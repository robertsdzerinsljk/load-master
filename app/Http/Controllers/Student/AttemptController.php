<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\SimulationAttempt;
use App\Services\Simulator\SimulationPreviewService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttemptController extends Controller
{
    public function __construct(
        private readonly SimulationPreviewService $previewService
    ) {
    }

    public function index(Request $request): Response
    {
        $attempts = SimulationAttempt::query()
            ->where('user_id', $request->user()->id)
            ->whereIn('status', ['in_progress', 'submitted', 'reviewed', 'draft'])
            ->with([
                'orderTemplate',
                'selectedTransportTemplate',
                'selectedPort',
                'selectedShip',
                'routeSegments.fromLocation',
                'routeSegments.toLocation',
                'fuelStations.location',
                'feedback',
            ])
            ->latest('updated_at')
            ->get()
            ->map(function (SimulationAttempt $attempt) {
                $preview = $this->resolvePreview($attempt);

                return [
                    'id' => $attempt->id,
                    'status' => $attempt->status,
                    'current_step' => $attempt->current_step,
                    'submitted_at' => optional($attempt->submitted_at)?->format('Y-m-d H:i'),
                    'updated_at' => optional($attempt->updated_at)?->format('Y-m-d H:i'),
                    'score' => data_get($preview, 'result.score', $attempt->score),
                    'total_cost' => data_get($preview, 'result.total_cost', $attempt->total_cost),
                    'total_time_hours' => data_get(
                        $preview,
                        'timeline.summary.total_hours',
                        $attempt->total_time_hours
                    ),
                    'total_fuel_liters' => data_get(
                        $preview,
                        'result.fuel_needed_liters',
                        $attempt->total_fuel_liters
                    ),
                    'is_valid' => data_get($preview, 'result.is_valid', $attempt->is_valid),
                    'feedback_text' => $attempt->feedback?->comment ?? $attempt->feedback_text,
                    'orderTemplate' => $attempt->orderTemplate ? [
                        'id' => $attempt->orderTemplate->id,
                        'title' => $attempt->orderTemplate->title,
                        'scenario_type' => $attempt->orderTemplate->scenario_type,
                        'cargo_name' => $attempt->orderTemplate->cargo_name,
                        'cargo_type' => $attempt->orderTemplate->cargo_type,
                        'deadline_date' => optional($attempt->orderTemplate->deadline_date)?->format('Y-m-d'),
                    ] : null,
                ];
            })
            ->values();

        return Inertia::render('Student/Attempts/Index', [
            'attempts' => $attempts,
        ]);
    }

    private function resolvePreview(SimulationAttempt $attempt): array
    {
        $preview = is_array($attempt->preview_result) ? $attempt->preview_result : [];

        if (empty($preview)) {
            return [];
        }

        if (!$this->previewRequiresRefresh($preview)) {
            return $preview;
        }

        return $this->previewService->build($attempt);
    }

    private function previewRequiresRefresh(array $preview): bool
    {
        $result = data_get($preview, 'result');

        if (!is_array($result)) {
            return true;
        }

        if (!is_array(data_get($preview, 'timeline'))) {
            return true;
        }

        if (!is_array(data_get($preview, 'hints'))) {
            return true;
        }

        foreach (['score_breakdown', 'scoring', 'delay_minutes', 'is_within_deadline'] as $key) {
            if (!array_key_exists($key, $result)) {
                return true;
            }
        }

        return false;
    }
}
