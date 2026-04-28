<?php

namespace App\Services\Simulator;

use App\Models\HandlingMethod;
use App\Models\OrderTemplate;
use App\Models\Port;
use App\Models\Ship;
use App\Models\SimulationAttempt;
use Illuminate\Support\Collection;

class ScenarioCompatibilityService
{
    private const DEFAULT_METHODS = [
        'crane' => [
            'name' => 'Crane',
            'supports_bulk' => true,
            'supports_container' => true,
            'supports_liquid' => false,
            'supports_refrigerated' => true,
            'supports_hazardous' => true,
            'throughput_containers_per_hour' => 30.0,
            'throughput_tons_per_hour' => 180.0,
        ],
        'gantry_crane' => [
            'name' => 'Gantry crane',
            'supports_bulk' => false,
            'supports_container' => true,
            'supports_liquid' => false,
            'supports_refrigerated' => true,
            'supports_hazardous' => true,
            'throughput_containers_per_hour' => 45.0,
            'throughput_tons_per_hour' => 220.0,
        ],
        'conveyor' => [
            'name' => 'Conveyor',
            'supports_bulk' => true,
            'supports_container' => false,
            'supports_liquid' => false,
            'supports_refrigerated' => false,
            'supports_hazardous' => false,
            'throughput_containers_per_hour' => null,
            'throughput_tons_per_hour' => 420.0,
        ],
        'forklift' => [
            'name' => 'Forklift',
            'supports_bulk' => false,
            'supports_container' => true,
            'supports_liquid' => false,
            'supports_refrigerated' => true,
            'supports_hazardous' => false,
            'throughput_containers_per_hour' => 18.0,
            'throughput_tons_per_hour' => 65.0,
        ],
        'manual' => [
            'name' => 'Manual',
            'supports_bulk' => false,
            'supports_container' => false,
            'supports_liquid' => false,
            'supports_refrigerated' => false,
            'supports_hazardous' => false,
            'throughput_containers_per_hour' => 4.0,
            'throughput_tons_per_hour' => 12.0,
        ],
        'pump' => [
            'name' => 'Pump',
            'supports_bulk' => false,
            'supports_container' => false,
            'supports_liquid' => true,
            'supports_refrigerated' => false,
            'supports_hazardous' => true,
            'throughput_containers_per_hour' => null,
            'throughput_tons_per_hour' => 260.0,
        ],
    ];

    public function inspectAttempt(SimulationAttempt $attempt): array
    {
        $attempt->loadMissing([
            'orderTemplate.temperatureMode',
            'selectedPort.handlingMethods',
            'selectedShip.handlingMethods',
        ]);

        return $this->inspect(
            $attempt->orderTemplate,
            $attempt->selectedPort,
            $attempt->selectedShip,
            [
                'selected_loading_method_code' => $attempt->selected_loading_method_code,
                'selected_unloading_method_code' => $attempt->selected_unloading_method_code,
                'loading_method_source' => $attempt->loading_method_source,
                'unloading_method_source' => $attempt->unloading_method_source,
            ]
        );
    }

    public function inspect(
        OrderTemplate $template,
        ?Port $port = null,
        ?Ship $ship = null,
        array $selection = []
    ): array {
        $cargo = $this->buildCargoProfile($template);
        $portCompatibility = $this->inspectPort($port, $cargo);
        $shipCompatibility = $this->inspectShip($template, $ship, $cargo);
        $pairCompatibility = $this->inspectPortShipPair($port, $ship);
        $handling = $this->buildHandlingContext(
            $template,
            $port,
            $ship,
            $cargo,
            $selection,
            $portCompatibility,
            $shipCompatibility
        );

        return [
            'cargo' => $cargo,
            'port' => $portCompatibility,
            'ship' => $shipCompatibility,
            'pair' => $pairCompatibility,
            'handling' => $handling,
            'valid' => $portCompatibility['compatible']
                && $shipCompatibility['compatible']
                && $pairCompatibility['compatible']
                && ($handling['validation']['valid'] ?? true),
        ];
    }

