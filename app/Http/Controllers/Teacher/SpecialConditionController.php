<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\SpecialCondition;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SpecialConditionController extends Controller
{
    public function index()
    {
        return Inertia::render('Teacher/Templates/SpecialConditions/Index', [
            'conditions' => SpecialCondition::latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Teacher/Templates/SpecialConditions/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        SpecialCondition::create($validated);

        return redirect()->route('teacher.templates.special-conditions');
    }

    public function edit($id)
    {
        $condition = SpecialCondition::findOrFail($id);

        return Inertia::render('Teacher/Templates/SpecialConditions/Edit', [
            'condition' => $condition,
        ]);
    }

    public function update(Request $request, $id)
    {
        $condition = SpecialCondition::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $condition->update($validated);

        return redirect()->route('teacher.templates.special-conditions');
    }
}