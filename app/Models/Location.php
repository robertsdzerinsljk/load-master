<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Location extends Model
{
    protected $fillable = [
        'name',
        'type',
        'country',
        'city_id',
        'city',
        'address',
        'latitude',
        'longitude',
        'notes',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    public function linkedCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'city_id');
    }

    public function outgoingLandRoutes(): HasMany
    {
        return $this->hasMany(LandRoute::class, 'from_location_id');
    }

    public function incomingLandRoutes(): HasMany
    {
        return $this->hasMany(LandRoute::class, 'to_location_id');
    }
    public function fuelStation(): HasOne
    {
        return $this->hasOne(FuelStation::class);
    }
}
