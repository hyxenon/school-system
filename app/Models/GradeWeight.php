<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradeWeight extends Model
{
    use HasFactory;

    protected $fillable = [
        'schedule_id',
        'assignment_weight',
        'quiz_weight',
        'exam_weight',
    ];

    /**
     * Get the schedule that owns the grade weights.
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }
}
