<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeaRoute extends Model
{
    protected $fillable = [
        'origin_port_id',
        'destination_port_id',
        'distance_km',
        'distance_nm',
        'duration_hours',
        'geometry_geojson',
        'provider',
        'notes',
    ];

    protected $casts = [
        'distance_km' => 'decimal:2',
        'distance_nm' => 'decimal:2',
        'duration_hours' => 'decimal:2',
        'geometry_geojson' => 'array',
    ];

    public function originPort(): BelongsTo
    {
        return $this->belongsTo(Port::class, 'origin_port_id');
    }

    public function destinationPort(): BelongsTo
    {
        return $this->belongsTo(Port::class, 'destination_port_id');
    }
}
