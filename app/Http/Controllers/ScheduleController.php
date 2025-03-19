<?php

namespace App\Http\Controllers;

use App\Models\Building;
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
            'professor.user'
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
                ->orWhere('day', 'like', "%{$search}%");
        }

        $schedules = $query->get();

        return Inertia::render('schedule', props: [
            'schedules' => $schedules,
            'subjects' => Subject::select('id', 'name')->get(),
            'professors' => Employee::with('user:id,name')->get(),
            'rooms' => Room::with('building:id,name')->get(),
            'buildings' => Building::all(),
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
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'block' => 'required|string|max:255',
            'year_level' => 'required|integer|min:1|max:6',
            'academic_year' => 'required|string',
            'semester' => 'required|in:1,2,3',
            'schedule_type' => 'required|in:Lecture,Laboratory,Hybrid',
            'max_students' => 'required|integer|min:1',
            'status' => 'required|in:Active,Inactive,Cancelled'
        ]);

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



    public function edit($id)
    {
        $schedule = Schedule::findOrFail($id);
        $subjects = Subject::with('course')->get();
        $professors = Employee::where('position', 'professor')
            ->with('user')
            ->get();
        $rooms = Room::with('building')->get();

        return Inertia::render('schedule', [
            'schedule' => $schedule,
            'subjects' => $subjects,
            'professors' => $professors,
            'rooms' => $rooms
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'room_id' => 'required|exists:rooms,id',
            'professor_id' => 'required|exists:employees,id',
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'block' => 'required|string|max:255',
            'year_level' => 'required|integer|min:1|max:6',
            'academic_year' => 'required|string',
            'semester' => 'required|in:1,2,3',
            'schedule_type' => 'required|in:Lecture,Laboratory,Hybrid',
            'max_students' => 'required|integer|min:1',
            'status' => 'required|in:Active,Inactive,Cancelled'
        ]);

        $conflict = Schedule::where('day', $request->day)
            ->where('id', '!=', $id)
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

        $schedule = Schedule::findOrFail($id);
        $schedule->update($request->all());

        return redirect()->route('schedules.index')->with('success', 'Schedule updated successfully.');
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

        return Inertia::render('my-schedules', [
            'schedules' => $schedules,
            'type' => 'teacher'
        ]);
    }
}
