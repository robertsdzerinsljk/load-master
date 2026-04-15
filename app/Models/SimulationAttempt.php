<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SimulationAttempt extends Model
{
protected $fillable = [
    'order_template_id',
    'user_id',
    'status',
    'current_step',
    'selected_transport_template_id',
    'selected_land_route_id',
    'selected_fuel_station_id',
    'selected_vehicle_count',
    'preview_result',
    'submitted_at',
];

    protected $casts = [
        'preview_result' => 'array',
        'submitted_at' => 'datetime',
        'selected_vehicle_count' => 'integer',
    ];

    public function orderTemplate(): BelongsTo
    {
        return $this->belongsTo(OrderTemplate::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function selectedTransportTemplate(): BelongsTo
    {
        return $this->belongsTo(TransportTemplate::class, 'selected_transport_template_id');
    }

    public function selectedLandRoute(): BelongsTo
    {
        return $this->belongsTo(LandRoute::class, 'selected_land_route_id');
    }

    public function selectedFuelStation(): BelongsTo
    {
        return $this->belongsTo(FuelStation::class, 'selected_fuel_station_id');
    }
}