    private function buildCargoProfile(OrderTemplate $template): array
    {
        $mode = $this->normalizeCargoMode(
            $template->cargo_mode
                ?? $template->cargo_type
                ?? ($template->cargo_amount_containers ? 'containerized' : null)
        );

        return [
            'mode' => $mode,
            'containers' => (int) ($template->cargo_amount_containers ?? 0),
            'tons' => (float) ($template->cargo_amount_tons ?? 0),
            'requires_temperature_control' => $template->temperature_mode_id !== null,
            'requires_closed_space' => (bool) ($template->requires_closed_space ?? false),
            'requires_ventilation' => (bool) ($template->requires_ventilation ?? false),
            'requires_hazardous_support' => (bool) ($template->requires_hazardous_support ?? false),
        ];
    }

    private function inspectPort(?Port $port, array $cargo): array
    {
        if (!$port) {
            return [
                'compatible' => false,
                'reasons' => ['Port is not selected.'],
                'supported_modes' => [],
            ];
        }

        $supportedModes = $this->resolvePortModes($port);
        $reasons = [];

        if ($cargo['mode'] !== null && !in_array($cargo['mode'], $supportedModes, true)) {
            $reasons[] = 'Selected port does not support the cargo mode required by this scenario.';
        }

        if (($cargo['requires_temperature_control'] ?? false) && !$port->supports_refrigerated) {
            $reasons[] = 'Selected port does not support temperature-controlled cargo handling.';
        }

        if (($cargo['requires_hazardous_support'] ?? false) && !$port->supports_hazardous) {
            $reasons[] = 'Selected port does not support hazardous cargo handling.';
        }

        return [
            'compatible' => empty($reasons),
            'reasons' => $reasons,
            'supported_modes' => $supportedModes,
        ];
    }

    private function inspectShip(OrderTemplate $template, ?Ship $ship, array $cargo): array
    {
        if (!$ship) {
            return [
                'compatible' => false,
                'reasons' => ['Ship is not selected.'],
                'supported_modes' => [],
            ];
        }

        $supportedModes = $this->resolveShipModes($ship);
        $allowedShipModes = collect($template->allowed_ship_cargo_modes ?? [])
            ->map(fn ($mode) => $this->normalizeCargoMode($mode))
            ->filter()
            ->values()
            ->all();
        $forbiddenShipModes = collect($template->forbidden_ship_cargo_modes ?? [])
            ->map(fn ($mode) => $this->normalizeCargoMode($mode))
            ->filter()
            ->values()
            ->all();

        $reasons = [];

        if ($cargo['mode'] !== null && !in_array($cargo['mode'], $supportedModes, true)) {
            $reasons[] = 'Selected ship cargo profile is not compatible with the scenario cargo mode.';
        }

        if (!empty($allowedShipModes) && empty(array_intersect($allowedShipModes, $supportedModes))) {
            $reasons[] = 'Selected ship does not match the allowed ship cargo modes for this scenario.';
        }

        if (!empty($forbiddenShipModes) && !empty(array_intersect($forbiddenShipModes, $supportedModes))) {
            $reasons[] = 'Selected ship matches a forbidden cargo mode for this scenario.';
        }

        if (($cargo['requires_closed_space'] ?? false) && !$ship->is_closed_cargo) {
            $reasons[] = 'Selected ship does not provide the closed cargo space required by this scenario.';
        }

        if (($cargo['requires_temperature_control'] ?? false) && !$ship->supports_refrigerated) {
            $reasons[] = 'Selected ship does not support temperature-controlled cargo.';
        }

        if (($cargo['requires_hazardous_support'] ?? false) && !$ship->supports_hazardous) {
            $reasons[] = 'Selected ship does not support hazardous cargo.';
        }

        return [
            'compatible' => empty($reasons),
            'reasons' => $reasons,
            'supported_modes' => $supportedModes,
        ];
    }

