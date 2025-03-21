<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\Course;
use Inertia\Inertia;
use App\Models\Subject;
use App\Models\Employee;
use App\Models\Room;
use App\Models\Schedule;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $query = Schedule::with([
            'subject',
            'room.building',
            'professor.user',
            'course'
        ]);

        // Server-side filtering if needed
        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->has('room_id')) {
            $query->where('room_id', $request->room_id);
        }

        if ($request->has('day')) {
            $query->where('day', $request->day);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('subject', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })
                ->orWhereHas('professor.user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('room', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('course', function ($q) use ($search) { // Add course search
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('course_code', 'like', "%{$search}%");
                })
                ->orWhere('day', 'like', "%{$search}%");
        }

        $schedules = $query->get();
        $courses = Course::select('id', 'name', 'course_code')->get();

        // Debug logging


        return Inertia::render('schedule', [
            'schedules' => $schedules,
            'subjects' => Subject::select('id', 'name')->get(),
            'professors' => Employee::with('user:id,name')->get(),
            'rooms' => Room::with('building:id,name')->get(),
            'buildings' => Building::all(),
            'courses' => $courses,
        ]);
    }

    public function create()
    {
        $subjects = Subject::with('course')->get();
        $professors = Employee::where('position', 'professor')
            ->with('user')
            ->get();
        $rooms = Room::with('building')->get();

        return Inertia::render('schedule', [
            'subjects' => $subjects,
            'professors' => $professors,
            'rooms' => $rooms
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'room_id' => 'required|exists:rooms,id',
            'professor_id' => 'required|exists:employees,id',
            'course_id' => 'required|exists:courses,id', // Add course validation
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => ['required', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/'],
            'end_time' => ['required', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', 'after:start_time'],
            'block' => 'required|string|max:255',
            'year_level' => 'required|integer|min:1|max:6',
            'academic_year' => 'required|string',
            'semester' => 'required|in:1,2,3',
            'schedule_type' => 'required|in:Lecture,Laboratory,Hybrid',
            'max_students' => 'required|integer|min:1',
            'status' => 'required|in:Active,Inactive,Cancelled'
        ]);

        // Format times to proper HH:mm:ss format
        $validated['start_time'] = date('H:i:s', strtotime($validated['start_time']));
        $validated['end_time'] = date('H:i:s', strtotime($validated['end_time']));

        // Check for scheduling conflicts
        $conflict = Schedule::where('day', $request->day)
            ->where(function ($query) use ($request) {
                $query->where('room_id', $request->room_id)
                    ->orWhere('professor_id', $request->professor_id);
            })
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                    ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                    ->orWhere(function ($query) use ($request) {
                        $query->where('start_time', '<', $request->start_time)
                            ->where('end_time', '>', $request->end_time);
                    });
            })
            ->where('start_time', '!=', $request->end_time)
            ->where('end_time', '!=', $request->start_time)
            ->exists();

        if ($conflict) {
            return back()->withErrors(['conflict' => 'The schedule conflicts with an existing schedule.']);
        }


        Schedule::create($validated);

        return redirect()->route('schedules.index')->with('success', 'Schedule created successfully.');
    }


    public function update(Request $request, Schedule $schedule)
    {
        // Format times to match database format
        $formattedStartTime = date('H:i:s', strtotime($request->start_time));
        $formattedEndTime = date('H:i:s', strtotime($request->end_time));

        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'professor_id' => 'required|exists:employees,id',
            'room_id' => 'required|exists:rooms,id',
            'course_id' => 'required|exists:courses,id',
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required',
            'end_time' => 'required',
            'year_level' => 'required|integer|min:1|max:6',
            'block' => 'required|string',
            'academic_year' => 'required|string',
            'semester' => 'required|integer|min:1|max:3',
            'schedule_type' => 'required|in:Lecture,Laboratory,Hybrid',
            'max_students' => 'required|integer|min:1',
            'status' => 'required|in:Active,Inactive,Cancelled',
        ]);

        // Replace the times with formatted versions
        $validated['start_time'] = $formattedStartTime;
        $validated['end_time'] = $formattedEndTime;

        // Verify end time is after start time
        if (strtotime($formattedEndTime) <= strtotime($formattedStartTime)) {
            return back()->withErrors(['end_time' => 'The end time must be after start time']);
        }

        // Check for scheduling conflicts, excluding the current schedule being updated
        $conflict = Schedule::where('id', '!=', $schedule->id)
            ->where('day', $request->day)
            ->where(function ($query) use ($request) {
                $query->where('room_id', $request->room_id)
                    ->orWhere('professor_id', $request->professor_id);
            })
            ->where(function ($query) use ($formattedStartTime, $formattedEndTime) {
                $query->whereBetween('start_time', [$formattedStartTime, $formattedEndTime])
                    ->orWhereBetween('end_time', [$formattedStartTime, $formattedEndTime])
                    ->orWhere(function ($query) use ($formattedStartTime, $formattedEndTime) {
                        $query->where('start_time', '<', $formattedStartTime)
                            ->where('end_time', '>', $formattedEndTime);
                    });
            })
            ->where('start_time', '!=', $formattedEndTime)
            ->where('end_time', '!=', $formattedStartTime)
            ->exists();

        if ($conflict) {
            return back()->withErrors(['conflict' => 'The schedule conflicts with an existing schedule.']);
        }

        $schedule->update($validated);



        return redirect()->route('schedules.index')
            ->with('success', 'Schedule updated successfully.');
    }

    public function destroy($id)
    {
        $schedule = Schedule::findOrFail($id);
        $schedule->delete();

        return redirect()->route('schedules.index')->with('success', 'Schedule deleted successfully.');
    }

    public function getTeacherSchedule(Request $request)
    {
        $teacherId = auth()->user()->employee->id;

        $schedules = Schedule::with(['subject', 'room.building'])
            ->where('professor_id', $teacherId)
            ->where('status', 'Active')
            ->when($request->academic_year, function ($query) use ($request) {
                return $query->where('academic_year', $request->academic_year);
            })
            ->when($request->semester, function ($query) use ($request) {
                return $query->where('semester', $request->semester);
            })
            ->orderBy('day')
            ->orderBy('start_time')
            ->get();

        return $this->renderSchedule($schedules, 'teacher');
    }

    public function getStudentSchedule(Request $request)
    {
        $student = auth()->user()->student;

        $schedules = Schedule::with(['subject', 'room.building'])
            ->where('course_id', $student->course_id)
            ->where('year_level', $student->year_level)
            ->where('block', $student->block)
            ->where('status', 'Active')
            ->when($request->academic_year, function ($query) use ($request) {
                return $query->where('academic_year', $request->academic_year);
            })
            ->when($request->semester, function ($query) use ($request) {
                return $query->where('semester', $request->semester);
            })
            ->orderBy('day')
            ->orderBy('start_time')
            ->get();

        return $this->renderSchedule($schedules, 'student');
    }

    private function renderSchedule($schedules, $type)
    {
        return Inertia::render('my-schedules', [
            'schedules' => $schedules,
            'type' => $type
        ]);
    }

    public function getTeacherClasses(Request $request)
    {
        $teacherId = auth()->user()->employee->id;

        $classes = Schedule::with(['subject', 'room.building', 'course'])
            ->where('professor_id', $teacherId)
            ->where('status', 'Active')
            ->when($request->academic_year, function ($query) use ($request) {
                return $query->where('academic_year', $request->academic_year);
            })
            ->when($request->semester, function ($query) use ($request) {
                return $query->where('semester', $request->semester);
            })
            ->orderBy('day')
            ->orderBy('start_time')
            ->get()
            ->groupBy(['academic_year', 'semester']);

        return $this->renderClasses($classes, 'teacher');
    }

    public function getStudentClasses(Request $request)
    {
        $student = auth()->user()->student;

        $classes = Schedule::with(['subject', 'room.building', 'course'])
            ->where('course_id', $student->course_id)
            ->where('year_level', $student->year_level)
            ->where('block', $student->block)
            ->where('status', 'Active')
            ->when($request->academic_year, function ($query) use ($request) {
                return $query->where('academic_year', $request->academic_year);
            })
            ->when($request->semester, function ($query) use ($request) {
                return $query->where('semester', $request->semester);
            })
            ->orderBy('day')
            ->orderBy('start_time')
            ->get()
            ->groupBy(['academic_year', 'semester']);

        return $this->renderClasses($classes, 'student');
    }

    private function renderClasses($schedules, $type)
    {
        return Inertia::render('my-classes', [
            'classes' => $schedules,
            'type' => $type
        ]);
    }

    public function show($id)
    {
        $schedule = Schedule::with([
            'subject',
            'subject.assignments' => function ($query) use ($id) {
                // Only get assignments for this specific schedule
                $query->where('schedule_id', $id);
            },
            'room.building',
            'course',
            'students.user',
            'students.submissions' => function ($query) use ($id) {
                // Filter submissions by joining with assignments table
                $query->whereHas('assignment', function ($q) use ($id) {
                    $q->where('schedule_id', $id);
                })->with(['assignment' => function ($q) use ($id) {
                    $q->where('schedule_id', $id);
                }]);
            }
        ])->findOrFail($id);

        $userRole = auth()->user()->employee ? 'teacher' : 'student';
        $currentUserId = auth()->id();

        $students = $schedule->students()->with([
            'user',
            'submissions' => function ($query) use ($id) {
                // Same filtering for the students' submissions
                $query->whereHas('assignment', function ($q) use ($id) {
                    $q->where('schedule_id', $id);
                })->with(['assignment' => function ($q) use ($id) {
                    $q->where('schedule_id', $id);
                }]);
            }
        ])->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'user_id' => $student->user->id, // Add user_id
                    'name' => $student->user->name,
                    'student_number' => $student->student_number,
                    'submissions' => $student->submissions->map(function ($submission) {
                        return [
                            'id' => $submission->id,
                            'assignment_id' => $submission->assignment_id,
                            'grade' => $submission->grade,
                            'feedback' => $submission->feedback,
                            'assignment' => [
                                'id' => $submission->assignment->id,
                                'period' => $submission->assignment->period,
                                'assessment_type' => $submission->assignment->assessment_type,
                                'total_points' => $submission->assignment->total_points
                            ]
                        ];
                    })
                ];
            });

        return Inertia::render('class-details', [
            'class' => array_merge($schedule->toArray(), ['students' => $students]),
            'userRole' => $userRole,
            'auth' => [
                'user' => auth()->user() // Make sure to include full user data
            ]
        ]);
    }
}
