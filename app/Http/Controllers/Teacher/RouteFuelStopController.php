<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\FuelStation;
use App\Models\LandRoute;
use App\Models\RouteFuelStop;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RouteFuelStopController extends Controller
{
    public function index()
    {
        return Inertia::render('Teacher/Templates/RouteFuelStops/Index', [
            'routeFuelStops' => RouteFuelStop::with([
                'landRoute.fromLocation',
                'landRoute.toLocation',
                'fuelStation.location',
            ])->latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Teacher/Templates/RouteFuelStops/Create', [
            'routes' => LandRoute::with(['fromLocation', 'toLocation'])
                ->orderByDesc('id')
                ->get(),
            'fuelStations' => FuelStation::with('location')
                ->orderByDesc('id')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'land_route_id' => 'required|exists:land_routes,id',
            'fuel_station_id' => 'required|exists:fuel_stations,id',
            'distance_from_start_km' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        RouteFuelStop::create($validated);

        return redirect()->route('teacher.templates.route-fuel-stops');
    }

    public function edit($id)
    {
        $routeFuelStop = RouteFuelStop::findOrFail($id);

        return Inertia::render('Teacher/Templates/RouteFuelStops/Edit', [
            'routeFuelStop' => $routeFuelStop,
            'routes' => LandRoute::with(['fromLocation', 'toLocation'])
                ->orderByDesc('id')
                ->get(),
            'fuelStations' => FuelStation::with('location')
                ->orderByDesc('id')
                ->get(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $routeFuelStop = RouteFuelStop::findOrFail($id);

        $validated = $request->validate([
            'land_route_id' => 'required|exists:land_routes,id',
            'fuel_station_id' => 'required|exists:fuel_stations,id',
            'distance_from_start_km' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $routeFuelStop->update($validated);

        return redirect()->route('teacher.templates.route-fuel-stops');
    }

    public function destroy($id)
    {
        $routeFuelStop = RouteFuelStop::findOrFail($id);
        $routeFuelStop->delete();

        return redirect()->route('teacher.templates.route-fuel-stops');
    }
}