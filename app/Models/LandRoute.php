<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LandRoute extends Model
{
    protected $fillable = [
        'from_location_id',
        'to_location_id',
        'distance_km',
        'estimated_time_hours',
        'toll_cost',
        'notes',
    ];

    protected $casts = [
        'distance_km' => 'decimal:2',
        'estimated_time_hours' => 'decimal:2',
        'toll_cost' => 'decimal:2',
    ];

    public function fromLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'from_location_id');
    }

    public function toLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'to_location_id');
    }
    public function fuelStops(): HasMany
    {
        return $this->hasMany(RouteFuelStop::class);
    }
}