<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\LandRoute;
use App\Models\OrderTemplate;
use App\Models\SimulationAttempt;
use App\Models\TransportTemplate;
use App\Services\HandlingDurationCalculator;
use App\Services\HandlingValidator;
use App\Services\Simulator\ScenarioCompatibilityService;
use App\Services\Simulator\SimulationPreviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SimulationAttemptController extends Controller
{
    private const STUDENT_ACTIVE_STATUS = 'in_progress';
    private const STUDENT_SUBMITTED_STATUS = 'submitted';
    private const TEACHER_TEST_ACTIVE_STATUS = 'teacher_testing';
    private const TEACHER_TEST_SUBMITTED_STATUS = 'teacher_test_submitted';
    private const TEACHER_TEST_ARCHIVED_STATUS = 'teacher_test_archived';

    private const STEP_ORDER = [
        'intro',
        'transport',
        'route',
        'fuel',
        'port',
        'ship',
        'simulation',
        'submit',
    ];

    public function __construct(
        private readonly SimulationPreviewService $previewService,
        private readonly ScenarioCompatibilityService $compatibilityService,
        private readonly HandlingValidator $handlingValidator,
        private readonly HandlingDurationCalculator $handlingDurationCalculator,
    ) {
    }

    public function indexTasks(Request $request): Response
    {
        $templates = OrderTemplate::query()
            ->latest('id')
            ->get();

        return Inertia::render('Student/Dashboard', [
            'templates' => $templates,
        ]);
    }

    public function showTask(Request $request, int $orderTemplateId)
    {
        return $this->redirectToSimulatorForUser($request, $orderTemplateId, '/student/simulator');
    }

    public function showTeacherTask(Request $request, int $orderTemplateId)
    {
        return $this->redirectToSimulatorForUser($request, $orderTemplateId, '/teacher/simulator');
    }

    public function startFreshTeacherTask(Request $request, int $orderTemplateId)
    {
        $template = OrderTemplate::query()->findOrFail($orderTemplateId);

        SimulationAttempt::query()
            ->where('user_id', $request->user()->id)
            ->where('order_template_id', $template->id)
            ->where('status', self::TEACHER_TEST_ACTIVE_STATUS)
            ->get()
            ->each(function (SimulationAttempt $attempt) {
                $attempt->status = self::TEACHER_TEST_ARCHIVED_STATUS;
                $attempt->save();
            });

        $attempt = SimulationAttempt::query()->create([
            'user_id' => $request->user()->id,
            'order_template_id' => $template->id,
            'status' => self::TEACHER_TEST_ACTIVE_STATUS,
            'current_step' => 'intro',
        ]);

        return redirect("/teacher/simulator/{$attempt->id}");
    }

    public function start(Request $request, int $id): Response
    {
        return $this->renderSimulator($request, $id, 'student');
    }

    public function startTeacher(Request $request, int $id): Response
    {
        return $this->renderSimulator($request, $id, 'teacher');
    }

    public function updateStep(Request $request, int $attemptId): JsonResponse
    {
        $attempt = SimulationAttempt::query()
            ->where('user_id', $request->user()->id)
            ->with([
                'orderTemplate.temperatureMode',
                'selectedTransportTemplate',
                'routeSegments.fromLocation',
                'routeSegments.toLocation',
                'fuelStations.location',
                'selectedPort.location',
                'selectedPort.handlingMethods',
                'selectedShip.handlingMethods',
            ])
            ->findOrFail($attemptId);

        $availableSteps = $this->resolveAvailableSteps($attempt->orderTemplate);
        $validated = $request->validate([
            'current_step' => ['required', 'string', 'in:' . implode(',', self::STEP_ORDER)],
            'selected_transport_template_id' => ['nullable', 'integer', 'exists:transport_templates,id'],
            'selected_vehicle_count' => ['nullable', 'integer', 'min:1', 'max:10000'],
            'selected_port_id' => ['nullable', 'integer', 'exists:ports,id'],
            'selected_ship_id' => ['nullable', 'integer', 'exists:ships,id'],
            'selected_loading_method_code' => ['nullable', 'string', 'max:100'],
            'selected_unloading_method_code' => ['nullable', 'string', 'max:100'],
            'loading_method_source' => ['nullable', 'in:port,ship'],
            'unloading_method_source' => ['nullable', 'in:port,ship'],
        ]);

        $requestedStep = $validated['current_step'];

        if (!in_array($requestedStep, $availableSteps, true)) {
            return response()->json([
                'message' => 'Sis solis sim scenarijam nav pieejams.',
            ], 422);
        }

        $originalPortId = $attempt->selected_port_id;
        $originalShipId = $attempt->selected_ship_id;
        $planningChanged = $this->applyPlanningSelections($attempt, $validated);
        $resourcesChanged = $originalPortId !== $attempt->selected_port_id
            || $originalShipId !== $attempt->selected_ship_id;
        $handlingChanged = false;

        if ($resourcesChanged) {
            $this->resetHandlingState($attempt);
            $handlingChanged = true;
        }

        foreach ([
            'selected_loading_method_code',
            'selected_unloading_method_code',
            'loading_method_source',
            'unloading_method_source',
        ] as $field) {
            if (!array_key_exists($field, $validated)) {
                continue;
            }

            if (($attempt->{$field} ?? null) !== $validated[$field]) {
                $attempt->{$field} = $validated[$field];
                $handlingChanged = true;
            }
        }

        $handlingResult = $this->syncHandlingState($attempt);
        $handlingChanged = $handlingChanged || ($handlingResult['changed'] ?? false);

        if (($planningChanged || $handlingChanged) && $requestedStep !== 'simulation') {
            $this->invalidatePreview($attempt);
        }

        if (
            $requestedStep === 'route'
            && in_array('transport', $availableSteps, true)
            && !$attempt->selected_transport_template_id
        ) {
            return response()->json([
                'message' => 'Vispirms izvelies transportu.',
            ], 422);
        }

        if (
            $requestedStep === 'fuel'
            && in_array('route', $availableSteps, true)
            && $attempt->routeSegments->count() === 0
        ) {
            return response()->json([
                'message' => 'Vispirms izveido marsrutu.',
            ], 422);
        }

        if ($requestedStep === 'simulation') {
            $errors = $this->validateSimulationRequirements($attempt, $availableSteps);

            if (!empty($errors)) {
                if ($planningChanged || $handlingChanged) {
                    $attempt->save();
                }

                return response()->json([
                    'message' => implode(' ', $errors),
                    'attempt' => $this->prepareAttemptForClient($attempt),
                    'available_steps' => $availableSteps,
                ], 422);
            }

            $preview = $this->previewService->build($attempt);

            $attempt->preview_result = $preview;
            $attempt->total_cost = $preview['result']['total_cost'] ?? null;
            $attempt->total_time_hours = $preview['result']['trip_time_hours'] ?? null;
            $attempt->total_fuel_liters = $preview['result']['fuel_needed_liters'] ?? null;
            $attempt->is_valid = $preview['result']['is_valid'] ?? null;
            $attempt->score = $preview['result']['score'] ?? null;
        }

        if ($requestedStep === 'submit' && empty($attempt->preview_result)) {
            return $this->blockedSubmissionResponse(
                'Pirms iesniegsanas nepieciesams palaist simulaciju.',
                $attempt,
                $availableSteps,
                ($attempt->orderTemplate->evaluation_mode ?? 'practice') === 'exam',
                'simulation'
            );
        }

        if ($requestedStep === 'submit' && data_get($attempt->preview_result, 'result.is_valid') !== true) {
            $isExamMode = ($attempt->orderTemplate->evaluation_mode ?? 'practice') === 'exam';

            return $this->blockedSubmissionResponse(
                $isExamMode
                    ? 'Risinajumu nevar iesniegt, kamer tas neatbilst visam prasibam.'
                    : 'Risinajumu nevar iesniegt, kamer tajaa ir kritiskas problemas.',
                $attempt,
                $availableSteps,
                $isExamMode,
                'simulation'
            );
        }

        $attempt->current_step = $requestedStep;
        $attempt->save();

        return response()->json([
            'message' => 'Solis saglabats.',
            'attempt' => $this->prepareAttemptForClient($attempt),
            'available_steps' => $availableSteps,
        ]);
    }

    public function saveDraft(Request $request, int $attemptId): JsonResponse
    {
        $attempt = SimulationAttempt::query()
            ->where('user_id', $request->user()->id)
            ->with([
                'orderTemplate.temperatureMode',
                'selectedTransportTemplate',
                'selectedPort.location',
                'selectedPort.handlingMethods',
                'selectedShip.handlingMethods',
                'routeSegments.fromLocation',
                'routeSegments.toLocation',
                'fuelStations.location',
            ])
            ->findOrFail($attemptId);

        $validated = $request->validate([
            'selected_transport_template_id' => ['nullable', 'integer', 'exists:transport_templates,id'],
            'selected_vehicle_count' => ['nullable', 'integer', 'min:1', 'max:10000'],
            'selected_port_id' => ['nullable', 'integer', 'exists:ports,id'],
            'selected_ship_id' => ['nullable', 'integer', 'exists:ships,id'],
            'selected_loading_method_code' => ['nullable', 'string', 'max:100'],
            'selected_unloading_method_code' => ['nullable', 'string', 'max:100'],
            'loading_method_source' => ['nullable', 'in:port,ship'],
            'unloading_method_source' => ['nullable', 'in:port,ship'],
        ]);

        $originalPortId = $attempt->selected_port_id;
        $originalShipId = $attempt->selected_ship_id;
        $planningChanged = $this->applyPlanningSelections($attempt, $validated);
        $resourcesChanged = $originalPortId !== $attempt->selected_port_id
            || $originalShipId !== $attempt->selected_ship_id;
        $handlingChanged = false;

        if ($resourcesChanged) {
            $this->resetHandlingState($attempt);
            $handlingChanged = true;
        }

        foreach ([
            'selected_loading_method_code',
            'selected_unloading_method_code',
            'loading_method_source',
            'unloading_method_source',
        ] as $field) {
            if (!array_key_exists($field, $validated)) {
                continue;
            }

            if (($attempt->{$field} ?? null) !== $validated[$field]) {
                $attempt->{$field} = $validated[$field];
                $handlingChanged = true;
            }
        }

        $handlingResult = $this->syncHandlingState($attempt);
        $handlingChanged = $handlingChanged || ($handlingResult['changed'] ?? false);

        if ($planningChanged || $handlingChanged) {
            $this->invalidatePreview($attempt);
            $attempt->save();
        }

        return response()->json([
            'message' => 'Melnraksts saglabats.',
            'attempt' => $this->prepareAttemptForClient($attempt),
            'available_steps' => $this->resolveAvailableSteps($attempt->orderTemplate),
        ]);
    }

    public function addRouteSegment(Request $request, int $attemptId): JsonResponse
    {
        $attempt = SimulationAttempt::query()
            ->where('user_id', $request->user()->id)
            ->with(['routeSegments', 'orderTemplate'])
            ->findOrFail($attemptId);

        $availableSteps = $this->resolveAvailableSteps($attempt->orderTemplate);

        if (!in_array('route', $availableSteps, true)) {
            return response()->json([
                'message' => 'Sim scenarijam marsruta veidosana nav pieejama.',
            ], 422);
        }

        $validated = $request->validate([
            'land_route_id' => ['required', 'integer', 'exists:land_routes,id'],
        ]);

        $nextPosition = ((int) $attempt->routeSegments->max('pivot.position')) + 1;

        $attempt->routeSegments()->attach($validated['land_route_id'], [
            'position' => $nextPosition,
        ]);

        $this->invalidatePreview($attempt);
        $attempt->save();

        return response()->json([
            'message' => 'Marsruta segments pievienots.',
            'attempt' => $this->prepareAttemptForClient($attempt),
        ]);
    }

    public function removeRouteSegment(Request $request, int $attemptId, int $segmentId): JsonResponse
    {
        $attempt = SimulationAttempt::query()
            ->where('user_id', $request->user()->id)
            ->with(['routeSegments', 'orderTemplate'])
            ->findOrFail($attemptId);

        $availableSteps = $this->resolveAvailableSteps($attempt->orderTemplate);

        if (!in_array('route', $availableSteps, true)) {
            return response()->json([
                'message' => 'Sim scenarijam marsruta veidosana nav pieejama.',
            ], 422);
        }

        $attempt->routeSegments()->detach($segmentId);

        $remaining = $attempt->routeSegments()->orderBy('simulation_attempt_route_segments.position')->get();

        foreach ($remaining as $index => $segment) {
            $attempt->routeSegments()->updateExistingPivot($segment->id, [
                'position' => $index + 1,
            ]);
        }

        $this->invalidatePreview($attempt);
        $attempt->save();

        return response()->json([
            'message' => 'Marsruta segments nonemts.',
            'attempt' => $this->prepareAttemptForClient($attempt),
        ]);
    }

    public function moveRouteSegment(Request $request, int $attemptId, int $segmentId): JsonResponse
    {
        $attempt = SimulationAttempt::query()
            ->where('user_id', $request->user()->id)
            ->with([
                'routeSegments.fromLocation',
                'routeSegments.toLocation',
                'orderTemplate',
            ])
            ->findOrFail($attemptId);

        $availableSteps = $this->resolveAvailableSteps($attempt->orderTemplate);

        if (!in_array('route', $availableSteps, true)) {
            return response()->json([
                'message' => 'Sim scenarijam marsruta veidosana nav pieejama.',
            ], 422);
        }

        $validated = $request->validate([
            'direction' => ['required', 'string', 'in:up,down'],
        ]);

        $segments = $attempt->routeSegments->sortBy('pivot.position')->values();
        $currentIndex = $segments->search(fn (LandRoute $segment) => $segment->id === $segmentId);

        if ($currentIndex === false) {
            return response()->json([
                'message' => 'Marsruta segments nav atrasts megjinajuma.',
            ], 404);
        }

        $targetIndex = $validated['direction'] === 'up'
            ? $currentIndex - 1
            : $currentIndex + 1;

        if (!isset($segments[$targetIndex])) {
            return response()->json([
                'message' => 'Segmentu vairs nevar parvietot saja virziena.',
            ], 422);
        }

        $currentSegment = $segments[$currentIndex];
        $targetSegment = $segments[$targetIndex];

        $attempt->routeSegments()->updateExistingPivot($currentSegment->id, [
            'position' => $targetSegment->pivot->position,
        ]);
        $attempt->routeSegments()->updateExistingPivot($targetSegment->id, [
            'position' => $currentSegment->pivot->position,
        ]);

        $this->invalidatePreview($attempt);
        $attempt->save();

        return response()->json([
            'message' => 'Marsruta segmenta seciba atjaunota.',
            'attempt' => $this->prepareAttemptForClient($attempt),
        ]);
    }

    public function addFuelStation(Request $request, int $attemptId): JsonResponse
    {
        $attempt = SimulationAttempt::query()
            ->where('user_id', $request->user()->id)
            ->with(['fuelStations', 'orderTemplate'])
            ->findOrFail($attemptId);

        $availableSteps = $this->resolveAvailableSteps($attempt->orderTemplate);

        if (!in_array('fuel', $availableSteps, true)) {
            return response()->json([
                'message' => 'Sim scenarijam degvielas planosana nav pieejama.',
            ], 422);
        }

        $validated = $request->validate([
            'fuel_station_id' => ['required', 'integer', 'exists:fuel_stations,id'],
        ]);

        $nextPosition = ((int) $attempt->fuelStations->max('pivot.position')) + 1;

        $attempt->fuelStations()->attach($validated['fuel_station_id'], [
            'position' => $nextPosition,
        ]);

        $this->invalidatePreview($attempt);
        $attempt->save();

        return response()->json([
            'message' => 'Degvielas pietura pievienota.',
            'attempt' => $this->prepareAttemptForClient($attempt),
        ]);
    }

    public function removeFuelStation(Request $request, int $attemptId, int $stationId): JsonResponse
    {
        $attempt = SimulationAttempt::query()
            ->where('user_id', $request->user()->id)
            ->with(['fuelStations', 'orderTemplate'])
            ->findOrFail($attemptId);

        $availableSteps = $this->resolveAvailableSteps($attempt->orderTemplate);

        if (!in_array('fuel', $availableSteps, true)) {
            return response()->json([
                'message' => 'Sim scenarijam degvielas planosana nav pieejama.',
            ], 422);
        }

        $attempt->fuelStations()->detach($stationId);

        $remaining = $attempt->fuelStations()->orderBy('simulation_attempt_fuel_stations.position')->get();

        foreach ($remaining as $index => $station) {
            $attempt->fuelStations()->updateExistingPivot($station->id, [
                'position' => $index + 1,
            ]);
        }

        $this->invalidatePreview($attempt);
        $attempt->save();

        return response()->json([
            'message' => 'Degvielas pietura nonemta.',
            'attempt' => $this->prepareAttemptForClient($attempt),
        ]);
    }

    public function moveFuelStation(Request $request, int $attemptId, int $stationId): JsonResponse
    {
        $attempt = SimulationAttempt::query()
            ->where('user_id', $request->user()->id)
            ->with([
                'fuelStations.location',
                'orderTemplate',
            ])
            ->findOrFail($attemptId);

        $availableSteps = $this->resolveAvailableSteps($attempt->orderTemplate);

        if (!in_array('fuel', $availableSteps, true)) {
            return response()->json([
                'message' => 'Sim scenarijam degvielas planosana nav pieejama.',
            ], 422);
        }

        $validated = $request->validate([
            'direction' => ['required', 'string', 'in:up,down'],
        ]);

        $stations = $attempt->fuelStations->sortBy('pivot.position')->values();
        $currentIndex = $stations->search(fn ($station) => $station->id === $stationId);

        if ($currentIndex === false) {
            return response()->json([
                'message' => 'Degvielas pietura nav atrasta megjinajuma.',
            ], 404);
        }

        $targetIndex = $validated['direction'] === 'up'
            ? $currentIndex - 1
            : $currentIndex + 1;

        if (!isset($stations[$targetIndex])) {
            return response()->json([
                'message' => 'Pieturu vairs nevar parvietot saja virziena.',
            ], 422);
        }

        $currentStation = $stations[$currentIndex];
        $targetStation = $stations[$targetIndex];

        $attempt->fuelStations()->updateExistingPivot($currentStation->id, [
            'position' => $targetStation->pivot->position,
        ]);
        $attempt->fuelStations()->updateExistingPivot($targetStation->id, [
            'position' => $currentStation->pivot->position,
        ]);

        $this->invalidatePreview($attempt);
        $attempt->save();

        return response()->json([
            'message' => 'Degvielas pieturu seciba atjaunota.',
            'attempt' => $this->prepareAttemptForClient($attempt),
        ]);
    }

    public function submit(Request $request, int $attemptId): JsonResponse
    {
        $attempt = SimulationAttempt::query()
            ->where('user_id', $request->user()->id)
            ->with([
                'orderTemplate',
                'routeSegments',
                'fuelStations',
            ])
            ->findOrFail($attemptId);

        $availableSteps = $this->resolveAvailableSteps($attempt->orderTemplate);
        $isExamMode = ($attempt->orderTemplate->evaluation_mode ?? 'practice') === 'exam';

        if (empty($attempt->preview_result)) {
            return $this->blockedSubmissionResponse(
                'Pirms iesniegsanas nepieciesams simulacijas aprekins.',
                $attempt,
                $availableSteps,
                $isExamMode,
                'simulation'
            );
        }

        if (data_get($attempt->preview_result, 'result.is_valid') !== true) {
            return $this->blockedSubmissionResponse(
                $isExamMode
                    ? 'Risinajumu nevar iesniegt, kamer tas neatbilst visam prasibam.'
                    : 'Risinajumu nevar iesniegt, kamer tajaa ir kritiskas problemas.',
                $attempt,
                $availableSteps,
                $isExamMode,
                'simulation'
            );
        }

        $attempt->status = str_starts_with((string) $attempt->status, 'teacher_test')
            ? self::TEACHER_TEST_SUBMITTED_STATUS
            : self::STUDENT_SUBMITTED_STATUS;
        $attempt->submitted_at = now();
        $attempt->current_step = 'submit';
        $attempt->save();

        return response()->json([
            'message' => 'Megjinajums iesniegts.',
            'attempt' => $this->prepareAttemptForClient($attempt),
        ]);
    }

    private function redirectToSimulatorForUser(
        Request $request,
        int $orderTemplateId,
        string $simulatorBasePath
    ) {
        $template = OrderTemplate::query()->findOrFail($orderTemplateId);
        $activeStatus = str_starts_with($simulatorBasePath, '/teacher/')
            ? self::TEACHER_TEST_ACTIVE_STATUS
            : self::STUDENT_ACTIVE_STATUS;

        $attempt = SimulationAttempt::query()->firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'order_template_id' => $template->id,
                'status' => $activeStatus,
            ],
            [
                'current_step' => 'intro',
            ]
        );

        $availableSteps = $this->resolveAvailableSteps($template);
        $firstStep = $availableSteps[0] ?? 'intro';

        if (!in_array($attempt->current_step, $availableSteps, true)) {
            $attempt->current_step = $firstStep;
            $attempt->save();
        }

        return redirect("{$simulatorBasePath}/{$attempt->id}");
    }

    private function renderSimulator(Request $request, int $id, string $simulatorMode): Response
    {
        $attempt = SimulationAttempt::query()
            ->where('user_id', $request->user()->id)
            ->with([
                'orderTemplate.transportTemplates',
                'orderTemplate.landRoutes.fromLocation',
                'orderTemplate.landRoutes.toLocation',
                'orderTemplate.fuelStations.location',
                'orderTemplate.ports.location',
                'orderTemplate.ports.handlingMethods',
                'orderTemplate.ships.handlingMethods',
                'orderTemplate.startLocation',
                'orderTemplate.endLocation',
                'orderTemplate.startPort.location',
                'orderTemplate.endPort.location',
                'orderTemplate.temperatureMode',
                'orderTemplate.specialCondition',
                'selectedTransportTemplate',
                'selectedPort.location',
                'selectedPort.handlingMethods',
                'selectedShip.handlingMethods',
                'routeSegments.fromLocation',
                'routeSegments.toLocation',
                'fuelStations.location',
            ])
            ->findOrFail($id);

        $availableSteps = $this->resolveAvailableSteps($attempt->orderTemplate);

        if (!in_array($attempt->current_step, $availableSteps, true)) {
            $attempt->current_step = $availableSteps[0] ?? 'intro';
            $attempt->save();
        }

        return Inertia::render('Student/Simulator/Show', [
            'template' => $attempt->orderTemplate,
            'attempt' => $this->prepareAttemptForClient($attempt),
            'availableSteps' => $availableSteps,
            'simulatorMode' => $simulatorMode,
            'actionBaseUrl' => $simulatorMode === 'teacher'
                ? '/teacher/simulator/attempt'
                : '/student/simulator/attempt',
            'backHref' => $simulatorMode === 'teacher'
                ? "/teacher/templates/order-templates/{$attempt->orderTemplate->id}"
                : '/student',
            'backLabel' => $simulatorMode === 'teacher'
                ? 'Atpakal uz sagatavi'
                : 'Atpakal uz uzdevumiem',
        ]);
    }

    private function resolveAvailableSteps(OrderTemplate $template): array
    {
        $config = $template->step_config ?? [];

        if (!is_array($config) || empty($config)) {
            return self::STEP_ORDER;
        }

        $enabled = [];

        foreach (self::STEP_ORDER as $step) {
            if (($config[$step] ?? false) === true) {
                $enabled[] = $step;
            }
        }

        if (empty($enabled)) {
            return self::STEP_ORDER;
        }

        return $enabled;
    }

    private function validateSimulationRequirements(SimulationAttempt $attempt, array $availableSteps): array
    {
        $errors = [];
        $handlingContext = $attempt->getAttribute('handling_context');

        if (in_array('transport', $availableSteps, true) && !$attempt->selected_transport_template_id) {
            $errors[] = 'Jaizvelas transports.';
        }

        if (in_array('route', $availableSteps, true) && $attempt->routeSegments->count() === 0) {
            $errors[] = 'Jaizveido marsruts.';
        }

        if (in_array('port', $availableSteps, true) && !$attempt->selected_port_id) {
            $errors[] = 'Jaizvelas osta.';
        }

        if (in_array('ship', $availableSteps, true) && !$attempt->selected_ship_id) {
            $errors[] = 'Jaizvelas kugjis.';
        }

        if (in_array('transport', $availableSteps, true) && !$attempt->selected_vehicle_count) {
            $errors[] = 'Janorada transportu skaits.';
        }

        if (
            in_array('ship', $availableSteps, true)
            && is_array($handlingContext)
            && $attempt->selected_port_id
            && $attempt->selected_ship_id
        ) {
            if (($handlingContext['loading']['required'] ?? false) && !$attempt->selected_loading_method_code) {
                $errors[] = 'Jaizvelas iekrausanas metode.';
            }

            if (($handlingContext['unloading']['required'] ?? false) && !$attempt->selected_unloading_method_code) {
                $errors[] = 'Jaizvelas izkrausanas metode.';
            }

            foreach ((array) ($handlingContext['validation']['errors'] ?? []) as $error) {
                $errors[] = $error;
            }
        }

        return array_values(array_unique(array_filter($errors)));
    }

    private function applyPlanningSelections(SimulationAttempt $attempt, array $validated): bool
    {
        $planningFields = [
            'selected_transport_template_id',
            'selected_vehicle_count',
            'selected_port_id',
            'selected_ship_id',
        ];

        $changed = false;

        foreach ($planningFields as $field) {
            if (!array_key_exists($field, $validated)) {
                continue;
            }

            if (($attempt->{$field} ?? null) !== $validated[$field]) {
                $changed = true;
            }

            $attempt->{$field} = $validated[$field];
        }

        return $changed;
    }

    private function invalidatePreview(SimulationAttempt $attempt): void
    {
        $attempt->preview_result = null;
        $attempt->total_cost = null;
        $attempt->total_time_hours = null;
        $attempt->total_fuel_liters = null;
        $attempt->is_valid = false;
        $attempt->score = null;
    }

    private function loadAttemptStateRelations(SimulationAttempt $attempt): void
    {
        $attempt->load([
            'orderTemplate.temperatureMode',
            'selectedTransportTemplate',
            'selectedPort.location',
            'selectedPort.handlingMethods',
            'selectedShip.handlingMethods',
            'routeSegments.fromLocation',
            'routeSegments.toLocation',
            'fuelStations.location',
        ]);
    }

    private function prepareAttemptForClient(SimulationAttempt $attempt): SimulationAttempt
    {
        $this->loadAttemptStateRelations($attempt);
        $this->appendHandlingContext($attempt);

        return $this->sanitizeAttemptForStudent($attempt);
    }

    private function resetHandlingState(SimulationAttempt $attempt): void
    {
        $attempt->selected_loading_method_code = null;
        $attempt->selected_unloading_method_code = null;
        $attempt->loading_method_source = null;
        $attempt->unloading_method_source = null;
        $attempt->loading_duration_minutes = null;
        $attempt->unloading_duration_minutes = null;
        $attempt->feedback_text = null;
    }

    private function syncHandlingState(SimulationAttempt $attempt): array
    {
        $changed = false;

        if (!$attempt->selected_port_id || !$attempt->selected_ship_id) {
            foreach (['loading_duration_minutes', 'unloading_duration_minutes', 'feedback_text'] as $field) {
                if ($attempt->{$field} !== null) {
                    $attempt->{$field} = null;
                    $changed = true;
                }
            }

            $this->appendHandlingContext($attempt);

            return [
                'changed' => $changed,
                'validation' => null,
            ];
        }

        $attempt->loadMissing([
            'orderTemplate.temperatureMode',
            'selectedPort.handlingMethods',
            'selectedShip.handlingMethods',
        ]);

        $validation = $this->handlingValidator->validate($attempt);
        $changed = $this->applyResolvedHandlingState($attempt, $validation) || $changed;

        if ($validation['valid'] ?? false) {
            $durations = $this->handlingDurationCalculator->calculate($attempt);

            foreach ([
                'loading_duration_minutes' => $durations['loading_duration_minutes'] ?? null,
                'unloading_duration_minutes' => $durations['unloading_duration_minutes'] ?? null,
            ] as $field => $value) {
                if ($attempt->{$field} !== $value) {
                    $attempt->{$field} = $value;
                    $changed = true;
                }
            }

            if ($attempt->feedback_text !== null) {
                $attempt->feedback_text = null;
                $changed = true;
            }
        } else {
            foreach (['loading_duration_minutes', 'unloading_duration_minutes'] as $field) {
                if ($attempt->{$field} !== null) {
                    $attempt->{$field} = null;
                    $changed = true;
                }
            }

            $feedback = implode(' ', (array) ($validation['errors'] ?? [])) ?: null;

            if ($attempt->feedback_text !== $feedback) {
                $attempt->feedback_text = $feedback;
                $changed = true;
            }
        }

        $this->appendHandlingContext($attempt);

        return [
            'changed' => $changed,
            'validation' => $validation,
        ];
    }

    private function applyResolvedHandlingState(SimulationAttempt $attempt, array $handlingValidation): bool
    {
        $changed = false;
        $loading = (array) ($handlingValidation['loading'] ?? []);
        $unloading = (array) ($handlingValidation['unloading'] ?? []);
        $resolvedValues = [
            'selected_loading_method_code' => ($loading['valid'] ?? false) ? ($loading['code'] ?? null) : null,
            'loading_method_source' => ($loading['valid'] ?? false) ? ($loading['source'] ?? null) : null,
            'selected_unloading_method_code' => ($unloading['valid'] ?? false) ? ($unloading['code'] ?? null) : null,
            'unloading_method_source' => ($unloading['valid'] ?? false) ? ($unloading['source'] ?? null) : null,
        ];

        foreach ($resolvedValues as $field => $value) {
            if (($attempt->{$field} ?? null) !== $value) {
                $attempt->{$field} = $value;
                $changed = true;
            }
        }

        return $changed;
    }

    private function appendHandlingContext(SimulationAttempt $attempt): void
    {
        $compatibility = $this->compatibilityService->inspectAttempt($attempt);
        $handling = is_array($compatibility['handling'] ?? null)
            ? $compatibility['handling']
            : [];

        $handling['resource_checks'] = [
            'port' => $compatibility['port'] ?? null,
            'ship' => $compatibility['ship'] ?? null,
            'pair' => $compatibility['pair'] ?? null,
            'valid' => (bool) ($compatibility['valid'] ?? false),
        ];

        $attempt->setAttribute('handling_context', $handling);
    }

    private function sanitizeAttemptForStudent(SimulationAttempt $attempt): SimulationAttempt
    {
        if (($attempt->orderTemplate?->evaluation_mode ?? 'practice') !== 'exam') {
            return $attempt;
        }

        $preview = $attempt->preview_result;

        if (!is_array($preview)) {
            return $attempt;
        }

        $preview['hints'] = [
            'critical' => [],
            'optimization' => [],
            'info' => [],
        ];

        data_set($preview, 'timeline.events', []);
        data_set($preview, 'fuel.approx_leg_distance_km', null);
        data_set($preview, 'timeline.summary.delay_minutes', null);
        data_set($preview, 'timeline.summary.is_within_deadline', null);
        data_set($preview, 'result.score', null);
        data_set($preview, 'result.scoring', null);
        data_set($preview, 'result.score_breakdown', null);
        data_set($preview, 'result.warnings', []);
        data_set($preview, 'result.required_vehicles', null);
        data_set($preview, 'result.selected_vehicles', null);
        data_set($preview, 'result.vehicle_capacity', null);
        data_set($preview, 'result.capacity_per_trip', null);
        data_set($preview, 'result.required_trips', null);
        data_set($preview, 'result.delay_minutes', null);
        data_set($preview, 'result.is_within_deadline', null);
        data_set($preview, 'result.needs_refuel', null);

        $attempt->setAttribute('preview_result', $preview);

        return $attempt;
    }

    private function blockedSubmissionResponse(
        string $message,
        SimulationAttempt $attempt,
        array $availableSteps,
        bool $isExamMode,
        ?string $fallbackStep = null
    ): JsonResponse {
        $payload = [
            'message' => $message,
        ];

        if (!$isExamMode) {
            $targetStep = $this->resolveSubmissionTargetStep($attempt, $availableSteps, $fallbackStep);

            if ($targetStep !== null) {
                $payload['target_step'] = $targetStep;
            }
        }

        return response()->json($payload, 422);
    }

    private function resolveSubmissionTargetStep(
        SimulationAttempt $attempt,
        array $availableSteps,
        ?string $fallbackStep = null
    ): ?string {
        $handlingContext = $attempt->getAttribute('handling_context');

        if (!is_array($handlingContext) && in_array('ship', $availableSteps, true)) {
            $this->appendHandlingContext($attempt);
            $handlingContext = $attempt->getAttribute('handling_context');
        }

        $candidates = [];

        if (
            in_array('transport', $availableSteps, true)
            && (!$attempt->selected_transport_template_id || (int) ($attempt->selected_vehicle_count ?? 0) < 1)
        ) {
            $candidates[] = 'transport';
        }

        if (in_array('route', $availableSteps, true) && $attempt->routeSegments->count() === 0) {
            $candidates[] = 'route';
        }

        if (
            in_array('fuel', $availableSteps, true)
            && (bool) ($attempt->orderTemplate?->requires_refuel_planning ?? false)
            && $attempt->fuelStations->count() === 0
        ) {
            $candidates[] = 'fuel';
        }

        if (in_array('port', $availableSteps, true) && !$attempt->selected_port_id) {
            $candidates[] = 'port';
        }

        if (in_array('ship', $availableSteps, true) && !$attempt->selected_ship_id) {
            $candidates[] = 'ship';
        }

        if (
            in_array('ship', $availableSteps, true)
            && is_array($handlingContext)
            && (
                (($handlingContext['loading']['required'] ?? false) && !$attempt->selected_loading_method_code)
                || (($handlingContext['unloading']['required'] ?? false) && !$attempt->selected_unloading_method_code)
                || !empty($handlingContext['validation']['errors'] ?? [])
            )
        ) {
            $candidates[] = 'ship';
        }

        foreach ((array) data_get($attempt->preview_result, 'result.score_breakdown.penalties', []) as $penalty) {
            $mappedStep = $this->mapPenaltyKeyToStep($penalty['key'] ?? null, $availableSteps);

            if ($mappedStep !== null) {
                $candidates[] = $mappedStep;
            }
        }

        if ($fallbackStep !== null) {
            $candidates[] = $fallbackStep;
        }

        return $this->resolveEarliestAvailableStep($availableSteps, $candidates);
    }

    private function mapPenaltyKeyToStep(?string $penaltyKey, array $availableSteps): ?string
    {
        return match ($penaltyKey) {
            'insufficient_vehicles', 'too_many_trips' => $this->firstAvailableStep($availableSteps, ['transport', 'simulation']),
            'route_chain', 'deadline_delay' => $this->firstAvailableStep($availableSteps, ['route', 'simulation']),
            'missing_fuel_stop', 'range_plan_invalid' => $this->firstAvailableStep($availableSteps, ['fuel', 'simulation']),
            'handling_selection' => $this->firstAvailableStep($availableSteps, ['ship', 'simulation']),
            'port_ship_compatibility' => $this->firstAvailableStep($availableSteps, ['ship', 'port', 'simulation']),
            default => null,
        };
    }

    private function resolveEarliestAvailableStep(array $availableSteps, array $candidates): ?string
    {
        $uniqueCandidates = array_values(array_unique(array_filter(
            $candidates,
            fn ($candidate) => is_string($candidate) && in_array($candidate, $availableSteps, true)
        )));

        if (empty($uniqueCandidates)) {
            return null;
        }

        usort($uniqueCandidates, function (string $left, string $right) use ($availableSteps) {
            return array_search($left, $availableSteps, true) <=> array_search($right, $availableSteps, true);
        });

        return $uniqueCandidates[0] ?? null;
    }

    private function firstAvailableStep(array $availableSteps, array $candidates): ?string
    {
        foreach ($candidates as $candidate) {
            if (in_array($candidate, $availableSteps, true)) {
                return $candidate;
            }
        }

        return null;
    }
}
