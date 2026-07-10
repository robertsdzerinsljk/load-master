<?php

use App\Models\LandRoute;
use App\Models\Location;
use App\Models\Port;
use App\Models\RouteTemplate;
use App\Models\SeaRoute;
use App\Models\Ship;
use App\Models\TransportTemplate;
use App\Services\Routing\RouteCalculationService;
use Database\Seeders\GlobalLogisticsCatalogSeeder;
use Database\Seeders\LogisticsDemoSeeder;

test('global logistics catalog seeder is idempotent and preserves custom locations', function () {
    $this->seed(LogisticsDemoSeeder::class);
    $this->seed(GlobalLogisticsCatalogSeeder::class);

    $firstCatalogLocationCount = Location::query()->where('source', 'catalog')->count();
    $firstCatalogRouteTemplateCount = RouteTemplate::query()->where('mode', 'catalog')->count();

    $customLocation = Location::query()->create([
        'name' => 'Teacher custom warehouse',
        'type' => 'warehouse',
        'country' => 'Latvia',
        'city' => 'Riga',
        'latitude' => 56.9671,
        'longitude' => 24.1854,
        'source' => 'custom',
        'external_id' => 'teacher-custom-warehouse',
    ]);

    $this->seed(GlobalLogisticsCatalogSeeder::class);

    expect(Location::query()->whereKey($customLocation->id)->exists())->toBeTrue()
        ->and(Location::query()->where('source', 'catalog')->count())->toBe($firstCatalogLocationCount)
        ->and(RouteTemplate::query()->where('mode', 'catalog')->count())->toBe($firstCatalogRouteTemplateCount)
        ->and(TransportTemplate::query()->where('name', 'EU Container Tractor 40FT')->exists())->toBeTrue()
        ->and(Ship::query()->where('name', 'Panamax Container Vessel 4500 TEU')->exists())->toBeTrue();
});

test('catalog provides multimodal global corridors with non straight line geometry', function () {
    $this->seed(LogisticsDemoSeeder::class);
    $this->seed(GlobalLogisticsCatalogSeeder::class);

    $riga = Location::query()->where('source', 'catalog')->where('external_id', 'riga')->firstOrFail();
    $rotterdam = Location::query()->where('source', 'catalog')->where('external_id', 'rotterdam_maasvlakte')->firstOrFail();
    $newark = Location::query()->where('source', 'catalog')->where('external_id', 'newark_port')->firstOrFail();

    $landRoute = LandRoute::query()
        ->where('from_location_id', $riga->id)
        ->where('to_location_id', $rotterdam->id)
        ->firstOrFail();

    expect($landRoute->provider)->toBe('catalog')
        ->and(count($landRoute->geometry_geojson['coordinates']))->toBeGreaterThan(2);

    $rotterdamPort = Port::query()->where('location_id', $rotterdam->id)->firstOrFail();
    $newarkPort = Port::query()->where('location_id', $newark->id)->firstOrFail();

    $seaRoute = SeaRoute::query()
        ->where('origin_port_id', $rotterdamPort->id)
        ->where('destination_port_id', $newarkPort->id)
        ->firstOrFail();

    expect($seaRoute->provider)->toBe('catalog')
        ->and(count($seaRoute->geometry_geojson['coordinates']))->toBeGreaterThan(2);

    $calculatedSeaRoute = app(RouteCalculationService::class)->sea($rotterdamPort, $newarkPort);

    expect($calculatedSeaRoute['provider'])->toBe('catalog')
        ->and($calculatedSeaRoute['warnings'])->toBe([]);

    $template = RouteTemplate::query()
        ->where('name', 'Catalog: Riga to Newark via Rotterdam')
        ->with('legs')
        ->firstOrFail();

    $landLeg = $template->legs->firstWhere('type', 'land');
    $seaLeg = $template->legs->firstWhere('type', 'sea');

    expect($template->legs)->toHaveCount(2)
        ->and(count($template->geometry_geojson['coordinates']))->toBeGreaterThan(4)
        ->and(count($landLeg->geometry_geojson['coordinates']))->toBeGreaterThan(2)
        ->and(count($seaLeg->geometry_geojson['coordinates']))->toBeGreaterThan(2);
});
