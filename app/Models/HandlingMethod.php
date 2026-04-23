<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class HandlingMethod extends Model
{
    protected $fillable = [
        'name',
        'code',
        'category',
        'requires_equipment',
        'requires_operator',
        'supports_bulk',
        'supports_container',
        'supports_liquid',
        'supports_refrigerated',
        'supports_hazardous',
        'throughput_containers_per_hour',
        'throughput_tons_per_hour',
        'notes',
    ];

    protected $casts = [
        'requires_equipment' => 'boolean',
        'requires_operator' => 'boolean',
        'supports_bulk' => 'boolean',
        'supports_container' => 'boolean',
        'supports_liquid' => 'boolean',
        'supports_refrigerated' => 'boolean',
        'supports_hazardous' => 'boolean',
        'throughput_containers_per_hour' => 'decimal:2',
        'throughput_tons_per_hour' => 'decimal:2',
    ];

    public function ports(): BelongsToMany
    {
        return $this->belongsToMany(Port::class, 'handling_method_port')
            ->withPivot([
                'is_loading',
                'is_unloading',
                'throughput_override_containers_per_hour',
                'throughput_override_tons_per_hour',
                'notes',
            ])
            ->withTimestamps();
    }

    public function ships(): BelongsToMany
    {
        return $this->belongsToMany(Ship::class, 'handling_method_ship')
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