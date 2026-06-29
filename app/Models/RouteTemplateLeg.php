<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteTemplateLeg extends Model
{
    protected $fillable = [
        'route_template_id',
        'sequence',
        'type',
        'origin_point_id',
        'destination_point_id',
        'distance_km',
        'duration_hours',
        'cost',
        'provider',
        'geometry_geojson',
        'warnings',
        'errors',
    ];

    protected $casts = [
        'distance_km' => 'decimal:2',
        'duration_hours' => 'decimal:2',
        'cost' => 'decimal:2',
        'geometry_geojson' => 'array',
        'warnings' => 'array',
        'errors' => 'array',
    ];

    public function routeTemplate(): BelongsTo
    {
        return $this->belongsTo(RouteTemplate::class);
    }

    public function originPoint(): BelongsTo
    {
        return $this->belongsTo(RouteTemplatePoint::class, 'origin_point_id');
    }

    public function destinationPoint(): BelongsTo
    {
        return $this->belongsTo(RouteTemplatePoint::class, 'destination_point_id');
    }
}
