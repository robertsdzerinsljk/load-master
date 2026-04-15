<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransportTemplate extends Model
{
    protected $fillable = [
        'name',
        'type',
        'description',
        'capacity',
        'temperature_support',
        'capacity_containers',
        'capacity_tons',
        'avg_speed_kmh',
        'cost_per_km',
        'fuel_consumption_per_100km',
        'max_range_km',
        'loading_time_minutes',
        'unloading_time_minutes',
    ];

    protected $casts = [
        'capacity_containers' => 'integer',
        'capacity_tons' => 'decimal:2',
        'avg_speed_kmh' => 'decimal:2',
        'cost_per_km' => 'decimal:2',
        'fuel_consumption_per_100km' => 'decimal:2',
        'max_range_km' => 'decimal:2',
        'loading_time_minutes' => 'integer',
        'unloading_time_minutes' => 'integer',
    ];
}