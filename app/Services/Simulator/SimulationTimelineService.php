<?php

namespace App\Services\Simulator;

use App\Models\SimulationAttempt;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

class SimulationTimelineService
{
    public function build(SimulationAttempt $attempt): array
    {
        $attempt->loadMissing([
            'orderTemplate',
            'selectedTransportTemplate',
            'selectedPort',
            'selectedShip',
            'routeSegments.fromLocation',
            'routeSegments.toLocation',
            'fuelStations.location',
        ]);

        $template = $attempt->orderTemplate;
        $transport = $attempt->selectedTransportTemplate;
        $port = $attempt->selectedPort;
        $ship = $attempt->selectedShip;

        $segments = $attempt->routeSegments->sortBy('pivot.position')->values();
        $fuelStations = $attempt->fuelStations->sortBy('pivot.position')->values();

        $config = is_array($template->scenario_config) ? $template->scenario_config : [];
        $timing = is_array($config['timing'] ?? null) ? $config['timing'] : [];

        $containerCount = (int) ($template->cargo_amount_containers ?? 0);
        $vehicleCount = max(1, (int) ($attempt->selected_vehicle_count ?? 1));

        $avgSpeed = (float) (
            $transport->avg_speed_kmh
            ?? $transport->average_speed_kmh
            ?? 70
        );

        $defaultLoadingMinutes = (int) ($timing['loading_fixed_minutes'] ?? 45);
        $defaultFuelStopMinutes = (int) ($timing['fuel_stop_minutes'] ?? 20);
        $defaultPortProcessingMinutes = (int) ($timing['port_processing_minutes'] ?? 60);
        $defaultShipLoadingMinutes = (int) ($timing['ship_loading_minutes'] ?? 90);

        $events = [];

        $current = $template->scenario_start_at
            ? Carbon::parse($template->scenario_start_at)
            : now()->copy();

        $startedAt = $current->copy();

        if ($containerCount > 0) {
            $loadingMinutes = $defaultLoadingMinutes;

            $events[] = $this->makeEvent(
                type: 'loading',
                label: 'Kravas sākotnējā iekraušana',
                start: $current,
                durationMinutes: $loadingMinutes,
                meta: [
                    'containers' => $containerCount,
                    'vehicles' => $vehicleCount,
                ]
            );

            $current = $current->copy()->addMinutes($loadingMinutes);
        }

        foreach ($segments as $index => $segment) {
            $distanceKm = (float) ($segment->distance_km ?? 0);
            $driveMinutes = $avgSpeed > 0
                ? (int) ceil(($distanceKm / $avgSpeed) * 60)
                : 0;

            $from = $segment->fromLocation->name ?? '—';
            $to = $segment->toLocation->name ?? '—';

            $events[] = $this->makeEvent(
                type: 'drive',
                label: "Brauciens {$from} → {$to}",
                start: $current,
                durationMinutes: $driveMinutes,
                meta: [
                    'distance_km' => $distanceKm,
                    'avg_speed_kmh' => $avgSpeed,
                    'segment_position' => $index + 1,
                ]
            );

            $current = $current->copy()->addMinutes($driveMinutes);

            if ($fuelStations->has($index)) {
                $station = $fuelStations[$index];
                $stationName = $station->display_name ?? $station->name ?? 'Degvielas pietura';

                $events[] = $this->makeEvent(
                    type: 'fuel_stop',
                    label: "Uzpilde: {$stationName}",
                    start: $current,
                    durationMinutes: $defaultFuelStopMinutes,
                    meta: [
                        'station_id' => $station->id,
                        'station_name' => $stationName,
                    ]
                );

                $current = $current->copy()->addMinutes($defaultFuelStopMinutes);
            }
        }

        if ($port) {
            $events[] = $this->makeEvent(
                type: 'port_processing',
                label: "Ostas apstrāde: {$port->name}",
                start: $current,
                durationMinutes: $defaultPortProcessingMinutes,
                meta: [
                    'port_id' => $port->id,
                    'port_name' => $port->name,
                ]
            );

            $current = $current->copy()->addMinutes($defaultPortProcessingMinutes);
        }

        if ($ship) {
            $events[] = $this->makeEvent(
                type: 'ship_loading',
                label: "Iekraušana kuģī: {$ship->name}",
                start: $current,
                durationMinutes: $defaultShipLoadingMinutes,
                meta: [
                    'ship_id' => $ship->id,
                    'ship_name' => $ship->name,
                ]
            );

            $current = $current->copy()->addMinutes($defaultShipLoadingMinutes);
        }

        $finishedAt = $current->copy();
        $totalMinutes = $startedAt->diffInMinutes($finishedAt);

        $deadlineAt = $template->deadline_at
            ? Carbon::parse($template->deadline_at)
            : null;

        if (!$deadlineAt && $template->deadline_date) {
            $deadlineAt = Carbon::parse($template->deadline_date)->endOfDay();
        }

        $delayMinutes = 0;
        $isWithinDeadline = true;

        if ($deadlineAt && $finishedAt->greaterThan($deadlineAt)) {
            $delayMinutes = $deadlineAt->diffInMinutes($finishedAt);
            $isWithinDeadline = false;
        }

        return [
            'events' => $events,
            'summary' => [
                'started_at' => $startedAt->toDateTimeString(),
                'finished_at' => $finishedAt->toDateTimeString(),
                'total_minutes' => $totalMinutes,
                'total_hours' => round($totalMinutes / 60, 2),
                'deadline_at' => $deadlineAt?->toDateTimeString(),
                'delay_minutes' => $delayMinutes,
                'is_within_deadline' => $isWithinDeadline,
            ],
        ];
    }

    private function makeEvent(
        string $type,
        string $label,
        CarbonInterface $start,
        int $durationMinutes,
        array $meta = []
    ): array {
        $startAt = Carbon::parse($start);
        $end = $startAt->copy()->addMinutes(max(0, $durationMinutes));

        return [
            'type' => $type,
            'label' => $label,
            'start_at' => $startAt->toDateTimeString(),
            'end_at' => $end->toDateTimeString(),
            'duration_minutes' => max(0, $durationMinutes),
            'meta' => $meta,
        ];
    }
}