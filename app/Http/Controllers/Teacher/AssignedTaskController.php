<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\SimulationAttempt;
use Inertia\Inertia;
use Inertia\Response;

class AssignedTaskController extends Controller
{
    public function show(int $id): Response
    {
        $attempt = SimulationAttempt::query()
            ->with([
                'user.class',
                'orderTemplate.temperatureMode',
                'orderTemplate.specialCondition',
                'orderTemplate.transportTemplates',
            ])
            ->findOrFail($id);

        $template = $attempt->orderTemplate;
        $student = $attempt->user;

        $preview = is_array($attempt->preview_result) ? $attempt->preview_result : [];

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
                    'temperature_mode' => $template?->temperatureMode?->name,
                    'special_condition' => $template?->specialCondition?->name,
                    'transport_names' => $template
                        ? $template->transportTemplates->pluck('name')->values()->all()
                        : [],
                ],
                'derived' => [
                    'delivery_quantity_match' => $deliveryQuantityMatch,
                    'delivery_type_match' => $deliveryTypeMatch,
                    'delivery_quality_match' => $deliveryQualityMatch,
                ],
            ],
        ]);
    }
}