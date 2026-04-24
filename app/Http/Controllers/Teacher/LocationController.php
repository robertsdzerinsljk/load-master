<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Services\LocationCatalogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function __construct(
        private readonly LocationCatalogService $locationCatalog
    ) {
    }

    public function index()
    {
        return Inertia::render('Teacher/Templates/Locations/Index', [
            'locations' => Location::query()
                ->with('linkedCity')
                ->orderBy('city')
                ->orderBy('name')
                ->get()
                ->map(fn (Location $location) => $this->serializeLocation($location))
                ->all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Teacher/Templates/Locations/Create', [
            'countries' => $this->locationCatalog->countryOptions(),
            'cities' => $this->locationCatalog->cityOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateLocation($request);

        Location::create($this->buildLocationPayload($validated));

        return redirect()->route('teacher.templates.locations');
    }

    public function edit($id)
    {
        $location = Location::with('linkedCity')->findOrFail($id);

        return Inertia::render('Teacher/Templates/Locations/Edit', [
            'location' => $this->serializeLocation($location),
            'countries' => $this->locationCatalog->countryOptions(),
            'cities' => $this->locationCatalog->cityOptions(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $location = Location::findOrFail($id);

        $validated = $this->validateLocation($request);

        $location->update($this->buildLocationPayload($validated));

        return redirect()->route('teacher.templates.locations');
    }

    public function destroy($id)
    {
        $location = Location::findOrFail($id);
        $location->delete();

        return redirect()->route('teacher.templates.locations');
    }

    private function validateLocation(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:255|required_with:new_city_name',
            'city_id' => 'nullable|integer|exists:cities,id',
            'new_city_name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'notes' => 'nullable|string',
        ]);
    }

    private function buildLocationPayload(array $validated): array
    {
        return $this->locationCatalog->buildLocationPayload($validated);
    }

    private function serializeLocation(Location $location): array
    {
        return array_merge($location->toArray(), [
            'city' => $location->linkedCity?->name ?? $location->city,
        ]);
    }
}
