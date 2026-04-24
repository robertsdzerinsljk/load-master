<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\FuelStation;
use App\Models\Location;
use App\Services\LocationCatalogService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class FuelStationController extends Controller
{
    public function __construct(
        private readonly LocationCatalogService $locationCatalog
    ) {
    }

    public function index()
    {
        return Inertia::render('Teacher/Templates/FuelStations/Index', [
            'fuelStations' => FuelStation::with('location')
                ->latest()
                ->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Teacher/Templates/FuelStations/Create', [
            'countries' => $this->locationCatalog->countryOptions(),
            'cities' => $this->locationCatalog->cityOptions(),
            'locations' => $this->locationCatalog->locationOptions(
                LocationCatalogService::FUEL_STATION_LOCATION_TYPES
            ),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateFuelStation($request);
        $location = $this->resolveFuelStationLocation($validated);

        $this->ensureLocationAvailable($location->id);

        FuelStation::create([
            'location_id' => $location->id,
            'fuel_type' => $validated['fuel_type'] ?? null,
            'price_per_liter' => $validated['price_per_liter'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('teacher.templates.fuel-stations');
    }

    public function edit($id)
    {
        $fuelStation = FuelStation::with('location')->findOrFail($id);

        return Inertia::render('Teacher/Templates/FuelStations/Edit', [
            'fuelStation' => $fuelStation,
            'countries' => $this->locationCatalog->countryOptions(),
            'cities' => $this->locationCatalog->cityOptions(),
            'locations' => $this->locationCatalog->locationOptions(
                LocationCatalogService::FUEL_STATION_LOCATION_TYPES
            ),
        ]);
    }

    public function update(Request $request, $id)
    {
        $fuelStation = FuelStation::with('location')->findOrFail($id);
        $validated = $this->validateFuelStation($request);
        $location = $this->resolveFuelStationLocation($validated, $fuelStation);

        $this->ensureLocationAvailable($location->id, $fuelStation->id);

        $fuelStation->update([
            'location_id' => $location->id,
            'fuel_type' => $validated['fuel_type'] ?? null,
            'price_per_liter' => $validated['price_per_liter'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('teacher.templates.fuel-stations');
    }

    public function destroy($id)
    {
        $fuelStation = FuelStation::findOrFail($id);
        $fuelStation->delete();

        return redirect()->route('teacher.templates.fuel-stations');
    }

    private function validateFuelStation(Request $request): array
    {
        $validated = $request->validate([
            'location_mode' => 'required|in:existing,new',
            'location_id' => 'nullable|integer|exists:locations,id',
            'location_name' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'city_id' => 'nullable|integer|exists:cities,id',
            'new_city_name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'fuel_type' => 'nullable|string|max:100',
            'price_per_liter' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        if (($validated['location_mode'] ?? 'existing') === 'existing') {
            if (!isset($validated['location_id']) || !$validated['location_id']) {
                throw ValidationException::withMessages([
                    'location_id' => 'Choose an existing fuel station location.',
                ]);
            }

            return $validated;
        }

        if (blank(trim((string) ($validated['location_name'] ?? '')))) {
            throw ValidationException::withMessages([
                'location_name' => 'Enter a name for the fuel station location.',
            ]);
        }

        if (blank(trim((string) ($validated['country'] ?? '')))) {
            throw ValidationException::withMessages([
                'country' => 'Choose or enter a country for the fuel station location.',
            ]);
        }

        if (
            empty($validated['city_id']) &&
            blank(trim((string) ($validated['new_city_name'] ?? '')))
        ) {
            throw ValidationException::withMessages([
                'city_id' => 'Choose an existing city or create a new one for the fuel station location.',
            ]);
        }

        return $validated;
    }

    private function resolveFuelStationLocation(
        array $validated,
        ?FuelStation $fuelStation = null,
    ): Location {
        if (($validated['location_mode'] ?? 'existing') === 'existing') {
            $location = Location::query()->findOrFail($validated['location_id']);

            if ($location->type !== 'fuel_station') {
                throw ValidationException::withMessages([
                    'location_id' => 'Choose a location with the fuel station type.',
                ]);
            }

            return $location;
        }

        $editableLocation = null;

        if ($fuelStation?->location && $fuelStation->location->type === 'fuel_station') {
            $editableLocation = $fuelStation->location;
        }

        return $this->locationCatalog->createOrUpdateLocation(
            $editableLocation,
            [
                'name' => $validated['location_name'],
                'country' => $validated['country'] ?? null,
                'city_id' => $validated['city_id'] ?? null,
                'new_city_name' => $validated['new_city_name'] ?? null,
                'address' => $validated['address'] ?? null,
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'notes' => null,
            ],
            'fuel_station',
        );
    }

    private function ensureLocationAvailable(int $locationId, ?int $ignoreFuelStationId = null): void
    {
        $query = FuelStation::query()->where('location_id', $locationId);

        if ($ignoreFuelStationId) {
            $query->whereKeyNot($ignoreFuelStationId);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'location_id' => 'This location is already linked to another fuel station.',
            ]);
        }
    }
}
