<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    /** @use HasFactory<\Database\Factories\ScheduleFactory> */
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'room_id',
        'professor_id',
        'academic_year',
        'semester',
        'year_level',
        'block',
        'schedule_type',
        'day',
        'start_time',
        'end_time',
        'max_students',
        'status',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function professor()
    {
        return $this->belongsTo(Employee::class, 'professor_id');
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'schedule_student')->withTimestamps();
    }
}
