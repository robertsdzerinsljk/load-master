<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\TemperatureMode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TemperatureModeController extends Controller
{
    public function index()
    {
        return Inertia::render('Teacher/Templates/Temperature/Index', [
            'modes' => TemperatureMode::latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Teacher/Templates/Temperature/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'range' => 'nullable|string|max:255',
        ]);

        TemperatureMode::create($validated);

        return redirect()->route('teacher.templates.temperature');
    }

    public function edit($id)
    {
        $mode = TemperatureMode::findOrFail($id);

        return Inertia::render('Teacher/Templates/Temperature/Edit', [
            'mode' => $mode,
        ]);
    }

    public function update(Request $request, $id)
    {
        $mode = TemperatureMode::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'range' => 'nullable|string|max:255',
        ]);

        $mode->update($validated);

        return redirect()->route('teacher.templates.temperature');
    }

    public function destroy($id)
    {
        $mode = TemperatureMode::findOrFail($id);
        $mode->delete();

        return redirect()->route('teacher.templates.temperature');
    }
}