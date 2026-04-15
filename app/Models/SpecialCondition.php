<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpecialCondition extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];
}