<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FuelStation extends Model
{
    protected $fillable = [
        'location_id',
        'fuel_type',
        'price_per_liter',
        'notes',
    ];

    protected $casts = [
        'price_per_liter' => 'decimal:2',
    ];

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function routeFuelStops(): HasMany
    {
        return $this->hasMany(RouteFuelStop::class);
    }
}