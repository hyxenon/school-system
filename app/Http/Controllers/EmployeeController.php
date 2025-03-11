<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\User;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $employees = Employee::with(['user', 'department'])->get();
        $departments = Department::all();
        $totalEmployees = $employees->count();

        return Inertia::render('employee', [
            'employees' => $employees,
            'departments' => $departments,
            'totalEmployees' => $totalEmployees,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'position' => 'required|in:registrar,treasurer,professor',
            'department_id' => 'nullable|string|exists:departments,id',
        ]);

        // For registrar and treasurer, force department_id to be null
        if (in_array($validated['position'], ['registrar', 'treasurer'])) {
            $validated['department_id'] = null;
        }

        try {
            // Create user and employee in a transaction
            DB::transaction(function () use ($validated) {
                // Create the user
                $user = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => Hash::make('password'), // Default password, should be changed later
                ]);

                // Create the employee
                Employee::create([
                    'user_id' => $user->id,
                    'department_id' => $validated['department_id'],
                    'position' => $validated['position'],
                    'isActive' => true,
                    'salary' => 40000,
                    'type' => 'employee'
                ]);
            });

            return redirect()->back()->with(['success' => 'Employee added successfully']);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['general' => 'Failed to add employee: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Employee $employee)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Employee $employee)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */ public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $employee->user_id,
            'position' => 'required|in:registrar,treasurer,professor',
            'department_id' => 'nullable|string|exists:departments,id',
        ]);

        // For registrar and treasurer, force department_id to be null
        if (in_array($validated['position'], ['registrar', 'treasurer'])) {
            $validated['department_id'] = null;
        }

        try {
            // Update user and employee in a transaction
            DB::transaction(function () use ($validated, $employee) {
                // Update the user
                $employee->user->update([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                ]);

                // Update the employee
                $employee->update([
                    'department_id' => $validated['department_id'],
                    'position' => $validated['position']
                ]);
            });

            return redirect()->back()->with(['success' => 'Employee updated successfully']);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['general' => 'Failed to update employee: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $employee)
    {
        $employee->user->delete();
        $employee->delete();

        return redirect()->route('employees.index')->with('message', 'Employee deleted successfully');
    }
}
