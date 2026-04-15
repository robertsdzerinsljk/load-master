<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\OrderTemplate;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(): Response
    {
        $students = User::query()
            ->where('role', 'student')
            ->with([
                'assignedOrderTemplates' => function ($query) {
                    $query->latest();
                }
            ])
            ->orderBy('name')
            ->get();

        $templates = OrderTemplate::query()
            ->orderBy('title')
            ->get(['id', 'title']);

        return Inertia::render('Teacher/Students/Index', [
            'students' => $students,
            'templates' => $templates,
        ]);
    }

    public function assignTask(): RedirectResponse
    {
        $data = request()->validate([
            'user_id' => ['required', 'exists:users,id'],
            'order_template_id' => ['required', 'exists:order_templates,id'],
        ]);

        $student = User::where('role', 'student')->findOrFail($data['user_id']);

        $student->assignedOrderTemplates()->syncWithoutDetaching([
            $data['order_template_id'] => [
                'assigned_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        return redirect()
            ->route('teacher.students')
            ->with('success', 'Uzdevums piešķirts veiksmīgi.');
    }
}