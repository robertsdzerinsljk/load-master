<?php

namespace App\Http\Controllers\Common;

use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RoleSwitchController
{
    public function index(): Response
    {
        return Inertia::render('RoleSelect/Index');
    }

    public function setTeacher(): RedirectResponse
    {
        session(['active_role' => 'teacher']);

        return redirect()->route('teacher.dashboard');
    }

    public function setStudent(): RedirectResponse
    {
        session(['active_role' => 'student']);

        return redirect()->route('student.dashboard');
    }
}