    private function inspectPortShipPair(?Port $port, ?Ship $ship): array
    {
        $reasons = [];

        if (!$port || !$ship) {
            return [
                'compatible' => false,
                'reasons' => ['Port and ship must both be selected before compatibility can be verified.'],
            ];
        }

        $portDraft = (float) ($port->max_draft_m ?? 0);
        $shipDraft = (float) ($ship->draft_m ?? 0);

        if ($portDraft > 0 && $shipDraft > 0 && $shipDraft > $portDraft) {
            $reasons[] = 'Selected ship draft exceeds the selected port draft limit.';
        }

        return [
            'compatible' => empty($reasons),
            'reasons' => $reasons,
        ];
    }

    private function buildHandlingContext(
        OrderTemplate $template,
        ?Port $port,
        ?Ship $ship,
        array $cargo,
        array $selection,
        array $portCompatibility,
        array $shipCompatibility
    ): array {
        $loadingSources = $this->buildDirectionSources(
            'loading',
            $template,
            $port,
            $ship,
            $cargo,
            $portCompatibility,
            $shipCompatibility
        );
        $unloadingSources = $this->buildDirectionSources(
            'unloading',
            $template,
            $port,
            $ship,
            $cargo,
            $portCompatibility,
            $shipCompatibility
        );

        $loadingRequired = (bool) ($template->requires_loading_method_choice ?? false);
        $unloadingRequired = (bool) ($template->requires_unloading_method_choice ?? false);

        $loadingSelection = $this->resolveDirectionSelection(
            $loadingSources,
            $selection['selected_loading_method_code'] ?? null,
            $selection['loading_method_source'] ?? null,
            $loadingRequired,
            $cargo
        );
        $unloadingSelection = $this->resolveDirectionSelection(
            $unloadingSources,
            $selection['selected_unloading_method_code'] ?? null,
            $selection['unloading_method_source'] ?? null,
            $unloadingRequired,
            $cargo
        );

        $errors = [];
        $warnings = [];

        if (($loadingSelection['valid'] ?? true) === false && !empty($loadingSelection['reason'])) {
            $errors[] = $loadingSelection['reason'];
        }

        if (($unloadingSelection['valid'] ?? true) === false && !empty($unloadingSelection['reason'])) {
            $errors[] = $unloadingSelection['reason'];
        }

        $requiredCodes = collect($template->required_handling_method_codes ?? [])
            ->filter()
            ->values()
            ->all();
        $selectedCodes = collect([
            $loadingSelection['code'] ?? null,
            $unloadingSelection['code'] ?? null,
        ])->filter()->values();

        foreach ($requiredCodes as $requiredCode) {
            if (!$selectedCodes->contains($requiredCode)) {
                $errors[] = "Scenario requires handling method [{$requiredCode}] to be part of the final loading/unloading plan.";
            }
        }

        if (($cargo['requires_ventilation'] ?? false) && $ship && !$ship->is_open_cargo && !$ship->is_closed_cargo) {
            $warnings[] = 'Ventilation requirement is stored for this scenario, but the ship profile does not expose a dedicated ventilation flag yet.';
        }

        return [
            'cargo_mode' => $cargo['mode'],
            'protections' => [
                'requires_temperature_control' => $cargo['requires_temperature_control'],
                'requires_closed_space' => $cargo['requires_closed_space'],
                'requires_ventilation' => $cargo['requires_ventilation'],
                'requires_hazardous_support' => $cargo['requires_hazardous_support'],
            ],
            'loading' => [
                'required' => $loadingRequired,
                'sources' => $loadingSources,
                'shared_method_codes' => $this->sharedMethodCodes($loadingSources),
                'selected' => $loadingSelection,
            ],
            'unloading' => [
                'required' => $unloadingRequired,
                'sources' => $unloadingSources,
                'shared_method_codes' => $this->sharedMethodCodes($unloadingSources),
                'selected' => $unloadingSelection,
            ],
            'validation' => [
                'valid' => empty($errors),
                'errors' => array_values(array_unique($errors)),
                'warnings' => array_values(array_unique($warnings)),
                'required_codes' => $requiredCodes,
            ],
        ];
    }

