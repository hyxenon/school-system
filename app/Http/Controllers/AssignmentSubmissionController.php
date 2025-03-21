<?php

namespace App\Http\Controllers;

use App\Models\AssignmentSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AssignmentSubmissionController extends Controller
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
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,id',
            'assignment_id' => 'required|exists:assignments,id',
            'grade' => 'required|numeric|min:0',
            'feedback' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $submission = AssignmentSubmission::updateOrCreate(
            [
                'student_id' => $request->student_id,
                'assignment_id' => $request->assignment_id,
            ],
            [
                'grade' => $request->grade,
                'feedback' => $request->feedback,
                'submission_date' => now(),
            ]
        );

        return back()->with('success', 'Grade submitted successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(AssignmentSubmission $assignmentSubmission)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AssignmentSubmission $assignmentSubmission)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AssignmentSubmission $submission)
    {
        $validator = Validator::make($request->all(), [
            'grade' => 'required|numeric|min:0',
            'feedback' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $submission->update([
            'grade' => $request->grade,
            'feedback' => $request->feedback,
        ]);

        return back()->with('success', 'Grade updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AssignmentSubmission $assignmentSubmission)
    {
        //
    }
}
