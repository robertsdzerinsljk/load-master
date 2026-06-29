<?php

namespace App\Http\Controllers\Routing;

use App\Http\Controllers\Controller;
use App\Models\RouteTemplate;
use App\Services\Routing\RouteBuilderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RouteTemplateController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'route_templates' => RouteTemplate::query()
                ->with(['points', 'legs'])
                ->orderBy('name')
                ->limit(100)
                ->get(),
        ]);
    }

    public function store(Request $request, RouteBuilderService $builder): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'mode' => ['nullable', Rule::in(['land', 'sea', 'multimodal', 'auto'])],
            'points' => ['required', 'array', 'min:2'],
            'points.*.location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'points.*.source' => ['nullable', 'string', 'max:80'],
            'points.*.external_id' => ['nullable', 'string', 'max:255'],
            'points.*.name' => ['required_without:points.*.location_id', 'string', 'max:255'],
            'points.*.display_name' => ['nullable', 'string', 'max:500'],
            'points.*.country' => ['nullable', 'string', 'max:255'],
            'points.*.city' => ['nullable', 'string', 'max:255'],
            'points.*.latitude' => ['required_without:points.*.location_id', 'numeric', 'between:-90,90'],
            'points.*.longitude' => ['required_without:points.*.location_id', 'numeric', 'between:-180,180'],
            'points.*.type' => ['nullable', Rule::in(['city', 'port', 'warehouse', 'factory', 'client', 'fuel_station', 'port_terminal', 'custom'])],
        ]);

        $template = $builder->saveTemplate($validated, (int) $request->user()->id);

        return response()->json(['route_template' => $template], 201);
    }

    public function show(RouteTemplate $routeTemplate): JsonResponse
    {
        return response()->json([
            'route_template' => $routeTemplate->load(['points', 'legs']),
        ]);
    }
}
