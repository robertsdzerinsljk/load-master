<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        return match ($user->role) {
            'admin' => redirect()->route('admin.users'),
            'teacher' => redirect()->route('teacher.dashboard'),
            'student' => $user->class_id
                ? redirect()->route('student.dashboard')
                : redirect()->route('onboarding.student-group'),
            default => redirect()->route('login'),
        };
    }
}
