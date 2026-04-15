<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\OrderTemplate;
use App\Models\SimulationAttempt;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class TeacherDashboardController extends Controller
{
    public function index(): Response
    {
        $templates = OrderTemplate::query()
            ->withCount('assignedStudents')
            ->latest()
            ->take(6)
            ->get()
            ->map(function ($template) {
                return [
                    'id' => $template->id,
                    'title' => $template->title,
                    'scenario_type' => $template->scenario_type,
                    'status' => $template->status,
                    'cargo_name' => $template->cargo_name,
                    'cargo_type' => $template->cargo_type,
                    'deadline_date' => optional($template->deadline_date)?->format('Y-m-d'),
                    'priority' => $template->priority,
                    'assigned_students_count' => $template->assigned_students_count,
                ];
            });

        $assignedTasks = SimulationAttempt::query()
            ->with([
                'user',
                'orderTemplate',
            ])
            ->latest()
            ->take(8)
            ->get()
            ->map(function ($attempt) {
                return [
                    'id' => $attempt->id,
                    'status' => $attempt->status,
                    'current_step' => $attempt->current_step,
                    'submitted_at' => optional($attempt->submitted_at)?->format('Y-m-d H:i'),
                    'updated_at' => optional($attempt->updated_at)?->format('Y-m-d H:i'),
                    'student_name' => $attempt->user?->name,
                    'student_email' => $attempt->user?->email,
                    'student_class' => null,
                    'template_id' => $attempt->orderTemplate?->id,
                    'template_title' => $attempt->orderTemplate?->title,
                    'deadline_date' => optional($attempt->orderTemplate?->deadline_date)?->format('Y-m-d'),
                    'priority' => $attempt->orderTemplate?->priority,
                ];
            });

        $stats = [
            'students_count' => User::query()->where('role', 'student')->count(),
            'templates_count' => OrderTemplate::query()->count(),
            'attempts_in_progress' => SimulationAttempt::query()->where('status', 'in_progress')->count(),
            'attempts_submitted' => SimulationAttempt::query()->where('status', 'submitted')->count(),
        ];

        return Inertia::render('Teacher/Dashboard', [
            'stats' => $stats,
            'templates' => $templates,
            'assignedTasks' => $assignedTasks,
        ]);
    }
}