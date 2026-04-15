<?php

namespace App\Models;

use App\Models\SchoolClass;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable([
    'name',
    'email',
    'password',
    'role',
    'class_id'
])]
#[Hidden([
    'password',
    'two_factor_secret',
    'two_factor_recovery_codes',
    'remember_token'
])]
class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function class()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function teachingClasses()
    {
        return $this->hasMany(SchoolClass::class, 'teacher_id');
    }

    public function studentOrders()
    {
        return $this->hasMany(StudentOrder::class, 'student_id');
    }

    public function templates()
    {
        return $this->hasMany(OrderTemplate::class, 'teacher_id');
    }

    public function assignedOrderTemplates(): BelongsToMany
{
    return $this->belongsToMany(OrderTemplate::class, 'order_template_user')
        ->withPivot('assigned_at')
        ->withTimestamps();
}

    public function simulationAttempts(): HasMany
    {
        return $this->hasMany(SimulationAttempt::class);
    }
}