    private function buildDirectionSources(
        string $direction,
        OrderTemplate $template,
        ?Port $port,
        ?Ship $ship,
        array $cargo,
        array $portCompatibility,
        array $shipCompatibility
    ): array {
        $sources = [];

        $includePortSource = (bool) ($template->allow_port_equipment ?? true);
        $includeShipSource = (bool) ($template->allow_ship_equipment ?? true);

        if ($includePortSource) {
            $portMethods = $port && ($portCompatibility['compatible'] ?? false)
                ? $this->resolvePortMethods($port, $direction, $cargo, $template)
                : [];

            $sources[] = [
                'key' => 'port',
                'label' => 'Port equipment',
                'enabled' => !empty($portMethods),
                'resource_name' => $port?->name,
                'methods' => $portMethods,
                'reasons' => $portCompatibility['compatible'] ?? false
                    ? []
                    : ($portCompatibility['reasons'] ?? []),
            ];
        }

        if ($includeShipSource) {
            $shipMethods = $ship && ($shipCompatibility['compatible'] ?? false)
                ? $this->resolveShipMethods($ship, $direction, $cargo, $template)
                : [];

            $sources[] = [
                'key' => 'ship',
                'label' => 'Ship equipment',
                'enabled' => !empty($shipMethods),
                'resource_name' => $ship?->name,
                'methods' => $shipMethods,
                'reasons' => $shipCompatibility['compatible'] ?? false
                    ? []
                    : ($shipCompatibility['reasons'] ?? []),
            ];
        }

        return $sources;
    }

    private function resolvePortMethods(
        Port $port,
        string $direction,
        array $cargo,
        OrderTemplate $template
    ): array {
        $methods = $port->relationLoaded('handlingMethods') && $port->handlingMethods->isNotEmpty()
            ? $this->mapConfiguredMethods($port->handlingMethods, 'port', $direction, $cargo, $template, $port, null)
            : $this->inferPortMethods($port, $direction, $cargo, $template);

        return array_values($methods);
    }

    private function resolveShipMethods(
        Ship $ship,
        string $direction,
        array $cargo,
        OrderTemplate $template
    ): array {
        $methods = $ship->relationLoaded('handlingMethods') && $ship->handlingMethods->isNotEmpty()
            ? $this->mapConfiguredMethods($ship->handlingMethods, 'ship', $direction, $cargo, $template, null, $ship)
            : $this->inferShipMethods($ship, $direction, $cargo, $template);

        return array_values($methods);
    }

    private function mapConfiguredMethods(
        Collection $methods,
        string $source,
        string $direction,
        array $cargo,
        OrderTemplate $template,
        ?Port $port = null,
        ?Ship $ship = null
    ): array {
        $result = [];

        /** @var HandlingMethod $method */
        foreach ($methods as $method) {
            $directionAllowed = $direction === 'loading'
                ? (bool) ($method->pivot?->is_loading ?? true)
                : (bool) ($method->pivot?->is_unloading ?? true);

            if (!$directionAllowed || !$this->templateAllowsMethod($template, $method->code)) {
                continue;
            }

            if (!$this->methodSupportsCargo($method->code, [
                'supports_bulk' => (bool) $method->supports_bulk,
                'supports_container' => (bool) $method->supports_container,
                'supports_liquid' => (bool) $method->supports_liquid,
                'supports_refrigerated' => (bool) $method->supports_refrigerated,
                'supports_hazardous' => (bool) $method->supports_hazardous,
            ], $cargo)) {
                continue;
            }

            $result[] = [
                'code' => $method->code,
                'name' => $method->name,
                'source' => $source,
                'origin' => 'configured',
                'throughput_containers_per_hour' => $this->resolveContainersThroughput($method, $source, $port, $ship),
                'throughput_tons_per_hour' => $this->resolveTonsThroughput($method, $source, $port, $ship),
                'notes' => $method->pivot?->notes,
            ];
        }

        return $this->uniqueMethodOptions($result);
    }

