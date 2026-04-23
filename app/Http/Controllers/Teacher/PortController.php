<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\HandlingMethod;
use App\Models\Location;
use App\Models\Port;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PortController extends Controller
{
    public function index()
    {
        return Inertia::render('Teacher/Templates/Ports/Index', [
            'ports' => Port::with(['location', 'handlingMethods'])->latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Teacher/Templates/Ports/Create', [
            'locations' => Location::orderBy('name')->get(['id', 'name', 'city', 'country']),
            'handlingMethods' => HandlingMethod::orderBy('name')->get(['id', 'name', 'code', 'category']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validatePort($request);

        $port = Port::create([
            ...$validated,
            'supports_bulk' => $request->boolean('supports_bulk'),
            'supports_container' => $request->boolean('supports_container'),
            'supports_liquid' => $request->boolean('supports_liquid'),
            'supports_refrigerated' => $request->boolean('supports_refrigerated'),
            'supports_hazardous' => $request->boolean('supports_hazardous'),
            'has_crane' => $request->boolean('has_crane'),
            'has_forklift' => $request->boolean('has_forklift'),
            'has_pump' => $request->boolean('has_pump'),
            'has_conveyor' => $request->boolean('has_conveyor'),
        ]);

        $this->syncHandlingMethods($port, $validated['handling_methods'] ?? []);

        return redirect()->route('teacher.templates.ports');
    }

    public function edit($id)
    {
        $port = Port::with(['handlingMethods', 'location'])->findOrFail($id);

        return Inertia::render('Teacher/Templates/Ports/Edit', [
            'port' => $port,
            'locations' => Location::orderBy('name')->get(['id', 'name', 'city', 'country']),
            'handlingMethods' => HandlingMethod::orderBy('name')->get(['id', 'name', 'code', 'category']),
        ]);
    }

    public function update(Request $request, $id)
    {
        $port = Port::with('handlingMethods')->findOrFail($id);
        $validated = $this->validatePort($request);

        $port->update([
            ...$validated,
            'supports_bulk' => $request->boolean('supports_bulk'),
            'supports_container' => $request->boolean('supports_container'),
            'supports_liquid' => $request->boolean('supports_liquid'),
            'supports_refrigerated' => $request->boolean('supports_refrigerated'),
            'supports_hazardous' => $request->boolean('supports_hazardous'),
            'has_crane' => $request->boolean('has_crane'),
            'has_forklift' => $request->boolean('has_forklift'),
            'has_pump' => $request->boolean('has_pump'),
            'has_conveyor' => $request->boolean('has_conveyor'),
        ]);

        $this->syncHandlingMethods($port, $validated['handling_methods'] ?? []);

        return redirect()->route('teacher.templates.ports');
    }

    public function destroy($id)
    {
        $port = Port::findOrFail($id);
        $port->delete();

        return redirect()->route('teacher.templates.ports');
    }

    private function validatePort(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'location_id' => 'nullable|exists:locations,id',
            'max_draft_m' => 'nullable|numeric|min:0',
            'city_distance_km' => 'nullable|numeric|min:0',
            'loading_rate_containers_per_hour' => 'nullable|numeric|min:0',
            'loading_rate_tons_per_hour' => 'nullable|numeric|min:0',
            'supports_bulk' => 'nullable|boolean',
            'supports_container' => 'nullable|boolean',
            'supports_liquid' => 'nullable|boolean',
            'supports_refrigerated' => 'nullable|boolean',
            'supports_hazardous' => 'nullable|boolean',
            'has_crane' => 'nullable|boolean',
            'has_forklift' => 'nullable|boolean',
            'has_pump' => 'nullable|boolean',
            'has_conveyor' => 'nullable|boolean',
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

    private function syncHandlingMethods(Port $port, array $methods): void
    {
        $codes = collect($methods)
            ->filter(fn ($method) => (bool) ($method['enabled'] ?? false))
            ->pluck('code')
            ->filter()
            ->values();

        if ($codes->isEmpty()) {
            $port->handlingMethods()->sync([]);

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

        $port->handlingMethods()->sync($payload);
    }
}
