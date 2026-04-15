<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Port extends Model
{
    protected $fillable = [
        'name',
        'country',
        'max_draft_m',
        'city_distance_km',
        'loading_rate_containers_per_hour',
        'loading_rate_tons_per_hour',
        'notes',
    ];

    protected $casts = [
        'max_draft_m' => 'decimal:2',
        'city_distance_km' => 'decimal:2',
        'loading_rate_containers_per_hour' => 'decimal:2',
        'loading_rate_tons_per_hour' => 'decimal:2',
    ];
}