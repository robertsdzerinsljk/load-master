<?php

return [
    'place_search_provider' => env('PLACE_SEARCH_PROVIDER', 'local'),
    'enable_external_place_search' => (bool) env('ENABLE_EXTERNAL_PLACE_SEARCH', false),
    'nominatim_base_url' => env('NOMINATIM_BASE_URL', 'https://nominatim.openstreetmap.org'),
    'maptiler_api_key' => env('MAPTILER_API_KEY'),
    'geonames_enabled' => (bool) env('GEONAMES_ENABLED', false),
    'default_country_filter' => env('PLACE_SEARCH_DEFAULT_COUNTRY'),
    'place_search_cache_enabled' => (bool) env('PLACE_SEARCH_CACHE_ENABLED', true),
];
