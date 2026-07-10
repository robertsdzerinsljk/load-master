<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\OrderTemplate;
use App\Models\SimulationAttempt;
use App\Models\User;
use App\Services\Simulator\ScenarioReadinessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
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
                'class',
                'assignedOrderTemplates' => function ($query) {
                    $query->latest();
                }
            ])
            ->orderBy('name')
            ->get()
            ->map(fn (User $student) => [
                'id' => $student->id,
                'name' => $student->name,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'display_name' => $this->displayName($student),
                'email' => $student->email,
                'class_id' => $student->class_id,
                'class_name' => $student->class?->name,
                'class' => $student->class ? [
                    'id' => $student->class->id,
                    'name' => $student->class->name,
                    'code' => $student->class->code,
                    'academic_year' => $student->class->academic_year,
                ] : null,
                'assignedOrderTemplates' => $student->assignedOrderTemplates
                    ->map(fn (OrderTemplate $template) => [
                        'id' => $template->id,
                        'title' => $template->title,
                    ])
                    ->values(),
            ])
            ->values();

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

    public function show(User $student): Response
    {
        abort_unless($student->role === 'student', 404);

        $student->load([
            'class',
            'assignedOrderTemplates' => function ($query) {
                $query->orderByPivot('assigned_at', 'desc');
            },
        ]);

        $attempts = SimulationAttempt::query()
            ->with(['orderTemplate', 'feedback'])
            ->where('user_id', $student->id)
            ->latest('updated_at')
            ->get();

        $attemptsByTemplate = $attempts
            ->filter(fn (SimulationAttempt $attempt) => $attempt->order_template_id !== null)
            ->groupBy('order_template_id');

        $assignments = $student->assignedOrderTemplates
            ->map(function (OrderTemplate $template) use ($attemptsByTemplate) {
                $latestAttempt = $attemptsByTemplate->get($template->id)?->first();
                $assignedAt = $template->pivot?->assigned_at
                    ? Carbon::parse($template->pivot->assigned_at)->format('Y-m-d H:i')
                    : null;

                return [
                    'id' => $template->id,
                    'title' => $template->title,
                    'scenario_type' => $template->scenario_type,
                    'priority' => $template->priority,
                    'deadline_date' => optional($template->deadline_date)?->format('Y-m-d'),
                    'assigned_at' => $assignedAt,
                    'attempt_id' => $latestAttempt?->id,
                    'attempt_status' => $latestAttempt?->status,
                    'attempt_updated_at' => optional($latestAttempt?->updated_at)?->format('Y-m-d H:i'),
                ];
            })
            ->values();

        $grades = $attempts
            ->pluck('feedback.grade')
            ->filter(fn ($grade) => $grade !== null);

        $scores = $attempts
            ->map(fn (SimulationAttempt $attempt) => $attempt->score ?? data_get($attempt->preview_result, 'result.score'))
            ->filter(fn ($score) => $score !== null);

        return Inertia::render('Teacher/Students/Show', [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'display_name' => $this->displayName($student),
                'email' => $student->email,
                'class_name' => $student->class?->name,
                'created_at' => optional($student->created_at)?->format('Y-m-d'),
            ],
            'stats' => [
                'assigned_count' => $assignments->count(),
                'attempts_count' => $attempts->count(),
                'in_progress_count' => $attempts->where('status', 'in_progress')->count(),
                'submitted_count' => $attempts->where('status', 'submitted')->count(),
                'reviewed_count' => $attempts->where('status', 'reviewed')->count(),
                'average_grade' => $grades->isNotEmpty() ? round($grades->avg(), 1) : null,
                'average_score' => $scores->isNotEmpty() ? round($scores->avg(), 1) : null,
            ],
            'assignments' => $assignments,
            'attempts' => $attempts
                ->map(fn (SimulationAttempt $attempt) => [
                    'id' => $attempt->id,
                    'status' => $attempt->status,
                    'current_step' => $attempt->current_step,
                    'submitted_at' => optional($attempt->submitted_at)?->format('Y-m-d H:i'),
                    'updated_at' => optional($attempt->updated_at)?->format('Y-m-d H:i'),
                    'score' => $attempt->score ?? data_get($attempt->preview_result, 'result.score'),
                    'total_cost' => $attempt->total_cost ?? data_get($attempt->preview_result, 'result.total_cost'),
                    'total_time_hours' => $attempt->total_time_hours ?? data_get($attempt->preview_result, 'result.total_time_hours'),
                    'total_fuel_liters' => $attempt->total_fuel_liters ?? data_get($attempt->preview_result, 'result.fuel_needed_liters'),
                    'template' => $attempt->orderTemplate ? [
                        'id' => $attempt->orderTemplate->id,
                        'title' => $attempt->orderTemplate->title,
                        'scenario_type' => $attempt->orderTemplate->scenario_type,
                        'deadline_date' => optional($attempt->orderTemplate->deadline_date)?->format('Y-m-d'),
                        'priority' => $attempt->orderTemplate->priority,
                    ] : null,
                    'feedback' => $attempt->feedback ? [
                        'grade' => $attempt->feedback->grade,
                        'comment' => $attempt->feedback->comment,
                    ] : null,
                ])
                ->values(),
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

    private function displayName(User $user): string
    {
        $fullName = trim(collect([$user->first_name, $user->last_name])
            ->filter()
            ->implode(' '));

        return $fullName !== '' ? $fullName : $user->name;
    }
}
