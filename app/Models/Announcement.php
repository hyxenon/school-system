<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Announcement extends Model
{
    /** @use HasFactory<\Database\Factories\AnnouncementFactory> */
    use HasFactory;

    use SoftDeletes;



    protected $fillable = [
        'title',
        'content',
        'type',
        'user_id',
        'department_id',
        'starts_at',
        'ends_at',
        'is_pinned',
        'visibility'
    ];

    protected $dates = [
        'starts_at',
        'ends_at',
        'deleted_at'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
