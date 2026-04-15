<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TemperatureMode extends Model
{
    protected $fillable = [
        'name',
        'description',
        'range',
    ];
}