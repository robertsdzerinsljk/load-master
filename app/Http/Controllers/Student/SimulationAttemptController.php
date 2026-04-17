<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\OrderTemplate;
use App\Models\SimulationAttempt;
use App\Models\TransportTemplate;
use App\Models\LandRoute;
use App\Services\Simulator\SimulationPreviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SimulationAttemptController extends Controller
{
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
        private readonly SimulationPreviewService $previewService
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
        $template = OrderTemplate::query()->findOrFail($orderTemplateId);

        $attempt = SimulationAttempt::query()->firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'order_template_id' => $template->id,
                'status' => 'in_progress',
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

        return redirect("/student/simulator/{$attempt->id}");
    }

    public function start(Request $request, int $id): Response
    {
        $attempt = SimulationAttempt::query()
            ->where('user_id', $request->user()->id)
            ->with([
                'orderTemplate.transportTemplates',
                'orderTemplate.landRoutes.fromLocation',
                'orderTemplate.landRoutes.toLocation',
                'orderTemplate.fuelStations.location',
                'orderTemplate.ports.location',
                'orderTemplate.ships',
                'orderTemplate.startLocation',
                'orderTemplate.endLocation',
                'orderTemplate.temperatureMode',
                'orderTemplate.specialCondition',
                'selectedTransportTemplate',
                'selectedPort.location',
                'selectedShip',
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
            'attempt' => $attempt,
            'availableSteps' => $availableSteps,
        ]);
    }

    public function updateStep(Request $request, int $attemptId): JsonResponse
    {
        $attempt = SimulationAttempt::query()
            ->where('user_id', $request->user()->id)
            ->with([
                'orderTemplate',
                'selectedTransportTemplate',
                'routeSegments.fromLocation',
                'routeSegments.toLocation',
                'fuelStations.location',
                'selectedPort',
                'selectedShip',
            ])
            ->findOrFail($attemptId);

        $availableSteps = $this->resolveAvailableSteps($attempt->orderTemplate);

        $validated = $request->validate([
            'current_step' => ['required', 'string', 'in:' . implode(',', self::STEP_ORDER)],
            'selected_transport_template_id' => ['nullable', 'integer', 'exists:transport_templates,id'],
            'selected_vehicle_count' => ['nullable', 'integer', 'min:1', 'max:10000'],
            'selected_port_id' => ['nullable', 'integer', 'exists:ports,id'],
            'selected_ship_id' => ['nullable', 'integer', 'exists:ships,id'],
        ]);

        $requestedStep = $validated['current_step'];

        if (!in_array($requestedStep, $availableSteps, true)) {
            return response()->json([
                'message' => 'Šis solis šim scenārijam nav pieejams.',
            ], 422);
        }

        if (array_key_exists('selected_transport_template_id', $validated)) {
            $attempt->selected_transport_template_id = $validated['selected_transport_template_id'];
        }

        if (array_key_exists('selected_vehicle_count', $validated)) {
            $attempt->selected_vehicle_count = $validated['selected_vehicle_count'];
        }

        if (array_key_exists('selected_port_id', $validated)) {
            $attempt->selected_port_id = $validated['selected_port_id'];
        }

        if (array_key_exists('selected_ship_id', $validated)) {
            $attempt->selected_ship_id = $validated['selected_ship_id'];
        }

        if ($requestedStep === 'route' && in_array('transport', $availableSteps, true) && !$attempt->selected_transport_template_id) {
            return response()->json([
                'message' => 'Vispirms izvēlies transportu.',
            ], 422);
        }

        if ($requestedStep === 'fuel' && in_array('route', $availableSteps, true) && $attempt->routeSegments->count() === 0) {
            return response()->json([
                'message' => 'Vispirms izveido maršrutu.',
            ], 422);
        }

        if ($requestedStep === 'simulation') {
            $errors = $this->validateSimulationRequirements($attempt, $availableSteps);

            if (!empty($errors)) {
                return response()->json([
                    'message' => implode(' ', $errors),
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
            return response()->json([
                'message' => 'Pirms iesniegšanas nepieciešams aprēķināt preview.',
            ], 422);
        }

        $attempt->current_step = $requestedStep;
        $attempt->save();

        $attempt->load([
            'selectedTransportTemplate',
            'selectedPort.location',
            'selectedShip',
            'routeSegments.fromLocation',
            'routeSegments.toLocation',
            'fuelStations.location',
        ]);

        return response()->json([
            'message' => 'Solis saglabāts.',
            'attempt' => $attempt,
            'available_steps' => $availableSteps,
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
                'message' => 'Šim scenārijam maršruta veidošana nav pieejama.',
            ], 422);
        }

        $validated = $request->validate([
            'land_route_id' => ['required', 'integer', 'exists:land_routes,id'],
        ]);

        $nextPosition = ((int) $attempt->routeSegments->max('pivot.position')) + 1;

        $attempt->routeSegments()->attach($validated['land_route_id'], [
            'position' => $nextPosition,
        ]);

        $attempt->load([
            'routeSegments.fromLocation',
            'routeSegments.toLocation',
        ]);

        return response()->json([
            'message' => 'Maršruta segments pievienots.',
            'attempt' => $attempt,
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
                'message' => 'Šim scenārijam maršruta veidošana nav pieejama.',
            ], 422);
        }

        $attempt->routeSegments()->detach($segmentId);

        $remaining = $attempt->routeSegments()->orderBy('simulation_attempt_route_segments.position')->get();

        foreach ($remaining as $index => $segment) {
            $attempt->routeSegments()->updateExistingPivot($segment->id, [
                'position' => $index + 1,
            ]);
        }

        $attempt->load([
            'routeSegments.fromLocation',
            'routeSegments.toLocation',
        ]);

        return response()->json([
            'message' => 'Maršruta segments noņemts.',
            'attempt' => $attempt,
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
                'message' => 'Šim scenārijam degvielas plānošana nav pieejama.',
            ], 422);
        }

        $validated = $request->validate([
            'fuel_station_id' => ['required', 'integer', 'exists:fuel_stations,id'],
        ]);

        $nextPosition = ((int) $attempt->fuelStations->max('pivot.position')) + 1;

        $attempt->fuelStations()->attach($validated['fuel_station_id'], [
            'position' => $nextPosition,
        ]);

        $attempt->load('fuelStations.location');

        return response()->json([
            'message' => 'Degvielas pietura pievienota.',
            'attempt' => $attempt,
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
                'message' => 'Šim scenārijam degvielas plānošana nav pieejama.',
            ], 422);
        }

        $attempt->fuelStations()->detach($stationId);

        $remaining = $attempt->fuelStations()->orderBy('simulation_attempt_fuel_stations.position')->get();

        foreach ($remaining as $index => $station) {
            $attempt->fuelStations()->updateExistingPivot($station->id, [
                'position' => $index + 1,
            ]);
        }

        $attempt->load('fuelStations.location');

        return response()->json([
            'message' => 'Degvielas pietura noņemta.',
            'attempt' => $attempt,
        ]);
    }

    public function submit(Request $request, int $attemptId): JsonResponse
    {
        $attempt = SimulationAttempt::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($attemptId);

        if (empty($attempt->preview_result)) {
            return response()->json([
                'message' => 'Pirms iesniegšanas nepieciešams preview aprēķins.',
            ], 422);
        }

        $attempt->status = 'submitted';
        $attempt->submitted_at = now();
        $attempt->current_step = 'submit';
        $attempt->save();

        return response()->json([
            'message' => 'Mēģinājums iesniegts.',
            'attempt' => $attempt,
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

        if (in_array('transport', $availableSteps, true) && !$attempt->selected_transport_template_id) {
            $errors[] = 'Jāizvēlas transports.';
        }

        if (in_array('route', $availableSteps, true) && $attempt->routeSegments->count() === 0) {
            $errors[] = 'Jāizveido maršruts.';
        }

        if (in_array('port', $availableSteps, true) && !$attempt->selected_port_id) {
            $errors[] = 'Jāizvēlas osta.';
        }

        if (in_array('ship', $availableSteps, true) && !$attempt->selected_ship_id) {
            $errors[] = 'Jāizvēlas kuģis.';
        }

        if (in_array('transport', $availableSteps, true) && !$attempt->selected_vehicle_count) {
            $errors[] = 'Jānorāda transportu skaits.';
        }

        return $errors;
    }
}