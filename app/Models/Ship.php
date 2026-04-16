<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ship extends Model
{
    protected $fillable = [
        'name',
        'ship_type',
        'draft_m',
        'draught_m',
        'required_depth_m',
        'capacity_containers',
        'container_capacity',
        'capacity_tons',
    ];

    protected $appends = [
        'draft_value',
        'capacity_containers_value',
    ];

    public function getDraftValueAttribute()
    {
        return $this->draft_m
            ?? $this->draught_m
            ?? $this->required_depth_m
            ?? null;
    }

    public function getCapacityContainersValueAttribute()
    {
        return $this->capacity_containers
            ?? $this->container_capacity
            ?? null;
    }
}