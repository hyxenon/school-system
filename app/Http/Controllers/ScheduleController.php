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
    public function index()
    {
        $schedules = Schedule::with([
            'subject',
            'room.building',
            'professor.user'
        ])->get();



        return Inertia::render('schedule', props: [
            'schedules' => $schedules,
            'subjects' => Subject::select('id', 'name')->get(), // Explicitly select needed fields
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

        Schedule::create($request->all());

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
}
