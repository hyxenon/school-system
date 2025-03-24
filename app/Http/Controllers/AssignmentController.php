<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Log the incoming request data for debugging
        Log::info('Assignment store request data:', $request->all());

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'due_date' => 'required|date|after_or_equal:today',
            'assessment_type' => 'required|in:Assignment,Quiz,Exam',
            'period' => 'required|in:Prelims,Midterms,Finals',
            'total_points' => 'required|integer|min:1|max:100',
            'subject_id' => 'required|exists:subjects,id',
            'schedule_id' => 'required|exists:schedules,id',
            'year_level' => 'required|integer|min:1|max:4',
            'block' => 'required|string',
        ]);

        if ($validator->fails()) {
            Log::error('Assignment validation failed:', $validator->errors()->toArray());
            return back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            $data = $validator->validated();
            $data['created_by'] = auth()->user()->employee->id;

            // Create the assignment and log success
            $assignment = Assignment::create($data);
            Log::info('Assignment created successfully:', ['id' => $assignment->id]);

            return redirect()
                ->back()
                ->with('success', 'Assessment created successfully');
        } catch (\Exception $e) {
            Log::error('Failed to create assignment:', ['error' => $e->getMessage()]);
            return redirect()
                ->back()
                ->withErrors(['error' => 'Failed to create assessment'])
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Assignment $assignment)
    {
        $schedule = Schedule::with([
            'subject',
            'subject.assignments',
            'students.submissions.assignment',
            'room.building',
            'course'
        ])->findOrFail($assignment->schedule_id);

        return Inertia::render('assignment-details', [
            'schedule' => $schedule,
            'assignment' => $assignment
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Assignment $assignment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Assignment $assignment)
    {
        // Log the incoming request data for debugging
        Log::info('Assignment update request data:', $request->all());

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'due_date' => 'required|date|after_or_equal:today',
            'assessment_type' => 'required|in:Assignment,Quiz,Exam',
            'period' => 'required|in:Prelims,Midterms,Finals',
            'total_points' => 'required|integer|min:1|max:100',
            'subject_id' => 'required|exists:subjects,id',
            'schedule_id' => 'required|exists:schedules,id',
            'year_level' => 'required|integer|min:1|max:4',
            'block' => 'required|string',
        ]);

        if ($validator->fails()) {
            Log::error('Assignment update validation failed:', $validator->errors()->toArray());
            return back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            $data = $validator->validated();
            $assignment->update($data);
            Log::info('Assignment updated successfully:', ['id' => $assignment->id]);

            return redirect()
                ->back()
                ->with('success', 'Assessment updated successfully');
        } catch (\Exception $e) {
            Log::error('Failed to update assignment:', ['error' => $e->getMessage()]);
            return redirect()
                ->back()
                ->withErrors(['error' => 'Failed to update assessment'])
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Assignment $assignment)
    {
        try {
            $assignment->delete();
            return redirect()
                ->back()
                ->with('success', 'Assessment deleted successfully');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Failed to delete assessment']);
        }
    }

    public function showGrading(Assignment $assignment)
    {
        $assignment->load(['subject', 'schedule']);

        $students = \App\Models\Student::with([
            'user',
            'submissions' => function ($query) use ($assignment) {
                $query->where('assignment_id', $assignment->id);
            }
        ])
            ->join('users', 'students.user_id', '=', 'users.id') // Add this join
            ->where('course_id', $assignment->schedule->course_id)
            ->where('year_level', $assignment->schedule->year_level)
            ->where('block', $assignment->schedule->block)
            ->orderBy('users.name')
            ->select('students.*') // Add this to select only student fields
            ->get();

        // Debug log
        \Log::info('Assignment grading data:', [
            'assignment' => $assignment->toArray(),
            'students' => $students->toArray()
        ]);

        return Inertia::render('assignment-grading', [
            'assignment' => array_merge($assignment->toArray(), [
                'schedule' => $assignment->schedule,
                'subject' => $assignment->subject
            ]),
            'students' => $students
        ]);
    }

    public function submitGrades(Request $request, Assignment $assignment)
    {
        $validator = Validator::make($request->all(), [
            'grades' => 'required|array',
            'grades.*.student_id' => 'required|exists:students,id',
            'grades.*.grade' => 'nullable|numeric|min:0|max:' . $assignment->total_points, // Changed from required to nullable
            'grades.*.feedback' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        foreach ($request->grades as $grade) {
            // Only create/update if grade is provided
            if (isset($grade['grade']) && $grade['grade'] !== '') {
                AssignmentSubmission::updateOrCreate(
                    [
                        'assignment_id' => $assignment->id,
                        'student_id' => $grade['student_id'],
                    ],
                    [
                        'grade' => $grade['grade'],
                        'feedback' => $grade['feedback'] ?? null,
                        'submission_date' => now(),
                    ]
                );
            }
        }

        return back()->with('success', 'Grades saved successfully');
    }
}