    private function inferPortMethods(
        Port $port,
        string $direction,
        array $cargo,
        OrderTemplate $template
    ): array {
        $result = [];

        $capabilities = [
            'gantry_crane' => (bool) $port->has_crane && ($cargo['mode'] ?? null) === 'containerized',
            'crane' => (bool) $port->has_crane,
            'conveyor' => (bool) $port->has_conveyor,
            'forklift' => (bool) $port->has_forklift,
            'pump' => (bool) $port->has_pump,
            'manual' => true,
        ];

        foreach ($capabilities as $code => $enabled) {
            if (!$enabled || !$this->templateAllowsMethod($template, $code)) {
                continue;
            }

            $definition = self::DEFAULT_METHODS[$code] ?? null;

            if (!$definition || !$this->methodSupportsCargo($code, $definition, $cargo)) {
                continue;
            }

            $result[] = [
                'code' => $code,
                'name' => $definition['name'],
                'source' => 'port',
                'origin' => 'inferred',
                'throughput_containers_per_hour' => $definition['throughput_containers_per_hour'] ?? (float) ($port->loading_rate_containers_per_hour ?? 0),
                'throughput_tons_per_hour' => $definition['throughput_tons_per_hour'] ?? (float) ($port->loading_rate_tons_per_hour ?? 0),
                'notes' => 'Derived from the selected port equipment profile.',
            ];
        }

        return $this->uniqueMethodOptions($result);
    }

    private function inferShipMethods(
        Ship $ship,
        string $direction,
        array $cargo,
        OrderTemplate $template
    ): array {
        $result = [];

        $capabilities = [
            'crane' => (bool) $ship->has_onboard_crane,
            'pump' => (bool) $ship->supports_liquid,
            'manual' => true,
        ];

        foreach ($capabilities as $code => $enabled) {
            if (!$enabled || !$this->templateAllowsMethod($template, $code)) {
                continue;
            }

            $definition = self::DEFAULT_METHODS[$code] ?? null;

            if (!$definition || !$this->methodSupportsCargo($code, $definition, $cargo)) {
                continue;
            }

            $result[] = [
                'code' => $code,
                'name' => $definition['name'],
                'source' => 'ship',
                'origin' => 'inferred',
                'throughput_containers_per_hour' => $definition['throughput_containers_per_hour'] ?? (float) ($ship->loading_capacity_containers_per_hour ?? 0),
                'throughput_tons_per_hour' => $definition['throughput_tons_per_hour'] ?? (float) ($ship->loading_capacity_tons_per_hour ?? 0),
                'notes' => 'Derived from the selected ship equipment profile.',
            ];
        }

        return $this->uniqueMethodOptions($result);
    }

