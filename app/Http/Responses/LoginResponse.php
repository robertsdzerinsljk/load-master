<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $user = $request->user();

        if ($user?->role === 'teacher') {
            return redirect()->route('teacher.dashboard');
        }

        if ($user?->role === 'student') {
            return redirect()->route('student.dashboard');
        }

        return redirect('/');
    }
}