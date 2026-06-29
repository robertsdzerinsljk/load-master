<?php

namespace App\Http\Controllers\Places;

use App\Http\Controllers\Controller;
use App\Services\Places\PlaceSearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PlaceController extends Controller
{
    public function store(Request $request, PlaceSearchService $places): JsonResponse
    {
        $validated = $request->validate([
            'source' => ['nullable', 'string', 'max:80'],
            'external_id' => ['nullable', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'display_name' => ['nullable', 'string', 'max:500'],
            'country' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'type' => ['nullable', Rule::in(['city', 'port', 'warehouse', 'factory', 'client', 'fuel_station', 'port_terminal', 'custom'])],
            'metadata' => ['nullable', 'array'],
        ]);

        $location = $places->savePlace($validated);

        return response()->json([
            'result' => $places->normalizeLocation($location),
        ], 201);
    }
}
