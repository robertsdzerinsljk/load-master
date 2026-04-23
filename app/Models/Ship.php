<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Ship extends Model
{
    protected $fillable = [
        'name',
        'cargo_type',
        'cargo_mode',
        'is_open_cargo',
        'is_closed_cargo',
        'supports_bulk',
        'supports_container',
        'supports_liquid',
        'supports_refrigerated',
        'supports_hazardous',
        'has_onboard_crane',
        'draft_m',
        'fuel_consumption_per_hour',
        'speed_kmh',
        'capacity_containers',
        'capacity_tons',
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
        'is_open_cargo' => 'boolean',
        'is_closed_cargo' => 'boolean',
        'supports_bulk' => 'boolean',
        'supports_container' => 'boolean',
        'supports_liquid' => 'boolean',
        'supports_refrigerated' => 'boolean',
        'supports_hazardous' => 'boolean',
        'has_onboard_crane' => 'boolean',
    ];

    public function orderTemplates(): BelongsToMany
    {
        return $this->belongsToMany(OrderTemplate::class, 'order_template_ships');
    }

    public function handlingMethods(): BelongsToMany
    {
    return $this->belongsToMany(HandlingMethod::class, 'handling_method_ship')
        ->withPivot([
            'is_loading',
            'is_unloading',
            'throughput_override_containers_per_hour',
            'throughput_override_tons_per_hour',
            'notes',
        ])
        ->withTimestamps();
    }
}