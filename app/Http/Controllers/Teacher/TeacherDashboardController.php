<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class TeacherDashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Teacher/Dashboard', [
            'stats' => [
                'students_count' => 0,
                'templates_count' => 0,
                'attempts_in_progress' => 0,
                'attempts_submitted' => 0,
            ],
            'templates' => [],
            'assignedTasks' => [],
        ]);
    }
}
