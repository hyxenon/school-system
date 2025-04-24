<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DTR extends Model
{
    /** @use HasFactory<\Database\Factories\DTRFactory> */
    use HasFactory;

    // The table name for this model
    protected $table = 'd_t_r_s';

    // Fields that can be mass-assigned
    protected $fillable = [
        'employee_id',
        'date',
        'time_in',
        'time_out',
        'lunch_start',
        'lunch_end',
        'overtime_start',
        'overtime_end',
        'status',
        'leave_type',
        'remarks',
        'hours_worked',
        'overtime_hours',
        'is_paid',
        'pay_period',
    ];

    // Cast attributes to native types
    protected $casts = [
        'date' => 'date',
        'time_in' => 'datetime',
        'time_out' => 'datetime',
        'lunch_start' => 'datetime',
        'lunch_end' => 'datetime',
        'overtime_start' => 'datetime',
        'overtime_end' => 'datetime',
        'hours_worked' => 'float',
        'overtime_hours' => 'float',
        'is_paid' => 'boolean',
        'pay_period' => 'date',
    ];

    /**
     * Get the employee that owns this DTR record.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Calculate total hours worked
     * 
     * @return float
     */
    public function calculateHoursWorked(): float
    {
        if (!$this->time_in || !$this->time_out) {
            return 0;
        }

        $timeIn = \Carbon\Carbon::parse($this->time_in);
        $timeOut = \Carbon\Carbon::parse($this->time_out);

        $lunchDuration = 0;
        if ($this->lunch_start && $this->lunch_end) {
            $lunchStart = \Carbon\Carbon::parse($this->lunch_start);
            $lunchEnd = \Carbon\Carbon::parse($this->lunch_end);
            $lunchDuration = $lunchStart->diffInMinutes($lunchEnd) / 60;
        }

        $hoursWorked = $timeIn->diffInMinutes($timeOut) / 60;

        return round($hoursWorked - $lunchDuration, 2);
    }

    /**
     * Calculate overtime hours
     * 
     * @return float
     */
    public function calculateOvertimeHours(): float
    {
        if (!$this->overtime_start || !$this->overtime_end) {
            return 0;
        }

        $overtimeStart = \Carbon\Carbon::parse($this->overtime_start);
        $overtimeEnd = \Carbon\Carbon::parse($this->overtime_end);

        return round($overtimeStart->diffInMinutes($overtimeEnd) / 60, 2);
    }
}
