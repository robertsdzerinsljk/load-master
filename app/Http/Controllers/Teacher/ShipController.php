<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\HandlingMethod;
use App\Models\Ship;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShipController extends Controller
{
    public function index()
    {
        return Inertia::render('Teacher/Templates/Ships/Index', [
            'ships' => Ship::with('handlingMethods')->latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Teacher/Templates/Ships/Create', [
            'handlingMethods' => HandlingMethod::orderBy('name')->get(['id', 'name', 'code', 'category']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateShip($request);

        $ship = Ship::create([
            ...$validated,
            'is_open_cargo' => $request->boolean('is_open_cargo'),
            'is_closed_cargo' => $request->boolean('is_closed_cargo'),
            'supports_bulk' => $request->boolean('supports_bulk'),
            'supports_container' => $request->boolean('supports_container'),
            'supports_liquid' => $request->boolean('supports_liquid'),
            'supports_refrigerated' => $request->boolean('supports_refrigerated'),
            'supports_hazardous' => $request->boolean('supports_hazardous'),
            'has_onboard_crane' => $request->boolean('has_onboard_crane'),
        ]);

        $this->syncHandlingMethods($ship, $validated['handling_methods'] ?? []);

        return redirect()->route('teacher.templates.ships');
    }

    public function edit($id)
    {
        $ship = Ship::with('handlingMethods')->findOrFail($id);

        return Inertia::render('Teacher/Templates/Ships/Edit', [
            'ship' => $ship,
            'handlingMethods' => HandlingMethod::orderBy('name')->get(['id', 'name', 'code', 'category']),
        ]);
    }

    public function update(Request $request, $id)
    {
        $ship = Ship::with('handlingMethods')->findOrFail($id);
        $validated = $this->validateShip($request);

        $ship->update([
            ...$validated,
            'is_open_cargo' => $request->boolean('is_open_cargo'),
            'is_closed_cargo' => $request->boolean('is_closed_cargo'),
            'supports_bulk' => $request->boolean('supports_bulk'),
            'supports_container' => $request->boolean('supports_container'),
            'supports_liquid' => $request->boolean('supports_liquid'),
            'supports_refrigerated' => $request->boolean('supports_refrigerated'),
            'supports_hazardous' => $request->boolean('supports_hazardous'),
            'has_onboard_crane' => $request->boolean('has_onboard_crane'),
        ]);

        $this->syncHandlingMethods($ship, $validated['handling_methods'] ?? []);

        return redirect()->route('teacher.templates.ships');
    }

    public function destroy($id)
    {
        $ship = Ship::findOrFail($id);
        $ship->delete();

        return redirect()->route('teacher.templates.ships');
    }

    private function validateShip(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'cargo_type' => 'nullable|string|max:100',
            'cargo_mode' => 'nullable|string|max:100',
            'is_open_cargo' => 'nullable|boolean',
            'is_closed_cargo' => 'nullable|boolean',
            'supports_bulk' => 'nullable|boolean',
            'supports_container' => 'nullable|boolean',
            'supports_liquid' => 'nullable|boolean',
            'supports_refrigerated' => 'nullable|boolean',
            'supports_hazardous' => 'nullable|boolean',
            'has_onboard_crane' => 'nullable|boolean',
            'capacity_containers' => 'nullable|integer|min:0',
            'capacity_tons' => 'nullable|numeric|min:0',
            'draft_m' => 'nullable|numeric|min:0',
            'fuel_consumption_per_hour' => 'nullable|numeric|min:0',
            'speed_kmh' => 'nullable|numeric|min:0',
            'loading_capacity_containers_per_hour' => 'nullable|numeric|min:0',
            'loading_capacity_tons_per_hour' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'handling_methods' => 'nullable|array',
            'handling_methods.*.code' => 'required|string|exists:handling_methods,code',
            'handling_methods.*.enabled' => 'nullable|boolean',
            'handling_methods.*.is_loading' => 'nullable|boolean',
            'handling_methods.*.is_unloading' => 'nullable|boolean',
            'handling_methods.*.throughput_override_containers_per_hour' => 'nullable|numeric|min:0',
            'handling_methods.*.throughput_override_tons_per_hour' => 'nullable|numeric|min:0',
            'handling_methods.*.notes' => 'nullable|string',
        ]);
    }

    private function syncHandlingMethods(Ship $ship, array $methods): void
    {
        $codes = collect($methods)
            ->filter(fn ($method) => (bool) ($method['enabled'] ?? false))
            ->pluck('code')
            ->filter()
            ->values();

        if ($codes->isEmpty()) {
            $ship->handlingMethods()->sync([]);

            return;
        }

        $handlingMethodIds = HandlingMethod::query()
            ->whereIn('code', $codes->all())
            ->pluck('id', 'code');

        $payload = [];

        foreach ($methods as $method) {
            if (!($method['enabled'] ?? false)) {
                continue;
            }

            $handlingMethodId = $handlingMethodIds[$method['code']] ?? null;

            if (!$handlingMethodId) {
                continue;
            }

            $payload[$handlingMethodId] = [
                'is_loading' => (bool) ($method['is_loading'] ?? true),
                'is_unloading' => (bool) ($method['is_unloading'] ?? true),
                'throughput_override_containers_per_hour' => $method['throughput_override_containers_per_hour'] ?? null,
                'throughput_override_tons_per_hour' => $method['throughput_override_tons_per_hour'] ?? null,
                'notes' => $method['notes'] ?? null,
            ];
        }

        $ship->handlingMethods()->sync($payload);
    }
}
