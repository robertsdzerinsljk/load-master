<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;


class Port extends Model
{
    protected $fillable = [
        'name',
        'country',
        'location_id',
        'max_draft_m',
        'city_distance_km',
        'loading_rate_containers_per_hour',
        'loading_rate_tons_per_hour',
        'supports_bulk',
        'supports_container',
        'supports_liquid',
        'supports_refrigerated',
        'supports_hazardous',
        'has_crane',
        'has_forklift',
        'has_pump',
        'has_conveyor',
        'notes',
    ];

    protected $casts = [
        'max_draft_m' => 'decimal:2',
        'city_distance_km' => 'decimal:2',
        'loading_rate_containers_per_hour' => 'decimal:2',
        'loading_rate_tons_per_hour' => 'decimal:2',
        'supports_bulk' => 'boolean',
        'supports_container' => 'boolean',
        'supports_liquid' => 'boolean',
        'supports_refrigerated' => 'boolean',
        'supports_hazardous' => 'boolean',
        'has_crane' => 'boolean',
        'has_forklift' => 'boolean',
        'has_pump' => 'boolean',
        'has_conveyor' => 'boolean',
    ];

    protected $appends = [
        'location_name',
    ];

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function orderTemplates(): BelongsToMany
    {
        return $this->belongsToMany(OrderTemplate::class, 'order_template_ports');
    }

    public function getLocationNameAttribute(): ?string
    {
        return $this->location?->name;
    }
    
    public function handlingMethods(): BelongsToMany
    {
    return $this->belongsToMany(HandlingMethod::class, 'handling_method_port')
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