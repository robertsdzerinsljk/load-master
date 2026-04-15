<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\TransportTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransportTemplateController extends Controller
{
    public function index()
    {
        return Inertia::render('Teacher/Templates/Transport/Index', [
            'templates' => TransportTemplate::latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Teacher/Templates/Transport/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'capacity' => 'nullable|string',
            'temperature_support' => 'nullable|string',

            'capacity_containers' => 'nullable|integer|min:0',
            'capacity_tons' => 'nullable|numeric|min:0',
            'avg_speed_kmh' => 'nullable|numeric|min:0',
            'cost_per_km' => 'nullable|numeric|min:0',
            'fuel_consumption_per_100km' => 'nullable|numeric|min:0',
            'max_range_km' => 'nullable|numeric|min:0',
            'loading_time_minutes' => 'nullable|integer|min:0',
            'unloading_time_minutes' => 'nullable|integer|min:0',
        ]);

        TransportTemplate::create($validated);

        return redirect()->route('teacher.templates.transport');
    }

    public function edit($id)
    {
        $template = TransportTemplate::findOrFail($id);

        return Inertia::render('Teacher/Templates/Transport/Edit', [
            'template' => $template,
        ]);
    }

    public function update(Request $request, $id)
    {
        $template = TransportTemplate::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'capacity' => 'nullable|string',
            'temperature_support' => 'nullable|string',

            'capacity_containers' => 'nullable|integer|min:0',
            'capacity_tons' => 'nullable|numeric|min:0',
            'avg_speed_kmh' => 'nullable|numeric|min:0',
            'cost_per_km' => 'nullable|numeric|min:0',
            'fuel_consumption_per_100km' => 'nullable|numeric|min:0',
            'max_range_km' => 'nullable|numeric|min:0',
            'loading_time_minutes' => 'nullable|integer|min:0',
            'unloading_time_minutes' => 'nullable|integer|min:0',
        ]);

        $template->update($validated);

        return redirect()->route('teacher.templates.transport');
    }

    public function destroy($id)
    {
        $template = TransportTemplate::findOrFail($id);
        $template->delete();

        return redirect()->route('teacher.templates.transport');
    }
}