<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteTemplatePoint extends Model
{
    protected $fillable = [
        'route_template_id',
        'sequence',
        'label',
        'location_id',
        'name',
        'latitude',
        'longitude',
        'point_type',
        'metadata',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'metadata' => 'array',
    ];

    public function routeTemplate(): BelongsTo
    {
        return $this->belongsTo(RouteTemplate::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}
