<?php

namespace App\Http\Controllers;

use App\Models\DTR;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class DTRController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Initialize query for DTR records
        $query = DTR::with(['employee.user', 'employee.department'])
            ->orderBy('date', 'desc');

        // Filter by employee if specified
        if ($request->has('employee_id') && $request->employee_id && $request->employee_id !== 'all') {
            $query->where('employee_id', $request->employee_id);
        }

        // Filter by date range if specified
        if ($request->has('start_date') && $request->start_date) {
            $query->where('date', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date) {
            $query->where('date', '<=', $request->end_date);
        }

        // Filter by status if specified
        if ($request->has('status') && $request->status && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        // Filter by payment status if specified
        if ($request->has('is_paid') && $request->is_paid !== null && $request->is_paid !== 'all') {
            $query->where('is_paid', $request->is_paid === 'true');
        }

        // Paginate the results
        $dtrRecords = $query->paginate(10)->withQueryString();

        // Add proper capitalization to employee names and positions
        $dtrRecords->through(function ($record) {
            if ($record->employee) {
                $record->employee->user->name = ucwords(strtolower($record->employee->user->name));
                $record->employee->position = ucwords(strtolower($record->employee->position));
                if ($record->employee->department) {
                    $record->employee->department->name = ucwords(strtolower($record->employee->department->name));
                }
            }
            return $record;
        });

        // Get all employees for the filter dropdown
        $employees = Employee::with('user')->get()->map(function ($employee) {
            return [
                'id' => $employee->id,
                'name' => ucwords(strtolower($employee->user->name)),
                'position' => ucwords(strtolower($employee->position)),
                'employee_id' => str_pad($employee->id, 4, '0', STR_PAD_LEFT)
            ];
        });

        // Return the Inertia view with data
        return Inertia::render('dtr', [
            'dtrRecords' => $dtrRecords,
            'employees' => $employees,
            'filters' => $request->only(['employee_id', 'start_date', 'end_date', 'status', 'is_paid']),
            'statuses' => ['Present', 'Absent', 'Late', 'Half Day', 'On Leave']
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get all employees for the form
        $employees = Employee::with('user', 'department')->get()->map(function ($employee) {
            return [
                'id' => $employee->id,
                'name' => ucwords(strtolower($employee->user->name)),
                'position' => ucwords(strtolower($employee->position)),
                'department' => $employee->department ? ucwords(strtolower($employee->department->name)) : 'Not Assigned',
                'employee_id' => str_pad($employee->id, 4, '0', STR_PAD_LEFT) // Format ID with leading zeros
            ];
        });

        return Inertia::render('dtr-create', [
            'employees' => $employees,
            'statuses' => ['Present', 'Absent', 'Late', 'Half Day', 'On Leave'],
            'leaveTypes' => ['Sick Leave', 'Vacation Leave', 'Personal Leave', 'Emergency Leave', 'Maternity/Paternity Leave']
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'time_in' => 'nullable|required_if:status,Present,Late,Half Day',
            'time_out' => 'nullable|required_if:status,Present,Late,Half Day',
            'lunch_start' => 'nullable',
            'lunch_end' => 'nullable',
            'overtime_start' => 'nullable',
            'overtime_end' => 'nullable',
            'status' => 'required|in:Present,Absent,Late,Half Day,On Leave',
            'leave_type' => 'nullable|required_if:status,On Leave',
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check for duplicate entries
        $existingRecord = DTR::where('employee_id', $request->employee_id)
            ->where('date', $request->date)
            ->first();

        if ($existingRecord) {
            return back()->withErrors(['date' => 'A DTR record already exists for this employee on this date'])->withInput();
        }

        // Calculate hours worked and overtime
        $hoursWorked = 0;
        $overtimeHours = 0;

        if ($request->time_in && $request->time_out) {
            $timeIn = Carbon::parse($request->time_in);
            $timeOut = Carbon::parse($request->time_out);

            $lunchDuration = 0;
            if ($request->lunch_start && $request->lunch_end) {
                $lunchStart = Carbon::parse($request->lunch_start);
                $lunchEnd = Carbon::parse($request->lunch_end);
                $lunchDuration = $lunchStart->diffInMinutes($lunchEnd) / 60;
            }

            $hoursWorked = $timeIn->diffInMinutes($timeOut) / 60;
            $hoursWorked = round($hoursWorked - $lunchDuration, 2);
        }

        if ($request->overtime_start && $request->overtime_end) {
            $overtimeStart = Carbon::parse($request->overtime_start);
            $overtimeEnd = Carbon::parse($request->overtime_end);
            $overtimeHours = round($overtimeStart->diffInMinutes($overtimeEnd) / 60, 2);
        }

        // Create the DTR record
        $dtr = DTR::create([
            'employee_id' => $request->employee_id,
            'date' => $request->date,
            'time_in' => $request->time_in,
            'time_out' => $request->time_out,
            'lunch_start' => $request->lunch_start,
            'lunch_end' => $request->lunch_end,
            'overtime_start' => $request->overtime_start,
            'overtime_end' => $request->overtime_end,
            'status' => $request->status,
            'leave_type' => $request->leave_type,
            'remarks' => $request->remarks,
            'hours_worked' => $hoursWorked,
            'overtime_hours' => $overtimeHours,
            'is_paid' => false, // New records are not paid by default
            'pay_period' => $this->determinePayPeriod($request->date),
        ]);

        return redirect()->route('DTR.index')->with('success', 'DTR record created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(DTR $DTR)
    {
        // Load employee relationship with user data
        $DTR->load('employee.user', 'employee.department');

        // Properly capitalize the employee name and position
        if ($DTR->employee && $DTR->employee->user) {
            $DTR->employee->user->name = ucwords(strtolower($DTR->employee->user->name));
            $DTR->employee->position = ucwords(strtolower($DTR->employee->position));
            if ($DTR->employee->department) {
                $DTR->employee->department->name = ucwords(strtolower($DTR->employee->department->name));
            }
        }

        return Inertia::render('dtr-show', [
            'dtr' => $DTR
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DTR $DTR)
    {
        // Load related employee data
        $DTR->load('employee.user', 'employee.department');

        // Check if employee exists, if not, log this issue with clearer message
        if (!$DTR->employee) {
            if ($DTR->employee_id === null) {
                Log::warning("DTR record #{$DTR->id} has null employee_id - needs assignment");
            } else {
                Log::warning("DTR record #{$DTR->id} references non-existent employee_id: {$DTR->employee_id}");
            }
        }

        // Get all employees for the form
        $employees = Employee::with('user', 'department')->get()->map(function ($employee) {
            return [
                'id' => $employee->id,
                'name' => ucwords(strtolower($employee->user->name)),
                'position' => ucwords(strtolower($employee->position)),
                'department' => $employee->department ? ucwords(strtolower($employee->department->name)) : 'Not Assigned',
                'employee_id' => str_pad($employee->id, 4, '0', STR_PAD_LEFT) // Format ID with leading zeros
            ];
        });

        return Inertia::render('dtr-edit', [
            'dtr' => $DTR,
            'employees' => $employees,
            'statuses' => ['Present', 'Absent', 'Late', 'Half Day', 'On Leave'],
            'leaveTypes' => ['Sick Leave', 'Vacation Leave', 'Personal Leave', 'Emergency Leave', 'Maternity/Paternity Leave']
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DTR $DTR)
    {
        $validated = $request->validate([
            'employee_id' => 'required',
            'date' => 'required|date',
            'time_in' => 'required_if:status,Present,Late,Half Day',
            'time_out' => 'required_if:status,Present,Late,Half Day',
            'lunch_start' => 'nullable',
            'lunch_end' => 'nullable',
            'overtime_start' => 'nullable',
            'overtime_end' => 'nullable',
            'status' => 'required',
            'leave_type' => 'required_if:status,On Leave',
            'remarks' => 'nullable',
        ]);

        // Calculate hours worked and overtime
        $hoursWorked = 0;
        $overtimeHours = 0;

        if ($request->time_in && $request->time_out) {
            $timeIn = Carbon::parse($request->time_in);
            $timeOut = Carbon::parse($request->time_out);

            $lunchDuration = 0;
            if ($request->lunch_start && $request->lunch_end) {
                $lunchStart = Carbon::parse($request->lunch_start);
                $lunchEnd = Carbon::parse($request->lunch_end);
                $lunchDuration = $lunchStart->diffInMinutes($lunchEnd) / 60;
            }

            $hoursWorked = $timeIn->diffInMinutes($timeOut) / 60;
            $hoursWorked = round($hoursWorked - $lunchDuration, 2);
        }

        if ($request->overtime_start && $request->overtime_end) {
            $overtimeStart = Carbon::parse($request->overtime_start);
            $overtimeEnd = Carbon::parse($request->overtime_end);
            $overtimeHours = round($overtimeStart->diffInMinutes($overtimeEnd) / 60, 2);
        }

        // Update the DTR record with all fields
        $DTR->update([
            ...$validated,
            'hours_worked' => $hoursWorked,
            'overtime_hours' => $overtimeHours,
            'pay_period' => $this->determinePayPeriod($request->date),
        ]);

        return redirect()->route('DTR.index')->with('success', 'DTR record updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DTR $DTR)
    {
        $DTR->delete();

        return redirect()->route('DTR.index')->with('success', 'DTR record deleted successfully');
    }

    /**
     * Mark multiple DTR records as paid.
     */
    public function markAsPaid(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'dtr_ids' => 'required|array',
            'dtr_ids.*' => 'exists:d_t_r_s,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        DTR::whereIn('id', $request->dtr_ids)
            ->update(['is_paid' => true]);

        return redirect()->route('DTR.index')
            ->with('success', 'DTR records marked as paid successfully');
    }

    /**
     * Export DTR records for payroll processing.
     */
    public function exportForPayroll(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'employee_id' => 'nullable|exists:employees,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $query = DTR::with(['employee.user', 'employee.department'])
            ->whereBetween('date', [$request->start_date, $request->end_date]);

        if ($request->employee_id) {
            $query->where('employee_id', $request->employee_id);
        }

        $dtrRecords = $query->get();

        // Process records for payroll
        $payrollData = [];
        $orphanedRecordsCount = 0;

        foreach ($dtrRecords as $record) {
            // Skip records with missing employee relationship
            if (!$record->employee) {
                $orphanedRecordsCount++;
                Log::warning("Skipping DTR record #{$record->id} with missing employee relationship during payroll export");
                continue;
            }

            $employeeId = $record->employee_id;

            if (!isset($payrollData[$employeeId])) {
                $payrollData[$employeeId] = [
                    'employee' => ucwords(strtolower($record->employee->user->name)),
                    'position' => ucwords(strtolower($record->employee->position)),
                    'department' => $record->employee->department ? ucwords(strtolower($record->employee->department->name)) : 'Not assigned',
                    'total_hours' => 0,
                    'overtime_hours' => 0,
                    'days_present' => 0,
                    'days_absent' => 0,
                    'days_late' => 0,
                    'days_on_leave' => 0,
                ];
            }

            $payrollData[$employeeId]['total_hours'] += $record->hours_worked;
            $payrollData[$employeeId]['overtime_hours'] += $record->overtime_hours;

            switch ($record->status) {
                case 'Present':
                    $payrollData[$employeeId]['days_present']++;
                    break;
                case 'Absent':
                    $payrollData[$employeeId]['days_absent']++;
                    break;
                case 'Late':
                    $payrollData[$employeeId]['days_late']++;
                    break;
                case 'On Leave':
                    $payrollData[$employeeId]['days_on_leave']++;
                    break;
            }
        }

        return Inertia::render('dtr-payroll-export', [
            'payrollData' => $payrollData,
            'startDate' => $request->start_date,
            'endDate' => $request->end_date,
        ]);
    }

    /**
     * Determine the pay period for a given date.
     */
    private function determinePayPeriod($date)
    {
        $date = Carbon::parse($date);
        $day = $date->day;

        // Assuming a semi-monthly payroll system (1-15 and 16-end of month)
        if ($day <= 15) {
            return $date->format('Y-m-15'); // First half of the month
        } else {
            return $date->endOfMonth()->format('Y-m-d'); // End of month
        }
    }

    /**
     * Generate report for attendance analytics.
     */
    public function attendanceReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Get employees filtered by department if specified
        $employees = Employee::query()
            ->with(['user', 'department'])
            ->when($request->department_id, function ($query) use ($request) {
                return $query->where('department_id', $request->department_id);
            })
            ->get();

        $employeeIds = $employees->pluck('id');

        // Get DTR records for these employees in the specified date range
        $dtrRecords = DTR::whereBetween('date', [$request->start_date, $request->end_date])
            ->whereIn('employee_id', $employeeIds)
            ->get();

        // Generate report data
        $reportData = [
            'total_employees' => $employees->count(),
            'total_attendance_records' => $dtrRecords->count(),
            'present_count' => $dtrRecords->where('status', 'Present')->count(),
            'absent_count' => $dtrRecords->where('status', 'Absent')->count(),
            'late_count' => $dtrRecords->where('status', 'Late')->count(),
            'on_leave_count' => $dtrRecords->where('status', 'On Leave')->count(),
            'average_hours' => $dtrRecords->avg('hours_worked'),
            'total_overtime_hours' => $dtrRecords->sum('overtime_hours'),
            'employee_stats' => $employees->map(function ($employee) use ($dtrRecords) {
                $employeeRecords = $dtrRecords->where('employee_id', $employee->id);

                return [
                    'name' => ucwords(strtolower($employee->user->name)),
                    'position' => ucwords(strtolower($employee->position)),
                    'department' => $employee->department ? ucwords(strtolower($employee->department->name)) : 'Not assigned',
                    'present' => $employeeRecords->where('status', 'Present')->count(),
                    'absent' => $employeeRecords->where('status', 'Absent')->count(),
                    'late' => $employeeRecords->where('status', 'Late')->count(),
                    'on_leave' => $employeeRecords->where('status', 'On Leave')->count(),
                    'total_hours' => $employeeRecords->sum('hours_worked'),
                    'overtime_hours' => $employeeRecords->sum('overtime_hours'),
                ];
            }),
        ];

        return Inertia::render('dtr-attendance-report', [
            'reportData' => $reportData,
            'startDate' => $request->start_date,
            'endDate' => $request->end_date,
        ]);
    }
}
