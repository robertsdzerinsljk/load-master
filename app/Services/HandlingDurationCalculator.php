<?php

namespace App\Services;

use App\Models\SimulationAttempt;
use App\Services\Simulator\ScenarioCompatibilityService;

class HandlingDurationCalculator
{
    public function __construct(
        private readonly ScenarioCompatibilityService $compatibilityService
    ) {
    }

    public function calculate(SimulationAttempt $attempt): array
    {
        $attempt->loadMissing('orderTemplate');

        $template = $attempt->orderTemplate;
        $compatibility = $this->compatibilityService->inspectAttempt($attempt);
        $handling = $compatibility['handling'] ?? [];
        $loadingSelection = $handling['loading']['selected'] ?? [];
        $unloadingSelection = $handling['unloading']['selected'] ?? [];

        $cargoTons = (float) ($template->cargo_amount_tons ?? 0);
        $cargoContainers = (float) ($template->cargo_amount_containers ?? 0);
        $cargoMode = $this->normalizeCargoMode($template->cargo_mode ?? $template->cargo_type);

        $loadingTonsPerHour = $this->normalizeRate($loadingSelection['throughput_tons_per_hour'] ?? null);
        $loadingContainersPerHour = $this->normalizeRate($loadingSelection['throughput_containers_per_hour'] ?? null);
        $unloadingTonsPerHour = $this->normalizeRate($unloadingSelection['throughput_tons_per_hour'] ?? null);
        $unloadingContainersPerHour = $this->normalizeRate($unloadingSelection['throughput_containers_per_hour'] ?? null);

        $loadingMinutes = $this->calculateMinutes(
            $cargoTons,
            $cargoContainers,
            $loadingTonsPerHour,
            $loadingContainersPerHour,
            $cargoMode
        );

        $unloadingMinutes = $this->calculateMinutes(
            $cargoTons,
            $cargoContainers,
            $unloadingTonsPerHour,
            $unloadingContainersPerHour,
            $cargoMode
        );

        return [
            'loading_duration_minutes' => $loadingMinutes,
            'unloading_duration_minutes' => $unloadingMinutes,
            'loading_method_code' => $loadingSelection['code'] ?? null,
            'loading_method_source' => $loadingSelection['source'] ?? null,
            'loading_tons_per_hour' => $loadingTonsPerHour,
            'loading_containers_per_hour' => $loadingContainersPerHour,
            'unloading_method_code' => $unloadingSelection['code'] ?? null,
            'unloading_method_source' => $unloadingSelection['source'] ?? null,
            'unloading_tons_per_hour' => $unloadingTonsPerHour,
            'unloading_containers_per_hour' => $unloadingContainersPerHour,
        ];
    }

    protected function calculateMinutes(
        float $cargoTons,
        float $cargoContainers,
        ?float $tonsPerHour,
        ?float $containersPerHour,
        ?string $cargoMode
    ): ?float {
        if ($cargoMode === 'containerized') {
            if ($cargoContainers > 0 && $containersPerHour !== null && $containersPerHour > 0) {
                return round(($cargoContainers / $containersPerHour) * 60, 2);
            }

            if ($cargoTons > 0 && $tonsPerHour !== null && $tonsPerHour > 0) {
                return round(($cargoTons / $tonsPerHour) * 60, 2);
            }

            return null;
        }

        if ($cargoMode === 'bulk' || $cargoMode === 'liquid' || $cargoMode === 'break_bulk') {
            if ($cargoTons > 0 && $tonsPerHour !== null && $tonsPerHour > 0) {
                return round(($cargoTons / $tonsPerHour) * 60, 2);
            }

            if ($cargoContainers > 0 && $containersPerHour !== null && $containersPerHour > 0) {
                return round(($cargoContainers / $containersPerHour) * 60, 2);
            }

            return null;
        }

        if ($cargoContainers > 0 && $containersPerHour !== null && $containersPerHour > 0) {
            return round(($cargoContainers / $containersPerHour) * 60, 2);
        }

        if ($cargoTons > 0 && $tonsPerHour !== null && $tonsPerHour > 0) {
            return round(($cargoTons / $tonsPerHour) * 60, 2);
        }

        return null;
    }

    private function normalizeRate(mixed $value): ?float
    {
        if ($value === null || $value === '' || (float) $value <= 0) {
            return null;
        }

        return (float) $value;
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
            'breakbulk', 'break_bulk', 'general' => 'break_bulk',
            default => strtolower(trim($value)),
        };
    }
}
