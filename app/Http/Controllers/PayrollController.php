<?php

namespace App\Http\Controllers;

use App\Models\DTR;
use App\Models\Employee;
use App\Models\Payroll;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PayrollController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $payrolls = Payroll::with('employee.user')
                ->when($request->search, function ($query, $search) {
                    return $query->whereHas('employee.user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
                })
                ->when($request->status, function ($query, $status) {
                    return $query->where('status', $status);
                })
                ->latest()
                ->paginate(10)
                ->withQueryString();

            // Transform employee data to match expected structure
            $payrolls->through(function ($payroll) {
                if ($payroll->employee && $payroll->employee->user) {
                    $name = $payroll->employee->user->name;
                    $nameParts = explode(' ', $name);
                    $firstName = $nameParts[0];
                    $lastName = count($nameParts) > 1 ? end($nameParts) : '';

                    // Create the expected structure
                    $payroll->employee = [
                        'id' => $payroll->employee->id,
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'position' => $payroll->employee->position
                    ];
                }
                return $payroll;
            });

            $payrollStats = [
                'total' => Payroll::count(),
                'pending' => Payroll::where('status', 'pending')->count(),
                'completed' => Payroll::where('status', 'completed')->count(),
            ];
        } catch (\Exception $e) {
            // If there's a database error (like missing table), provide empty data
            $payrolls = (object) [
                'data' => [],
                'meta' => null,
                'links' => null,
            ];

            $payrollStats = [
                'total' => 0,
                'pending' => 0,
                'completed' => 0,
            ];
        }

        return Inertia::render('payroll', [
            'payrolls' => $payrolls,
            'stats' => $payrollStats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // First check if there are any unpaid DTR records at all
        $hasUnpaidDTRs = DTR::where('is_paid', false)->exists();

        // Get all employees
        $employees = Employee::with('user')
            ->get()
            ->map(function ($employee) {
                $name = $employee->user->name;
                $nameParts = explode(' ', $name);
                $firstName = $nameParts[0];
                $lastName = count($nameParts) > 1 ? end($nameParts) : '';

                return [
                    'id' => $employee->id,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'hourly_rate' => $employee->salary / 160, // Assuming 160 hours per month
                    'position' => $employee->position
                ];
            });

        // Get employees with unpaid DTR records
        $employeesWithDTR = DTR::where('is_paid', false)
            ->select('employee_id')
            ->distinct()
            ->pluck('employee_id')
            ->toArray();

        $eligibleEmployees = $employees->whereIn('id', $employeesWithDTR);

        return Inertia::render('payroll/create', [
            'employees' => $eligibleEmployees,
            'hasUnpaidDTRs' => $hasUnpaidDTRs
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'pay_period_start' => 'required|date',
            'pay_period_end' => 'required|date|after_or_equal:pay_period_start',
            'allowances' => 'sometimes|numeric|min:0',
            'deductions' => 'sometimes|numeric|min:0',
            'payment_method' => 'required|string',
            'remarks' => 'sometimes|string|nullable',
        ]);

        try {
            DB::beginTransaction();

            $employee = Employee::findOrFail($validated['employee_id']);

            // Create new payroll record
            $payroll = Payroll::create([
                'employee_id' => $validated['employee_id'],
                'pay_period_start' => $validated['pay_period_start'],
                'pay_period_end' => $validated['pay_period_end'],
                'allowances' => $validated['allowances'] ?? 0,
                'deductions' => $validated['deductions'] ?? 0,
                'payment_method' => $validated['payment_method'],
                'remarks' => $validated['remarks'] ?? null,
                'status' => 'pending',
                'basic_salary' => 0, // Will be calculated
                'overtime_pay' => 0, // Will be calculated
                'tax' => 0, // Will be calculated
                'net_salary' => 0, // Will be calculated
            ]);

            // Calculate hourly rate from monthly salary (assuming 160 working hours per month)
            $hourlyRate = $employee->salary / 160;
            $overtimeRate = $hourlyRate * 1.5; // Overtime rate is 1.5x regular rate

            $payroll->calculatePayroll($hourlyRate, $overtimeRate);

            DB::commit();

            return redirect()->route('payroll.index')->with('success', 'Payroll successfully created');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to create payroll: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Payroll $payroll)
    {
        // Eager load employee with user and department to ensure data availability
        $payroll->load('employee.user', 'employee.department');

        // Format employee data for the view
        if ($payroll->employee && $payroll->employee->user) {
            $name = $payroll->employee->user->name;
            $nameParts = explode(' ', $name);
            $firstName = $nameParts[0];
            $lastName = count($nameParts) > 1 ? end($nameParts) : '';

            // Create the expected structure for the frontend
            $employeeData = [
                'id' => $payroll->employee->id,
                'user' => $payroll->employee->user,
                'position' => $payroll->employee->position,
                'department' => $payroll->employee->department
            ];

            // Replace the employee relation with our formatted data
            $payroll->employee = $employeeData;
        } else {
            // Provide fallback data if employee relation is missing
            $payroll->employee = [
                'id' => null,
                'user' => [
                    'name' => 'Unknown Employee',
                    'email' => 'N/A'
                ],
                'position' => 'Unknown',
                'department' => null
            ];
        }

        $dtrRecords = DTR::where('employee_id', $payroll->employee_id)
            ->whereBetween('date', [$payroll->pay_period_start, $payroll->pay_period_end])
            ->get();

        return Inertia::render('payroll/show', [
            'payroll' => $payroll,
            'dtrRecords' => $dtrRecords,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Payroll $payroll)
    {
        // Eager load employee with user and department to ensure data availability
        $payroll->load('employee.user', 'employee.department');

        // Format employee data for the view
        if ($payroll->employee && $payroll->employee->user) {
            $employeeData = [
                'id' => $payroll->employee->id,
                'user' => $payroll->employee->user,
                'position' => $payroll->employee->position,
                'department' => $payroll->employee->department
            ];

            // Replace the employee relation with our formatted data
            $payroll->employee = $employeeData;
        } else {
            // Provide fallback data if employee relation is missing
            $payroll->employee = [
                'id' => null,
                'user' => [
                    'name' => 'Unknown Employee',
                    'email' => 'N/A'
                ],
                'position' => 'Unknown',
                'department' => null
            ];
        }

        return Inertia::render('payroll/edit', [
            'payroll' => $payroll,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Payroll $payroll)
    {
        $validated = $request->validate([
            'allowances' => 'sometimes|numeric|min:0',
            'deductions' => 'sometimes|numeric|min:0',
            'payment_method' => 'required|string',
            'remarks' => 'sometimes|string|nullable',
            'status' => 'required|string|in:pending,processing,completed,rejected',
        ]);

        try {
            DB::beginTransaction();

            $payroll->update($validated);

            // Recalculate net salary if allowances or deductions changed
            if ($request->has('allowances') || $request->has('deductions')) {
                $grossPay = $payroll->basic_salary + $payroll->overtime_pay + $payroll->allowances;
                $payroll->net_salary = $grossPay - $payroll->deductions - $payroll->tax;
                $payroll->save();
            }

            // Set paid_at timestamp if status is completed and not already set
            if ($validated['status'] === 'completed' && !$payroll->paid_at) {
                $payroll->paid_at = Carbon::now();
                $payroll->save();
            }

            DB::commit();

            return redirect()->route('payroll.index')->with('success', 'Payroll successfully updated');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to update payroll: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Payroll $payroll)
    {
        // Only allow deletion of pending payrolls
        if ($payroll->status !== 'pending') {
            return redirect()->back()->with('error', 'Only pending payrolls can be deleted');
        }

        try {
            DB::beginTransaction();

            // Mark associated DTR records as unpaid
            DTR::where('employee_id', $payroll->employee_id)
                ->whereBetween('date', [$payroll->pay_period_start, $payroll->pay_period_end])
                ->update(['is_paid' => false]);

            // Delete the payroll
            $payroll->delete();

            DB::commit();

            return redirect()->route('payroll.index')->with('success', 'Payroll successfully deleted');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to delete payroll: ' . $e->getMessage());
        }
    }

    /**
     * Generate a payroll report for a specific period
     */
    public function report(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'sometimes|string',
        ]);

        $payrollReport = Payroll::with('employee')
            ->whereBetween('pay_period_start', [$validated['start_date'], $validated['end_date']])
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->get();

        $totals = [
            'basic_salary' => $payrollReport->sum('basic_salary'),
            'overtime_pay' => $payrollReport->sum('overtime_pay'),
            'allowances' => $payrollReport->sum('allowances'),
            'deductions' => $payrollReport->sum('deductions'),
            'tax' => $payrollReport->sum('tax'),
            'net_salary' => $payrollReport->sum('net_salary'),
        ];

        return Inertia::render('payroll/report', [
            'report' => $payrollReport,
            'totals' => $totals,
            'filters' => $validated,
        ]);
    }
}
