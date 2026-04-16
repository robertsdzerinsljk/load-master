<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403, 'Nav piekļuves (nav autentificēts).');
        }

        if ($user->role !== $role) {
            abort(403, 'Tev nav piekļuves šai sadaļai.');
        }

        return $next($request);
    }
}