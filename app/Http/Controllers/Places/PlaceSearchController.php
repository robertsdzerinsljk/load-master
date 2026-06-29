<?php

namespace App\Http\Controllers\Places;

use App\Http\Controllers\Controller;
use App\Services\Places\PlaceSearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlaceSearchController extends Controller
{
    public function __invoke(Request $request, PlaceSearchService $places): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:120'],
            'country' => ['nullable', 'string', 'max:10'],
        ]);

        return response()->json($places->search($validated['q'], [
            'country' => $validated['country'] ?? null,
        ]));
    }
}
