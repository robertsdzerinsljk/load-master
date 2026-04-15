<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\CustomsDocument;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomsDocumentController extends Controller
{
    public function index()
    {
        return Inertia::render('Teacher/Templates/Customs/Index', [
            'documents' => CustomsDocument::latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Teacher/Templates/Customs/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        CustomsDocument::create($validated);

        return redirect()->route('teacher.templates.customs');
    }

    public function edit($id)
    {
        $document = CustomsDocument::findOrFail($id);

        return Inertia::render('Teacher/Templates/Customs/Edit', [
            'document' => $document,
        ]);
    }

    public function update(Request $request, $id)
    {
        $document = CustomsDocument::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $document->update($validated);

        return redirect()->route('teacher.templates.customs');
    }

    public function destroy($id)
    {
        $document = CustomsDocument::findOrFail($id);
        $document->delete();

        return redirect()->route('teacher.templates.customs');
    }
}