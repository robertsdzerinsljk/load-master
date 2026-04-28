<?php

use App\Models\FuelStation;
use App\Models\Location;
use App\Models\OrderTemplate;
use App\Models\TemperatureMode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('student dashboard task cards receive temperature mode and fuel stop locations', function () {
    $student = User::factory()->create([
        'role' => 'student',
    ]);

    $startLocation = Location::query()->create([
        'name' => 'Riga Warehouse',
    ]);

    $endLocation = Location::query()->create([
        'name' => 'Liepaja Port',
    ]);

    $fuelLocation = Location::query()->create([
        'name' => 'A9 Fuel Hub',
    ]);

    $temperatureMode = TemperatureMode::query()->create([
        'name' => 'Frozen -18C',
    ]);

    $fuelStation = FuelStation::query()->create([
        'location_id' => $fuelLocation->id,
        'fuel_type' => 'diesel',
        'price_per_liter' => 1.59,
    ]);

    $template = OrderTemplate::query()->create([
        'title' => 'Cold chain route',
        'scenario_type' => 'land_transport',
        'status' => 'ready',
        'cargo_name' => 'Frozen food',
        'start_location_id' => $startLocation->id,
        'end_location_id' => $endLocation->id,
        'temperature_mode_id' => $temperatureMode->id,
    ]);

    $template->fuelStations()->attach($fuelStation->id);

    $this->actingAs($student)
        ->get(route('student.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Dashboard')
            ->where('templates.0.id', $template->id)
            ->where('templates.0.temperature_mode.name', 'Frozen -18C')
            ->where('templates.0.fuel_stations.0.location_name', 'A9 Fuel Hub')
            ->where('templates.0.fuel_stations.0.fuel_type', 'diesel'));
});
