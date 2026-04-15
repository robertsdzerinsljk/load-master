<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\FuelStation;
use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FuelStationController extends Controller
{
    public function index()
    {
        return Inertia::render('Teacher/Templates/FuelStations/Index', [
            'fuelStations' => FuelStation::with('location')
                ->latest()
                ->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Teacher/Templates/FuelStations/Create', [
            'locations' => Location::where('type', 'fuel_station')
                ->orderBy('name')
                ->get(['id', 'name', 'city', 'country']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'location_id' => 'required|exists:locations,id|unique:fuel_stations,location_id',
            'fuel_type' => 'nullable|string|max:100',
            'price_per_liter' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        FuelStation::create($validated);

        return redirect()->route('teacher.templates.fuel-stations');
    }

    public function edit($id)
    {
        $fuelStation = FuelStation::findOrFail($id);

        return Inertia::render('Teacher/Templates/FuelStations/Edit', [
            'fuelStation' => $fuelStation,
            'locations' => Location::where('type', 'fuel_station')
                ->orderBy('name')
                ->get(['id', 'name', 'city', 'country']),
        ]);
    }

    public function update(Request $request, $id)
    {
        $fuelStation = FuelStation::findOrFail($id);

        $validated = $request->validate([
            'location_id' => 'required|exists:locations,id|unique:fuel_stations,location_id,' . $fuelStation->id,
            'fuel_type' => 'nullable|string|max:100',
            'price_per_liter' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $fuelStation->update($validated);

        return redirect()->route('teacher.templates.fuel-stations');
    }

    public function destroy($id)
    {
        $fuelStation = FuelStation::findOrFail($id);
        $fuelStation->delete();

        return redirect()->route('teacher.templates.fuel-stations');
    }
}