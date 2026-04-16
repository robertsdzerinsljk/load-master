<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FuelStation extends Model
{
    protected $fillable = [
        'location_id',
        'fuel_type',
        'price_per_liter',
        'notes',
    ];

    protected $appends = [
        'display_name',
        'location_name',
    ];

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function getDisplayNameAttribute(): string
    {
        $fuelType = $this->fuel_type ? strtoupper($this->fuel_type) : 'Fuel station';
        $locationName = $this->location?->name;

        return $locationName
            ? "{$fuelType} — {$locationName}"
            : $fuelType;
    }

    public function getLocationNameAttribute(): ?string
    {
        return $this->location?->name;
    }
}