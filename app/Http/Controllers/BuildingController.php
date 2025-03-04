<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BuildingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // BuildingsController.php
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = 10;

        $buildings = Building::query()
            ->when($search, function ($query, $search) {
                return $query->where('name', 'LIKE', "%{$search}%");
            })
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $rooms = Room::query()
            ->with('building')
            ->when($search, function ($query, $search) {
                return $query->where('name', 'LIKE', "%{$search}%")
                    ->orWhereHas('building', function ($query) use ($search) {
                        $query->where('name', 'LIKE', "%{$search}%");
                    });
            })
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('buildings', [
            'buildings' => $buildings,
            'rooms' => $rooms,
            'filters' => $request->only(['search', 'page'])
        ]);
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:buildings,name',
        ]);

        $building = Building::create($validated);

        return redirect()->route('buildings.index')->with('sucess', 'Buding created successfully');
    }



    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Building $building)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:buildings,name',
        ]);

        $building->update($validated);

        return redirect()->route('buildings.index')->with('success', 'Building updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Building $building)
    {
        $building->delete();

        return redirect()->route('buildings.index')->with('success', 'Building deleted successfully');
    }
}
