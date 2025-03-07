<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Department;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class EnrollmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $enrollments = Enrollment::with(['student.user', 'course', 'department'])
            ->latest()
            ->paginate(10);

        $courses = Course::all();
        $departments = Department::all();
        $students = Student::with(['user', 'course', 'course.department'])
            ->where('enrollment_status', '!=', 'Enrolled')
            ->get();

        return Inertia::render('enrollment', [
            'enrollments' => $enrollments,
            'courses' => $courses,
            'departments' => $departments,
            'students' => $students,
            'filters' => request()->all(['search', 'status', 'payment', 'academic_year', 'semester']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $courses = Course::all();
        $departments = Department::all();
        $students = Student::with(['user', 'course'])
            ->where('enrollment_status', '!=', 'Enrolled')
            ->get();

        return Inertia::render('enrollment/create', [
            'courses' => $courses,
            'departments' => $departments,
            'students' => $students,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,id',
            'course_id' => 'required|exists:courses,id',
            'department_id' => 'required|exists:departments,id',
            'academic_year' => 'required|string',
            'semester' => 'required|in:1,2,3',
            'status' => 'required|in:Enrolled,Pending,Cancelled',
            'payment_status' => 'required|in:Completed,Pending',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $enrollment = Enrollment::create([
            'student_id' => $request->student_id,
            'course_id' => $request->course_id,
            'department_id' => $request->department_id,
            'academic_year' => $request->academic_year,
            'semester' => $request->semester,
            'enrollment_date' => now(),
            'status' => $request->status,
            'payment_status' => $request->payment_status,
        ]);

        // Update student enrollment status
        if ($request->status === 'Enrolled') {
            $student = Student::find($request->student_id);
            $student->enrollment_status = 'Enrolled';
            $student->save();
        }

        return redirect()->route('enrollment.index')
            ->with('success', 'Enrollment created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Enrollment $enrollment)
    {
        $enrollment->load(['student.user', 'course', 'department']);

        return Inertia::render('enrollment/show', [
            'enrollment' => $enrollment,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Enrollment $enrollment)
    {
        $enrollment->load(['student.user', 'course', 'department']);

        $courses = Course::all();
        $departments = Department::all();

        return Inertia::render('enrollment/edit', [
            'enrollment' => $enrollment,
            'courses' => $courses,
            'departments' => $departments,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Enrollment $enrollment)
    {
        $validator = Validator::make($request->all(), [
            'course_id' => 'required|exists:courses,id',
            'department_id' => 'required|exists:departments,id',
            'academic_year' => 'required|string',
            'semester' => 'required|in:1,2,3',
            'status' => 'required|in:Enrolled,Pending,Cancelled',
            'payment_status' => 'required|in:Completed,Pending',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $enrollment->update([
            'course_id' => $request->course_id,
            'department_id' => $request->department_id,
            'academic_year' => $request->academic_year,
            'semester' => $request->semester,
            'status' => $request->status,
            'payment_status' => $request->payment_status,
        ]);

        // Update student enrollment status based on enrollment status
        $student = Student::find($enrollment->student_id);

        if ($request->status === 'Enrolled') {
            $student->enrollment_status = 'Enrolled';
        } elseif ($request->status === 'Cancelled') {
            $student->enrollment_status = 'Not Enrolled';
        }

        $student->save();

        return redirect()->route('enrollment.index')
            ->with('success', 'Enrollment updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Enrollment $enrollment)
    {
        // Update student enrollment status when enrollment is deleted
        $student = Student::find($enrollment->student_id);
        $student->enrollment_status = 'Not Enrolled';
        $student->save();

        $enrollment->delete();

        return redirect()->route('enrollment.index')
            ->with('success', 'Enrollment deleted successfully.');
    }

    /**
     * Export enrollment data as PDF.
     */
    public function exportPdf(Enrollment $enrollment)
    {
        $enrollment->load(['student.user', 'course', 'department']);


        return response()->download('path/to/generated/pdf');
    }

    /**
     * Filter enrollments by various criteria.
     */
    public function filter(Request $request)
    {
        $query = Enrollment::with(['student.user', 'course', 'department']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student.user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })
                ->orWhereHas('student', function ($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%");
                })
                ->orWhereHas('course', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment') && $request->payment !== 'all') {
            $query->where('payment_status', $request->payment);
        }

        if ($request->filled('academic_year') && $request->academic_year !== 'all') {
            $query->where('academic_year', $request->academic_year);
        }

        if ($request->filled('semester') && $request->semester !== 'all') {
            $query->where('semester', $request->semester);
        }

        $enrollments = $query->latest()->paginate(10);

        return Inertia::render('enrollment', [
            'enrollments' => $enrollments,
            'filters' => $request->all(['search', 'status', 'payment', 'academic_year', 'semester']),
        ]);
    }
}
