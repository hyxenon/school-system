<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssignmentSubmission extends Model
{
    /** @use HasFactory<\Database\Factories\AssignmentSubmissionFactory> */
    use HasFactory;

    protected $fillable = [
        'assignment_id',
        'student_id',
        'submission_date',
        'grade',
        'feedback'
    ];

    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
