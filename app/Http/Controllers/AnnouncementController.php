<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;


class AnnouncementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $departments = Department::all();
        $announcements = Announcement::with('department')->latest()->get();

        return Inertia::render('announcement', [
            'departments' => $departments,
            'announcements' => $announcements,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'content' => 'required|string',
            'type' => 'required|in:general,academic,administrative,emergency',
            'department_id' => 'nullable|exists:departments,id',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'is_pinned' => 'boolean',
            'visibility' => 'required|in:all,students,teachers,staff',
        ]);

        $validated['user_id'] = Auth::user()->id;

        $announcement = Announcement::create($validated);

        return redirect()->back()->with('success', 'Announcement created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:100',
            'content' => 'required|string',
            'type' => 'required|in:general,academic,administrative,emergency',
            'department_id' => 'nullable|exists:departments,id',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'is_pinned' => 'boolean',
            'visibility' => 'required|in:all,students,teachers,staff',
        ]);

        // Ensure is_pinned is always a boolean
        $validated['is_pinned'] = $request->boolean('is_pinned');

        $announcement->update($validated);

        return redirect()->back()->with('success', 'Announcement updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return redirect()->back()->with('success', 'Announcement deleted successfully.');
    }

    /**
     * Toggle the pin status of the specified announcement.
     */
    public function togglePin(Announcement $announcement)
    {
        $announcement->update(['is_pinned' => !$announcement->is_pinned]);

        return redirect()->back()->with('success', 'Announcement pin status updated successfully.');
    }



    public function getAnnouncements(Request $request)
    {
        $announcements = Announcement::with('department')->latest();

        if ($request->has('department_id')) {
            $announcements->where('department_id', $request->department_id);
        }

        return Inertia::render('dashboard', [
            'announcements' => $announcements->get(),
        ]);
    }
}
