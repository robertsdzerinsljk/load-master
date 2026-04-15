<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\LandRoute;
use App\Models\OrderTemplate;
use App\Models\Port;
use App\Models\Ship;
use App\Models\SpecialCondition;
use App\Models\TemperatureMode;
use App\Models\TransportTemplate;
use App\Services\LandTransportCalculator;
use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderTemplateController extends Controller
{
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

        $template = OrderTemplate::create($this->extractTemplateFields($validated));

        $this->syncRelations($template, $validated);

        return redirect()->route('teacher.templates.order-templates.show', $template->id);
    }

    public function show($id)
    {
        $template = OrderTemplate::with([
            'startLocation',
            'endLocation',
            'startPort',
            'endPort',
            'temperatureMode',
            'specialCondition',
            'transportTemplates',
            'ships',
            'ports',
            'landRoutes.fromLocation',
            'landRoutes.toLocation',
        ])->findOrFail($id);

        return Inertia::render('Teacher/Templates/OrderTemplates/Show', [
            'template' => $template,
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
public function previewSaved($id, LandTransportCalculator $calculator)
{
    $template = OrderTemplate::with([
        'transportTemplates',
        'landRoutes.fromLocation',
        'landRoutes.toLocation',
        'landRoutes.fuelStops.fuelStation.location',
    ])->findOrFail($id);

    $cargoAmountContainers = (int) ($template->cargo_amount_containers ?? 0);
    $transport = $template->transportTemplates->first();
    $route = $template->landRoutes->first();

    if ($cargoAmountContainers <= 0) {
        return response()->json([
            'message' => 'Preview nav iespējams, jo sagatavē nav norādīts konteineru skaits lielāks par 0.',
        ], 422);
    }

    if (!$transport) {
        return response()->json([
            'message' => 'Preview nav iespējams, jo sagatavei nav piesaistīts neviens sauszemes transports.',
        ], 422);
    }

    if (!$route) {
        return response()->json([
            'message' => 'Preview nav iespējams, jo sagatavei nav piesaistīts neviens sauszemes maršruts.',
        ], 422);
    }

    $result = $calculator->calculate(
        $route,
        $transport,
        $cargoAmountContainers
    );

    return response()->json($result);
}
    protected function validateTemplate(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'scenario_type' => 'required|string|max:100',
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
            'budget_limit' => 'nullable|numeric|min:0',
            'requires_refuel_planning' => 'nullable|boolean',
            'max_trips' => 'nullable|integer|min:0',
            'priority' => 'nullable|string|max:100',

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
        return [
            'title' => $validated['title'],
            'scenario_type' => $validated['scenario_type'],
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

            'start_location_id' => $validated['start_location_id'] ?? null,
            'end_location_id' => $validated['end_location_id'] ?? null,
            'start_port_id' => $validated['start_port_id'] ?? null,
            'end_port_id' => $validated['end_port_id'] ?? null,

            'deadline_date' => $validated['deadline_date'] ?? null,
            'budget_limit' => $validated['budget_limit'] ?? null,
            'requires_refuel_planning' => (bool) ($validated['requires_refuel_planning'] ?? false),
            'max_trips' => $validated['max_trips'] ?? null,
            'priority' => $validated['priority'] ?? null,
        ];
    }

    protected function syncRelations(OrderTemplate $template, array $validated): void
    {
        $template->transportTemplates()->sync($validated['transport_template_ids'] ?? []);
        $template->ships()->sync($validated['ship_ids'] ?? []);
        $template->ports()->sync($validated['port_ids'] ?? []);
        $template->landRoutes()->sync($validated['land_route_ids'] ?? []);
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
                ['value' => 'general', 'label' => 'Vispārējs scenārijs'],
                ['value' => 'fuel_planning', 'label' => 'Uzpildes plānošana'],
                ['value' => 'port_restriction', 'label' => 'Ostu ierobežojumi'],
                ['value' => 'cost_optimization', 'label' => 'Izmaksu optimizācija'],
                ['value' => 'capacity_planning', 'label' => 'Kapacitātes plānošana'],
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
}