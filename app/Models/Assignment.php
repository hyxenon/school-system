<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    /** @use HasFactory<\Database\Factories\AssignmentFactory> */
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'title',
        'description',
        'due_date',
        'assessment_type',
        'created_by',
        'year_level',
        'block'

    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
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
