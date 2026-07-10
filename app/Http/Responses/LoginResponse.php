<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $user = $request->user();

        if ($user?->role === 'admin') {
            return redirect()->route('admin.users');
        }

        if ($user?->role === 'teacher') {
            return redirect()->route('teacher.dashboard');
        }

        if ($user?->role === 'student') {
            if (! $user->class_id) {
                return redirect()->route('onboarding.student-group');
            }

            return redirect()->route('student.dashboard');
        }

        return redirect('/');
    }
}
