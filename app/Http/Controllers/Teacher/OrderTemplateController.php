<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\LandRoute;
use App\Models\Location;
use App\Models\OrderTemplate;
use App\Models\Port;
use App\Models\Ship;
use App\Models\SimulationAttempt;
use App\Models\SpecialCondition;
use App\Models\TemperatureMode;
use App\Models\TransportTemplate;
use App\Services\LandTransportCalculator;
use App\Services\Simulator\ScenarioReadinessService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderTemplateController extends Controller
{
    public function __construct(
        private readonly ScenarioReadinessService $scenarioReadinessService
    ) {
    }

    public function index()
    {
        return Inertia::render('Teacher/Templates/OrderTemplates/Index', [
            'templates' => OrderTemplate::with([
                'startLocation',
                'endLocation',
                'temperatureMode',
                'specialCondition',
                'transportTemplates',
                'ships',
                'ports',
                'landRoutes',
            ])->latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Teacher/Templates/OrderTemplates/Create', [
            'options' => $this->getOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateTemplate($request);

        $templateFields = $this->extractTemplateFields($validated);

        $template = OrderTemplate::create($templateFields);

        $this->syncRelations($template, $validated);

        return redirect()->route('teacher.templates.order-templates.show', $template->id);
    }

    public function show(Request $request, int $id)
    {
        $template = OrderTemplate::query()
            ->with([
                'temperatureMode',
                'specialCondition',
                'startLocation',
                'endLocation',
                'startPort',
                'endPort',
                'transportTemplates',
                'ships',
                'ports',
                'landRoutes.fromLocation',
                'landRoutes.toLocation',
            ])
            ->findOrFail($id);

        $teacherTests = SimulationAttempt::query()
            ->where('user_id', $request->user()->id)
            ->where('order_template_id', $template->id)
            ->whereIn('status', [
                'teacher_testing',
                'teacher_test_submitted',
                'teacher_test_archived',
            ])
            ->latest('updated_at')
            ->get();

        $latestTeacherTest = $teacherTests->first();
        $readiness = $this->scenarioReadinessService->evaluate($template, $latestTeacherTest);

        return Inertia::render('Teacher/Templates/OrderTemplates/Show', [
            'template' => $template,
            'readiness' => $readiness,
            'latestTeacherTest' => $latestTeacherTest ? [
                'id' => $latestTeacherTest->id,
                'status' => $latestTeacherTest->status,
                'current_step' => $latestTeacherTest->current_step,
                'score' => data_get($latestTeacherTest->preview_result, 'result.score', $latestTeacherTest->score),
                'is_valid' => data_get($latestTeacherTest->preview_result, 'result.is_valid', $latestTeacherTest->is_valid),
                'updated_at' => optional($latestTeacherTest->updated_at)?->format('Y-m-d H:i'),
                'submitted_at' => optional($latestTeacherTest->submitted_at)?->format('Y-m-d H:i'),
                'qualitySummary' => $this->buildTeacherTestQualitySummary($latestTeacherTest),
            ] : null,
            'teacherTestStats' => [
                'total' => $teacherTests->count(),
                'active' => $teacherTests->where('status', 'teacher_testing')->count(),
                'submitted' => $teacherTests->where('status', 'teacher_test_submitted')->count(),
            ],
        ]);
    }

    public function edit($id)
    {
        $template = OrderTemplate::with([
            'transportTemplates:id',
            'ships:id',
            'ports:id',
            'landRoutes:id',
        ])->findOrFail($id);

        return Inertia::render('Teacher/Templates/OrderTemplates/Edit', [
            'template' => $template,
            'options' => $this->getOptions(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $template = OrderTemplate::findOrFail($id);

        $validated = $this->validateTemplate($request);

        $template->update($this->extractTemplateFields($validated));

        $this->syncRelations($template, $validated);

        return redirect()->route('teacher.templates.order-templates.show', $template->id);
    }

    public function preview(Request $request, LandTransportCalculator $calculator)
    {
        $validated = $request->validate([
            'scenario_type' => 'nullable|string|max:100',
            'cargo_amount_containers' => 'nullable|integer|min:0',
            'transport_template_ids' => 'nullable|array',
            'transport_template_ids.*' => 'integer|exists:transport_templates,id',
            'land_route_ids' => 'nullable|array',
            'land_route_ids.*' => 'integer|exists:land_routes,id',
        ]);

        $cargoAmountContainers = (int) ($validated['cargo_amount_containers'] ?? 0);
        $transportIds = $validated['transport_template_ids'] ?? [];
        $routeIds = $validated['land_route_ids'] ?? [];

        if ($cargoAmountContainers <= 0) {
            return response()->json([
                'message' => 'Lai izmēģinātu scenāriju, norādiet konteineru skaitu lielāku par 0.',
            ], 422);
        }

        if (empty($transportIds)) {
            return response()->json([
                'message' => 'Lai izmēģinātu scenāriju, izvēlieties vismaz vienu sauszemes transportu.',
            ], 422);
        }

        if (empty($routeIds)) {
            return response()->json([
                'message' => 'Lai izmēģinātu scenāriju, izvēlieties vismaz vienu sauszemes maršrutu.',
            ], 422);
        }

        $transport = TransportTemplate::findOrFail($transportIds[0]);

        $route = LandRoute::with(['fromLocation', 'toLocation', 'fuelStops.fuelStation.location'])
            ->findOrFail($routeIds[0]);

        $result = $calculator->calculate(
            $route,
            $transport,
            $cargoAmountContainers
        );

        return response()->json($result);
    }

    private function buildTeacherTestQualitySummary(SimulationAttempt $attempt): ?array
    {
        $preview = is_array($attempt->preview_result) ? $attempt->preview_result : [];
        $result = data_get($preview, 'result');

        if (!is_array($result)) {
            return null;
        }

        $score = (int) ($result['score'] ?? $attempt->score ?? 0);
        $isValid = (bool) ($result['is_valid'] ?? $attempt->is_valid ?? false);
        $delayMinutes = (int) ($result['delay_minutes'] ?? data_get($preview, 'timeline.summary.delay_minutes', 0) ?? 0);
        $warnings = data_get($result, 'warnings', []);
        $penalties = data_get($result, 'score_breakdown.penalties', []);

        $categoryCounts = [
            'time' => 0,
            'cost' => 0,
            'compatibility' => 0,
            'trips' => 0,
        ];

        foreach ($penalties as $penalty) {
            $category = $penalty['category'] ?? null;

            if ($category && array_key_exists($category, $categoryCounts)) {
                $categoryCounts[$category]++;
            }
        }

        $insights = [];

        if ($delayMinutes > 0) {
            $insights[] = [
                'title' => 'Termiņa spiediens',
                'tone' => 'danger',
                'body' => "Pēdējais tests kavēja termiņu par {$delayMinutes} minūtēm, tāpēc scenārijs var būt pārāk stingrs laika ziņā.",
            ];
        }

        if (($categoryCounts['compatibility'] ?? 0) > 0) {
            $insights[] = [
                'title' => 'Savietojamības riski',
                'tone' => 'warning',
                'body' => 'Lielākā daļa sodu nāk no maršruta, ostas, kuģa vai degvielas plāna savietojamības. Pārbaudi, vai skolēniem ir pietiekami skaidras izvēles.',
            ];
        }

        if (($categoryCounts['cost'] ?? 0) > 0 || ($categoryCounts['trips'] ?? 0) > 0) {
            $insights[] = [
                'title' => 'Kapacitātes slodze',
                'tone' => 'warning',
                'body' => 'Tests saņēma sodus par transporta vienību skaitu vai reisu apjomu. Var būt vērts pārskatīt pieejamo kapacitāti vai maksimālo reisu limitu.',
            ];
        }

        if ($score >= 90 && $isValid && empty($penalties)) {
            $insights[] = [
                'title' => 'Var būt pārāk viegls',
                'tone' => 'info',
                'body' => 'Pēdējais tests izgāja bez sodiem. Ja gribi vairāk izaicinājuma, vari pievienot stingrāku termiņu vai sarežģītāku resursu izvēli.',
            ];
        }

        if (empty($insights) && !empty($warnings)) {
            $insights[] = [
                'title' => 'Ir signāli pārbaudei',
                'tone' => 'warning',
                'body' => (string) ($warnings[0] ?? 'Pēdējais tests uzrādīja brīdinājumus, tāpēc scenāriju vērts vēlreiz pārbaudīt pirms piešķiršanas.'),
            ];
        }

        if (empty($insights)) {
            $insights[] = [
                'title' => 'Scenārijs izskatās stabils',
                'tone' => 'success',
                'body' => 'Pēdējais tests neuzrādīja kritiskus signālus. Vari izmantot šo rezultātu kā bāzes pārbaudi pirms piešķiršanas studentiem.',
            ];
        }

        if (!$isValid || $score < 50) {
            $headline = 'Scenārijs prasa pārskatīšanu';
            $tone = 'danger';
            $summary = 'Pēdējais skolotāja tests uzrādīja kritiskas problēmas vai pārāk smagus sodus. Pirms piešķiršanas studentiem būtu vēlams to pielāgot.';
        } elseif ($score >= 90) {
            $headline = 'Scenārijs šķiet ļoti viegls';
            $tone = 'info';
            $summary = 'Pēdējais tests sasniedza ļoti augstu rezultātu. Ja mērķis ir izaicinājums, apsver stingrākus nosacījumus vai vairāk savstarpēji atkarīgu izvēļu.';
        } elseif ($score >= 70) {
            $headline = 'Scenārijs izskatās sabalansēts';
            $tone = 'success';
            $summary = 'Pēdējais tests rāda, ka scenārijs ir izpildāms, bet joprojām prasa pārdomātas izvēles. Tas izskatās labs kandidāts piešķiršanai.';
        } else {
            $headline = 'Scenārijs ir izaicinošs';
            $tone = 'warning';
            $summary = 'Pēdējais tests ir izpildāms, taču sodu apjoms ir jūtams. Pārbaudi, vai šis grūtības līmenis atbilst iecerētajam.';
        }

        return [
            'headline' => $headline,
            'tone' => $tone,
            'summary' => $summary,
            'score' => $score,
            'is_valid' => $isValid,
            'penalties_count' => is_array($penalties) ? count($penalties) : 0,
            'insights' => array_slice($insights, 0, 3),
        ];
    }

    public function previewSaved(int $id)
    {
        $template = OrderTemplate::query()
            ->with([
                'transportTemplates',
                'landRoutes.fromLocation',
                'landRoutes.toLocation',
            ])
            ->findOrFail($id);

        $transport = $template->transportTemplates->first();
        $route = $template->landRoutes->first();

        if (!$transport || !$route) {
            return response()->json([
                'message' => 'Sagatavei trūkst transports vai maršruts preview aprēķinam.',
            ], 422);
        }

        $distanceKm = (float) ($route->distance_km ?? 0);
        $containerCount = (int) ($template->cargo_amount_containers ?? 0);
        $capacity = max(1, (int) ($transport->capacity_containers ?? 1));
        $avgSpeed = (float) ($transport->avg_speed_kmh ?? 60);
        $costPerKm = (float) ($transport->cost_per_km ?? 1);
        $fuelPer100 = (float) ($transport->fuel_consumption_per_100km ?? 0);
        $maxRangeKm = (float) ($transport->max_range_km ?? 0);
        $loadingMinutes = (float) ($transport->loading_time_minutes ?? 0);
        $unloadingMinutes = (float) ($transport->unloading_time_minutes ?? 0);

        $requiredVehicles = max(1, (int) ceil($containerCount / $capacity));
        $tripTimeHours = $avgSpeed > 0 ? round($distanceKm / $avgSpeed, 2) : 0;
        $cycleTimeHours = round($tripTimeHours + (($loadingMinutes + $unloadingMinutes) / 60), 2);

        $baseCostPerVehicle = round($distanceKm * $costPerKm, 2);
        $totalBaseCost = round($baseCostPerVehicle * $requiredVehicles, 2);

        $fuelUsedPerVehicle = round(($distanceKm / 100) * $fuelPer100, 2);
        $needsRefuel = $maxRangeKm > 0 ? $distanceKm > $maxRangeKm : false;

        return response()->json([
            'route' => [
                'from' => optional($route->fromLocation)->name,
                'to' => optional($route->toLocation)->name,
                'distance_km' => $distanceKm,
                'toll_cost' => 0,
            ],
            'transport' => [
                'name' => $transport->name,
                'type' => $transport->type,
                'capacity_containers' => $transport->capacity_containers,
                'avg_speed_kmh' => $transport->avg_speed_kmh,
                'cost_per_km' => $transport->cost_per_km,
                'fuel_consumption_per_100km' => $transport->fuel_consumption_per_100km,
                'max_range_km' => $transport->max_range_km,
                'loading_time_minutes' => $transport->loading_time_minutes,
                'unloading_time_minutes' => $transport->unloading_time_minutes,
            ],
            'cargo' => [
                'amount_containers' => $containerCount,
            ],
            'result' => [
                'required_vehicles' => $requiredVehicles,
                'trip_time_hours' => $tripTimeHours,
                'cycle_time_hours' => $cycleTimeHours,
                'transport_cost_per_vehicle' => $baseCostPerVehicle,
                'base_cost_per_vehicle' => $baseCostPerVehicle,
                'total_base_cost' => $totalBaseCost,
                'fuel_used_liters_per_vehicle' => $fuelUsedPerVehicle,
                'needs_refuel' => $needsRefuel,
                'can_complete_with_current_route_data' => true,
                'fuel_cost_per_vehicle' => null,
                'total_fuel_cost' => null,
                'total_cost' => $totalBaseCost,
            ],
            'fuel' => [
                'available_fuel_stops' => [],
                'recommended_fuel_stop' => null,
            ],
            'message' => 'Preview aprēķins izpildīts veiksmīgi.',
        ]);
    }

    protected function validateTemplate(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'scenario_type' => 'required|string|max:100',
            'scenario_focus' => 'nullable|string|max:100',
            'evaluation_mode' => 'required|in:practice,exam',
            'status' => 'required|string|max:100',

            'description' => 'nullable|string',
            'student_brief' => 'nullable|string',
            'teacher_notes' => 'nullable|string',

            'cargo_name' => 'nullable|string|max:255',
            'cargo_type' => 'nullable|string|max:255',
            'cargo_amount_containers' => 'nullable|integer|min:0',
            'cargo_amount_tons' => 'nullable|numeric|min:0',
            'cargo_volume_m3' => 'nullable|numeric|min:0',
            'cargo_value' => 'nullable|numeric|min:0',

            'temperature_mode_id' => 'nullable|exists:temperature_modes,id',
            'special_condition_id' => 'nullable|exists:special_conditions,id',

            'start_location_id' => 'nullable|exists:locations,id',
            'end_location_id' => 'nullable|exists:locations,id',
            'start_port_id' => 'nullable|exists:ports,id',
            'end_port_id' => 'nullable|exists:ports,id',

            'deadline_date' => 'nullable|date',
            'scenario_start_at' => 'nullable|date',
            'deadline_at' => 'nullable|date|after_or_equal:scenario_start_at',
            'budget_limit' => 'nullable|numeric|min:0',
            'requires_refuel_planning' => 'nullable|boolean',
            'max_trips' => 'nullable|integer|min:0',
            'priority' => 'nullable|string|max:100',

            'timing_loading_fixed_minutes' => 'nullable|integer|min:0|max:100000',
            'timing_fuel_stop_minutes' => 'nullable|integer|min:0|max:100000',
            'timing_port_processing_minutes' => 'nullable|integer|min:0|max:100000',
            'timing_ship_loading_minutes' => 'nullable|integer|min:0|max:100000',
            'timing_max_drive_minutes_before_rest' => 'nullable|integer|min:0|max:100000',
            'timing_rest_minutes' => 'nullable|integer|min:0|max:100000',

            'waiting_port_queue_minutes' => 'nullable|integer|min:0|max:100000',
            'waiting_ship_ready_at' => 'nullable|date',

            'scoring_time_weight' => 'nullable|integer|min:0|max:100',
            'scoring_cost_weight' => 'nullable|integer|min:0|max:100',
            'scoring_compatibility_weight' => 'nullable|integer|min:0|max:100',
            'scoring_trips_weight' => 'nullable|integer|min:0|max:100',

            'transport_template_ids' => 'nullable|array',
            'transport_template_ids.*' => 'integer|exists:transport_templates,id',

            'ship_ids' => 'nullable|array',
            'ship_ids.*' => 'integer|exists:ships,id',

            'port_ids' => 'nullable|array',
            'port_ids.*' => 'integer|exists:ports,id',

            'land_route_ids' => 'nullable|array',
            'land_route_ids.*' => 'integer|exists:land_routes,id',
        ]);
    }

    protected function extractTemplateFields(array $validated): array
    {
        $scenarioType = $validated['scenario_type'];
        $scenarioFocus = $validated['scenario_focus'] ?? $this->defaultScenarioFocus($scenarioType);

        return [
            'title' => $validated['title'],
            'scenario_type' => $scenarioType,
            'scenario_focus' => $scenarioFocus,
            'evaluation_mode' => $validated['evaluation_mode'] ?? 'practice',
            'status' => $validated['status'],

            'description' => $validated['description'] ?? null,
            'student_brief' => $validated['student_brief'] ?? null,
            'teacher_notes' => $validated['teacher_notes'] ?? null,

            'cargo_name' => $validated['cargo_name'] ?? null,
            'cargo_type' => $validated['cargo_type'] ?? null,
            'cargo_amount_containers' => $validated['cargo_amount_containers'] ?? null,
            'cargo_amount_tons' => $validated['cargo_amount_tons'] ?? null,
            'cargo_volume_m3' => $validated['cargo_volume_m3'] ?? null,
            'cargo_value' => $validated['cargo_value'] ?? null,

            'temperature_mode_id' => $validated['temperature_mode_id'] ?? null,
            'special_condition_id' => $validated['special_condition_id'] ?? null,

            'start_location_id' => $this->resolveStartLocationId($scenarioType, $validated),
            'end_location_id' => $this->resolveEndLocationId($scenarioType, $validated),
            'start_port_id' => $this->resolveStartPortId($scenarioType, $validated),
            'end_port_id' => $this->resolveEndPortId($scenarioType, $validated),

            'deadline_date' => $validated['deadline_date'] ?? null,
            'scenario_start_at' => $validated['scenario_start_at'] ?? null,
            'deadline_at' => $validated['deadline_at'] ?? null,
            'budget_limit' => $validated['budget_limit'] ?? null,
            'requires_refuel_planning' => $this->resolveRefuelPlanning($scenarioType, $validated),
            'max_trips' => $validated['max_trips'] ?? null,
            'priority' => $validated['priority'] ?? null,

            'step_config' => $this->buildStepConfig($scenarioType),
            'scenario_config' => $this->buildScenarioConfig($scenarioType, $validated),
        ];
    }

    protected function syncRelations(OrderTemplate $template, array $validated): void
    {
        $scenarioType = $validated['scenario_type'] ?? 'general';

        $template->transportTemplates()->sync(
            $this->allowsTransport($scenarioType)
                ? ($validated['transport_template_ids'] ?? [])
                : []
        );

        $template->ships()->sync(
            $this->allowsShip($scenarioType)
                ? ($validated['ship_ids'] ?? [])
                : []
        );

        $template->ports()->sync(
            $this->allowsPort($scenarioType)
                ? ($validated['port_ids'] ?? [])
                : []
        );

        $template->landRoutes()->sync(
            $this->allowsRoute($scenarioType)
                ? ($validated['land_route_ids'] ?? [])
                : []
        );
    }

    protected function getOptions(): array
    {
        return [
            'temperatureModes' => TemperatureMode::orderBy('name')->get(['id', 'name']),
            'specialConditions' => SpecialCondition::orderBy('name')->get(['id', 'name']),
            'locations' => Location::orderBy('name')->get(['id', 'name', 'city', 'type']),
            'ports' => Port::orderBy('name')->get(['id', 'name', 'country']),
            'transportTemplates' => TransportTemplate::orderBy('name')->get(['id', 'name', 'type']),
            'ships' => Ship::orderBy('name')->get(['id', 'name', 'cargo_type']),
            'landRoutes' => LandRoute::with(['fromLocation:id,name', 'toLocation:id,name'])
                ->orderByDesc('id')
                ->get(['id', 'from_location_id', 'to_location_id', 'distance_km']),
            'scenarioTypes' => [
                ['value' => 'land_transport', 'label' => 'Sauszemes transports'],
                ['value' => 'land_to_port', 'label' => 'Sauszeme → osta'],
                ['value' => 'port_to_ship', 'label' => 'Osta → kuģis'],
                ['value' => 'full_chain', 'label' => 'Pilna loģistikas ķēde'],
            ],
            'scenarioFocuses' => [
                ['value' => 'general', 'label' => 'Vispārējs'],
                ['value' => 'deadline', 'label' => 'Termiņš'],
                ['value' => 'cost', 'label' => 'Izmaksas'],
                ['value' => 'fuel', 'label' => 'Degviela'],
                ['value' => 'compatibility', 'label' => 'Saderība'],
            ],
            'evaluationModes' => [
                ['value' => 'practice', 'label' => 'Mācību režīms'],
                ['value' => 'exam', 'label' => 'Pārbaudes darbs'],
            ],
            'statusOptions' => [
                ['value' => 'draft', 'label' => 'Melnraksts'],
                ['value' => 'ready', 'label' => 'Gatavs'],
            ],
            'priorityOptions' => [
                ['value' => 'low', 'label' => 'Zema'],
                ['value' => 'medium', 'label' => 'Vidēja'],
                ['value' => 'high', 'label' => 'Augsta'],
                ['value' => 'critical', 'label' => 'Kritiska'],
            ],
        ];
    }

    private function buildStepConfig(string $type): array
    {
        return match ($type) {
            'land_transport' => [
                'intro' => true,
                'transport' => true,
                'route' => true,
                'fuel' => true,
                'port' => false,
                'ship' => false,
                'simulation' => true,
                'submit' => true,
            ],
            'land_to_port' => [
                'intro' => true,
                'transport' => true,
                'route' => true,
                'fuel' => true,
                'port' => true,
                'ship' => false,
                'simulation' => true,
                'submit' => true,
            ],
            'port_to_ship' => [
                'intro' => true,
                'transport' => false,
                'route' => false,
                'fuel' => false,
                'port' => true,
                'ship' => true,
                'simulation' => true,
                'submit' => true,
            ],
            'full_chain' => [
                'intro' => true,
                'transport' => true,
                'route' => true,
                'fuel' => true,
                'port' => true,
                'ship' => true,
                'simulation' => true,
                'submit' => true,
            ],
            default => [],
        };
    }

    private function buildScenarioConfig(string $type, array $validated = []): array
{
    $timing = [
    'loading_fixed_minutes' => isset($validated['timing_loading_fixed_minutes'])
        ? (int) $validated['timing_loading_fixed_minutes']
        : 45,
    'fuel_stop_minutes' => isset($validated['timing_fuel_stop_minutes'])
        ? (int) $validated['timing_fuel_stop_minutes']
        : 20,
    'port_processing_minutes' => isset($validated['timing_port_processing_minutes'])
        ? (int) $validated['timing_port_processing_minutes']
        : 60,
    'ship_loading_minutes' => isset($validated['timing_ship_loading_minutes'])
        ? (int) $validated['timing_ship_loading_minutes']
        : 90,
    'max_drive_minutes_before_rest' => isset($validated['timing_max_drive_minutes_before_rest'])
        ? (int) $validated['timing_max_drive_minutes_before_rest']
        : 270,
    'rest_minutes' => isset($validated['timing_rest_minutes'])
        ? (int) $validated['timing_rest_minutes']
        : 45,
];

    $availability = [
        'port_queue_minutes' => isset($validated['waiting_port_queue_minutes'])
            ? (int) $validated['waiting_port_queue_minutes']
            : 0,
        'ship_ready_at' => $validated['waiting_ship_ready_at'] ?? null,
    ];

    $scoring = [
    'time_weight' => isset($validated['scoring_time_weight'])
        ? (int) $validated['scoring_time_weight']
        : 35,
    'cost_weight' => isset($validated['scoring_cost_weight'])
        ? (int) $validated['scoring_cost_weight']
        : 25,
    'compatibility_weight' => isset($validated['scoring_compatibility_weight'])
        ? (int) $validated['scoring_compatibility_weight']
        : 25,
    'trips_weight' => isset($validated['scoring_trips_weight'])
        ? (int) $validated['scoring_trips_weight']
        : 15,
    ];

    return match ($type) {
        'land_transport' => [
            'mode' => 'land',
            'student_choices' => [
                'transport' => true,
                'route' => true,
                'fuel' => true,
                'port' => false,
                'ship' => false,
            ],
            'timing' => $timing,
            'availability' => $availability,
            'scoring' => $scoring,
        ],
        'land_to_port' => [
            'mode' => 'land_port',
            'student_choices' => [
                'transport' => true,
                'route' => true,
                'fuel' => true,
                'port' => true,
                'ship' => false,
            ],
            'timing' => $timing,
            'availability' => $availability,
            'scoring' => $scoring,
        ],
        'port_to_ship' => [
            'mode' => 'port_ship',
            'student_choices' => [
                'transport' => false,
                'route' => false,
                'fuel' => false,
                'port' => true,
                'ship' => true,
            ],
            'timing' => $timing,
            'availability' => $availability,
            'scoring' => $scoring,
        ],
        'full_chain' => [
            'mode' => 'full',
            'student_choices' => [
                'transport' => true,
                'route' => true,
                'fuel' => true,
                'port' => true,
                'ship' => true,
            ],
            'timing' => $timing,
            'availability' => $availability,
            'scoring' => $scoring,
        ],
        default => [
            'timing' => $timing,
            'availability' => $availability,
            'scoring' => $scoring,
        ],
    };
}

    private function defaultScenarioFocus(string $type): string
    {
        return match ($type) {
            'land_transport' => 'fuel',
            'land_to_port' => 'deadline',
            'port_to_ship' => 'compatibility',
            'full_chain' => 'general',
            default => 'general',
        };
    }

    private function allowsTransport(string $type): bool
    {
        return in_array($type, ['land_transport', 'land_to_port', 'full_chain'], true);
    }

    private function allowsRoute(string $type): bool
    {
        return in_array($type, ['land_transport', 'land_to_port', 'full_chain'], true);
    }

    private function allowsPort(string $type): bool
    {
        return in_array($type, ['land_to_port', 'port_to_ship', 'full_chain'], true);
    }

    private function allowsShip(string $type): bool
    {
        return in_array($type, ['port_to_ship', 'full_chain'], true);
    }

    private function resolveStartLocationId(string $type, array $validated): ?int
    {
        if (!in_array($type, ['land_transport', 'land_to_port', 'full_chain'], true)) {
            return null;
        }

        return isset($validated['start_location_id'])
            ? (int) $validated['start_location_id']
            : null;
    }

    private function resolveEndLocationId(string $type, array $validated): ?int
    {
        if (!in_array($type, ['land_transport', 'full_chain'], true)) {
            return null;
        }

        return isset($validated['end_location_id'])
            ? (int) $validated['end_location_id']
            : null;
    }

    private function resolveStartPortId(string $type, array $validated): ?int
    {
        if (!in_array($type, ['port_to_ship', 'full_chain'], true)) {
            return null;
        }

        return isset($validated['start_port_id'])
            ? (int) $validated['start_port_id']
            : null;
    }

    private function resolveEndPortId(string $type, array $validated): ?int
    {
        if (!in_array($type, ['land_to_port', 'full_chain'], true)) {
            return null;
        }

        return isset($validated['end_port_id'])
            ? (int) $validated['end_port_id']
            : null;
    }

    private function resolveRefuelPlanning(string $type, array $validated): bool
    {
        if (!in_array($type, ['land_transport', 'land_to_port', 'full_chain'], true)) {
            return false;
        }

        return (bool) ($validated['requires_refuel_planning'] ?? false);
    }
}
