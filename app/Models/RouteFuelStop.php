<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteFuelStop extends Model
{
    protected $fillable = [
        'land_route_id',
        'fuel_station_id',
        'distance_from_start_km',
        'notes',
    ];

    protected $casts = [
        'distance_from_start_km' => 'decimal:2',
    ];

    public function landRoute(): BelongsTo
    {
        return $this->belongsTo(LandRoute::class);
    }

    public function fuelStation(): BelongsTo
    {
        return $this->belongsTo(FuelStation::class);
    }
}