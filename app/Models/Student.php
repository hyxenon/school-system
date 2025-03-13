<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Student extends Model
{
    /** @use HasFactory<\Database\Factories\StudentFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'year_level',
        'block',
        'status',
        'enrollment_status'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

    public function assignments()
    {
        return $this->hasMany(AssignmentSubmission::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function enrollment()
    {
        return $this->hasMany(Enrollment::class)->latest()->limit(1);
    }
}
