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
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orderTemplate(): BelongsTo
    {
        return $this->belongsTo(OrderTemplate::class);
    }
}