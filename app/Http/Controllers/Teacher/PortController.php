<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Port;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PortController extends Controller
{
    public function index()
    {
        return Inertia::render('Teacher/Templates/Ports/Index', [
            'ports' => Port::latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Teacher/Templates/Ports/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'max_draft_m' => 'nullable|numeric|min:0',
            'city_distance_km' => 'nullable|numeric|min:0',
            'loading_rate_containers_per_hour' => 'nullable|numeric|min:0',
            'loading_rate_tons_per_hour' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        Port::create($validated);

        return redirect()->route('teacher.templates.ports');
    }

    public function edit($id)
    {
        $port = Port::findOrFail($id);

        return Inertia::render('Teacher/Templates/Ports/Edit', [
            'port' => $port,
        ]);
    }

    public function update(Request $request, $id)
    {
        $port = Port::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'max_draft_m' => 'nullable|numeric|min:0',
            'city_distance_km' => 'nullable|numeric|min:0',
            'loading_rate_containers_per_hour' => 'nullable|numeric|min:0',
            'loading_rate_tons_per_hour' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $port->update($validated);

        return redirect()->route('teacher.templates.ports');
    }

    public function destroy($id)
    {
        $port = Port::findOrFail($id);
        $port->delete();

        return redirect()->route('teacher.templates.ports');
    }
}