<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderTemplate extends Model
{
    protected $fillable = [
        'title',
        'scenario_type',
        'scenario_focus',
        'status',
        'description',
        'student_brief',
        'teacher_notes',
        'cargo_name',
        'cargo_type',
        'cargo_amount_containers',
        'cargo_amount_tons',
        'cargo_volume_m3',
        'cargo_value',
        'temperature_mode_id',
        'special_condition_id',
        'start_location_id',
        'end_location_id',
        'start_port_id',
        'end_port_id',
        'deadline_date',
        'scenario_start_at',
        'deadline_at',
        'budget_limit',
        'requires_refuel_planning',
        'max_trips',
        'priority',
        'step_config',
        'scenario_config',
    ];

    protected $casts = [
        'cargo_amount_containers' => 'integer',
        'cargo_amount_tons' => 'decimal:2',
        'cargo_volume_m3' => 'decimal:2',
        'cargo_value' => 'decimal:2',
        'budget_limit' => 'decimal:2',
        'requires_refuel_planning' => 'boolean',
        'max_trips' => 'integer',
        'deadline_date' => 'date',
        'scenario_start_at' => 'datetime',
        'deadline_at' => 'datetime',
        'step_config' => 'array',
        'scenario_config' => 'array',
    ];

    public function temperatureMode(): BelongsTo
    {
        return $this->belongsTo(TemperatureMode::class, 'temperature_mode_id');
    }

    public function specialCondition(): BelongsTo
    {
        return $this->belongsTo(SpecialCondition::class, 'special_condition_id');
    }

    public function startLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'start_location_id');
    }

    public function endLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'end_location_id');
    }

    public function startPort(): BelongsTo
    {
        return $this->belongsTo(Port::class, 'start_port_id');
    }

    public function endPort(): BelongsTo
    {
        return $this->belongsTo(Port::class, 'end_port_id');
    }

    public function transportTemplates(): BelongsToMany
    {
        return $this->belongsToMany(
            TransportTemplate::class,
            'order_template_transport_templates'
        );
    }

    public function ships(): BelongsToMany
    {
        return $this->belongsToMany(Ship::class, 'order_template_ships');
    }

    public function ports(): BelongsToMany
    {
        return $this->belongsToMany(Port::class, 'order_template_ports');
    }

    public function landRoutes(): BelongsToMany
    {
        return $this->belongsToMany(
            LandRoute::class,
            'order_template_land_routes'
        );
    }

    public function assignedStudents(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'order_template_user')
            ->withPivot('assigned_at')
            ->withTimestamps();
    }

    public function simulationAttempts(): HasMany
    {
        return $this->hasMany(SimulationAttempt::class);
    }

    public function fuelStations(): BelongsToMany
    {
        return $this->belongsToMany(FuelStation::class, 'order_template_fuel_station');
    }
}