<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Department;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class DepartmentController extends Controller
{
    public function index()
    {
        $departments = Department::with(['courses', 'programHead.user'])->get();
        $totalCourses = Course::count();
        $totalDepartments = Department::count();

        return Inertia::render('department', props: [
            'departments' => $departments,
            'totalDepartments' => $totalDepartments,
            'totalCourses' => $totalCourses,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'department_code' => 'required|string|max:10|unique:departments',
            'name' => 'required|string|max:255',
            'program_head_id' => 'nullable|string|exists:employees,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        DB::beginTransaction();
        try {
            $department = Department::create($validator->validated());

            // If program head is assigned, update employee position
            if ($request->program_head_id) {
                $this->updateProgramHead($department, $request->program_head_id);
            }

            DB::commit();
            return redirect()->route('departments.index')->with('message', 'Department added successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create department: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, Department $department)
    {
        $validator = Validator::make($request->all(), [
            'department_code' => 'required|string|max:10|unique:departments,department_code,' . $department->id,
            'name' => 'required|string|max:255',
            'program_head_id' => 'nullable|string|exists:employees,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        DB::beginTransaction();
        try {
            // Check if program head is changing
            $oldProgramHeadId = $department->program_head_id;
            $newProgramHeadId = $request->program_head_id;

            $department->update($validator->validated());

            // If program head is changing, update both employees
            if ($oldProgramHeadId !== $newProgramHeadId) {
                $this->updateProgramHead($department, $newProgramHeadId, $oldProgramHeadId);
            }

            DB::commit();
            return redirect()->route('departments.index')->with('message', 'Department updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update department: ' . $e->getMessage()]);
        }
    }

    public function destroy(Department $department)
    {
        DB::beginTransaction();
        try {
            // If department has a program head, revert position to professor
            if ($department->program_head_id) {
                $this->updateProgramHead($department, null, $department->program_head_id);
            }

            $department->delete();

            DB::commit();
            return redirect()->route('departments.index')->with('message', 'Department deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to delete department: ' . $e->getMessage()]);
        }
    }

    /**
     * Handle program head position changes
     * 
     * @param Department $department
     * @param string|null $newHeadId
     * @param string|null $oldHeadId
     * @return void
     */
    private function updateProgramHead(Department $department, ?string $newHeadId, ?string $oldHeadId = null)
    {
        // If there was a previous program head, change them back to professor
        if ($oldHeadId) {
            $oldHead = Employee::findOrFail($oldHeadId);
            $oldHead->position = 'professor';
            $oldHead->save();
        }

        // If assigning a new program head
        if ($newHeadId) {
            // Check if employee is already a program head for another department
            $employee = Employee::findOrFail($newHeadId);

            // Ensure the employee belongs to the department they'll be heading
            if ($employee->department_id != $department->id) {
                throw new \Exception('Employee must belong to the department they are heading');
            }

            // Check if employee is already a program head elsewhere
            $otherDepartment = Department::where('program_head_id', $newHeadId)
                ->where('id', '!=', $department->id)
                ->first();

            if ($otherDepartment) {
                throw new \Exception('This employee is already a program head for another department');
            }

            // Update employee position to program head
            $employee->position = 'program head';
            $employee->save();
        }
    }
}
