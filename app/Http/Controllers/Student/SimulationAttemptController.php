<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\LandRoute;
use App\Models\OrderTemplate;
use App\Models\SimulationAttempt;
use App\Models\TransportTemplate;
use App\Services\LandTransportCalculator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SimulationAttemptController extends Controller
{
    public function indexTasks()
    {
        $user = auth()->user();

        $templates = $user
            ? $user->assignedOrderTemplates()
                ->with([
                    'startLocation',
                    'endLocation',
                    'transportTemplates',
                ])
                ->latest()
                ->get()
            : collect();

        return Inertia::render('Student/Dashboard', [
            'templates' => $templates,
        ]);
    }

    public function showTask($orderTemplateId)
    {
        $user = auth()->user();

        $template = OrderTemplate::with([
            'transportTemplates',
            'landRoutes.fromLocation',
            'landRoutes.toLocation',
        ])->findOrFail($orderTemplateId);

        if (!$user || !$user->assignedOrderTemplates()->where('order_templates.id', $template->id)->exists()) {
            abort(403, 'Šis uzdevums jums nav piešķirts.');
        }

        $attempt = SimulationAttempt::firstOrCreate(
            [
                'order_template_id' => $template->id,
                'user_id' => $user->id,
            ],
            [
                'status' => 'in_progress',
                'current_step' => 'intro',
            ]
        );

        return Inertia::render('Student/Simulator/Show', [
            'template' => $template,
            'attempt' => $attempt->load([
                'selectedTransportTemplate',
                'selectedLandRoute.fromLocation',
                'selectedLandRoute.toLocation',
                'selectedFuelStation.location',
            ]),
        ]);
    }

    public function updateStep(Request $request, $attemptId, LandTransportCalculator $calculator)
    {
        $user = auth()->user();

        $attempt = SimulationAttempt::with('orderTemplate')
            ->where('user_id', $user?->id)
            ->findOrFail($attemptId);

        $validated = $request->validate([
            'current_step' => 'required|string|max:100',
            'selected_transport_template_id' => 'nullable|exists:transport_templates,id',
            'selected_land_route_id' => 'nullable|exists:land_routes,id',
            'selected_fuel_station_id' => 'nullable|exists:fuel_stations,id',
            'selected_vehicle_count' => 'nullable|integer|min:0',
        ]);

        $attempt->update([
            'current_step' => $validated['current_step'],
            'selected_transport_template_id' => $validated['selected_transport_template_id'] ?? null,
            'selected_land_route_id' => $validated['selected_land_route_id'] ?? null,
            'selected_fuel_station_id' => $validated['selected_fuel_station_id'] ?? null,
            'selected_vehicle_count' => $validated['selected_vehicle_count'] ?? null,
        ]);

        $preview = null;

        if (
            !empty($attempt->selected_transport_template_id) &&
            !empty($attempt->selected_land_route_id) &&
            !empty($attempt->orderTemplate?->cargo_amount_containers)
        ) {
            $route = LandRoute::with([
                'fromLocation',
                'toLocation',
                'fuelStops.fuelStation.location',
            ])->findOrFail($attempt->selected_land_route_id);

            $transport = TransportTemplate::findOrFail($attempt->selected_transport_template_id);

            $preview = $calculator->calculate(
                $route,
                $transport,
                (int) $attempt->orderTemplate->cargo_amount_containers
            );

            $attempt->update([
                'preview_result' => $preview,
            ]);
        }

        return response()->json([
            'message' => 'Attempt updated.',
            'attempt' => $attempt->fresh()->load([
                'selectedTransportTemplate',
                'selectedLandRoute.fromLocation',
                'selectedLandRoute.toLocation',
                'selectedFuelStation.location',
            ]),
            'preview' => $preview,
        ]);
    }

    public function submit($attemptId)
    {
        $user = auth()->user();

        $attempt = SimulationAttempt::where('user_id', $user?->id)->findOrFail($attemptId);

        $attempt->update([
            'status' => 'submitted',
            'current_step' => 'submitted',
            'submitted_at' => now(),
        ]);

        return response()->json([
            'message' => 'Risinājums iesniegts.',
            'attempt' => $attempt,
        ]);
    }
}