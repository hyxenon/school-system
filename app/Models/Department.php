<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    /** @use HasFactory<\Database\Factories\DepartmentFactory> */
    use HasFactory;

    protected $fillable = ['department_code', 'name', 'program_head_id',];

    public function programHead(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'program_head_id');
    }

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }
}