    private function resolveDirectionSelection(
        array $sources,
        ?string $requestedCode,
        ?string $requestedSource,
        bool $required,
        array $cargo
    ): array {
        $availableOptions = collect($sources)
            ->where('enabled', true)
            ->flatMap(fn ($source) => $source['methods'] ?? [])
            ->values();

        if ($availableOptions->isEmpty()) {
            return [
                'code' => null,
                'name' => null,
                'source' => null,
                'valid' => !$required,
                'auto_selected' => false,
                'reason' => $required
                    ? 'No compatible handling methods are available for this step.'
                    : null,
                'throughput_containers_per_hour' => null,
                'throughput_tons_per_hour' => null,
            ];
        }

        $resolved = null;

        if ($requestedCode && $requestedSource) {
            $resolved = $availableOptions->first(
                fn ($option) => $option['code'] === $requestedCode && $option['source'] === $requestedSource
            );

            if (!$resolved) {
                return [
                    'code' => $requestedCode,
                    'name' => null,
                    'source' => $requestedSource,
                    'valid' => false,
                    'auto_selected' => false,
                    'reason' => 'Selected handling method is not available from the chosen source.',
                    'throughput_containers_per_hour' => null,
                    'throughput_tons_per_hour' => null,
                ];
            }
        }

        if (!$resolved && $requestedCode) {
            $matches = $availableOptions
                ->where('code', $requestedCode)
                ->values();

            if ($matches->isNotEmpty()) {
                $resolved = $this->pickRecommendedOption($matches, $cargo);
            }
        }

        if (!$resolved && $requestedSource) {
            $sourceMatches = $availableOptions
                ->where('source', $requestedSource)
                ->values();

            if ($sourceMatches->isNotEmpty() && !$required) {
                $resolved = $this->pickRecommendedOption($sourceMatches, $cargo);
            }
        }

        $autoSelected = false;

        if (!$resolved && !$required) {
            $resolved = $this->pickRecommendedOption($availableOptions, $cargo);
            $autoSelected = $resolved !== null;
        }

        if (!$resolved) {
            return [
                'code' => null,
                'name' => null,
                'source' => $requestedSource,
                'valid' => false,
                'auto_selected' => false,
                'reason' => 'A handling method must be selected before the simulation can continue.',
                'throughput_containers_per_hour' => null,
                'throughput_tons_per_hour' => null,
            ];
        }

        return [
            'code' => $resolved['code'],
            'name' => $resolved['name'],
            'source' => $resolved['source'],
            'valid' => true,
            'auto_selected' => $autoSelected,
            'reason' => null,
            'throughput_containers_per_hour' => $resolved['throughput_containers_per_hour'] ?? null,
            'throughput_tons_per_hour' => $resolved['throughput_tons_per_hour'] ?? null,
        ];
    }

    private function pickRecommendedOption(Collection $options, array $cargo): ?array
    {
        if ($options->isEmpty()) {
            return null;
        }

        $preferredMetric = $cargo['containers'] > 0 ? 'throughput_containers_per_hour' : 'throughput_tons_per_hour';

        return $options
            ->sortByDesc(function (array $option) use ($preferredMetric) {
                $value = (float) ($option[$preferredMetric] ?? 0);

                return $value > 0 ? $value : -1;
            })
            ->first();
    }

    private function sharedMethodCodes(array $sources): array
    {
        $enabledSources = collect($sources)->where('enabled', true)->values();

        if ($enabledSources->count() < 2) {
            return [];
        }

        $codeSets = $enabledSources
            ->map(fn ($source) => collect($source['methods'] ?? [])->pluck('code')->all())
            ->filter(fn ($codes) => !empty($codes))
            ->values();

        if ($codeSets->count() < 2) {
            return [];
        }

        $shared = $codeSets->shift();

        foreach ($codeSets as $codes) {
            $shared = array_values(array_intersect($shared, $codes));
        }

        return array_values(array_unique($shared));
    }

    private function templateAllowsMethod(OrderTemplate $template, string $code): bool
    {
        if ($code === 'manual' && !($template->allow_manual_handling ?? true)) {
            return false;
        }

        $allowed = collect($template->allowed_handling_method_codes ?? [])
            ->filter()
            ->values();

        return $allowed->isEmpty() || $allowed->contains($code);
    }

    private function methodSupportsCargo(string $code, array $definition, array $cargo): bool
    {
        $mode = $cargo['mode'] ?? null;

        if ($mode === 'bulk' && empty($definition['supports_bulk'])) {
            return false;
        }

        if ($mode === 'containerized' && empty($definition['supports_container'])) {
            return false;
        }

        if ($mode === 'liquid' && empty($definition['supports_liquid'])) {
            return false;
        }

        if ($mode === 'palletized' && !in_array($code, ['crane', 'gantry_crane', 'forklift', 'manual'], true)) {
            return false;
        }

        if ($mode === 'break_bulk' && !in_array($code, ['crane', 'gantry_crane', 'forklift', 'manual'], true)) {
            return false;
        }

        if (($cargo['requires_temperature_control'] ?? false) && empty($definition['supports_refrigerated'])) {
            return false;
        }

        if (($cargo['requires_hazardous_support'] ?? false) && empty($definition['supports_hazardous'])) {
            return false;
        }

        return true;
    }

