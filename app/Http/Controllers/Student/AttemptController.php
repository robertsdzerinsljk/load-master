<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\SimulationAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttemptController extends Controller
{
    public function index(Request $request): Response
    {
        $attempts = SimulationAttempt::query()
            ->where('user_id', $request->user()->id)
            ->with([
                'orderTemplate',
            ])
            ->latest('updated_at')
            ->get();

        return Inertia::render('Student/Attempts/Index', [
            'attempts' => $attempts,
        ]);
    }
}