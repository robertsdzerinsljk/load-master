<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\SimulationAttempt;
use App\Models\TeacherFeedback;
use App\Services\Simulator\SimulationPreviewService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssignedTaskController extends Controller
{
    public function __construct(
        private readonly SimulationPreviewService $previewService
    ) {
    }

    public function show(int $id): Response
    {
        $attempt = SimulationAttempt::query()
            ->with([
                'user.class',
                'orderTemplate.temperatureMode',
                'orderTemplate.specialCondition',
                'orderTemplate.transportTemplates',
                'selectedTransportTemplate',
                'selectedPort',
                'selectedShip',
                'routeSegments.fromLocation',
                'routeSegments.toLocation',
                'fuelStations.location',
                'feedback',
            ])
            ->findOrFail($id);

        $template = $attempt->orderTemplate;
        $student = $attempt->user;
        $preview = $this->resolvePreview($attempt);

        $deliveryQuantityMatch = 'Daļēji';
        $deliveryTypeMatch = 'Daļēji';
        $deliveryQualityMatch = 'Daļēji';

        if ($template) {
            $containers = (int) ($template->cargo_amount_containers ?? 0);
            $requiredVehicles = (int) data_get($preview, 'result.required_vehicles', 0);

            if ($containers > 0 && $requiredVehicles > 0) {
                $deliveryQuantityMatch = 'Jā';
            }

            if (!empty($template->cargo_type) && !empty($template->temperatureMode?->name)) {
                $deliveryTypeMatch = 'Jā';
            }

            if ($attempt->status === 'submitted') {
                $deliveryQualityMatch = 'Jā';
            }
        }

        return Inertia::render('Teacher/AssignedTasks/Show', [
            'attempt' => [
                'id' => $attempt->id,
                'status' => $attempt->status,
                'current_step' => $attempt->current_step,
                'submitted_at' => optional($attempt->submitted_at)?->format('Y-m-d H:i'),
                'updated_at' => optional($attempt->updated_at)?->format('Y-m-d H:i'),
                'preview_result' => $preview,

                'selected_transport_template_id' => $attempt->selected_transport_template_id,
                'selected_vehicle_count' => $attempt->selected_vehicle_count,
                'selected_port_id' => $attempt->selected_port_id,
                'selected_ship_id' => $attempt->selected_ship_id,

                'selectedTransportTemplate' => $attempt->selectedTransportTemplate ? [
                    'id' => $attempt->selectedTransportTemplate->id,
                    'name' => $attempt->selectedTransportTemplate->name,
                    'type' => $attempt->selectedTransportTemplate->type,
                    'capacity_containers' => $attempt->selectedTransportTemplate->capacity_containers
                        ?? $attempt->selectedTransportTemplate->container_capacity,
                ] : null,

                'selectedPort' => $attempt->selectedPort ? [
                    'id' => $attempt->selectedPort->id,
                    'name' => $attempt->selectedPort->name,
                    'country' => $attempt->selectedPort->country ?? null,
                ] : null,

                'selectedShip' => $attempt->selectedShip ? [
                    'id' => $attempt->selectedShip->id,
                    'name' => $attempt->selectedShip->name,
                    'cargo_type' => $attempt->selectedShip->cargo_type ?? null,
                    'ship_type' => $attempt->selectedShip->ship_type ?? null,
                ] : null,

                'ordered_route_segments' => $attempt->routeSegments
                    ->sortBy('pivot.position')
                    ->values()
                    ->map(function ($segment) {
                        return [
                            'id' => $segment->id,
                            'distance_km' => $segment->distance_km,
                            'pivot' => [
                                'position' => $segment->pivot->position ?? null,
                            ],
                            'fromLocation' => $segment->fromLocation ? [
                                'id' => $segment->fromLocation->id,
                                'name' => $segment->fromLocation->name,
                            ] : null,
                            'toLocation' => $segment->toLocation ? [
                                'id' => $segment->toLocation->id,
                                'name' => $segment->toLocation->name,
                            ] : null,
                        ];
                    })
                    ->all(),

                'ordered_fuel_stations' => $attempt->fuelStations
                    ->sortBy('pivot.position')
                    ->values()
                    ->map(function ($station) {
                        return [
                            'id' => $station->id,
                            'name' => $station->name ?? null,
                            'display_name' => $station->display_name ?? $station->name ?? null,
                            'location_name' => $station->location?->name ?? null,
                            'pivot' => [
                                'position' => $station->pivot->position ?? null,
                            ],
                        ];
                    })
                    ->all(),

                'student' => [
                    'id' => $student?->id,
                    'name' => $student?->name,
                    'email' => $student?->email,
                    'class_name' => $student?->class?->name,
                ],

                'template' => [
                    'id' => $template?->id,
                    'title' => $template?->title,
                    'description' => $template?->description,
                    'student_brief' => $template?->student_brief,
                    'cargo_name' => $template?->cargo_name,
                    'cargo_type' => $template?->cargo_type,
                    'cargo_amount_containers' => $template?->cargo_amount_containers,
                    'cargo_amount_tons' => $template?->cargo_amount_tons,
                    'deadline_date' => optional($template?->deadline_date)?->format('Y-m-d'),
                    'priority' => $template?->priority,
                    'evaluation_mode' => $template?->evaluation_mode,
                    'temperature_mode' => $template?->temperatureMode?->name,
                    'special_condition' => $template?->specialCondition?->name,
                    'transport_names' => $template
                        ? $template->transportTemplates->pluck('name')->values()->all()
                        : [],
                ],

                'feedback' => $attempt->feedback ? [
                    'id' => $attempt->feedback->id,
                    'grade' => $attempt->feedback->grade,
                    'comment' => $attempt->feedback->comment,
                ] : null,

                'derived' => [
                    'delivery_quantity_match' => $deliveryQuantityMatch,
                    'delivery_type_match' => $deliveryTypeMatch,
                    'delivery_quality_match' => $deliveryQualityMatch,
                ],
            ],
        ]);
    }

    public function saveFeedback(Request $request, SimulationAttempt $attempt)
    {
        $data = $request->validate([
            'grade' => 'nullable|integer|min:0|max:100',
            'comment' => 'nullable|string',
        ]);

        TeacherFeedback::updateOrCreate(
            [
                'simulation_attempt_id' => $attempt->id,
            ],
            [
                'assignment_id' => $attempt->assignment_id,
                'grade' => $data['grade'] ?? null,
                'comment' => $data['comment'] ?? null,
            ]
        );

        if ($attempt->status !== 'reviewed') {
            $attempt->status = 'reviewed';
            $attempt->save();
        }

        return back()->with('success', 'Atsauksme saglabāta.');
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
