<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RouteTemplate extends Model
{
    protected $fillable = [
        'name',
        'description',
        'created_by',
        'mode',
        'total_distance_km',
        'total_duration_hours',
        'geometry_geojson',
        'metadata',
    ];

    protected $casts = [
        'total_distance_km' => 'decimal:2',
        'total_duration_hours' => 'decimal:2',
        'geometry_geojson' => 'array',
        'metadata' => 'array',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function points(): HasMany
    {
        return $this->hasMany(RouteTemplatePoint::class)->orderBy('sequence');
    }

    public function legs(): HasMany
    {
        return $this->hasMany(RouteTemplateLeg::class)->orderBy('sequence');
    }
}
