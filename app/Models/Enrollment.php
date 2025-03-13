<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    /** @use HasFactory<\Database\Factories\EnrollmentFactory> */
    use HasFactory;

    protected $fillable = [
        'student_id',
        'course_id',
        'department_id',
        'academic_year',
        'semester',
        'enrollment_date',
        'status',
        'payment_status'
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function getRemainingBalance()
    {
        // Fixed total fee for each enrollment
        $totalFee = 40000;

        // Get the total paid amount from all payments linked to this enrollment
        $totalPaid = $this->payments->sum('amount');

        // Calculate and return the remaining balance
        return $totalFee - $totalPaid;
    }
}
