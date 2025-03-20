<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
            return back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            $data = $validator->validated();
            $data['created_by'] = auth()->user()->employee->id;

            Assignment::create($data);

            return redirect()
                ->back()
                ->with('success', 'Assessment created successfully');
        } catch (\Exception $e) {
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
        //
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
            return back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            $data = $validator->validated();
            $assignment->update($data);

            return redirect()
                ->back()
                ->with('success', 'Assessment updated successfully');
        } catch (\Exception $e) {
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
}
