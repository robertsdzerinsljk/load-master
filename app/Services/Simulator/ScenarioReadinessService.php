<?php

namespace App\Services\Simulator;

use App\Models\OrderTemplate;
use App\Models\Port;
use App\Models\Ship;
use App\Models\SimulationAttempt;

class ScenarioReadinessService
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

    public function evaluate(OrderTemplate $template, ?SimulationAttempt $latestTeacherTest = null): array
    {
        $template->loadMissing([
            'startLocation',
            'endLocation',
            'startPort.location',
            'endPort.location',
            'routeTemplate.points',
            'routeTemplate.legs',
            'transportTemplates',
            'landRoutes.fromLocation',
            'landRoutes.toLocation',
            'ports.location',
            'ships',
        ]);

        $enabledSteps = $this->enabledSteps($template);
        $needsTransport = in_array('transport', $enabledSteps, true);
        $needsRoute = in_array('route', $enabledSteps, true);
        $needsPort = in_array('port', $enabledSteps, true);
        $needsShip = in_array('ship', $enabledSteps, true);
        $hasRoutePlan = $template->landRoutes->isNotEmpty() || $template->routeTemplate !== null;
        $issues = [];
        $recommendations = [];

        if ($needsTransport && $template->transportTemplates->isEmpty()) {
            $issues[] = $this->issue(
                'critical',
                'Nav pievienots transports',
                'Scenārijam nav neviena transporta varianta, tāpēc students nevarēs sākt plānošanu.'
            );
            $recommendations[] = 'Pievieno vismaz vienu transporta sagatavi.';
        }

        if ($needsRoute && ! $hasRoutePlan) {
            $issues[] = $this->issue(
                'critical',
                'Nav pievienots maršruts',
                'Scenārijam nav neviena sauszemes maršruta segmenta, tāpēc piegādes ķēdi nevar izveidot.'
            );
            $recommendations[] = 'Pievieno vismaz vienu maršruta segmentu.';
        }

        if ($needsPort && $template->ports->isEmpty()) {
            $issues[] = $this->issue(
                'critical',
                'Nav pievienota osta',
                'ScenÄrijam nav nevienas ostas izvÄ“les, lai gan simulatora plÅ«smÄ ir ostas solis.'
            );
            $recommendations[] = 'Pievieno vismaz vienu ostu vai maini scenÄrija tipu.';
        }

        if ($needsShip && $template->ships->isEmpty()) {
            $issues[] = $this->issue(
                'critical',
                'Nav pievienots kuÄ£is',
                'ScenÄrijam nav neviena kuÄ£a varianta, lai gan simulatora plÅ«smÄ ir kuÄ£a solis.'
            );
            $recommendations[] = 'Pievieno vismaz vienu kuÄ£i vai maini scenÄrija tipu.';
        }

        if ($needsRoute && $template->startLocation && $template->landRoutes->isNotEmpty()) {
            $hasStartMatch = $template->landRoutes->contains(
                fn ($route) => (int) $route->from_location_id === (int) $template->start_location_id
            );

            if (! $hasStartMatch) {
                $issues[] = $this->issue(
                    'critical',
                    'Maršruts nesākas pareizajā vietā',
                    'Nevienam pievienotajam maršrutam sākumpunkts neatbilst scenārija sākuma lokācijai.'
                );
                $recommendations[] = 'Pārbaudi sākuma lokāciju vai pievieno maršruta segmentu, kas sākas pareizajā punktā.';
            }
        }

        $routeTargetLocationId = $this->routeTargetLocationId($template, $needsPort, $needsShip);

        if ($needsRoute && $routeTargetLocationId && $template->landRoutes->isNotEmpty()) {
            $hasEndMatch = $template->landRoutes->contains(
                fn ($route) => (int) $route->to_location_id === $routeTargetLocationId
            );

            if (! $hasEndMatch) {
                $issues[] = $this->issue(
                    'critical',
                    'Maršruts nebeidzas pie galamērķa',
                    'Nevienam pievienotajam maršrutam galapunkts neatbilst scenārija beigu lokācijai.'
                );
                $recommendations[] = 'Pievieno maršruta segmentu, kas sasniedz izvēlēto galamērķi.';
            }
        }

        if ($needsRoute && $template->routeTemplate) {
            $points = $template->routeTemplate->points->sortBy('sequence')->values();
            $firstPoint = $points->first();
            $lastPoint = $points->last();
            $routeIncludesSea = $template->routeTemplate->legs->contains(fn ($leg) => ($leg->type ?? null) === 'sea');
            $templateTargetLocationId = $this->routeTargetLocationId($template, $needsPort, $needsShip, $routeIncludesSea);

            if ($template->start_location_id && (int) ($firstPoint?->location_id ?? 0) !== (int) $template->start_location_id) {
                $issues[] = $this->issue(
                    'critical',
                    'MarÅ¡ruts nesÄkas pareizajÄ vietÄ',
                    'PievienotÄ marÅ¡ruta sagatave nesÄkas scenÄrija sÄkuma lokÄcijÄ.'
                );
                $recommendations[] = 'PÄrbaudi sÄkuma lokÄciju vai izveido marÅ¡ruta sagatavi no pareizÄ sÄkumpunkta.';
            }

            if ($templateTargetLocationId && (int) ($lastPoint?->location_id ?? 0) !== $templateTargetLocationId) {
                $issues[] = $this->issue(
                    'critical',
                    'MarÅ¡ruts nebeidzas pie galamÄ“rÄ·a',
                    'PievienotÄ marÅ¡ruta sagatave nesasniedz scenÄrijam nepiecieÅ¡amo gala punktu.'
                );
                $recommendations[] = 'Pievieno marÅ¡ruta sagatavi, kas sasniedz izvÄ“lÄ“to galamÄ“rÄ·i vai izbraukÅ¡anas ostu.';
            }
        }

        if ($needsPort && $needsShip && $template->ports->isNotEmpty() && $template->ships->isNotEmpty() && ! $this->hasCompatiblePortShipPair($template)) {
            $issues[] = $this->issue(
                'critical',
                'Osta un kuģis nav savietojami',
                'No pašreiz pievienotajām ostām un kuģiem neveidojas neviena derīga kombinācija šim scenārijam.'
            );
            $recommendations[] = 'Pārbaudi ostu dziļumus, kuģu iegrimumu un kapacitāti.';
        }

        $deadlineCheck = $this->evaluateDeadlinePressure($template);

        if ($deadlineCheck !== null) {
            $issues[] = $deadlineCheck;
            $recommendations[] = 'Pārskati termiņu vai pievieno ātrākus / piemērotākus transporta variantus.';
        }

        if ($latestTeacherTest === null) {
            $issues[] = $this->issue(
                'warning',
                'Nav veikts skolotāja tests',
                'Pirms piešķiršanas ieteicams vienreiz iziet scenāriju simulatorā, lai pārbaudītu plūsmu un vērtēšanu.'
            );
            $recommendations[] = 'Palaid vismaz vienu skolotāja testu pirms uzdevuma piešķiršanas studentiem.';
        } else {
            $testIssue = $this->evaluateLatestTeacherTest($latestTeacherTest);

            if ($testIssue !== null) {
                $issues[] = $testIssue;
            }
        }

        $criticalCount = collect($issues)->where('severity', 'critical')->count();
        $warningCount = collect($issues)->where('severity', 'warning')->count();

        if ($criticalCount > 0) {
            $status = 'blocked';
            $headline = 'Nav gatavs piešķiršanai';
            $summary = 'Scenārijā ir kritiskas problēmas, kuras vajadzētu novērst pirms uzdevuma piešķiršanas studentiem.';
        } elseif ($warningCount > 0) {
            $status = 'warning';
            $headline = 'Gandrīz gatavs piešķiršanai';
            $summary = 'Scenāriju var izmantot, bet pirms piešķiršanas ir ieteicams pārskatīt brīdinājumus.';
        } else {
            $status = 'ready';
            $headline = 'Gatavs piešķiršanai';
            $summary = 'Scenārijs izskatās tehniski sagatavots piešķiršanai studentiem.';
        }

        return [
            'status' => $status,
            'headline' => $headline,
            'summary' => $summary,
            'has_critical_issues' => $criticalCount > 0,
            'critical_count' => $criticalCount,
            'warning_count' => $warningCount,
            'issues' => array_values($issues),
            'recommendations' => array_values(array_unique($recommendations)),
        ];
    }

    private function evaluateLatestTeacherTest(SimulationAttempt $attempt): ?array
    {
        $preview = is_array($attempt->preview_result) ? $attempt->preview_result : [];
        $isValid = (bool) data_get($preview, 'result.is_valid', $attempt->is_valid ?? false);
        $score = (int) data_get($preview, 'result.score', $attempt->score ?? 0);

        if (! $isValid) {
            return $this->issue(
                'critical',
                'Pēdējais skolotāja tests bija nederīgs',
                'Pēdējais sandbox mēģinājums neizgāja veiksmīgi, tāpēc scenāriju nevajadzētu piešķirt bez papildus pārbaudes.'
            );
        }

        if ($score < 50) {
            return $this->issue(
                'warning',
                'Pēdējais tests ieguva zemu rezultātu',
                'Skolotāja tests ir izpildāms, bet rezultāts bija ļoti zems. Pārbaudi, vai scenārijs nav pārāk stingrs.'
            );
        }

        return null;
    }

    private function evaluateDeadlinePressure(OrderTemplate $template): ?array
    {
        if (! $template->scenario_start_at || ! $template->deadline_at) {
            return null;
        }

        $enabledSteps = $this->enabledSteps($template);

        if (! in_array('transport', $enabledSteps, true) || ! in_array('route', $enabledSteps, true)) {
            return null;
        }

        if ($template->transportTemplates->isEmpty() || $template->landRoutes->isEmpty()) {
            return null;
        }

        $fastestTransport = $template->transportTemplates
            ->sortByDesc(fn ($transport) => (float) ($transport->avg_speed_kmh ?? $transport->average_speed_kmh ?? 0))
            ->first();

        if ($fastestTransport === null) {
            return null;
        }

        $speed = (float) ($fastestTransport->avg_speed_kmh ?? $fastestTransport->average_speed_kmh ?? 0);

        if ($speed <= 0) {
            return null;
        }

        $totalDistanceKm = (float) $template->landRoutes->sum(fn ($route) => (float) ($route->distance_km ?? 0));
        $loadingMinutes = (float) ($fastestTransport->loading_time_minutes ?? 0);
        $unloadingMinutes = (float) ($fastestTransport->unloading_time_minutes ?? 0);
        $optimisticMinutes = (int) ceil((($totalDistanceKm / $speed) * 60) + $loadingMinutes + $unloadingMinutes);

        $availableMinutes = (int) $template->scenario_start_at->diffInMinutes($template->deadline_at, false);

        if ($availableMinutes > 0 && $optimisticMinutes > $availableMinutes) {
            return $this->issue(
                'warning',
                'Termiņš var būt pārāk stingrs',
                "Pat optimistiskā aprēķinā piegādei vajag apmēram {$optimisticMinutes} min, bet scenārijā pieejamas tikai {$availableMinutes} min."
            );
        }

        return null;
    }

    private function enabledSteps(OrderTemplate $template): array
    {
        $config = $template->step_config;

        if (is_array($config) && ! empty($config)) {
            $enabled = [];

            foreach (self::STEP_ORDER as $step) {
                if (($config[$step] ?? false) === true) {
                    $enabled[] = $step;
                }
            }

            if (! empty($enabled)) {
                return $template->requires_refuel_planning
                    ? $enabled
                    : array_values(array_filter($enabled, fn (string $step) => $step !== 'fuel'));
            }
        }

        $enabled = match ($template->scenario_type) {
            'land_transport' => ['intro', 'transport', 'route', 'fuel', 'simulation', 'submit'],
            'land_to_port' => ['intro', 'transport', 'route', 'fuel', 'port', 'simulation', 'submit'],
            'port_to_ship' => ['intro', 'port', 'ship', 'simulation', 'submit'],
            'full_chain', 'mixed_transport' => ['intro', 'transport', 'route', 'fuel', 'port', 'ship', 'simulation', 'submit'],
            default => self::STEP_ORDER,
        };

        if (! $template->requires_refuel_planning) {
            $enabled = array_values(array_filter($enabled, fn (string $step) => $step !== 'fuel'));
        }

        return $enabled;
    }

    private function routeTargetLocationId(
        OrderTemplate $template,
        bool $needsPort,
        bool $needsShip,
        bool $routeIncludesSea = false,
    ): ?int {
        if ($routeIncludesSea) {
            if ($template->endPort?->location_id) {
                return (int) $template->endPort->location_id;
            }

            return $template->end_location_id ? (int) $template->end_location_id : null;
        }

        if ($needsShip && $template->startPort?->location_id) {
            return (int) $template->startPort->location_id;
        }

        if ($needsPort && $template->endPort?->location_id) {
            return (int) $template->endPort->location_id;
        }

        return $template->end_location_id ? (int) $template->end_location_id : null;
    }

    private function hasCompatiblePortShipPair(OrderTemplate $template): bool
    {
        $containerCount = (int) ($template->cargo_amount_containers ?? 0);

        /** @var Port $port */
        foreach ($template->ports as $port) {
            $portDepth = (float) ($port->depth_value ?? $port->depth_m ?? $port->max_depth_m ?? $port->draft_limit_m ?? 0);

            /** @var Ship $ship */
            foreach ($template->ships as $ship) {
                $shipDraft = (float) ($ship->draft_value ?? $ship->draft_m ?? $ship->draught_m ?? $ship->required_depth_m ?? 0);
                $shipCapacity = (int) ($ship->capacity_containers_value ?? $ship->capacity_containers ?? $ship->container_capacity ?? 0);

                $depthOk = $portDepth <= 0 || $shipDraft <= 0 || $shipDraft <= $portDepth;
                $capacityOk = $containerCount <= 0 || $shipCapacity <= 0 || $containerCount <= $shipCapacity;

                if ($depthOk && $capacityOk) {
                    return true;
                }
            }
        }

        return false;
    }

    private function issue(string $severity, string $title, string $body): array
    {
        return [
            'severity' => $severity,
            'title' => $title,
            'body' => $body,
        ];
    }
}
