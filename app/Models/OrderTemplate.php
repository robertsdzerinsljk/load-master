<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class OrderTemplate extends Model
{
    protected $fillable = [
        'title',
        'scenario_type',
        'scenario_focus',
        'evaluation_mode',
        'status',
        'description',
        'student_brief',
        'teacher_notes',
        'cargo_name',
        'cargo_type',
        'cargo_mode',
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
        'budget_limit',
        'requires_refuel_planning',
        'max_trips',
        'priority',
        'step_config',
        'scenario_config',
        'scenario_start_at',
        'deadline_at',
        'requires_closed_space',
        'requires_ventilation',
        'requires_hazardous_support',
        'allowed_ship_cargo_modes',
        'forbidden_ship_cargo_modes',
        'requires_loading_method_choice',
        'requires_unloading_method_choice',
        'allow_manual_handling',
        'allow_port_equipment',
        'allow_ship_equipment',
        'allowed_handling_method_codes',
        'required_handling_method_codes',
    ];

    protected $casts = [
        'cargo_amount_containers' => 'integer',
        'cargo_amount_tons' => 'decimal:2',
        'cargo_volume_m3' => 'decimal:2',
        'cargo_value' => 'decimal:2',
        'deadline_date' => 'date',
        'budget_limit' => 'decimal:2',
        'requires_refuel_planning' => 'boolean',
        'max_trips' => 'integer',
        'step_config' => 'array',
        'scenario_config' => 'array',
        'scenario_start_at' => 'datetime',
        'deadline_at' => 'datetime',
        'requires_closed_space' => 'boolean',
        'requires_ventilation' => 'boolean',
        'requires_hazardous_support' => 'boolean',
        'allowed_ship_cargo_modes' => 'array',
        'forbidden_ship_cargo_modes' => 'array',
        'requires_loading_method_choice' => 'boolean',
        'requires_unloading_method_choice' => 'boolean',
        'allow_manual_handling' => 'boolean',
        'allow_port_equipment' => 'boolean',
        'allow_ship_equipment' => 'boolean',
        'allowed_handling_method_codes' => 'array',
        'required_handling_method_codes' => 'array',
    ];

    public function temperatureMode(): BelongsTo
    {
        return $this->belongsTo(TemperatureMode::class);
    }

    public function specialCondition(): BelongsTo
    {
        return $this->belongsTo(SpecialCondition::class);
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
        return $this->belongsToMany(TransportTemplate::class, 'order_template_transport_templates');
    }

    public function ports(): BelongsToMany
    {
        return $this->belongsToMany(Port::class, 'order_template_ports');
    }

    public function landRoutes(): BelongsToMany
    {
        return $this->belongsToMany(LandRoute::class, 'order_template_land_routes');
    }

    public function ships(): BelongsToMany
    {
        return $this->belongsToMany(Ship::class, 'order_template_ships');
    }

    public function fuelStations(): BelongsToMany
    {
        return $this->belongsToMany(FuelStation::class, 'order_template_fuel_station');
    }

    public function assignedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'order_template_user')
            ->withPivot('assigned_at')
            ->withTimestamps();
    }

    public function assignedStudents(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'order_template_user')
            ->where('users.role', 'student')
            ->withPivot('assigned_at')
            ->withTimestamps();
    }
}
