<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\CustomsDocument;
use App\Models\FuelStation;
use App\Models\HandlingMethod;
use App\Models\LandRoute;
use App\Models\Location;
use App\Models\OrderTemplate;
use App\Models\Port;
use App\Models\RouteFuelStop;
use App\Models\Ship;
use App\Models\SpecialCondition;
use App\Models\TemperatureMode;
use App\Models\TransportTemplate;
use Illuminate\Database\Seeder;

class LogisticsDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->cleanupOrphanLegacyLocations();

        $cities = $this->seedCities();
        $locations = $this->seedLocations($cities);

        $this->normalizeLegacyFuelStations($locations);

        $transportTemplates = $this->seedTransportTemplates();
        $ships = $this->seedShips();
        $ports = $this->seedPorts($locations);
        $fuelStations = $this->seedFuelStations($locations);
        $routes = $this->seedLandRoutes($locations);

        $this->seedTemperatureModes();
        $this->seedSpecialConditions();
        $this->seedCustomsDocuments();
        $this->seedRouteFuelStops($routes, $fuelStations);
        $this->syncPortHandlingMethods($ports);
        $this->syncShipHandlingMethods($ships);
    }

    private function cleanupOrphanLegacyLocations(): void
    {
        Location::query()
            ->whereNull('type')
            ->orderBy('id')
            ->get()
            ->each(function (Location $location) {
                $isReferenced =
                    $location->outgoingLandRoutes()->exists() ||
                    $location->incomingLandRoutes()->exists() ||
                    $location->fuelStation()->exists() ||
                    Port::query()->where('location_id', $location->id)->exists() ||
                    OrderTemplate::query()
                        ->where('start_location_id', $location->id)
                        ->orWhere('end_location_id', $location->id)
                        ->exists();

                if (!$isReferenced) {
                    $location->delete();
                }
            });
    }

    private function seedCities(): array
    {
        $definitions = [
            ['key' => 'riga', 'name' => 'Rīga', 'country' => 'Latvia'],
            ['key' => 'jelgava', 'name' => 'Jelgava', 'country' => 'Latvia'],
            ['key' => 'liepaja', 'name' => 'Liepāja', 'country' => 'Latvia'],
            ['key' => 'ventspils', 'name' => 'Ventspils', 'country' => 'Latvia'],
            ['key' => 'daugavpils', 'name' => 'Daugavpils', 'country' => 'Latvia'],
            ['key' => 'klaipeda', 'name' => 'Klaipeda', 'country' => 'Lithuania'],
            ['key' => 'kaunas', 'name' => 'Kaunas', 'country' => 'Lithuania'],
            ['key' => 'vilnius', 'name' => 'Vilnius', 'country' => 'Lithuania'],
            ['key' => 'tallinn', 'name' => 'Tallinn', 'country' => 'Estonia'],
            ['key' => 'tartu', 'name' => 'Tartu', 'country' => 'Estonia'],
            ['key' => 'helsinki', 'name' => 'Helsinki', 'country' => 'Finland'],
            ['key' => 'stockholm', 'name' => 'Stockholm', 'country' => 'Sweden'],
            ['key' => 'gdansk', 'name' => 'Gdansk', 'country' => 'Poland'],
            ['key' => 'hamburg', 'name' => 'Hamburg', 'country' => 'Germany'],
        ];

        $cities = [];

        foreach ($definitions as $definition) {
            $cities[$definition['key']] = City::query()->updateOrCreate(
                [
                    'name' => $definition['name'],
                    'country' => $definition['country'],
                ],
                []
            );
        }

        return $cities;
    }

    private function seedLocations(array $cities): array
    {
        $definitions = [
            [
                'key' => 'riga_city',
                'name' => 'Rīga',
                'type' => 'city',
                'city' => 'riga',
                'address' => 'Rīga, Latvia',
                'latitude' => 56.9496,
                'longitude' => 24.1052,
                'notes' => 'Core city node for Riga-based scenarios.',
            ],
            [
                'key' => 'jelgava_city',
                'name' => 'Jelgava',
                'type' => 'city',
                'city' => 'jelgava',
                'address' => 'Jelgava, Latvia',
                'latitude' => 56.6527,
                'longitude' => 23.7128,
                'notes' => 'Core city node for Jelgava-based scenarios.',
            ],
            [
                'key' => 'liepaja_city',
                'name' => 'Liepāja',
                'type' => 'city',
                'city' => 'liepaja',
                'address' => 'Liepāja, Latvia',
                'latitude' => 56.5047,
                'longitude' => 21.0108,
                'notes' => 'Core city node for Liepāja-based scenarios.',
            ],
            [
                'key' => 'ventspils_city',
                'name' => 'Ventspils',
                'type' => 'city',
                'city' => 'ventspils',
                'address' => 'Ventspils, Latvia',
                'latitude' => 57.3894,
                'longitude' => 21.5606,
                'notes' => 'Core city node for Ventspils-based scenarios.',
            ],
            [
                'key' => 'daugavpils_city',
                'name' => 'Daugavpils',
                'type' => 'city',
                'city' => 'daugavpils',
                'address' => 'Daugavpils, Latvia',
                'latitude' => 55.8747,
                'longitude' => 26.5362,
                'notes' => 'Core city node for Daugavpils-based scenarios.',
            ],
            [
                'key' => 'klaipeda_city',
                'name' => 'Klaipeda',
                'type' => 'city',
                'city' => 'klaipeda',
                'address' => 'Klaipeda, Lithuania',
                'latitude' => 55.7033,
                'longitude' => 21.1443,
                'notes' => 'Core city node for Klaipeda-based scenarios.',
            ],
            [
                'key' => 'kaunas_city',
                'name' => 'Kaunas',
                'type' => 'city',
                'city' => 'kaunas',
                'address' => 'Kaunas, Lithuania',
                'latitude' => 54.8985,
                'longitude' => 23.9036,
                'notes' => 'Core city node for Kaunas-based scenarios.',
            ],
            [
                'key' => 'tallinn_city',
                'name' => 'Tallinn',
                'type' => 'city',
                'city' => 'tallinn',
                'address' => 'Tallinn, Estonia',
                'latitude' => 59.4370,
                'longitude' => 24.7536,
                'notes' => 'Core city node for Tallinn-based scenarios.',
            ],
            [
                'key' => 'helsinki_city',
                'name' => 'Helsinki',
                'type' => 'city',
                'city' => 'helsinki',
                'address' => 'Helsinki, Finland',
                'latitude' => 60.1699,
                'longitude' => 24.9384,
                'notes' => 'Core city node for Helsinki-based scenarios.',
            ],
            [
                'key' => 'vilnius_city',
                'name' => 'Vilnius',
                'type' => 'city',
                'city' => 'vilnius',
                'address' => 'Vilnius, Lithuania',
                'latitude' => 54.6872,
                'longitude' => 25.2797,
                'notes' => 'Core city node for Vilnius-based scenarios.',
            ],
            [
                'key' => 'tartu_city',
                'name' => 'Tartu',
                'type' => 'city',
                'city' => 'tartu',
                'address' => 'Tartu, Estonia',
                'latitude' => 58.3776,
                'longitude' => 26.7290,
                'notes' => 'Core city node for Tartu-based scenarios.',
            ],
            [
                'key' => 'stockholm_city',
                'name' => 'Stockholm',
                'type' => 'city',
                'city' => 'stockholm',
                'address' => 'Stockholm, Sweden',
                'latitude' => 59.3293,
                'longitude' => 18.0686,
                'notes' => 'Core city node for Stockholm-based scenarios.',
            ],
            [
                'key' => 'gdansk_city',
                'name' => 'Gdansk',
                'type' => 'city',
                'city' => 'gdansk',
                'address' => 'Gdansk, Poland',
                'latitude' => 54.3520,
                'longitude' => 18.6466,
                'notes' => 'Core city node for Gdansk-based scenarios.',
            ],
            [
                'key' => 'hamburg_city',
                'name' => 'Hamburg',
                'type' => 'city',
                'city' => 'hamburg',
                'address' => 'Hamburg, Germany',
                'latitude' => 53.5511,
                'longitude' => 9.9937,
                'notes' => 'Core city node for Hamburg-based scenarios.',
            ],
            [
                'key' => 'riga_factory',
                'name' => 'Riga Electronics Factory',
                'type' => 'factory',
                'city' => 'riga',
                'address' => 'Granita iela 12, Riga',
                'latitude' => 56.9281,
                'longitude' => 24.1833,
                'notes' => 'High-value container export point.',
            ],
            [
                'key' => 'jelgava_factory',
                'name' => 'Jelgava Food Processing Plant',
                'type' => 'factory',
                'city' => 'jelgava',
                'address' => 'Prohorova iela 15, Jelgava',
                'latitude' => 56.6510,
                'longitude' => 23.7404,
                'notes' => 'Temperature-sensitive palletized cargo origin.',
            ],
            [
                'key' => 'riga_warehouse',
                'name' => 'Riga Container Hub',
                'type' => 'warehouse',
                'city' => 'riga',
                'address' => 'Maskavas iela 450, Riga',
                'latitude' => 56.9035,
                'longitude' => 24.2268,
                'notes' => 'General cross-docking and consolidation hub.',
            ],
            [
                'key' => 'liepaja_warehouse',
                'name' => 'Liepaja Cold Storage Warehouse',
                'type' => 'warehouse',
                'city' => 'liepaja',
                'address' => 'Brivostas iela 34, Liepaja',
                'latitude' => 56.5178,
                'longitude' => 20.9982,
                'notes' => 'Cold-chain storage near the port area.',
            ],
            [
                'key' => 'ventspils_warehouse',
                'name' => 'Ventspils Chemical Depot',
                'type' => 'warehouse',
                'city' => 'ventspils',
                'address' => 'Talsu iela 75, Ventspils',
                'latitude' => 57.3762,
                'longitude' => 21.5631,
                'notes' => 'Hazardous-compatible storage node.',
            ],
            [
                'key' => 'kaunas_warehouse',
                'name' => 'Kaunas Distribution Center',
                'type' => 'warehouse',
                'city' => 'kaunas',
                'address' => 'Vakarinis aplinkelis 6, Kaunas',
                'latitude' => 54.8980,
                'longitude' => 23.8283,
                'notes' => 'Lithuanian export staging warehouse.',
            ],
            [
                'key' => 'helsinki_customer',
                'name' => 'Helsinki Retail Distribution Center',
                'type' => 'customer',
                'city' => 'helsinki',
                'address' => 'Satamakaari 20, Helsinki',
                'latitude' => 60.2097,
                'longitude' => 25.1854,
                'notes' => 'Nordic retail customer delivery point.',
            ],
            [
                'key' => 'stockholm_customer',
                'name' => 'Stockholm Retail DC',
                'type' => 'customer',
                'city' => 'stockholm',
                'address' => 'Vintervagen 18, Stockholm',
                'latitude' => 59.3293,
                'longitude' => 18.0686,
                'notes' => 'Swedish end-customer distribution center.',
            ],
            [
                'key' => 'riga_terminal',
                'name' => 'Riga Freeport Terminal',
                'type' => 'port_terminal',
                'city' => 'riga',
                'address' => 'Eksporta iela 3A, Riga',
                'latitude' => 56.9731,
                'longitude' => 24.0935,
                'notes' => 'Container-focused Riga terminal.',
            ],
            [
                'key' => 'liepaja_terminal',
                'name' => 'Liepaja Port Terminal',
                'type' => 'port_terminal',
                'city' => 'liepaja',
                'address' => 'Brivostas iela 42, Liepaja',
                'latitude' => 56.5224,
                'longitude' => 20.9944,
                'notes' => 'Bulk and container terminal in Liepaja.',
            ],
            [
                'key' => 'ventspils_terminal',
                'name' => 'Ventspils Port Terminal',
                'type' => 'port_terminal',
                'city' => 'ventspils',
                'address' => 'Darzu iela 6, Ventspils',
                'latitude' => 57.3921,
                'longitude' => 21.5645,
                'notes' => 'Deep-water cargo terminal in Ventspils.',
            ],
            [
                'key' => 'klaipeda_terminal',
                'name' => 'Klaipeda Port Terminal',
                'type' => 'port_terminal',
                'city' => 'klaipeda',
                'address' => 'Perkelos g. 10, Klaipeda',
                'latitude' => 55.6928,
                'longitude' => 21.1277,
                'notes' => 'Lithuanian container and reefer terminal.',
            ],
            [
                'key' => 'helsinki_terminal',
                'name' => 'Helsinki Vuosaari Freight Terminal',
                'type' => 'port_terminal',
                'city' => 'helsinki',
                'address' => 'Seilorinkatu 5, Helsinki',
                'latitude' => 60.2091,
                'longitude' => 25.1788,
                'notes' => 'Finnish freight terminal for Baltic links.',
            ],
            [
                'key' => 'riga_fuel',
                'name' => 'Circle K A7 South Riga',
                'type' => 'fuel_station',
                'city' => 'riga',
                'address' => 'Bauskas iela 88A, Riga',
                'latitude' => 56.9050,
                'longitude' => 24.1302,
                'notes' => 'Truck-friendly station near the southern transit corridor.',
            ],
            [
                'key' => 'jelgava_fuel',
                'name' => 'Virsi Jelgava Transit',
                'type' => 'fuel_station',
                'city' => 'jelgava',
                'address' => 'Liela iela 127, Jelgava',
                'latitude' => 56.6494,
                'longitude' => 23.7288,
                'notes' => 'Primary diesel stop for Jelgava routes.',
            ],
            [
                'key' => 'liepaja_fuel',
                'name' => 'Neste Liepaja Port Access',
                'type' => 'fuel_station',
                'city' => 'liepaja',
                'address' => 'Pulvera iela 31, Liepaja',
                'latitude' => 56.5153,
                'longitude' => 21.0085,
                'notes' => 'Convenient station for port-bound trucks.',
            ],
            [
                'key' => 'ventspils_fuel',
                'name' => 'Virsi Ventspils Transit',
                'type' => 'fuel_station',
                'city' => 'ventspils',
                'address' => 'Dzintaru iela 66, Ventspils',
                'latitude' => 57.3831,
                'longitude' => 21.5522,
                'notes' => 'Transit stop near Ventspils access roads.',
            ],
            [
                'key' => 'klaipeda_fuel',
                'name' => 'Circle K Klaipeda South',
                'type' => 'fuel_station',
                'city' => 'klaipeda',
                'address' => 'Vilniaus pl. 8, Klaipeda',
                'latitude' => 55.6598,
                'longitude' => 21.1634,
                'notes' => 'Reliable stop for Lithuanian outbound routes.',
            ],
            [
                'key' => 'tallinn_fuel',
                'name' => 'Neste Tallinn Freight Stop',
                'type' => 'fuel_station',
                'city' => 'tallinn',
                'address' => 'Peterburi tee 90F, Tallinn',
                'latitude' => 59.4308,
                'longitude' => 24.8425,
                'notes' => 'Supports Tallinn freight corridor movements.',
            ],
        ];

        $locations = [];

        foreach ($definitions as $definition) {
            $city = $cities[$definition['city']];

            $locations[$definition['key']] = Location::query()->updateOrCreate(
                [
                    'name' => $definition['name'],
                    'type' => $definition['type'],
                    'country' => $city->country,
                    'city_id' => $city->id,
                ],
                [
                    'city' => $city->name,
                    'address' => $definition['address'],
                    'latitude' => $definition['latitude'],
                    'longitude' => $definition['longitude'],
                    'notes' => $definition['notes'],
                ]
            );
        }

        return $locations;
    }

    private function normalizeLegacyFuelStations(array $locations): void
    {
        $legacyMap = [
            'Rīga' => 'riga_fuel',
            'Jelgava' => 'jelgava_fuel',
            'Liepāja' => 'liepaja_fuel',
            'Ventspils' => 'ventspils_fuel',
        ];

        FuelStation::query()
            ->with('location')
            ->get()
            ->each(function (FuelStation $fuelStation) use ($legacyMap, $locations) {
                $linkedLocation = $fuelStation->location;

                if (!$linkedLocation || $linkedLocation->type === 'fuel_station') {
                    return;
                }

                $cityName = trim((string) ($linkedLocation->city ?: $linkedLocation->name));
                $targetKey = $legacyMap[$cityName] ?? null;

                if (!$targetKey || !isset($locations[$targetKey])) {
                    return;
                }

                $fuelStation->update([
                    'location_id' => $locations[$targetKey]->id,
                    'fuel_type' => $fuelStation->fuel_type ?: 'diesel',
                ]);
            });
    }

    private function seedFuelStations(array $locations): array
    {
        $definitions = [
            [
                'key' => 'riga_fuel_station',
                'location' => 'riga_fuel',
                'fuel_type' => 'diesel',
                'price_per_liter' => 1.67,
                'notes' => '24/7 diesel supply with truck parking.',
            ],
            [
                'key' => 'jelgava_fuel_station',
                'location' => 'jelgava_fuel',
                'fuel_type' => 'diesel',
                'price_per_liter' => 1.62,
                'notes' => 'Reliable stop for regional distribution routes.',
            ],
            [
                'key' => 'liepaja_fuel_station',
                'location' => 'liepaja_fuel',
                'fuel_type' => 'diesel',
                'price_per_liter' => 1.64,
                'notes' => 'Port-adjacent refueling point.',
            ],
            [
                'key' => 'ventspils_fuel_station',
                'location' => 'ventspils_fuel',
                'fuel_type' => 'diesel',
                'price_per_liter' => 1.63,
                'notes' => 'Transit diesel station for long-haul routes.',
            ],
            [
                'key' => 'klaipeda_fuel_station',
                'location' => 'klaipeda_fuel',
                'fuel_type' => 'diesel',
                'price_per_liter' => 1.58,
                'notes' => 'Lithuanian stop for export-bound freight.',
            ],
            [
                'key' => 'tallinn_fuel_station',
                'location' => 'tallinn_fuel',
                'fuel_type' => 'diesel',
                'price_per_liter' => 1.71,
                'notes' => 'Tallinn freight corridor diesel station.',
            ],
        ];

        $fuelStations = [];

        foreach ($definitions as $definition) {
            $fuelStations[$definition['key']] = FuelStation::query()->updateOrCreate(
                ['location_id' => $locations[$definition['location']]->id],
                [
                    'fuel_type' => $definition['fuel_type'],
                    'price_per_liter' => $definition['price_per_liter'],
                    'notes' => $definition['notes'],
                ]
            );
        }

        return $fuelStations;
    }

    private function seedTransportTemplates(): array
    {
        $definitions = [
            [
                'name' => 'Container Truck 40FT',
                'type' => 'truck',
                'description' => 'Standard container truck for Baltic overland port delivery.',
                'capacity' => '1x 40FT container / 26 pallets',
                'temperature_support' => null,
                'capacity_containers' => 1,
                'capacity_tons' => 18,
                'avg_speed_kmh' => 72,
                'cost_per_km' => 1.35,
                'fuel_consumption_per_100km' => 28,
                'max_range_km' => 950,
                'loading_time_minutes' => 30,
                'unloading_time_minutes' => 30,
            ],
            [
                'name' => 'Reefer Truck 18T',
                'type' => 'reefer_truck',
                'description' => 'Temperature-controlled truck for food and pharmaceutical shipments.',
                'capacity' => '18t refrigerated cargo',
                'temperature_support' => '+2C to +8C / frozen capable',
                'capacity_containers' => 0,
                'capacity_tons' => 18,
                'avg_speed_kmh' => 68,
                'cost_per_km' => 1.55,
                'fuel_consumption_per_100km' => 31,
                'max_range_km' => 850,
                'loading_time_minutes' => 40,
                'unloading_time_minutes' => 35,
            ],
            [
                'name' => 'Bulk Truck 24T',
                'type' => 'truck',
                'description' => 'Open cargo truck for dry bulk and industrial loads.',
                'capacity' => '24t bulk cargo',
                'temperature_support' => null,
                'capacity_containers' => 0,
                'capacity_tons' => 24,
                'avg_speed_kmh' => 70,
                'cost_per_km' => 1.28,
                'fuel_consumption_per_100km' => 30,
                'max_range_km' => 900,
                'loading_time_minutes' => 35,
                'unloading_time_minutes' => 35,
            ],
        ];

        $templates = [];

        foreach ($definitions as $definition) {
            $templates[$definition['name']] = TransportTemplate::query()->updateOrCreate(
                ['name' => $definition['name']],
                $definition
            );
        }

        return $templates;
    }

    private function seedShips(): array
    {
        $definitions = [
            [
                'name' => 'Baltic Carrier',
                'cargo_type' => 'Container cargo',
                'cargo_mode' => 'containerized',
                'is_open_cargo' => false,
                'is_closed_cargo' => true,
                'supports_bulk' => false,
                'supports_container' => true,
                'supports_liquid' => false,
                'supports_refrigerated' => true,
                'supports_hazardous' => true,
                'has_onboard_crane' => true,
                'draft_m' => 8.2,
                'fuel_consumption_per_hour' => 145,
                'speed_kmh' => 33,
                'capacity_containers' => 620,
                'capacity_tons' => 11000,
                'loading_capacity_containers_per_hour' => 48,
                'loading_capacity_tons_per_hour' => 950,
                'notes' => 'Reliable container feeder for Baltic routes.',
            ],
            [
                'name' => 'Nordic Reefer',
                'cargo_type' => 'Refrigerated cargo',
                'cargo_mode' => 'containerized',
                'is_open_cargo' => false,
                'is_closed_cargo' => true,
                'supports_bulk' => false,
                'supports_container' => true,
                'supports_liquid' => false,
                'supports_refrigerated' => true,
                'supports_hazardous' => false,
                'has_onboard_crane' => false,
                'draft_m' => 7.6,
                'fuel_consumption_per_hour' => 118,
                'speed_kmh' => 31,
                'capacity_containers' => 420,
                'capacity_tons' => 7600,
                'loading_capacity_containers_per_hour' => 36,
                'loading_capacity_tons_per_hour' => 720,
                'notes' => 'Focused on cold-chain regional shipments.',
            ],
            [
                'name' => 'Amber Bulk One',
                'cargo_type' => 'Dry bulk',
                'cargo_mode' => 'bulk',
                'is_open_cargo' => true,
                'is_closed_cargo' => false,
                'supports_bulk' => true,
                'supports_container' => false,
                'supports_liquid' => false,
                'supports_refrigerated' => false,
                'supports_hazardous' => false,
                'has_onboard_crane' => true,
                'draft_m' => 9.8,
                'fuel_consumption_per_hour' => 152,
                'speed_kmh' => 28,
                'capacity_containers' => 0,
                'capacity_tons' => 16000,
                'loading_capacity_containers_per_hour' => 0,
                'loading_capacity_tons_per_hour' => 1400,
                'notes' => 'Bulk carrier for industrial commodities.',
            ],
        ];

        $ships = [];

        foreach ($definitions as $definition) {
            $ships[$definition['name']] = Ship::query()->updateOrCreate(
                ['name' => $definition['name']],
                $definition
            );
        }

        return $ships;
    }

    private function seedPorts(array $locations): array
    {
        $definitions = [
            [
                'name' => 'Riga Port',
                'country' => 'Latvia',
                'location' => 'riga_terminal',
                'max_draft_m' => 12.8,
                'city_distance_km' => 10,
                'loading_rate_containers_per_hour' => 55,
                'loading_rate_tons_per_hour' => 1800,
                'supports_bulk' => true,
                'supports_container' => true,
                'supports_liquid' => false,
                'supports_refrigerated' => true,
                'supports_hazardous' => true,
                'has_crane' => true,
                'has_forklift' => true,
                'has_pump' => false,
                'has_conveyor' => true,
                'notes' => 'Balanced container and general cargo capability.',
            ],
            [
                'name' => 'Liepaja Port',
                'country' => 'Latvia',
                'location' => 'liepaja_terminal',
                'max_draft_m' => 10.5,
                'city_distance_km' => 6,
                'loading_rate_containers_per_hour' => 38,
                'loading_rate_tons_per_hour' => 1300,
                'supports_bulk' => true,
                'supports_container' => true,
                'supports_liquid' => false,
                'supports_refrigerated' => true,
                'supports_hazardous' => false,
                'has_crane' => true,
                'has_forklift' => true,
                'has_pump' => false,
                'has_conveyor' => true,
                'notes' => 'Regional port with strong reefer support.',
            ],
            [
                'name' => 'Ventspils Port',
                'country' => 'Latvia',
                'location' => 'ventspils_terminal',
                'max_draft_m' => 14.0,
                'city_distance_km' => 5,
                'loading_rate_containers_per_hour' => 42,
                'loading_rate_tons_per_hour' => 2200,
                'supports_bulk' => true,
                'supports_container' => true,
                'supports_liquid' => true,
                'supports_refrigerated' => false,
                'supports_hazardous' => true,
                'has_crane' => true,
                'has_forklift' => true,
                'has_pump' => true,
                'has_conveyor' => true,
                'notes' => 'Deep-water port with liquid and bulk compatibility.',
            ],
            [
                'name' => 'Klaipeda Port',
                'country' => 'Lithuania',
                'location' => 'klaipeda_terminal',
                'max_draft_m' => 13.5,
                'city_distance_km' => 7,
                'loading_rate_containers_per_hour' => 58,
                'loading_rate_tons_per_hour' => 2100,
                'supports_bulk' => true,
                'supports_container' => true,
                'supports_liquid' => false,
                'supports_refrigerated' => true,
                'supports_hazardous' => true,
                'has_crane' => true,
                'has_forklift' => true,
                'has_pump' => false,
                'has_conveyor' => true,
                'notes' => 'Lithuanian container export gateway.',
            ],
            [
                'name' => 'Helsinki Port',
                'country' => 'Finland',
                'location' => 'helsinki_terminal',
                'max_draft_m' => 11.0,
                'city_distance_km' => 12,
                'loading_rate_containers_per_hour' => 46,
                'loading_rate_tons_per_hour' => 1500,
                'supports_bulk' => false,
                'supports_container' => true,
                'supports_liquid' => false,
                'supports_refrigerated' => true,
                'supports_hazardous' => true,
                'has_crane' => true,
                'has_forklift' => true,
                'has_pump' => false,
                'has_conveyor' => false,
                'notes' => 'Feeder and ro-ro focused Nordic port.',
            ],
        ];

        $ports = [];

        foreach ($definitions as $definition) {
            $location = $locations[$definition['location']];

            $ports[$definition['name']] = Port::query()->updateOrCreate(
                ['name' => $definition['name']],
                [
                    'country' => $definition['country'],
                    'location_id' => $location->id,
                    'max_draft_m' => $definition['max_draft_m'],
                    'city_distance_km' => $definition['city_distance_km'],
                    'loading_rate_containers_per_hour' => $definition['loading_rate_containers_per_hour'],
                    'loading_rate_tons_per_hour' => $definition['loading_rate_tons_per_hour'],
                    'supports_bulk' => $definition['supports_bulk'],
                    'supports_container' => $definition['supports_container'],
                    'supports_liquid' => $definition['supports_liquid'],
                    'supports_refrigerated' => $definition['supports_refrigerated'],
                    'supports_hazardous' => $definition['supports_hazardous'],
                    'has_crane' => $definition['has_crane'],
                    'has_forklift' => $definition['has_forklift'],
                    'has_pump' => $definition['has_pump'],
                    'has_conveyor' => $definition['has_conveyor'],
                    'notes' => $definition['notes'],
                ]
            );
        }

        return $ports;
    }

    private function seedLandRoutes(array $locations): array
    {
        $definitions = [
            [
                'key' => 'riga_factory_to_riga_port',
                'from' => 'riga_factory',
                'to' => 'riga_terminal',
                'distance_km' => 18,
                'estimated_time_hours' => 0.45,
                'toll_cost' => 0,
                'notes' => 'Short shuttle from factory to Riga port terminal.',
            ],
            [
                'key' => 'jelgava_factory_to_riga_port',
                'from' => 'jelgava_factory',
                'to' => 'riga_terminal',
                'distance_km' => 52,
                'estimated_time_hours' => 0.95,
                'toll_cost' => 0,
                'notes' => 'Common regional export route into Riga Freeport.',
            ],
            [
                'key' => 'liepaja_warehouse_to_liepaja_port',
                'from' => 'liepaja_warehouse',
                'to' => 'liepaja_terminal',
                'distance_km' => 9,
                'estimated_time_hours' => 0.25,
                'toll_cost' => 0,
                'notes' => 'Cold-chain delivery into Liepaja port terminal.',
            ],
            [
                'key' => 'ventspils_warehouse_to_ventspils_port',
                'from' => 'ventspils_warehouse',
                'to' => 'ventspils_terminal',
                'distance_km' => 7,
                'estimated_time_hours' => 0.2,
                'toll_cost' => 0,
                'notes' => 'Short hazardous-compatible route to Ventspils port.',
            ],
            [
                'key' => 'kaunas_to_klaipeda_port',
                'from' => 'kaunas_warehouse',
                'to' => 'klaipeda_terminal',
                'distance_km' => 215,
                'estimated_time_hours' => 3.25,
                'toll_cost' => 12.5,
                'notes' => 'Lithuanian export route to Klaipeda port.',
            ],
            [
                'key' => 'riga_hub_to_ventspils_port',
                'from' => 'riga_warehouse',
                'to' => 'ventspils_terminal',
                'distance_km' => 189,
                'estimated_time_hours' => 2.9,
                'toll_cost' => 8.4,
                'notes' => 'Long-haul domestic route from Riga to Ventspils port.',
            ],
        ];

        $routes = [];

        foreach ($definitions as $definition) {
            $routes[$definition['key']] = LandRoute::query()->updateOrCreate(
                [
                    'from_location_id' => $locations[$definition['from']]->id,
                    'to_location_id' => $locations[$definition['to']]->id,
                ],
                [
                    'distance_km' => $definition['distance_km'],
                    'estimated_time_hours' => $definition['estimated_time_hours'],
                    'toll_cost' => $definition['toll_cost'],
                    'notes' => $definition['notes'],
                ]
            );
        }

        return $routes;
    }

    private function seedRouteFuelStops(array $routes, array $fuelStations): void
    {
        $definitions = [
            [
                'route' => 'jelgava_factory_to_riga_port',
                'fuel_station' => 'riga_fuel_station',
                'distance_from_start_km' => 32,
                'notes' => 'Useful fallback stop on the way into Riga.',
            ],
            [
                'route' => 'kaunas_to_klaipeda_port',
                'fuel_station' => 'klaipeda_fuel_station',
                'distance_from_start_km' => 196,
                'notes' => 'Late-route fuel stop before Klaipeda port entry.',
            ],
            [
                'route' => 'riga_hub_to_ventspils_port',
                'fuel_station' => 'ventspils_fuel_station',
                'distance_from_start_km' => 176,
                'notes' => 'Transit stop before the final approach to Ventspils.',
            ],
        ];

        foreach ($definitions as $definition) {
            RouteFuelStop::query()->updateOrCreate(
                [
                    'land_route_id' => $routes[$definition['route']]->id,
                    'fuel_station_id' => $fuelStations[$definition['fuel_station']]->id,
                ],
                [
                    'distance_from_start_km' => $definition['distance_from_start_km'],
                    'notes' => $definition['notes'],
                ]
            );
        }
    }

    private function seedTemperatureModes(): void
    {
        $definitions = [
            [
                'name' => 'Ambient cargo',
                'range' => '+15C lidz +25C',
                'description' => 'Standard non-refrigerated cargo range.',
            ],
            [
                'name' => 'Chilled cargo',
                'range' => '+2C lidz +8C',
                'description' => 'Used for dairy, food, and pharma shipments.',
            ],
            [
                'name' => 'Frozen cargo',
                'range' => '-22C lidz -18C',
                'description' => 'Deep-frozen cargo and cold-chain exports.',
            ],
        ];

        foreach ($definitions as $definition) {
            TemperatureMode::query()->updateOrCreate(
                ['name' => $definition['name']],
                $definition
            );
        }
    }

    private function seedSpecialConditions(): void
    {
        $definitions = [
            [
                'name' => 'Port security escort',
                'description' => 'Requires coordinated entry and escort inside the terminal area.',
            ],
            [
                'name' => 'Hazardous cargo handling permit',
                'description' => 'Additional checks for dangerous goods handling and documentation.',
            ],
            [
                'name' => 'Priority retail delivery window',
                'description' => 'Tighter timing tolerance for customer-facing deliveries.',
            ],
        ];

        foreach ($definitions as $definition) {
            SpecialCondition::query()->updateOrCreate(
                ['name' => $definition['name']],
                $definition
            );
        }
    }

    private function seedCustomsDocuments(): void
    {
        $definitions = [
            [
                'name' => 'EU Export Pack',
                'description' => 'Commercial invoice, packing list, and export declaration bundle.',
            ],
            [
                'name' => 'Cold Chain Health Documents',
                'description' => 'Temperature log and food safety certification set.',
            ],
            [
                'name' => 'Hazardous Cargo Document Set',
                'description' => 'Dangerous goods declaration and safety handling paperwork.',
            ],
        ];

        foreach ($definitions as $definition) {
            CustomsDocument::query()->updateOrCreate(
                ['name' => $definition['name']],
                $definition
            );
        }
    }

    private function syncPortHandlingMethods(array $ports): void
    {
        $handlingMethodIds = HandlingMethod::query()->pluck('id', 'code');

        $this->syncHandlingMethods($ports['Riga Port'], $handlingMethodIds, [
            'gantry_crane' => ['is_loading' => true, 'is_unloading' => true],
            'crane' => ['is_loading' => true, 'is_unloading' => true],
            'forklift' => ['is_loading' => true, 'is_unloading' => true],
            'conveyor' => ['is_loading' => true, 'is_unloading' => true],
            'manual' => ['is_loading' => true, 'is_unloading' => true],
        ]);

        $this->syncHandlingMethods($ports['Liepaja Port'], $handlingMethodIds, [
            'gantry_crane' => ['is_loading' => true, 'is_unloading' => true],
            'crane' => ['is_loading' => true, 'is_unloading' => true],
            'forklift' => ['is_loading' => true, 'is_unloading' => true],
            'conveyor' => ['is_loading' => true, 'is_unloading' => true],
            'manual' => ['is_loading' => true, 'is_unloading' => true],
        ]);

        $this->syncHandlingMethods($ports['Ventspils Port'], $handlingMethodIds, [
            'gantry_crane' => ['is_loading' => true, 'is_unloading' => true],
            'crane' => ['is_loading' => true, 'is_unloading' => true],
            'forklift' => ['is_loading' => true, 'is_unloading' => true],
            'conveyor' => ['is_loading' => true, 'is_unloading' => true],
            'pump' => ['is_loading' => true, 'is_unloading' => true],
            'manual' => ['is_loading' => true, 'is_unloading' => true],
        ]);

        $this->syncHandlingMethods($ports['Klaipeda Port'], $handlingMethodIds, [
            'gantry_crane' => ['is_loading' => true, 'is_unloading' => true],
            'crane' => ['is_loading' => true, 'is_unloading' => true],
            'forklift' => ['is_loading' => true, 'is_unloading' => true],
            'conveyor' => ['is_loading' => true, 'is_unloading' => true],
            'manual' => ['is_loading' => true, 'is_unloading' => true],
        ]);

        $this->syncHandlingMethods($ports['Helsinki Port'], $handlingMethodIds, [
            'gantry_crane' => ['is_loading' => true, 'is_unloading' => true],
            'crane' => ['is_loading' => true, 'is_unloading' => true],
            'forklift' => ['is_loading' => true, 'is_unloading' => true],
            'manual' => ['is_loading' => true, 'is_unloading' => true],
        ]);
    }

    private function syncShipHandlingMethods(array $ships): void
    {
        $handlingMethodIds = HandlingMethod::query()->pluck('id', 'code');

        $this->syncShipMethods($ships['Baltic Carrier'], $handlingMethodIds, [
            'crane' => ['is_loading' => true, 'is_unloading' => true],
            'forklift' => ['is_loading' => true, 'is_unloading' => true],
            'manual' => ['is_loading' => true, 'is_unloading' => true],
        ]);

        $this->syncShipMethods($ships['Nordic Reefer'], $handlingMethodIds, [
            'forklift' => ['is_loading' => true, 'is_unloading' => true],
            'manual' => ['is_loading' => true, 'is_unloading' => true],
        ]);

        $this->syncShipMethods($ships['Amber Bulk One'], $handlingMethodIds, [
            'crane' => ['is_loading' => true, 'is_unloading' => true],
            'conveyor' => ['is_loading' => true, 'is_unloading' => true],
            'manual' => ['is_loading' => true, 'is_unloading' => true],
        ]);
    }

    private function syncHandlingMethods(Port $port, $handlingMethodIds, array $codes): void
    {
        $payload = [];

        foreach ($codes as $code => $settings) {
            $handlingMethodId = $handlingMethodIds[$code] ?? null;

            if (!$handlingMethodId) {
                continue;
            }

            $payload[$handlingMethodId] = [
                'is_loading' => $settings['is_loading'] ?? true,
                'is_unloading' => $settings['is_unloading'] ?? true,
                'throughput_override_containers_per_hour' => null,
                'throughput_override_tons_per_hour' => null,
                'notes' => null,
            ];
        }

        $port->handlingMethods()->sync($payload);
    }

    private function syncShipMethods(Ship $ship, $handlingMethodIds, array $codes): void
    {
        $payload = [];

        foreach ($codes as $code => $settings) {
            $handlingMethodId = $handlingMethodIds[$code] ?? null;

            if (!$handlingMethodId) {
                continue;
            }

            $payload[$handlingMethodId] = [
                'is_loading' => $settings['is_loading'] ?? true,
                'is_unloading' => $settings['is_unloading'] ?? true,
                'throughput_override_containers_per_hour' => null,
                'throughput_override_tons_per_hour' => null,
                'notes' => null,
            ];
        }

        $ship->handlingMethods()->sync($payload);
    }
}
