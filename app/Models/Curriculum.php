<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Curriculum extends Model
{
    /** @use HasFactory<\Database\Factories\CurriculumFactory> */
    use HasFactory;
    protected $table = 'curriculums';

    protected $fillable = ['course_id', 'year_level', 'semester'];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'curriculum_subject');
    }
}
