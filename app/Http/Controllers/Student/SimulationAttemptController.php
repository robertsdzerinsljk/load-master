<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\OrderTemplate;
use App\Models\SimulationAttempt;
use App\Services\Simulator\SimulationPreviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class SimulationAttemptController extends Controller
{
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

        return Inertia::render('Student/Simulator/Show', [
            'template' => $attempt->orderTemplate,
            'attempt' => $attempt,
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

        $validated = $request->validate([
            'current_step' => ['required', 'string', 'in:intro,transport,route,fuel,port,ship,simulation,submit'],
            'selected_transport_template_id' => ['nullable', 'integer', 'exists:transport_templates,id'],
            'selected_vehicle_count' => ['nullable', 'integer', 'min:1', 'max:10000'],

            'selected_port_id' => ['nullable', 'integer', 'exists:ports,id'],
            'selected_ship_id' => ['nullable', 'integer', 'exists:ships,id'],
        ]);

        if (array_key_exists('selected_transport_template_id', $validated)) {
            $attempt->selected_transport_template_id = $validated['selected_transport_template_id'];
        }

        if (array_key_exists('selected_vehicle_count', $validated)) {
            $attempt->selected_vehicle_count = $validated['selected_vehicle_count'];
        }

        $requestedStep = $validated['current_step'];

        if ($requestedStep === 'route' && !$attempt->selected_transport_template_id) {
            return response()->json([
                'message' => 'Vispirms izvēlies transportu.',
            ], 422);
        }

        if ($requestedStep === 'fuel' && $attempt->routeSegments->count() === 0) {
            return response()->json([
                'message' => 'Vispirms izveido maršrutu.',
            ], 422);
        }

        if ($requestedStep === 'simulation') {
            if (
                !$attempt->selected_transport_template_id ||
                !$attempt->selected_vehicle_count ||
                $attempt->routeSegments->count() === 0
            ) {
                return response()->json([
                    'message' => 'Lai aprēķinātu preview, jāizvēlas transports, transportu skaits un jāizveido maršruts.',
                ], 422);
            }
        if (array_key_exists('selected_port_id', $validated)) {
                $attempt->selected_port_id = $validated['selected_port_id'];
            }

            if (array_key_exists('selected_ship_id', $validated)) {
                $attempt->selected_ship_id = $validated['selected_ship_id'];
            }

            $preview = $this->previewService->build($attempt);

            $attempt->preview_result = $preview;
            $attempt->total_cost = $preview['result']['total_cost'];
            $attempt->total_time_hours = $preview['result']['trip_time_hours'];
            $attempt->total_fuel_liters = $preview['result']['fuel_needed_liters'];
            $attempt->is_valid = $preview['result']['is_valid'];
            $attempt->score = $preview['result']['score'];
        }

        if ($requestedStep === 'submit' && empty($attempt->preview_result)) {
            return response()->json([
                'message' => 'Pirms iesniegšanas nepieciešams aprēķināt preview.',
            ], 422);
        }

        $attempt->current_step = $requestedStep;
        $attempt->save();

        $attempt->load([
    'routeSegments.fromLocation',
    'routeSegments.toLocation',
    'fuelStations.location',
]);

        return response()->json([
            'message' => 'Solis saglabāts.',
            'attempt' => $attempt,
        ]);
    }

    public function addRouteSegment(Request $request, int $attemptId): JsonResponse
    {
        $attempt = SimulationAttempt::query()
            ->where('user_id', $request->user()->id)
            ->with('routeSegments')
            ->findOrFail($attemptId);

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
            ->with('routeSegments')
            ->findOrFail($attemptId);

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
            ->with('fuelStations')
            ->findOrFail($attemptId);

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
            ->with('fuelStations')
            ->findOrFail($attemptId);

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
                'message' => 'Pirms iesniegšanas nepieciešams aprēķināt preview.',
            ], 422);
        }

        $attempt->status = 'submitted';
        $attempt->current_step = 'submit';
        $attempt->submitted_at = Carbon::now();
        $attempt->save();

        return response()->json([
            'message' => 'Risinājums iesniegts.',
            'attempt' => $attempt,
        ]);
    }
}