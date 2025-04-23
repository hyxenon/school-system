<?php

namespace App\Http\Controllers;

use App\Models\DTR;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DTRController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('dtr');
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(DTR $dTR)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DTR $dTR)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DTR $dTR)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DTR $dTR)
    {
        //
    }
}
