<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SimulationAttempt extends Model
{
    protected $casts = [
        'preview_result' => 'array',
        'handling_context' => 'array',
        'submitted_at' => 'datetime',
        'is_valid' => 'boolean',
        'loading_duration_minutes' => 'decimal:2',
        'unloading_duration_minutes' => 'decimal:2',
    ];

    protected $fillable = [
        'user_id',
        'order_template_id',

        'selected_transport_template_id',
        'selected_temperature_mode_id',
        'selected_port_id',
        'selected_ship_id',
        'selected_special_condition_id',
        'selected_vehicle_count',

        'selected_loading_method_code',
        'selected_unloading_method_code',
        'loading_method_source',
        'unloading_method_source',
        'loading_duration_minutes',
        'unloading_duration_minutes',

        'current_step',
        'status',

        'score',
        'total_cost',
        'total_time_hours',
        'total_fuel_liters',
        'is_valid',
        'feedback_text',
        'preview_result',
        'handling_context',
        'submitted_at',

        'assignment_id',
    ];

    protected $appends = [
        'ordered_route_segments',
        'ordered_fuel_stations',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orderTemplate(): BelongsTo
    {
        return $this->belongsTo(OrderTemplate::class);
    }

    public function selectedTransportTemplate(): BelongsTo
    {
        return $this->belongsTo(TransportTemplate::class, 'selected_transport_template_id');
    }

    public function selectedTemperatureMode(): BelongsTo
    {
        return $this->belongsTo(TemperatureMode::class, 'selected_temperature_mode_id');
    }

    public function selectedPort(): BelongsTo
    {
        return $this->belongsTo(Port::class, 'selected_port_id');
    }

    public function feedback()
    {
        return $this->hasOne(\App\Models\TeacherFeedback::class, 'simulation_attempt_id');
    }

    public function selectedShip(): BelongsTo
    {
        return $this->belongsTo(Ship::class, 'selected_ship_id');
    }

    public function selectedSpecialCondition(): BelongsTo
    {
        return $this->belongsTo(SpecialCondition::class, 'selected_special_condition_id');
    }

    public function routeSegments(): BelongsToMany
    {
        return $this->belongsToMany(
            LandRoute::class,
            'simulation_attempt_route_segments'
        )->withPivot('position')
         ->withTimestamps()
         ->orderBy('simulation_attempt_route_segments.position');
    }

    public function fuelStations(): BelongsToMany
    {
        return $this->belongsToMany(
            FuelStation::class,
            'simulation_attempt_fuel_stations'
        )->withPivot('position')
         ->withTimestamps()
         ->orderBy('simulation_attempt_fuel_stations.position');
    }

    public function getOrderedRouteSegmentsAttribute()
    {
        if (!$this->relationLoaded('routeSegments')) {
            return [];
        }

        return $this->routeSegments->map(function ($segment) {
            return [
                'id' => $segment->id,
                'distance_km' => $segment->distance_km,
                'fromLocation' => $segment->fromLocation ? [
                    'name' => $segment->fromLocation->name,
                ] : null,
                'toLocation' => $segment->toLocation ? [
                    'name' => $segment->toLocation->name,
                ] : null,
                'pivot' => [
                    'position' => $segment->pivot?->position,
                ],
            ];
        })->values();
    }

    public function getOrderedFuelStationsAttribute()
    {
        if (!$this->relationLoaded('fuelStations')) {
            return [];
        }

        return $this->fuelStations->map(function ($station) {
            return [
                'id' => $station->id,
                'name' => $station->display_name ?? '—',
                'location_name' => $station->location_name ?? null,
                'fuel_type' => $station->fuel_type,
                'price_per_liter' => $station->price_per_liter,
                'pivot' => [
                    'position' => $station->pivot?->position,
                ],
            ];
        })->values();
    }
}
