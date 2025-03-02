<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class CourseController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course_code' => 'required|string|max:10|unique:courses',
            'name' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        Course::create($validator->validated());

        return redirect()->route('departments.index')->with('message', 'Course added successfully');
    }

    public function update(Request $request, Course $course)
    {
        $validator = Validator::make($request->all(), [
            'course_code' => 'required|string|max:10|unique:courses,course_code,' . $course->id,
            'name' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        $course->update($validator->validated());

        return redirect()->route('departments.index')->with('message', 'Course updated successfully');
    }

    public function destroy(Course $course)
    {
        $course->delete();

        return redirect()->route('departments.index')->with('message', 'Course deleted successfully');
    }
}
