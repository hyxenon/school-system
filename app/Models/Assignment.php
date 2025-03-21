<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    /** @use HasFactory<\Database\Factories\AssignmentFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'due_date',
        'assessment_type',
        'period', // Make sure this is included
        'total_points',
        'subject_id',
        'schedule_id',
        'created_by',
        'year_level',
        'block',
    ];

    protected $casts = [
        'due_date' => 'datetime',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    public function studentSubmissions()
    {
        return $this->hasMany(AssignmentSubmission::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(Employee::class, 'created_by');
    }
}
