<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\Course;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class SubjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Subject::with('course');

        // Apply search filter if provided
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // Apply course filter if provided
        if ($request->filled('course') && $request->input('course') !== 'all') {
            $query->where('course_id', $request->input('course'));
        }

        // Apply department filter if provided
        if ($request->filled('department') && $request->input('department') !== 'all') {
            $departmentId = $request->input('department');
            $coursesInDepartment = Course::where('department_id', $departmentId)->pluck('id');
            $query->whereIn('course_id', $coursesInDepartment);
        }

        // Paginate the results
        $subjects = $query->paginate(10)->withQueryString();

        $courses = Course::all();
        $departments = Department::with('courses')->get();

        return Inertia::render('subjects', [
            'subjects' => $subjects,
            'courses' => $courses,
            'departments' => $departments,
            'filters' => $request->only(['search', 'course', 'department'])
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:20|unique:subjects',
            'name' => 'required|string|max:255',
            'credits' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'course_id' => 'nullable|exists:courses,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        Subject::create($request->all());

        return redirect()->route('subjects.index')->with('success', 'Subject created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Subject $subject)
    {
        return response()->json([
            'subject' => $subject->load('course')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Subject $subject)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:20|unique:subjects,code,' . $subject->id,
            'name' => 'required|string|max:255',
            'credits' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'course_id' => 'nullable|exists:courses,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        $subject->update($request->all());

        return redirect()->route('subjects.index')->with('success', 'Subject updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subject $subject)
    {
        $subject->delete();

        return redirect()->route('subjects.index')->with('success', 'Subject deleted successfully');
    }
}
