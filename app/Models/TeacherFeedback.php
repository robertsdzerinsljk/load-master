<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeacherFeedback extends Model
{
    protected $table = 'teacher_feedback';

    protected $fillable = [
        'assignment_id',
        'simulation_attempt_id',
        'grade',
        'comment',
    ];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(SimulationAttempt::class, 'simulation_attempt_id');
    }
}