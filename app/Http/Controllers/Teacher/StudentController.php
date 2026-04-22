<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\OrderTemplate;
use App\Models\User;
use App\Services\Simulator\ScenarioReadinessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function __construct(
        private readonly ScenarioReadinessService $scenarioReadinessService
    ) {
    }

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
            ->with([
                'startLocation',
                'endLocation',
                'transportTemplates',
                'landRoutes.fromLocation',
                'landRoutes.toLocation',
                'ports.location',
                'ships',
            ])
            ->orderBy('title')
            ->get()
            ->map(function (OrderTemplate $template) {
                return [
                    'id' => $template->id,
                    'title' => $template->title,
                    'readiness' => $this->scenarioReadinessService->evaluate($template),
                ];
            })
            ->values();

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
            'confirm_warning' => ['nullable', 'boolean'],
        ]);

        $student = User::where('role', 'student')->findOrFail($data['user_id']);
        $template = OrderTemplate::query()
            ->with([
                'startLocation',
                'endLocation',
                'transportTemplates',
                'landRoutes.fromLocation',
                'landRoutes.toLocation',
                'ports.location',
                'ships',
            ])
            ->findOrFail($data['order_template_id']);

        $readiness = $this->scenarioReadinessService->evaluate($template);

        if ($readiness['has_critical_issues']) {
            throw ValidationException::withMessages([
                'order_template_id' => "Šo uzdevumu vēl nevar piešķirt. {$readiness['headline']}.",
            ]);
        }

        if (($readiness['status'] ?? null) === 'warning' && !($data['confirm_warning'] ?? false)) {
            throw ValidationException::withMessages([
                'order_template_id' => 'Šim uzdevumam ir brīdinājumi. Apstiprini piešķiršanu vēlreiz, ja vēlies turpināt.',
            ]);
        }

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
