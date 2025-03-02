<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class DepartmentController extends Controller
{
    public function index()
    {
        $departments = Department::with('courses')->get();
        $totalCourses = Course::get()->count();
        $totalDepartments = Department::count();
        $activeDepartments = 0;
        $inactiveDepartments = 0;

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
            'program_head_id' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        Department::create($validator->validated());

        return redirect()->route('departments.index')->with('message', 'Department added successfully');
    }

    public function update(Request $request, Department $department)
    {


        $validator = Validator::make($request->all(), [
            'department_code' => 'required|string|max:10|unique:departments,department_code,' . $department->id,
            'name' => 'required|string|max:255',
            'program_head_id' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        $department->update($validator->validated());

        return redirect()->route('departments.index')->with('message', 'Department updated successfully');
    }

    public function destroy(Department $department)
    {
        $department->delete();

        return redirect()->route('departments.index')->with('message', 'Department deleted successfully');
    }
}
