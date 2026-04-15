<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomsDocument extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];
}