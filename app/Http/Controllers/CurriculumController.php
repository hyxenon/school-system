<?php

namespace App\Http\Controllers;

use App\Models\Curriculum;
use App\Models\Department;
use App\Models\Course;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CurriculumController extends Controller
{
    public function index()
    {
        $departments = Department::all();
        $courses = Course::all();
        $subjects = Subject::all();
        $curriculums = Curriculum::with(['course', 'subjects'])->get();

        return Inertia::render('curriculum', [
            'departments' => $departments,
            'courses' => $courses,
            'subjects' => $subjects,
            'curriculums' => $curriculums,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'year_level' => 'required|integer|min:1|max:4',
            'semester' => 'required|integer|min:1|max:2',
            'subject_id' => 'required|exists:subjects,id',
        ]);

        // Check if the subject already exists in any curriculum for this course
        $subjectExists = Curriculum::where('course_id', $request->course_id)
            ->whereHas('subjects', function ($query) use ($request) {
                $query->where('subjects.id', $request->subject_id);
            })
            ->exists();

        if ($subjectExists) {
            return back()->withErrors(['subject_id' => 'This subject is already in the curriculum for this course.']);
        }

        $curriculum = Curriculum::firstOrCreate([
            'course_id' => $request->course_id,
            'year_level' => $request->year_level,
            'semester' => $request->semester,
        ]);

        $curriculum->subjects()->attach($request->subject_id);

        return redirect()->back()->with([
            'curriculums' => Curriculum::with(['course', 'subjects'])->get(),
        ]);
    }

    public function destroy(Curriculum $curriculum, Request $request)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
        ]);

        $curriculum->subjects()->detach($request->subject_id);

        // If the curriculum has no subjects left, delete it
        if ($curriculum->subjects()->count() === 0) {
            $curriculum->delete();
        }

        return redirect()->back()->with([
            'curriculums' => Curriculum::with(['course', 'subjects'])->get(),
        ]);
    }

    public function getSubjects(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
        ]);

        $subjects = Subject::where(function ($query) use ($request) {
            $query->where('course_id', $request->course_id)
                ->orWhereNull('course_id');
        })->get();

        return response()->json($subjects);
    }
}
