<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    /** @use HasFactory<\Database\Factories\SubjectFactory> */
    use HasFactory;


    protected $fillable = [
        'code',
        'name',
        'course_id',
        'credits',
        'description'
    ];


    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function curriculums()
    {
        return $this->belongsToMany(Curriculum::class, 'curriculum_subject');
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }
}
