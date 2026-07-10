<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\FuelStation;
use App\Models\HandlingMethod;
use App\Models\LandRoute;
use App\Models\Location;
use App\Models\Port;
use App\Models\RouteFuelStop;
use App\Models\RouteTemplate;
use App\Models\RouteTemplateLeg;
use App\Models\RouteTemplatePoint;
use App\Models\SeaRoute;
use App\Models\Ship;
use App\Models\TransportTemplate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GlobalLogisticsCatalogSeeder extends Seeder
{
    private const SOURCE = 'catalog';

    public function run(): void
    {
        $locations = $this->seedLocations();
        $transports = $this->seedTransportTemplates();
        $ships = $this->seedShips();
        $ports = $this->seedPorts($locations);
        $fuelStations = $this->seedFuelStations($locations);
        $landRoutes = $this->seedLandRoutes($locations);

        $this->seedRouteFuelStops($landRoutes, $fuelStations);
        $this->seedSeaRoutes($ports);
        $this->syncHandlingMethods($ports, $ships);
        $this->seedRouteTemplates($locations, $ports);
    }

    /**
     * @return array<string, Location>
     */
    private function seedLocations(): array
    {
        $definitions = [
            ['key' => 'riga', 'name' => 'Riga', 'type' => 'city', 'country' => 'Latvia', 'city' => 'Riga', 'lat' => 56.9496, 'lng' => 24.1052],
            ['key' => 'liepaja', 'name' => 'Liepaja', 'type' => 'city', 'country' => 'Latvia', 'city' => 'Liepaja', 'lat' => 56.5047, 'lng' => 21.0108],
            ['key' => 'ventspils', 'name' => 'Ventspils', 'type' => 'city', 'country' => 'Latvia', 'city' => 'Ventspils', 'lat' => 57.3894, 'lng' => 21.5606],
            ['key' => 'daugavpils', 'name' => 'Daugavpils', 'type' => 'city', 'country' => 'Latvia', 'city' => 'Daugavpils', 'lat' => 55.8747, 'lng' => 26.5362],
            ['key' => 'kaunas', 'name' => 'Kaunas', 'type' => 'city', 'country' => 'Lithuania', 'city' => 'Kaunas', 'lat' => 54.8985, 'lng' => 23.9036],
            ['key' => 'vilnius', 'name' => 'Vilnius', 'type' => 'city', 'country' => 'Lithuania', 'city' => 'Vilnius', 'lat' => 54.6872, 'lng' => 25.2797],
            ['key' => 'warsaw', 'name' => 'Warsaw', 'type' => 'city', 'country' => 'Poland', 'city' => 'Warsaw', 'lat' => 52.2297, 'lng' => 21.0122],
            ['key' => 'berlin', 'name' => 'Berlin', 'type' => 'city', 'country' => 'Germany', 'city' => 'Berlin', 'lat' => 52.5200, 'lng' => 13.4050],
            ['key' => 'hamburg', 'name' => 'Hamburg', 'type' => 'city', 'country' => 'Germany', 'city' => 'Hamburg', 'lat' => 53.5511, 'lng' => 9.9937],
            ['key' => 'rotterdam', 'name' => 'Rotterdam', 'type' => 'city', 'country' => 'Netherlands', 'city' => 'Rotterdam', 'lat' => 51.9244, 'lng' => 4.4777],
            ['key' => 'antwerp', 'name' => 'Antwerp', 'type' => 'city', 'country' => 'Belgium', 'city' => 'Antwerp', 'lat' => 51.2194, 'lng' => 4.4025],
            ['key' => 'gdansk', 'name' => 'Gdansk', 'type' => 'city', 'country' => 'Poland', 'city' => 'Gdansk', 'lat' => 54.3520, 'lng' => 18.6466],
            ['key' => 'tallinn', 'name' => 'Tallinn', 'type' => 'city', 'country' => 'Estonia', 'city' => 'Tallinn', 'lat' => 59.4370, 'lng' => 24.7536],
            ['key' => 'helsinki', 'name' => 'Helsinki', 'type' => 'city', 'country' => 'Finland', 'city' => 'Helsinki', 'lat' => 60.1699, 'lng' => 24.9384],
            ['key' => 'stockholm', 'name' => 'Stockholm', 'type' => 'city', 'country' => 'Sweden', 'city' => 'Stockholm', 'lat' => 59.3293, 'lng' => 18.0686],
            ['key' => 'copenhagen', 'name' => 'Copenhagen', 'type' => 'city', 'country' => 'Denmark', 'city' => 'Copenhagen', 'lat' => 55.6761, 'lng' => 12.5683],
            ['key' => 'gothenburg', 'name' => 'Gothenburg', 'type' => 'city', 'country' => 'Sweden', 'city' => 'Gothenburg', 'lat' => 57.7089, 'lng' => 11.9746],
            ['key' => 'prague', 'name' => 'Prague', 'type' => 'city', 'country' => 'Czechia', 'city' => 'Prague', 'lat' => 50.0755, 'lng' => 14.4378],
            ['key' => 'vienna', 'name' => 'Vienna', 'type' => 'city', 'country' => 'Austria', 'city' => 'Vienna', 'lat' => 48.2082, 'lng' => 16.3738],
            ['key' => 'milan', 'name' => 'Milan', 'type' => 'city', 'country' => 'Italy', 'city' => 'Milan', 'lat' => 45.4642, 'lng' => 9.1900],
            ['key' => 'trieste', 'name' => 'Trieste', 'type' => 'city', 'country' => 'Italy', 'city' => 'Trieste', 'lat' => 45.6495, 'lng' => 13.7768],
            ['key' => 'koper', 'name' => 'Koper', 'type' => 'city', 'country' => 'Slovenia', 'city' => 'Koper', 'lat' => 45.5481, 'lng' => 13.7302],
            ['key' => 'constanta', 'name' => 'Constanta', 'type' => 'city', 'country' => 'Romania', 'city' => 'Constanta', 'lat' => 44.1598, 'lng' => 28.6348],
            ['key' => 'istanbul', 'name' => 'Istanbul', 'type' => 'city', 'country' => 'Turkey', 'city' => 'Istanbul', 'lat' => 41.0082, 'lng' => 28.9784],
            ['key' => 'piraeus', 'name' => 'Piraeus', 'type' => 'city', 'country' => 'Greece', 'city' => 'Piraeus', 'lat' => 37.9420, 'lng' => 23.6460],
            ['key' => 'valencia', 'name' => 'Valencia', 'type' => 'city', 'country' => 'Spain', 'city' => 'Valencia', 'lat' => 39.4699, 'lng' => -0.3763],
            ['key' => 'barcelona', 'name' => 'Barcelona', 'type' => 'city', 'country' => 'Spain', 'city' => 'Barcelona', 'lat' => 41.3851, 'lng' => 2.1734],
            ['key' => 'le_havre', 'name' => 'Le Havre', 'type' => 'city', 'country' => 'France', 'city' => 'Le Havre', 'lat' => 49.4944, 'lng' => 0.1079],
            ['key' => 'felixstowe', 'name' => 'Felixstowe', 'type' => 'city', 'country' => 'United Kingdom', 'city' => 'Felixstowe', 'lat' => 51.9617, 'lng' => 1.3511],
            ['key' => 'dublin', 'name' => 'Dublin', 'type' => 'city', 'country' => 'Ireland', 'city' => 'Dublin', 'lat' => 53.3498, 'lng' => -6.2603],
            ['key' => 'newark', 'name' => 'Newark', 'type' => 'city', 'country' => 'United States', 'city' => 'Newark', 'lat' => 40.7357, 'lng' => -74.1724],
            ['key' => 'norfolk', 'name' => 'Norfolk', 'type' => 'city', 'country' => 'United States', 'city' => 'Norfolk', 'lat' => 36.8508, 'lng' => -76.2859],
            ['key' => 'savannah', 'name' => 'Savannah', 'type' => 'city', 'country' => 'United States', 'city' => 'Savannah', 'lat' => 32.0809, 'lng' => -81.0912],
            ['key' => 'houston', 'name' => 'Houston', 'type' => 'city', 'country' => 'United States', 'city' => 'Houston', 'lat' => 29.7604, 'lng' => -95.3698],
            ['key' => 'long_beach', 'name' => 'Long Beach', 'type' => 'city', 'country' => 'United States', 'city' => 'Long Beach', 'lat' => 33.7701, 'lng' => -118.1937],
            ['key' => 'montreal', 'name' => 'Montreal', 'type' => 'city', 'country' => 'Canada', 'city' => 'Montreal', 'lat' => 45.5017, 'lng' => -73.5673],
            ['key' => 'halifax', 'name' => 'Halifax', 'type' => 'city', 'country' => 'Canada', 'city' => 'Halifax', 'lat' => 44.6488, 'lng' => -63.5752],
            ['key' => 'santos', 'name' => 'Santos', 'type' => 'city', 'country' => 'Brazil', 'city' => 'Santos', 'lat' => -23.9608, 'lng' => -46.3336],
            ['key' => 'buenos_aires', 'name' => 'Buenos Aires', 'type' => 'city', 'country' => 'Argentina', 'city' => 'Buenos Aires', 'lat' => -34.6037, 'lng' => -58.3816],
            ['key' => 'durban', 'name' => 'Durban', 'type' => 'city', 'country' => 'South Africa', 'city' => 'Durban', 'lat' => -29.8587, 'lng' => 31.0218],
            ['key' => 'cape_town', 'name' => 'Cape Town', 'type' => 'city', 'country' => 'South Africa', 'city' => 'Cape Town', 'lat' => -33.9249, 'lng' => 18.4241],
            ['key' => 'jebel_ali', 'name' => 'Jebel Ali', 'type' => 'city', 'country' => 'United Arab Emirates', 'city' => 'Dubai', 'lat' => 25.0118, 'lng' => 55.0612],
            ['key' => 'nhava_sheva', 'name' => 'Nhava Sheva', 'type' => 'city', 'country' => 'India', 'city' => 'Navi Mumbai', 'lat' => 18.9490, 'lng' => 72.9512],
            ['key' => 'colombo', 'name' => 'Colombo', 'type' => 'city', 'country' => 'Sri Lanka', 'city' => 'Colombo', 'lat' => 6.9271, 'lng' => 79.8612],
            ['key' => 'singapore', 'name' => 'Singapore', 'type' => 'city', 'country' => 'Singapore', 'city' => 'Singapore', 'lat' => 1.3521, 'lng' => 103.8198],
            ['key' => 'shanghai', 'name' => 'Shanghai', 'type' => 'city', 'country' => 'China', 'city' => 'Shanghai', 'lat' => 31.2304, 'lng' => 121.4737],
            ['key' => 'ningbo', 'name' => 'Ningbo', 'type' => 'city', 'country' => 'China', 'city' => 'Ningbo', 'lat' => 29.8683, 'lng' => 121.5440],
            ['key' => 'yantian', 'name' => 'Yantian', 'type' => 'city', 'country' => 'China', 'city' => 'Shenzhen', 'lat' => 22.5565, 'lng' => 114.2369],
            ['key' => 'busan', 'name' => 'Busan', 'type' => 'city', 'country' => 'South Korea', 'city' => 'Busan', 'lat' => 35.1796, 'lng' => 129.0756],
            ['key' => 'yokohama', 'name' => 'Yokohama', 'type' => 'city', 'country' => 'Japan', 'city' => 'Yokohama', 'lat' => 35.4437, 'lng' => 139.6380],
            ['key' => 'sydney', 'name' => 'Sydney', 'type' => 'city', 'country' => 'Australia', 'city' => 'Sydney', 'lat' => -33.8688, 'lng' => 151.2093],
            ['key' => 'melbourne', 'name' => 'Melbourne', 'type' => 'city', 'country' => 'Australia', 'city' => 'Melbourne', 'lat' => -37.8136, 'lng' => 144.9631],

            ['key' => 'riga_freeport', 'name' => 'Riga Freeport Container Terminal', 'type' => 'port_terminal', 'country' => 'Latvia', 'city' => 'Riga', 'lat' => 57.0450, 'lng' => 24.0640],
            ['key' => 'liepaja_port', 'name' => 'Liepaja Port Terminal', 'type' => 'port_terminal', 'country' => 'Latvia', 'city' => 'Liepaja', 'lat' => 56.5280, 'lng' => 20.9990],
            ['key' => 'ventspils_port', 'name' => 'Ventspils Freeport Terminal', 'type' => 'port_terminal', 'country' => 'Latvia', 'city' => 'Ventspils', 'lat' => 57.3950, 'lng' => 21.5320],
            ['key' => 'klaipeda_port', 'name' => 'Klaipeda Container Terminal', 'type' => 'port_terminal', 'country' => 'Lithuania', 'city' => 'Klaipeda', 'lat' => 55.7060, 'lng' => 21.1190],
            ['key' => 'muuga_port', 'name' => 'Muuga Harbour Terminal', 'type' => 'port_terminal', 'country' => 'Estonia', 'city' => 'Tallinn', 'lat' => 59.5020, 'lng' => 24.9630],
            ['key' => 'helsinki_vuosaari', 'name' => 'Helsinki Vuosaari Harbour', 'type' => 'port_terminal', 'country' => 'Finland', 'city' => 'Helsinki', 'lat' => 60.2090, 'lng' => 25.1830],
            ['key' => 'stockholm_norvik', 'name' => 'Stockholm Norvik Port', 'type' => 'port_terminal', 'country' => 'Sweden', 'city' => 'Stockholm', 'lat' => 58.9590, 'lng' => 17.9730],
            ['key' => 'gdansk_dct', 'name' => 'Port of Gdansk DCT', 'type' => 'port_terminal', 'country' => 'Poland', 'city' => 'Gdansk', 'lat' => 54.3970, 'lng' => 18.7040],
            ['key' => 'hamburg_port', 'name' => 'Port of Hamburg Container Terminal', 'type' => 'port_terminal', 'country' => 'Germany', 'city' => 'Hamburg', 'lat' => 53.5430, 'lng' => 9.9660],
            ['key' => 'rotterdam_maasvlakte', 'name' => 'Port of Rotterdam Maasvlakte', 'type' => 'port_terminal', 'country' => 'Netherlands', 'city' => 'Rotterdam', 'lat' => 51.9520, 'lng' => 4.0520],
            ['key' => 'antwerp_port', 'name' => 'Port of Antwerp Container Terminal', 'type' => 'port_terminal', 'country' => 'Belgium', 'city' => 'Antwerp', 'lat' => 51.3030, 'lng' => 4.3010],
            ['key' => 'bremerhaven_port', 'name' => 'Bremerhaven Container Terminal', 'type' => 'port_terminal', 'country' => 'Germany', 'city' => 'Bremerhaven', 'lat' => 53.5650, 'lng' => 8.5540],
            ['key' => 'copenhagen_port', 'name' => 'Copenhagen Malmo Port', 'type' => 'port_terminal', 'country' => 'Denmark', 'city' => 'Copenhagen', 'lat' => 55.7040, 'lng' => 12.6090],
            ['key' => 'gothenburg_port', 'name' => 'Port of Gothenburg', 'type' => 'port_terminal', 'country' => 'Sweden', 'city' => 'Gothenburg', 'lat' => 57.6930, 'lng' => 11.8230],
            ['key' => 'trieste_port', 'name' => 'Port of Trieste', 'type' => 'port_terminal', 'country' => 'Italy', 'city' => 'Trieste', 'lat' => 45.6500, 'lng' => 13.7650],
            ['key' => 'koper_port', 'name' => 'Port of Koper', 'type' => 'port_terminal', 'country' => 'Slovenia', 'city' => 'Koper', 'lat' => 45.5550, 'lng' => 13.7300],
            ['key' => 'constanta_port', 'name' => 'Port of Constanta', 'type' => 'port_terminal', 'country' => 'Romania', 'city' => 'Constanta', 'lat' => 44.1450, 'lng' => 28.6590],
            ['key' => 'piraeus_port', 'name' => 'Port of Piraeus', 'type' => 'port_terminal', 'country' => 'Greece', 'city' => 'Piraeus', 'lat' => 37.9430, 'lng' => 23.6400],
            ['key' => 'valencia_port', 'name' => 'Port of Valencia', 'type' => 'port_terminal', 'country' => 'Spain', 'city' => 'Valencia', 'lat' => 39.4480, 'lng' => -0.3160],
            ['key' => 'barcelona_port', 'name' => 'Port of Barcelona', 'type' => 'port_terminal', 'country' => 'Spain', 'city' => 'Barcelona', 'lat' => 41.3520, 'lng' => 2.1640],
            ['key' => 'le_havre_port', 'name' => 'Port of Le Havre', 'type' => 'port_terminal', 'country' => 'France', 'city' => 'Le Havre', 'lat' => 49.4730, 'lng' => 0.1360],
            ['key' => 'felixstowe_port', 'name' => 'Port of Felixstowe', 'type' => 'port_terminal', 'country' => 'United Kingdom', 'city' => 'Felixstowe', 'lat' => 51.9550, 'lng' => 1.3100],
            ['key' => 'dublin_port', 'name' => 'Dublin Port', 'type' => 'port_terminal', 'country' => 'Ireland', 'city' => 'Dublin', 'lat' => 53.3490, 'lng' => -6.2100],
            ['key' => 'newark_port', 'name' => 'Port Newark Container Terminal', 'type' => 'port_terminal', 'country' => 'United States', 'city' => 'Newark', 'lat' => 40.6840, 'lng' => -74.1470],
            ['key' => 'norfolk_port', 'name' => 'Port of Virginia Norfolk', 'type' => 'port_terminal', 'country' => 'United States', 'city' => 'Norfolk', 'lat' => 36.9460, 'lng' => -76.3300],
            ['key' => 'savannah_port', 'name' => 'Port of Savannah Garden City', 'type' => 'port_terminal', 'country' => 'United States', 'city' => 'Savannah', 'lat' => 32.1280, 'lng' => -81.1510],
            ['key' => 'houston_port', 'name' => 'Port Houston Bayport', 'type' => 'port_terminal', 'country' => 'United States', 'city' => 'Houston', 'lat' => 29.6070, 'lng' => -95.0100],
            ['key' => 'long_beach_port', 'name' => 'Port of Long Beach', 'type' => 'port_terminal', 'country' => 'United States', 'city' => 'Long Beach', 'lat' => 33.7540, 'lng' => -118.2160],
            ['key' => 'montreal_port', 'name' => 'Port of Montreal', 'type' => 'port_terminal', 'country' => 'Canada', 'city' => 'Montreal', 'lat' => 45.5580, 'lng' => -73.5290],
            ['key' => 'halifax_port', 'name' => 'Port of Halifax', 'type' => 'port_terminal', 'country' => 'Canada', 'city' => 'Halifax', 'lat' => 44.6380, 'lng' => -63.5660],
            ['key' => 'santos_port', 'name' => 'Port of Santos', 'type' => 'port_terminal', 'country' => 'Brazil', 'city' => 'Santos', 'lat' => -23.9550, 'lng' => -46.3000],
            ['key' => 'buenos_aires_port', 'name' => 'Port of Buenos Aires', 'type' => 'port_terminal', 'country' => 'Argentina', 'city' => 'Buenos Aires', 'lat' => -34.5890, 'lng' => -58.3700],
            ['key' => 'durban_port', 'name' => 'Port of Durban', 'type' => 'port_terminal', 'country' => 'South Africa', 'city' => 'Durban', 'lat' => -29.8680, 'lng' => 31.0380],
            ['key' => 'cape_town_port', 'name' => 'Port of Cape Town', 'type' => 'port_terminal', 'country' => 'South Africa', 'city' => 'Cape Town', 'lat' => -33.9080, 'lng' => 18.4330],
            ['key' => 'jebel_ali_port', 'name' => 'Jebel Ali Port', 'type' => 'port_terminal', 'country' => 'United Arab Emirates', 'city' => 'Dubai', 'lat' => 25.0100, 'lng' => 55.0620],
            ['key' => 'nhava_sheva_port', 'name' => 'Jawaharlal Nehru Port Nhava Sheva', 'type' => 'port_terminal', 'country' => 'India', 'city' => 'Navi Mumbai', 'lat' => 18.9490, 'lng' => 72.9510],
            ['key' => 'colombo_port', 'name' => 'Port of Colombo', 'type' => 'port_terminal', 'country' => 'Sri Lanka', 'city' => 'Colombo', 'lat' => 6.9520, 'lng' => 79.8450],
            ['key' => 'singapore_port', 'name' => 'Port of Singapore Tuas', 'type' => 'port_terminal', 'country' => 'Singapore', 'city' => 'Singapore', 'lat' => 1.2650, 'lng' => 103.6200],
            ['key' => 'shanghai_port', 'name' => 'Port of Shanghai Yangshan', 'type' => 'port_terminal', 'country' => 'China', 'city' => 'Shanghai', 'lat' => 30.6260, 'lng' => 122.0640],
            ['key' => 'ningbo_port', 'name' => 'Port of Ningbo Zhoushan', 'type' => 'port_terminal', 'country' => 'China', 'city' => 'Ningbo', 'lat' => 29.8720, 'lng' => 121.8500],
            ['key' => 'yantian_port', 'name' => 'Yantian International Container Terminal', 'type' => 'port_terminal', 'country' => 'China', 'city' => 'Shenzhen', 'lat' => 22.5840, 'lng' => 114.2750],
            ['key' => 'busan_port', 'name' => 'Busan New Port', 'type' => 'port_terminal', 'country' => 'South Korea', 'city' => 'Busan', 'lat' => 35.0800, 'lng' => 128.8200],
            ['key' => 'yokohama_port', 'name' => 'Port of Yokohama', 'type' => 'port_terminal', 'country' => 'Japan', 'city' => 'Yokohama', 'lat' => 35.4510, 'lng' => 139.6640],
            ['key' => 'sydney_port', 'name' => 'Port Botany Sydney', 'type' => 'port_terminal', 'country' => 'Australia', 'city' => 'Sydney', 'lat' => -33.9710, 'lng' => 151.2220],
            ['key' => 'melbourne_port', 'name' => 'Port of Melbourne', 'type' => 'port_terminal', 'country' => 'Australia', 'city' => 'Melbourne', 'lat' => -37.8420, 'lng' => 144.9120],

            ['key' => 'riga_a7_fuel', 'name' => 'Riga A7 Fuel Hub', 'type' => 'fuel_station', 'country' => 'Latvia', 'city' => 'Riga', 'lat' => 56.8860, 'lng' => 24.2090],
            ['key' => 'kaunas_a1_fuel', 'name' => 'Kaunas A1 Fuel Hub', 'type' => 'fuel_station', 'country' => 'Lithuania', 'city' => 'Kaunas', 'lat' => 54.9060, 'lng' => 23.8220],
            ['key' => 'warsaw_s8_fuel', 'name' => 'Warsaw S8 Fuel Hub', 'type' => 'fuel_station', 'country' => 'Poland', 'city' => 'Warsaw', 'lat' => 52.2650, 'lng' => 20.8680],
            ['key' => 'berlin_a10_fuel', 'name' => 'Berlin A10 Fuel Hub', 'type' => 'fuel_station', 'country' => 'Germany', 'city' => 'Berlin', 'lat' => 52.3580, 'lng' => 13.0460],
            ['key' => 'hamburg_a1_fuel', 'name' => 'Hamburg A1 Fuel Hub', 'type' => 'fuel_station', 'country' => 'Germany', 'city' => 'Hamburg', 'lat' => 53.4680, 'lng' => 10.0170],
            ['key' => 'rotterdam_a15_fuel', 'name' => 'Rotterdam A15 Fuel Hub', 'type' => 'fuel_station', 'country' => 'Netherlands', 'city' => 'Rotterdam', 'lat' => 51.8950, 'lng' => 4.2840],
        ];

        $locations = [];

        foreach ($definitions as $definition) {
            $city = $this->city($definition['city'], $definition['country']);
            $locations[$definition['key']] = $this->catalogLocation($definition, $city);
        }

        return $locations;
    }

    /**
     * @return array<string, TransportTemplate>
     */
    private function seedTransportTemplates(): array
    {
        $definitions = [
            'container_40ft_eu' => [
                'name' => 'EU Container Tractor 40FT',
                'type' => 'truck',
                'description' => 'Standard EU road tractor and semi-trailer for one 40FT container.',
                'capacity' => '1 x 40FT container',
                'temperature_support' => 'ambient',
                'capacity_containers' => 1,
                'capacity_tons' => 24,
                'avg_speed_kmh' => 72,
                'cost_per_km' => 1.45,
                'fuel_consumption_per_100km' => 31,
                'max_range_km' => 950,
                'loading_time_minutes' => 45,
                'unloading_time_minutes' => 45,
            ],
            'reefer_40ft_eu' => [
                'name' => 'EU Reefer Container Tractor 40FT',
                'type' => 'reefer_truck',
                'description' => 'Refrigerated container road unit for cold-chain cargo.',
                'capacity' => '1 x 40FT reefer container',
                'temperature_support' => 'refrigerated',
                'capacity_containers' => 1,
                'capacity_tons' => 22,
                'avg_speed_kmh' => 68,
                'cost_per_km' => 1.75,
                'fuel_consumption_per_100km' => 34,
                'max_range_km' => 850,
                'loading_time_minutes' => 55,
                'unloading_time_minutes' => 55,
            ],
            'bulk_tipper_24t' => [
                'name' => 'EU Bulk Tipper 24T',
                'type' => 'bulk_truck',
                'description' => 'Bulk tipper for grain, aggregates, and other non-container dry cargo.',
                'capacity' => '24 t bulk',
                'temperature_support' => 'ambient',
                'capacity_containers' => 0,
                'capacity_tons' => 24,
                'avg_speed_kmh' => 70,
                'cost_per_km' => 1.35,
                'fuel_consumption_per_100km' => 29,
                'max_range_km' => 900,
                'loading_time_minutes' => 35,
                'unloading_time_minutes' => 35,
            ],
            'heavy_haul_lowbed' => [
                'name' => 'Heavy Haul Lowbed 70T',
                'type' => 'heavy_haul',
                'description' => 'Lowbed heavy-haul unit for machinery and project cargo.',
                'capacity' => '70 t project cargo',
                'temperature_support' => 'ambient',
                'capacity_containers' => 0,
                'capacity_tons' => 70,
                'avg_speed_kmh' => 55,
                'cost_per_km' => 2.80,
                'fuel_consumption_per_100km' => 48,
                'max_range_km' => 700,
                'loading_time_minutes' => 120,
                'unloading_time_minutes' => 120,
            ],
            'tanker_30t' => [
                'name' => 'Liquid Tanker 30T',
                'type' => 'tanker_truck',
                'description' => 'Road tanker for liquid cargo scenarios.',
                'capacity' => '30 t liquid cargo',
                'temperature_support' => 'ambient',
                'capacity_containers' => 0,
                'capacity_tons' => 30,
                'avg_speed_kmh' => 68,
                'cost_per_km' => 1.65,
                'fuel_consumption_per_100km' => 32,
                'max_range_km' => 850,
                'loading_time_minutes' => 70,
                'unloading_time_minutes' => 70,
            ],
        ];

        $templates = [];

        foreach ($definitions as $key => $definition) {
            $templates[$key] = TransportTemplate::query()->updateOrCreate(
                ['name' => $definition['name']],
                $definition
            );
        }

        return $templates;
    }

    /**
     * @return array<string, Ship>
     */
    private function seedShips(): array
    {
        $definitions = [
            'feeder_900_teu' => [
                'name' => 'Baltic Feeder 900 TEU',
                'cargo_type' => 'container',
                'cargo_mode' => 'containerized',
                'capacity_containers' => 900,
                'capacity_tons' => 12000,
                'draft_m' => 7.2,
                'fuel_consumption_per_hour' => 3.8,
                'speed_kmh' => 31,
                'loading_capacity_containers_per_hour' => 55,
                'loading_capacity_tons_per_hour' => 450,
                'is_closed_cargo' => true,
                'supports_container' => true,
                'supports_refrigerated' => true,
                'supports_hazardous' => true,
                'has_onboard_crane' => false,
                'notes' => 'Short-sea feeder for Baltic and North Sea services.',
            ],
            'feeder_geared_650_teu' => [
                'name' => 'Geared Feeder 650 TEU',
                'cargo_type' => 'container',
                'cargo_mode' => 'containerized',
                'capacity_containers' => 650,
                'capacity_tons' => 8500,
                'draft_m' => 6.4,
                'fuel_consumption_per_hour' => 3.2,
                'speed_kmh' => 28,
                'loading_capacity_containers_per_hour' => 35,
                'loading_capacity_tons_per_hour' => 320,
                'is_closed_cargo' => true,
                'supports_container' => true,
                'supports_refrigerated' => true,
                'supports_hazardous' => true,
                'has_onboard_crane' => true,
                'notes' => 'Geared feeder that can work at smaller ports.',
            ],
            'panamax_4500_teu' => [
                'name' => 'Panamax Container Vessel 4500 TEU',
                'cargo_type' => 'container',
                'cargo_mode' => 'containerized',
                'capacity_containers' => 4500,
                'capacity_tons' => 62000,
                'draft_m' => 12.2,
                'fuel_consumption_per_hour' => 8.5,
                'speed_kmh' => 37,
                'loading_capacity_containers_per_hour' => 110,
                'loading_capacity_tons_per_hour' => 900,
                'is_closed_cargo' => true,
                'supports_container' => true,
                'supports_refrigerated' => true,
                'supports_hazardous' => true,
                'has_onboard_crane' => false,
                'notes' => 'Medium deep-sea container vessel.',
            ],
            'ulcv_15000_teu' => [
                'name' => 'ULCV 15000 TEU',
                'cargo_type' => 'container',
                'cargo_mode' => 'containerized',
                'capacity_containers' => 15000,
                'capacity_tons' => 185000,
                'draft_m' => 15.5,
                'fuel_consumption_per_hour' => 14.5,
                'speed_kmh' => 39,
                'loading_capacity_containers_per_hour' => 180,
                'loading_capacity_tons_per_hour' => 1500,
                'is_closed_cargo' => true,
                'supports_container' => true,
                'supports_refrigerated' => true,
                'supports_hazardous' => true,
                'has_onboard_crane' => false,
                'notes' => 'Large deep-sea container vessel for major hub ports.',
            ],
            'bulk_handymax_38000' => [
                'name' => 'Handymax Bulk Carrier 38000 DWT',
                'cargo_type' => 'bulk',
                'cargo_mode' => 'bulk',
                'capacity_containers' => 0,
                'capacity_tons' => 38000,
                'draft_m' => 10.2,
                'fuel_consumption_per_hour' => 6.0,
                'speed_kmh' => 26,
                'loading_capacity_containers_per_hour' => 0,
                'loading_capacity_tons_per_hour' => 850,
                'is_open_cargo' => true,
                'supports_bulk' => true,
                'has_onboard_crane' => true,
                'notes' => 'Geared bulk carrier for grain and dry bulk tasks.',
            ],
            'product_tanker_45000' => [
                'name' => 'MR Product Tanker 45000 DWT',
                'cargo_type' => 'liquid',
                'cargo_mode' => 'liquid',
                'capacity_containers' => 0,
                'capacity_tons' => 45000,
                'draft_m' => 11.4,
                'fuel_consumption_per_hour' => 6.8,
                'speed_kmh' => 27,
                'loading_capacity_containers_per_hour' => 0,
                'loading_capacity_tons_per_hour' => 1200,
                'is_closed_cargo' => true,
                'supports_liquid' => true,
                'supports_hazardous' => true,
                'has_onboard_crane' => false,
                'notes' => 'Medium-range tanker for liquid cargo tasks.',
            ],
        ];

        $ships = [];

        foreach ($definitions as $key => $definition) {
            $ships[$key] = Ship::query()->updateOrCreate(
                ['name' => $definition['name']],
                $definition
            );
        }

        return $ships;
    }

    /**
     * @param  array<string, Location>  $locations
     * @return array<string, Port>
     */
    private function seedPorts(array $locations): array
    {
        $definitions = [
            ['key' => 'riga_freeport', 'name' => 'Riga Freeport', 'country' => 'Latvia', 'location' => 'riga_freeport', 'draft' => 13.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'liepaja_port', 'name' => 'Liepaja Port', 'country' => 'Latvia', 'location' => 'liepaja_port', 'draft' => 12.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'ventspils_port', 'name' => 'Ventspils Freeport', 'country' => 'Latvia', 'location' => 'ventspils_port', 'draft' => 15.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'klaipeda_port', 'name' => 'Klaipeda Port', 'country' => 'Lithuania', 'location' => 'klaipeda_port', 'draft' => 14.5, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'muuga_port', 'name' => 'Muuga Harbour', 'country' => 'Estonia', 'location' => 'muuga_port', 'draft' => 17.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'helsinki_vuosaari', 'name' => 'Helsinki Vuosaari Harbour', 'country' => 'Finland', 'location' => 'helsinki_vuosaari', 'draft' => 11.0, 'containers' => true, 'bulk' => false, 'liquid' => false, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => false, 'conveyor' => false],
            ['key' => 'stockholm_norvik', 'name' => 'Stockholm Norvik Port', 'country' => 'Sweden', 'location' => 'stockholm_norvik', 'draft' => 16.5, 'containers' => true, 'bulk' => false, 'liquid' => false, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => false, 'conveyor' => false],
            ['key' => 'gdansk_dct', 'name' => 'Port of Gdansk DCT', 'country' => 'Poland', 'location' => 'gdansk_dct', 'draft' => 16.5, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'hamburg_port', 'name' => 'Port of Hamburg', 'country' => 'Germany', 'location' => 'hamburg_port', 'draft' => 15.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'rotterdam_maasvlakte', 'name' => 'Port of Rotterdam Maasvlakte', 'country' => 'Netherlands', 'location' => 'rotterdam_maasvlakte', 'draft' => 20.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'antwerp_port', 'name' => 'Port of Antwerp', 'country' => 'Belgium', 'location' => 'antwerp_port', 'draft' => 16.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'bremerhaven_port', 'name' => 'Bremerhaven Container Terminal', 'country' => 'Germany', 'location' => 'bremerhaven_port', 'draft' => 14.5, 'containers' => true, 'bulk' => false, 'liquid' => false, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => false, 'conveyor' => false],
            ['key' => 'copenhagen_port', 'name' => 'Copenhagen Malmo Port', 'country' => 'Denmark', 'location' => 'copenhagen_port', 'draft' => 10.0, 'containers' => true, 'bulk' => true, 'liquid' => false, 'reefer' => true, 'hazard' => false, 'crane' => true, 'forklift' => true, 'pump' => false, 'conveyor' => true],
            ['key' => 'gothenburg_port', 'name' => 'Port of Gothenburg', 'country' => 'Sweden', 'location' => 'gothenburg_port', 'draft' => 13.5, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'trieste_port', 'name' => 'Port of Trieste', 'country' => 'Italy', 'location' => 'trieste_port', 'draft' => 18.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'koper_port', 'name' => 'Port of Koper', 'country' => 'Slovenia', 'location' => 'koper_port', 'draft' => 14.5, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'constanta_port', 'name' => 'Port of Constanta', 'country' => 'Romania', 'location' => 'constanta_port', 'draft' => 19.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'piraeus_port', 'name' => 'Port of Piraeus', 'country' => 'Greece', 'location' => 'piraeus_port', 'draft' => 18.0, 'containers' => true, 'bulk' => true, 'liquid' => false, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => false, 'conveyor' => true],
            ['key' => 'valencia_port', 'name' => 'Port of Valencia', 'country' => 'Spain', 'location' => 'valencia_port', 'draft' => 17.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'barcelona_port', 'name' => 'Port of Barcelona', 'country' => 'Spain', 'location' => 'barcelona_port', 'draft' => 16.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'le_havre_port', 'name' => 'Port of Le Havre', 'country' => 'France', 'location' => 'le_havre_port', 'draft' => 16.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'felixstowe_port', 'name' => 'Port of Felixstowe', 'country' => 'United Kingdom', 'location' => 'felixstowe_port', 'draft' => 15.0, 'containers' => true, 'bulk' => false, 'liquid' => false, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => false, 'conveyor' => false],
            ['key' => 'dublin_port', 'name' => 'Dublin Port', 'country' => 'Ireland', 'location' => 'dublin_port', 'draft' => 11.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'newark_port', 'name' => 'Port Newark Container Terminal', 'country' => 'United States', 'location' => 'newark_port', 'draft' => 15.2, 'containers' => true, 'bulk' => false, 'liquid' => false, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => false, 'conveyor' => false],
            ['key' => 'norfolk_port', 'name' => 'Port of Virginia Norfolk', 'country' => 'United States', 'location' => 'norfolk_port', 'draft' => 15.5, 'containers' => true, 'bulk' => true, 'liquid' => false, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => false, 'conveyor' => true],
            ['key' => 'savannah_port', 'name' => 'Port of Savannah Garden City', 'country' => 'United States', 'location' => 'savannah_port', 'draft' => 14.5, 'containers' => true, 'bulk' => false, 'liquid' => false, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => false, 'conveyor' => false],
            ['key' => 'houston_port', 'name' => 'Port Houston Bayport', 'country' => 'United States', 'location' => 'houston_port', 'draft' => 13.7, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'long_beach_port', 'name' => 'Port of Long Beach', 'country' => 'United States', 'location' => 'long_beach_port', 'draft' => 23.0, 'containers' => true, 'bulk' => false, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => false],
            ['key' => 'montreal_port', 'name' => 'Port of Montreal', 'country' => 'Canada', 'location' => 'montreal_port', 'draft' => 11.3, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'halifax_port', 'name' => 'Port of Halifax', 'country' => 'Canada', 'location' => 'halifax_port', 'draft' => 16.8, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'santos_port', 'name' => 'Port of Santos', 'country' => 'Brazil', 'location' => 'santos_port', 'draft' => 15.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'buenos_aires_port', 'name' => 'Port of Buenos Aires', 'country' => 'Argentina', 'location' => 'buenos_aires_port', 'draft' => 10.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'durban_port', 'name' => 'Port of Durban', 'country' => 'South Africa', 'location' => 'durban_port', 'draft' => 16.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'cape_town_port', 'name' => 'Port of Cape Town', 'country' => 'South Africa', 'location' => 'cape_town_port', 'draft' => 15.9, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'jebel_ali_port', 'name' => 'Jebel Ali Port', 'country' => 'United Arab Emirates', 'location' => 'jebel_ali_port', 'draft' => 17.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'nhava_sheva_port', 'name' => 'Jawaharlal Nehru Port Nhava Sheva', 'country' => 'India', 'location' => 'nhava_sheva_port', 'draft' => 14.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'colombo_port', 'name' => 'Port of Colombo', 'country' => 'Sri Lanka', 'location' => 'colombo_port', 'draft' => 18.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'singapore_port', 'name' => 'Port of Singapore Tuas', 'country' => 'Singapore', 'location' => 'singapore_port', 'draft' => 16.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'shanghai_port', 'name' => 'Port of Shanghai Yangshan', 'country' => 'China', 'location' => 'shanghai_port', 'draft' => 15.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'ningbo_port', 'name' => 'Port of Ningbo Zhoushan', 'country' => 'China', 'location' => 'ningbo_port', 'draft' => 17.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'yantian_port', 'name' => 'Yantian International Container Terminal', 'country' => 'China', 'location' => 'yantian_port', 'draft' => 16.0, 'containers' => true, 'bulk' => false, 'liquid' => false, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => false, 'conveyor' => false],
            ['key' => 'busan_port', 'name' => 'Busan New Port', 'country' => 'South Korea', 'location' => 'busan_port', 'draft' => 16.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'yokohama_port', 'name' => 'Port of Yokohama', 'country' => 'Japan', 'location' => 'yokohama_port', 'draft' => 16.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'sydney_port', 'name' => 'Port Botany Sydney', 'country' => 'Australia', 'location' => 'sydney_port', 'draft' => 15.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
            ['key' => 'melbourne_port', 'name' => 'Port of Melbourne', 'country' => 'Australia', 'location' => 'melbourne_port', 'draft' => 14.0, 'containers' => true, 'bulk' => true, 'liquid' => true, 'reefer' => true, 'hazard' => true, 'crane' => true, 'forklift' => true, 'pump' => true, 'conveyor' => true],
        ];

        $ports = [];

        foreach ($definitions as $definition) {
            $ports[$definition['key']] = Port::query()->updateOrCreate(
                ['name' => $definition['name'], 'country' => $definition['country']],
                [
                    'location_id' => $locations[$definition['location']]->id,
                    'max_draft_m' => $definition['draft'],
                    'city_distance_km' => 0,
                    'loading_rate_containers_per_hour' => $definition['containers'] ? 75 : 0,
                    'loading_rate_tons_per_hour' => $definition['bulk'] ? 900 : 350,
                    'supports_bulk' => $definition['bulk'],
                    'supports_container' => $definition['containers'],
                    'supports_liquid' => $definition['liquid'],
                    'supports_refrigerated' => $definition['reefer'],
                    'supports_hazardous' => $definition['hazard'],
                    'has_crane' => $definition['crane'],
                    'has_forklift' => $definition['forklift'],
                    'has_pump' => $definition['pump'],
                    'has_conveyor' => $definition['conveyor'],
                    'notes' => 'Seeded global logistics catalog port.',
                ]
            );
        }

        return $ports;
    }

    /**
     * @param  array<string, Location>  $locations
     * @return array<string, FuelStation>
     */
    private function seedFuelStations(array $locations): array
    {
        $definitions = [
            'riga_a7_fuel' => ['location' => 'riga_a7_fuel', 'price' => 1.62],
            'kaunas_a1_fuel' => ['location' => 'kaunas_a1_fuel', 'price' => 1.58],
            'warsaw_s8_fuel' => ['location' => 'warsaw_s8_fuel', 'price' => 1.54],
            'berlin_a10_fuel' => ['location' => 'berlin_a10_fuel', 'price' => 1.72],
            'hamburg_a1_fuel' => ['location' => 'hamburg_a1_fuel', 'price' => 1.74],
            'rotterdam_a15_fuel' => ['location' => 'rotterdam_a15_fuel', 'price' => 1.69],
        ];

        $stations = [];

        foreach ($definitions as $key => $definition) {
            $stations[$key] = FuelStation::query()->updateOrCreate(
                ['location_id' => $locations[$definition['location']]->id, 'fuel_type' => 'diesel'],
                [
                    'price_per_liter' => $definition['price'],
                    'notes' => 'Catalog fuel stop for long-haul route planning.',
                ]
            );
        }

        return $stations;
    }

    /**
     * @param  array<string, Location>  $locations
     * @return array<string, LandRoute>
     */
    private function seedLandRoutes(array $locations): array
    {
        $definitions = [
            'riga_riga_freeport' => ['from' => 'riga', 'to' => 'riga_freeport', 'distance' => 18, 'hours' => 0.55, 'coords' => ['riga', 'riga_freeport']],
            'riga_ventspils_port' => ['from' => 'riga', 'to' => 'ventspils_port', 'distance' => 190, 'hours' => 2.8, 'coords' => ['riga', 'ventspils', 'ventspils_port']],
            'riga_liepaja_port' => ['from' => 'riga', 'to' => 'liepaja_port', 'distance' => 220, 'hours' => 3.2, 'coords' => ['riga', 'liepaja', 'liepaja_port']],
            'riga_klaipeda_port' => ['from' => 'riga', 'to' => 'klaipeda_port', 'distance' => 310, 'hours' => 4.6, 'coords' => ['riga', 'kaunas', 'klaipeda_port']],
            'kaunas_klaipeda_port' => ['from' => 'kaunas', 'to' => 'klaipeda_port', 'distance' => 215, 'hours' => 3.0, 'coords' => ['kaunas', 'klaipeda', 'klaipeda_port']],
            'riga_tallinn_muuga' => ['from' => 'riga', 'to' => 'muuga_port', 'distance' => 320, 'hours' => 4.7, 'coords' => ['riga', 'tallinn', 'muuga_port']],
            'riga_daugavpils' => ['from' => 'riga', 'to' => 'daugavpils', 'distance' => 239, 'hours' => 3.4, 'coords' => ['riga', 'daugavpils']],
            'riga_gdansk_dct' => ['from' => 'riga', 'to' => 'gdansk_dct', 'distance' => 690, 'hours' => 9.0, 'coords' => ['riga', 'kaunas', 'warsaw', 'gdansk_dct']],
            'riga_hamburg_port' => ['from' => 'riga', 'to' => 'hamburg_port', 'distance' => 1320, 'hours' => 17.5, 'coords' => ['riga', 'kaunas', 'warsaw', 'berlin', 'hamburg_port']],
            'riga_rotterdam_port' => ['from' => 'riga', 'to' => 'rotterdam_maasvlakte', 'distance' => 1680, 'hours' => 22.5, 'coords' => ['riga', 'kaunas', 'warsaw', 'berlin', 'hamburg', 'rotterdam_maasvlakte']],
            'riga_antwerp_port' => ['from' => 'riga', 'to' => 'antwerp_port', 'distance' => 1660, 'hours' => 22.0, 'coords' => ['riga', 'kaunas', 'warsaw', 'berlin', 'antwerp_port']],
            'riga_trieste_port' => ['from' => 'riga', 'to' => 'trieste_port', 'distance' => 1790, 'hours' => 23.0, 'coords' => ['riga', 'warsaw', 'vienna', 'trieste_port']],
            'riga_koper_port' => ['from' => 'riga', 'to' => 'koper_port', 'distance' => 1810, 'hours' => 23.3, 'coords' => ['riga', 'warsaw', 'vienna', 'koper_port']],
            'riga_constanta_port' => ['from' => 'riga', 'to' => 'constanta_port', 'distance' => 1900, 'hours' => 25.0, 'coords' => ['riga', 'warsaw', 'vienna', 'constanta_port']],
            'hamburg_rotterdam_port' => ['from' => 'hamburg_port', 'to' => 'rotterdam_maasvlakte', 'distance' => 500, 'hours' => 6.0, 'coords' => ['hamburg_port', 'rotterdam_maasvlakte']],
            'rotterdam_antwerp_port' => ['from' => 'rotterdam_maasvlakte', 'to' => 'antwerp_port', 'distance' => 120, 'hours' => 2.0, 'coords' => ['rotterdam_maasvlakte', 'antwerp_port']],
        ];

        $routes = [];

        foreach ($definitions as $key => $definition) {
            $routes[$key] = $this->catalogLandRoute($definition, $locations);
        }

        return $routes;
    }

    /**
     * @param  array<string, LandRoute>  $routes
     * @param  array<string, FuelStation>  $fuelStations
     */
    private function seedRouteFuelStops(array $routes, array $fuelStations): void
    {
        $definitions = [
            'riga_gdansk_dct' => [
                ['station' => 'kaunas_a1_fuel', 'distance' => 265],
                ['station' => 'warsaw_s8_fuel', 'distance' => 560],
            ],
            'riga_hamburg_port' => [
                ['station' => 'kaunas_a1_fuel', 'distance' => 265],
                ['station' => 'warsaw_s8_fuel', 'distance' => 560],
                ['station' => 'berlin_a10_fuel', 'distance' => 1040],
            ],
            'riga_rotterdam_port' => [
                ['station' => 'kaunas_a1_fuel', 'distance' => 265],
                ['station' => 'warsaw_s8_fuel', 'distance' => 560],
                ['station' => 'berlin_a10_fuel', 'distance' => 1040],
                ['station' => 'hamburg_a1_fuel', 'distance' => 1320],
            ],
            'riga_antwerp_port' => [
                ['station' => 'kaunas_a1_fuel', 'distance' => 265],
                ['station' => 'warsaw_s8_fuel', 'distance' => 560],
                ['station' => 'berlin_a10_fuel', 'distance' => 1040],
            ],
            'hamburg_rotterdam_port' => [
                ['station' => 'rotterdam_a15_fuel', 'distance' => 460],
            ],
        ];

        foreach ($definitions as $routeKey => $stops) {
            if (! isset($routes[$routeKey])) {
                continue;
            }

            foreach ($stops as $stop) {
                if (! isset($fuelStations[$stop['station']])) {
                    continue;
                }

                RouteFuelStop::query()->updateOrCreate(
                    [
                        'land_route_id' => $routes[$routeKey]->id,
                        'fuel_station_id' => $fuelStations[$stop['station']]->id,
                    ],
                    [
                        'distance_from_start_km' => $stop['distance'],
                    ]
                );
            }
        }
    }

    /**
     * @param  array<string, Port>  $ports
     */
    private function seedSeaRoutes(array $ports): void
    {
        $definitions = [
            ['from' => 'riga_freeport', 'to' => 'helsinki_vuosaari', 'km' => 420, 'hours' => 14, 'coords' => ['riga_freeport', [24.6, 58.8], 'helsinki_vuosaari']],
            ['from' => 'riga_freeport', 'to' => 'stockholm_norvik', 'km' => 500, 'hours' => 17, 'coords' => ['riga_freeport', [22.8, 58.6], 'stockholm_norvik']],
            ['from' => 'ventspils_port', 'to' => 'stockholm_norvik', 'km' => 360, 'hours' => 12, 'coords' => ['ventspils_port', [20.3, 58.4], 'stockholm_norvik']],
            ['from' => 'klaipeda_port', 'to' => 'stockholm_norvik', 'km' => 520, 'hours' => 18, 'coords' => ['klaipeda_port', [19.5, 57.6], 'stockholm_norvik']],
            ['from' => 'muuga_port', 'to' => 'helsinki_vuosaari', 'km' => 90, 'hours' => 3.5, 'coords' => ['muuga_port', 'helsinki_vuosaari']],
            ['from' => 'riga_freeport', 'to' => 'hamburg_port', 'km' => 1320, 'hours' => 44, 'coords' => ['riga_freeport', [20.0, 56.0], [14.5, 54.8], [10.4, 54.3], 'hamburg_port']],
            ['from' => 'riga_freeport', 'to' => 'rotterdam_maasvlakte', 'km' => 1650, 'hours' => 55, 'coords' => ['riga_freeport', [20.0, 56.0], [14.5, 54.8], [8.0, 55.5], [3.2, 52.2], 'rotterdam_maasvlakte']],
            ['from' => 'gdansk_dct', 'to' => 'hamburg_port', 'km' => 650, 'hours' => 22, 'coords' => ['gdansk_dct', [14.5, 54.8], [10.4, 54.3], 'hamburg_port']],
            ['from' => 'hamburg_port', 'to' => 'rotterdam_maasvlakte', 'km' => 550, 'hours' => 19, 'coords' => ['hamburg_port', [8.0, 55.5], [3.2, 52.2], 'rotterdam_maasvlakte']],
            ['from' => 'rotterdam_maasvlakte', 'to' => 'felixstowe_port', 'km' => 220, 'hours' => 8, 'coords' => ['rotterdam_maasvlakte', [2.7, 52.0], 'felixstowe_port']],
            ['from' => 'rotterdam_maasvlakte', 'to' => 'newark_port', 'km' => 6200, 'hours' => 188, 'coords' => ['rotterdam_maasvlakte', [-8.0, 49.0], [-30.0, 45.0], [-55.0, 41.0], 'newark_port']],
            ['from' => 'hamburg_port', 'to' => 'newark_port', 'km' => 6400, 'hours' => 194, 'coords' => ['hamburg_port', [3.2, 52.2], [-8.0, 49.0], [-30.0, 45.0], [-55.0, 41.0], 'newark_port']],
            ['from' => 'rotterdam_maasvlakte', 'to' => 'halifax_port', 'km' => 5400, 'hours' => 164, 'coords' => ['rotterdam_maasvlakte', [-8.0, 49.0], [-30.0, 45.0], [-50.0, 44.0], 'halifax_port']],
            ['from' => 'rotterdam_maasvlakte', 'to' => 'montreal_port', 'km' => 5900, 'hours' => 179, 'coords' => ['rotterdam_maasvlakte', [-8.0, 49.0], [-30.0, 45.0], [-50.0, 44.0], 'montreal_port']],
            ['from' => 'rotterdam_maasvlakte', 'to' => 'singapore_port', 'km' => 15600, 'hours' => 470, 'coords' => ['rotterdam_maasvlakte', [-5.0, 36.0], [14.0, 35.0], [32.5, 30.0], [43.0, 12.5], [72.0, 12.0], [95.0, 5.8], 'singapore_port']],
            ['from' => 'rotterdam_maasvlakte', 'to' => 'shanghai_port', 'km' => 19600, 'hours' => 590, 'coords' => ['rotterdam_maasvlakte', [-5.0, 36.0], [32.5, 30.0], [43.0, 12.5], [72.0, 12.0], [95.0, 5.8], [116.0, 22.0], 'shanghai_port']],
            ['from' => 'rotterdam_maasvlakte', 'to' => 'yantian_port', 'km' => 18000, 'hours' => 545, 'coords' => ['rotterdam_maasvlakte', [-5.0, 36.0], [32.5, 30.0], [43.0, 12.5], [72.0, 12.0], [95.0, 5.8], 'yantian_port']],
            ['from' => 'singapore_port', 'to' => 'shanghai_port', 'km' => 3900, 'hours' => 118, 'coords' => ['singapore_port', [108.0, 8.0], [116.0, 22.0], 'shanghai_port']],
            ['from' => 'singapore_port', 'to' => 'busan_port', 'km' => 4700, 'hours' => 142, 'coords' => ['singapore_port', [111.0, 12.0], [122.0, 26.0], 'busan_port']],
            ['from' => 'singapore_port', 'to' => 'sydney_port', 'km' => 6300, 'hours' => 190, 'coords' => ['singapore_port', [112.0, -8.0], [130.0, -20.0], 'sydney_port']],
            ['from' => 'valencia_port', 'to' => 'jebel_ali_port', 'km' => 7600, 'hours' => 230, 'coords' => ['valencia_port', [14.0, 35.0], [32.5, 30.0], [43.0, 12.5], 'jebel_ali_port']],
            ['from' => 'piraeus_port', 'to' => 'jebel_ali_port', 'km' => 5000, 'hours' => 152, 'coords' => ['piraeus_port', [32.5, 30.0], [43.0, 12.5], 'jebel_ali_port']],
            ['from' => 'jebel_ali_port', 'to' => 'nhava_sheva_port', 'km' => 2050, 'hours' => 62, 'coords' => ['jebel_ali_port', [63.0, 23.0], 'nhava_sheva_port']],
            ['from' => 'nhava_sheva_port', 'to' => 'colombo_port', 'km' => 1500, 'hours' => 46, 'coords' => ['nhava_sheva_port', [75.0, 12.0], 'colombo_port']],
            ['from' => 'colombo_port', 'to' => 'singapore_port', 'km' => 2800, 'hours' => 85, 'coords' => ['colombo_port', [88.0, 6.0], [95.0, 5.8], 'singapore_port']],
            ['from' => 'rotterdam_maasvlakte', 'to' => 'santos_port', 'km' => 9900, 'hours' => 300, 'coords' => ['rotterdam_maasvlakte', [-10.0, 35.0], [-25.0, 10.0], [-35.0, -10.0], 'santos_port']],
            ['from' => 'santos_port', 'to' => 'buenos_aires_port', 'km' => 1800, 'hours' => 55, 'coords' => ['santos_port', [-48.0, -30.0], 'buenos_aires_port']],
            ['from' => 'rotterdam_maasvlakte', 'to' => 'durban_port', 'km' => 11300, 'hours' => 342, 'coords' => ['rotterdam_maasvlakte', [-8.0, 35.0], [5.0, 5.0], [15.0, -25.0], 'durban_port']],
            ['from' => 'durban_port', 'to' => 'cape_town_port', 'km' => 1600, 'hours' => 49, 'coords' => ['durban_port', [25.0, -35.0], 'cape_town_port']],
        ];

        foreach ($definitions as $definition) {
            $this->catalogSeaRoute($definition, $ports);
        }
    }

    /**
     * @param  array<string, Port>  $ports
     * @param  array<string, Ship>  $ships
     */
    private function syncHandlingMethods(array $ports, array $ships): void
    {
        $methods = HandlingMethod::query()->get()->keyBy('code');

        if ($methods->isEmpty()) {
            return;
        }

        foreach ($ports as $port) {
            $sync = [];

            foreach (['gantry_crane', 'crane', 'forklift', 'conveyor', 'pump'] as $code) {
                if (! isset($methods[$code])) {
                    continue;
                }

                if (
                    ($code === 'gantry_crane' && $port->supports_container)
                    || ($code === 'crane' && $port->has_crane)
                    || ($code === 'forklift' && $port->has_forklift)
                    || ($code === 'conveyor' && $port->has_conveyor)
                    || ($code === 'pump' && $port->has_pump)
                ) {
                    $sync[$methods[$code]->id] = [
                        'is_loading' => true,
                        'is_unloading' => true,
                        'throughput_override_containers_per_hour' => $port->loading_rate_containers_per_hour,
                        'throughput_override_tons_per_hour' => $port->loading_rate_tons_per_hour,
                        'notes' => 'Catalog default handling capability.',
                    ];
                }
            }

            if (! empty($sync)) {
                $port->handlingMethods()->syncWithoutDetaching($sync);
            }
        }

        foreach ($ships as $ship) {
            $sync = [];

            foreach (['crane', 'gantry_crane', 'pump', 'conveyor'] as $code) {
                if (! isset($methods[$code])) {
                    continue;
                }

                if (
                    ($code === 'crane' && $ship->has_onboard_crane)
                    || ($code === 'gantry_crane' && $ship->supports_container)
                    || ($code === 'pump' && $ship->supports_liquid)
                    || ($code === 'conveyor' && $ship->supports_bulk)
                ) {
                    $sync[$methods[$code]->id] = [
                        'is_loading' => true,
                        'is_unloading' => true,
                        'throughput_override_containers_per_hour' => $ship->loading_capacity_containers_per_hour,
                        'throughput_override_tons_per_hour' => $ship->loading_capacity_tons_per_hour,
                        'notes' => 'Catalog default onboard handling capability.',
                    ];
                }
            }

            if (! empty($sync)) {
                $ship->handlingMethods()->syncWithoutDetaching($sync);
            }
        }
    }

    /**
     * @param  array<string, Location>  $locations
     * @param  array<string, Port>  $ports
     */
    private function seedRouteTemplates(array $locations, array $ports): void
    {
        $definitions = [
            [
                'name' => 'Catalog: Riga to Helsinki cold chain',
                'points' => ['riga', 'riga_freeport', 'helsinki_vuosaari'],
                'legs' => [
                    ['type' => 'land', 'from' => 'riga', 'to' => 'riga_freeport', 'distance' => 18, 'hours' => 0.55],
                    ['type' => 'sea', 'from' => 'riga_freeport', 'to' => 'helsinki_vuosaari', 'distance' => 420, 'hours' => 14],
                ],
            ],
            [
                'name' => 'Catalog: Riga to Stockholm via Ventspils',
                'points' => ['riga', 'ventspils_port', 'stockholm_norvik'],
                'legs' => [
                    ['type' => 'land', 'from' => 'riga', 'to' => 'ventspils_port', 'distance' => 190, 'hours' => 2.8],
                    ['type' => 'sea', 'from' => 'ventspils_port', 'to' => 'stockholm_norvik', 'distance' => 360, 'hours' => 12],
                ],
            ],
            [
                'name' => 'Catalog: Riga to Hamburg feeder export',
                'points' => ['riga', 'riga_freeport', 'hamburg_port'],
                'legs' => [
                    ['type' => 'land', 'from' => 'riga', 'to' => 'riga_freeport', 'distance' => 18, 'hours' => 0.55],
                    ['type' => 'sea', 'from' => 'riga_freeport', 'to' => 'hamburg_port', 'distance' => 1320, 'hours' => 44],
                ],
            ],
            [
                'name' => 'Catalog: Riga to Rotterdam overland',
                'points' => ['riga', 'rotterdam_maasvlakte'],
                'legs' => [
                    ['type' => 'land', 'from' => 'riga', 'to' => 'rotterdam_maasvlakte', 'distance' => 1680, 'hours' => 22.5],
                ],
            ],
            [
                'name' => 'Catalog: Riga to Newark via Rotterdam',
                'points' => ['riga', 'rotterdam_maasvlakte', 'newark_port'],
                'legs' => [
                    ['type' => 'land', 'from' => 'riga', 'to' => 'rotterdam_maasvlakte', 'distance' => 1680, 'hours' => 22.5],
                    ['type' => 'sea', 'from' => 'rotterdam_maasvlakte', 'to' => 'newark_port', 'distance' => 6200, 'hours' => 188],
                ],
            ],
            [
                'name' => 'Catalog: Kaunas to Stockholm via Klaipeda',
                'points' => ['kaunas', 'klaipeda_port', 'stockholm_norvik'],
                'legs' => [
                    ['type' => 'land', 'from' => 'kaunas', 'to' => 'klaipeda_port', 'distance' => 215, 'hours' => 3.0],
                    ['type' => 'sea', 'from' => 'klaipeda_port', 'to' => 'stockholm_norvik', 'distance' => 520, 'hours' => 18],
                ],
            ],
            [
                'name' => 'Catalog: Riga to Singapore via Rotterdam',
                'points' => ['riga', 'rotterdam_maasvlakte', 'singapore_port'],
                'legs' => [
                    ['type' => 'land', 'from' => 'riga', 'to' => 'rotterdam_maasvlakte', 'distance' => 1680, 'hours' => 22.5],
                    ['type' => 'sea', 'from' => 'rotterdam_maasvlakte', 'to' => 'singapore_port', 'distance' => 15600, 'hours' => 470],
                ],
            ],
            [
                'name' => 'Catalog: Riga to Shanghai via Rotterdam',
                'points' => ['riga', 'rotterdam_maasvlakte', 'shanghai_port'],
                'legs' => [
                    ['type' => 'land', 'from' => 'riga', 'to' => 'rotterdam_maasvlakte', 'distance' => 1680, 'hours' => 22.5],
                    ['type' => 'sea', 'from' => 'rotterdam_maasvlakte', 'to' => 'shanghai_port', 'distance' => 19600, 'hours' => 590],
                ],
            ],
        ];

        foreach ($definitions as $definition) {
            $this->catalogRouteTemplate($definition, $locations, $ports);
        }
    }

    private function city(string $name, string $country): City
    {
        return City::query()->updateOrCreate(
            ['name' => $name, 'country' => $country],
            []
        );
    }

    private function catalogLocation(array $definition, City $city): Location
    {
        $location = Location::query()
            ->where('source', self::SOURCE)
            ->where('external_id', $definition['key'])
            ->first();

        if (! $location) {
            $location = Location::query()
                ->where('name', $definition['name'])
                ->where('type', $definition['type'])
                ->where('country', $definition['country'])
                ->first();
        }

        $attributes = [
            'name' => $definition['name'],
            'type' => $definition['type'],
            'country' => $definition['country'],
            'city_id' => $city->id,
            'city' => $definition['city'],
            'address' => $definition['address'] ?? $definition['name'].', '.$definition['country'],
            'latitude' => $definition['lat'],
            'longitude' => $definition['lng'],
            'source' => self::SOURCE,
            'external_id' => $definition['key'],
            'metadata' => [
                'catalog_version' => 1,
                'seeded_by' => static::class,
            ],
            'notes' => $definition['notes'] ?? 'Seeded global logistics catalog location.',
        ];

        if ($location) {
            $location->fill($attributes)->save();

            return $location;
        }

        return Location::query()->create($attributes);
    }

    private function catalogLandRoute(array $definition, array $locations): LandRoute
    {
        $from = $locations[$definition['from']];
        $to = $locations[$definition['to']];
        $route = LandRoute::query()
            ->where('from_location_id', $from->id)
            ->where('to_location_id', $to->id)
            ->first();

        $attributes = [
            'distance_km' => $definition['distance'],
            'estimated_time_hours' => $definition['hours'],
            'toll_cost' => $definition['toll'] ?? 0,
            'geometry_geojson' => $this->lineString($definition['coords'], $locations),
            'provider' => 'catalog',
            'notes' => 'Seeded catalog corridor. Distances are educational route approximations, not live navigation quotes.',
        ];

        if ($route) {
            if (in_array($route->provider, [null, 'catalog', 'demo', 'approximation'], true)) {
                $route->fill($attributes)->save();
            }

            return $route;
        }

        return LandRoute::query()->create([
            'from_location_id' => $from->id,
            'to_location_id' => $to->id,
            ...$attributes,
        ]);
    }

    private function catalogSeaRoute(array $definition, array $ports): SeaRoute
    {
        $origin = $ports[$definition['from']];
        $destination = $ports[$definition['to']];
        $route = SeaRoute::query()
            ->where('origin_port_id', $origin->id)
            ->where('destination_port_id', $destination->id)
            ->first();

        $attributes = [
            'distance_km' => $definition['km'],
            'distance_nm' => round($definition['km'] / 1.852, 2),
            'duration_hours' => $definition['hours'],
            'geometry_geojson' => $this->lineString($definition['coords'], $this->portLocations($ports)),
            'provider' => 'catalog',
            'notes' => 'Seeded manual sea corridor for study simulation. Geometry is a corridor polyline, not a live AIS track.',
        ];

        if ($route) {
            if (in_array($route->provider, [null, 'catalog', 'demo', 'approximation'], true)) {
                $route->fill($attributes)->save();
            }

            return $route;
        }

        return SeaRoute::query()->create([
            'origin_port_id' => $origin->id,
            'destination_port_id' => $destination->id,
            ...$attributes,
        ]);
    }

    private function catalogRouteTemplate(array $definition, array $locations, array $ports): RouteTemplate
    {
        return DB::transaction(function () use ($definition, $locations, $ports) {
            $template = RouteTemplate::query()->updateOrCreate(
                ['name' => $definition['name'], 'created_by' => null],
                [
                    'description' => 'Seeded study corridor with explicit land/sea legs.',
                    'mode' => 'catalog',
                    'total_distance_km' => collect($definition['legs'])->sum(fn ($leg) => (float) $leg['distance']),
                    'total_duration_hours' => collect($definition['legs'])->sum(fn ($leg) => (float) $leg['hours']),
                    'metadata' => [
                        'source' => self::SOURCE,
                        'catalog_version' => 1,
                    ],
                ]
            );

            RouteTemplateLeg::query()->where('route_template_id', $template->id)->delete();
            RouteTemplatePoint::query()->where('route_template_id', $template->id)->delete();

            $points = [];

            foreach (array_values($definition['points']) as $sequence => $locationKey) {
                $location = $locations[$locationKey];
                $points[$locationKey] = RouteTemplatePoint::query()->create([
                    'route_template_id' => $template->id,
                    'sequence' => $sequence,
                    'label' => chr(65 + $sequence),
                    'location_id' => $location->id,
                    'name' => $location->name,
                    'latitude' => $location->latitude,
                    'longitude' => $location->longitude,
                    'point_type' => $location->type ?? 'custom',
                    'metadata' => [
                        'source' => self::SOURCE,
                    ],
                ]);
            }

            $templateCoordinates = [];

            foreach (array_values($definition['legs']) as $sequence => $leg) {
                $geometry = $this->catalogRouteTemplateLegGeometry($leg, $locations, $ports);
                $coordinates = $geometry['coordinates'] ?? [];
                foreach ($coordinates as $coordinate) {
                    if ($templateCoordinates === [] || end($templateCoordinates) !== $coordinate) {
                        $templateCoordinates[] = $coordinate;
                    }
                }

                RouteTemplateLeg::query()->create([
                    'route_template_id' => $template->id,
                    'sequence' => $sequence,
                    'type' => $leg['type'],
                    'origin_point_id' => $points[$leg['from']]->id,
                    'destination_point_id' => $points[$leg['to']]->id,
                    'distance_km' => $leg['distance'],
                    'duration_hours' => $leg['hours'],
                    'cost' => null,
                    'provider' => 'catalog',
                    'geometry_geojson' => $geometry,
                    'warnings' => [],
                    'errors' => [],
                ]);
            }

            $template->forceFill([
                'geometry_geojson' => [
                    'type' => 'LineString',
                    'coordinates' => $templateCoordinates,
                ],
            ])->save();

            return $template->load(['points', 'legs']);
        });
    }

    private function catalogRouteTemplateLegGeometry(array $leg, array $locations, array $ports): array
    {
        $from = $locations[$leg['from']] ?? null;
        $to = $locations[$leg['to']] ?? null;

        if (($leg['type'] ?? null) === 'land' && $from && $to) {
            $route = LandRoute::query()
                ->where('from_location_id', $from->id)
                ->where('to_location_id', $to->id)
                ->first();

            if (is_array($route?->geometry_geojson)) {
                return $route->geometry_geojson;
            }
        }

        if (($leg['type'] ?? null) === 'sea') {
            $origin = $ports[$leg['from']] ?? null;
            $destination = $ports[$leg['to']] ?? null;

            if ($origin && $destination) {
                $route = SeaRoute::query()
                    ->where('origin_port_id', $origin->id)
                    ->where('destination_port_id', $destination->id)
                    ->first();

                if (is_array($route?->geometry_geojson)) {
                    return $route->geometry_geojson;
                }
            }
        }

        return $this->lineString([$leg['from'], $leg['to']], $locations);
    }

    /**
     * @param  array<int, string|array{0: float, 1: float}>  $points
     * @param  array<string, Location>  $locations
     */
    private function lineString(array $points, array $locations): array
    {
        return [
            'type' => 'LineString',
            'coordinates' => collect($points)
                ->map(function ($point) use ($locations) {
                    if (is_array($point)) {
                        return [(float) $point[0], (float) $point[1]];
                    }

                    $location = $locations[$point] ?? null;

                    return [
                        (float) ($location?->longitude ?? 0),
                        (float) ($location?->latitude ?? 0),
                    ];
                })
                ->values()
                ->all(),
        ];
    }

    /**
     * @param  array<string, Port>  $ports
     * @return array<string, Location>
     */
    private function portLocations(array $ports): array
    {
        return collect($ports)
            ->mapWithKeys(fn (Port $port, string $key) => [$key => $port->location])
            ->filter()
            ->all();
    }
}
