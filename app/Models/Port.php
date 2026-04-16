<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Port extends Model
{
    protected $fillable = [
        'name',
        'country',
        'city',
        'location_id',
        'depth_m',
        'max_depth_m',
        'draft_limit_m',
    ];

    protected $appends = [
        'location_name',
        'depth_value',
    ];

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function getLocationNameAttribute(): ?string
    {
        if ($this->location?->name) {
            return $this->location->name;
        }

        if (!empty($this->city) && !empty($this->country)) {
            return "{$this->city}, {$this->country}";
        }

        return $this->city ?? $this->country ?? null;
    }

    public function getDepthValueAttribute()
    {
        return $this->depth_m
            ?? $this->max_depth_m
            ?? $this->draft_limit_m
            ?? null;
    }
}