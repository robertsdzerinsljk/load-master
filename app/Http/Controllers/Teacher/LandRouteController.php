<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\LandRoute;
use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandRouteController extends Controller
{
    public function index()
    {
        return Inertia::render('Teacher/Templates/LandRoutes/Index', [
            'routes' => LandRoute::with(['fromLocation', 'toLocation'])
                ->latest()
                ->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Teacher/Templates/LandRoutes/Create', [
            'locations' => Location::orderBy('name')->get(['id', 'name', 'type', 'city']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'from_location_id' => 'required|exists:locations,id|different:to_location_id',
            'to_location_id' => 'required|exists:locations,id|different:from_location_id',
            'distance_km' => 'required|numeric|min:0',
            'estimated_time_hours' => 'nullable|numeric|min:0',
            'toll_cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        LandRoute::create($validated);

        return redirect()->route('teacher.templates.land-routes');
    }

    public function edit($id)
    {
        $route = LandRoute::findOrFail($id);

        return Inertia::render('Teacher/Templates/LandRoutes/Edit', [
            'routeItem' => $route,
            'locations' => Location::orderBy('name')->get(['id', 'name', 'type', 'city']),
        ]);
    }

    public function update(Request $request, $id)
    {
        $route = LandRoute::findOrFail($id);

        $validated = $request->validate([
            'from_location_id' => 'required|exists:locations,id|different:to_location_id',
            'to_location_id' => 'required|exists:locations,id|different:from_location_id',
            'distance_km' => 'required|numeric|min:0',
            'estimated_time_hours' => 'nullable|numeric|min:0',
            'toll_cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $route->update($validated);

        return redirect()->route('teacher.templates.land-routes');
    }

    public function destroy($id)
    {
        $route = LandRoute::findOrFail($id);
        $route->delete();

        return redirect()->route('teacher.templates.land-routes');
    }
}