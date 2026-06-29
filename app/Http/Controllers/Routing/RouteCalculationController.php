<?php

namespace App\Http\Controllers\Routing;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Port;
use App\Services\Routing\RouteCalculationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RouteCalculationController extends Controller
{
    public function __invoke(Request $request, RouteCalculationService $routes): JsonResponse
    {
        $validated = $request->validate([
            'route_type' => ['required', Rule::in(['land', 'sea', 'multimodal'])],
            'origin_location_id' => ['required_if:route_type,land', 'integer', 'exists:locations,id'],
            'destination_location_id' => ['required_if:route_type,land', 'integer', 'exists:locations,id'],
            'origin_port_id' => ['required_if:route_type,sea', 'integer', 'exists:ports,id'],
            'destination_port_id' => ['required_if:route_type,sea', 'integer', 'exists:ports,id'],
            'legs' => ['required_if:route_type,multimodal', 'array'],
            'legs.*.type' => ['required_with:legs', Rule::in(['land', 'sea', 'port_handling'])],
            'legs.*.origin_location_id' => ['required_if:legs.*.type,land', 'integer', 'exists:locations,id'],
            'legs.*.destination_location_id' => ['required_if:legs.*.type,land', 'integer', 'exists:locations,id'],
            'legs.*.origin_port_id' => ['required_if:legs.*.type,sea', 'integer', 'exists:ports,id'],
            'legs.*.destination_port_id' => ['required_if:legs.*.type,sea', 'integer', 'exists:ports,id'],
            'legs.*.duration_hours' => ['nullable', 'numeric', 'min:0'],
            'legs.*.cost' => ['nullable', 'numeric', 'min:0'],
            'legs.*.origin' => ['nullable', 'string', 'max:255'],
            'legs.*.destination' => ['nullable', 'string', 'max:255'],
            'legs.*.port' => ['nullable', 'string', 'max:255'],
        ]);

        $result = match ($validated['route_type']) {
            'land' => $routes->land(
                Location::query()->findOrFail($validated['origin_location_id']),
                Location::query()->findOrFail($validated['destination_location_id']),
            ),
            'sea' => $routes->sea(
                Port::query()->with('location')->findOrFail($validated['origin_port_id']),
                Port::query()->with('location')->findOrFail($validated['destination_port_id']),
            ),
            'multimodal' => $routes->multimodal($validated['legs'] ?? []),
        };

        return response()->json($result);
    }
}
