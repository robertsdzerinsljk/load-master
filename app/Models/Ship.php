<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ship extends Model
{
    protected $fillable = [
        'name',
        'cargo_type',
        'capacity_containers',
        'capacity_tons',
        'draft_m',
        'fuel_consumption_per_hour',
        'speed_kmh',
        'loading_capacity_containers_per_hour',
        'loading_capacity_tons_per_hour',
        'notes',
    ];

    protected $casts = [
        'capacity_containers' => 'integer',
        'capacity_tons' => 'decimal:2',
        'draft_m' => 'decimal:2',
        'fuel_consumption_per_hour' => 'decimal:2',
        'speed_kmh' => 'decimal:2',
        'loading_capacity_containers_per_hour' => 'decimal:2',
        'loading_capacity_tons_per_hour' => 'decimal:2',
    ];
}