    private function resolveContainersThroughput(
        HandlingMethod $method,
        string $source,
        ?Port $port = null,
        ?Ship $ship = null
    ): ?float {
        if ($method->pivot?->throughput_override_containers_per_hour !== null) {
            return (float) $method->pivot->throughput_override_containers_per_hour;
        }

        if ($method->throughput_containers_per_hour !== null) {
            return (float) $method->throughput_containers_per_hour;
        }

        if ($source === 'port' && $port?->loading_rate_containers_per_hour !== null) {
            return (float) $port->loading_rate_containers_per_hour;
        }

        if ($source === 'ship' && $ship?->loading_capacity_containers_per_hour !== null) {
            return (float) $ship->loading_capacity_containers_per_hour;
        }

        return null;
    }

    private function resolveTonsThroughput(
        HandlingMethod $method,
        string $source,
        ?Port $port = null,
        ?Ship $ship = null
    ): ?float {
        if ($method->pivot?->throughput_override_tons_per_hour !== null) {
            return (float) $method->pivot->throughput_override_tons_per_hour;
        }

        if ($method->throughput_tons_per_hour !== null) {
            return (float) $method->throughput_tons_per_hour;
        }

        if ($source === 'port' && $port?->loading_rate_tons_per_hour !== null) {
            return (float) $port->loading_rate_tons_per_hour;
        }

        if ($source === 'ship' && $ship?->loading_capacity_tons_per_hour !== null) {
            return (float) $ship->loading_capacity_tons_per_hour;
        }

        return null;
    }

    private function resolvePortModes(Port $port): array
    {
        $modes = [];

        if ($port->supports_bulk) {
            $modes[] = 'bulk';
        }

        if ($port->supports_container) {
            $modes[] = 'containerized';
        }

        if ($port->supports_liquid) {
            $modes[] = 'liquid';
        }

        if ($port->has_forklift || $port->has_crane) {
            $modes[] = 'palletized';
            $modes[] = 'break_bulk';
        }

        return array_values(array_unique($modes));
    }

    private function resolveShipModes(Ship $ship): array
    {
        $modes = [];

        $explicitMode = $this->normalizeCargoMode($ship->cargo_mode ?? $ship->cargo_type);

        if ($explicitMode !== null) {
            $modes[] = $explicitMode;
        }

        if ($ship->supports_container || (int) ($ship->capacity_containers ?? 0) > 0) {
            $modes[] = 'containerized';
            $modes[] = 'palletized';
        }

        if ($ship->supports_bulk) {
            $modes[] = 'bulk';
            $modes[] = 'break_bulk';
        }

        if ($ship->supports_liquid) {
            $modes[] = 'liquid';
        }

        if ($ship->is_open_cargo || $ship->has_onboard_crane) {
            $modes[] = 'break_bulk';
        }

        return array_values(array_unique($modes));
    }

    private function normalizeCargoMode(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        return match (strtolower(trim($value))) {
            'container', 'containers', 'containerized' => 'containerized',
            'bulk', 'dry_bulk' => 'bulk',
            'liquid', 'tank', 'tanker' => 'liquid',
            'pallet', 'palletized' => 'palletized',
            'breakbulk', 'break_bulk', 'general' => 'break_bulk',
            default => strtolower(trim($value)),
        };
    }

    private function uniqueMethodOptions(array $options): array
    {
        $seen = [];
        $unique = [];

        foreach ($options as $option) {
            $key = "{$option['source']}:{$option['code']}";

            if (isset($seen[$key])) {
                continue;
            }

            $seen[$key] = true;
            $unique[] = $option;
        }

        return $unique;
    }
}
