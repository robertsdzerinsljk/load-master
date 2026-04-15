<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Ship;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShipController extends Controller
{
    public function index()
    {
        return Inertia::render('Teacher/Templates/Ships/Index', [
            'ships' => Ship::latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Teacher/Templates/Ships/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'cargo_type' => 'nullable|string|max:100',
            'capacity_containers' => 'nullable|integer|min:0',
            'capacity_tons' => 'nullable|numeric|min:0',
            'draft_m' => 'nullable|numeric|min:0',
            'fuel_consumption_per_hour' => 'nullable|numeric|min:0',
            'speed_kmh' => 'nullable|numeric|min:0',
            'loading_capacity_containers_per_hour' => 'nullable|numeric|min:0',
            'loading_capacity_tons_per_hour' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        Ship::create($validated);

        return redirect()->route('teacher.templates.ships');
    }

    public function edit($id)
    {
        $ship = Ship::findOrFail($id);

        return Inertia::render('Teacher/Templates/Ships/Edit', [
            'ship' => $ship,
        ]);
    }

    public function update(Request $request, $id)
    {
        $ship = Ship::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'cargo_type' => 'nullable|string|max:100',
            'capacity_containers' => 'nullable|integer|min:0',
            'capacity_tons' => 'nullable|numeric|min:0',
            'draft_m' => 'nullable|numeric|min:0',
            'fuel_consumption_per_hour' => 'nullable|numeric|min:0',
            'speed_kmh' => 'nullable|numeric|min:0',
            'loading_capacity_containers_per_hour' => 'nullable|numeric|min:0',
            'loading_capacity_tons_per_hour' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $ship->update($validated);

        return redirect()->route('teacher.templates.ships');
    }

    public function destroy($id)
    {
        $ship = Ship::findOrFail($id);
        $ship->delete();

        return redirect()->route('teacher.templates.ships');
    }
}