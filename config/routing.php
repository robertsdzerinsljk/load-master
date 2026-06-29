<?php

return [
    'map_provider' => env('MAP_PROVIDER', 'openstreetmap'),
    'land_routing_provider' => env('LAND_ROUTING_PROVIDER', 'osrm'),
    'sea_routing_provider' => env('SEA_ROUTING_PROVIDER', 'manual'),
    'osrm_base_url' => rtrim((string) env('OSRM_BASE_URL', 'https://router.project-osrm.org'), '/'),
    'osrm_verify_ssl' => (bool) env('OSRM_VERIFY_SSL', true),
    'route_cache_enabled' => env('ROUTE_CACHE_ENABLED', true),
];
