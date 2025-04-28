<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payroll extends Model
{
    /** @use HasFactory<\Database\Factories\PayrollFactory> */
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'pay_period_start',
        'pay_period_end',
        'basic_salary',
        'overtime_pay',
        'allowances',
        'deductions',
        'tax',
        'net_salary',
        'payment_method',
        'status',
        'remarks',
        'paid_at',
    ];

    protected $casts = [
        'pay_period_start' => 'date',
        'pay_period_end' => 'date',
        'basic_salary' => 'float',
        'overtime_pay' => 'float',
        'allowances' => 'float',
        'deductions' => 'float',
        'tax' => 'float',
        'net_salary' => 'float',
        'paid_at' => 'datetime',
    ];

    /**
     * Get the employee that owns this payroll record.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get DTR records related to this payroll period
     */
    public function dtrRecords()
    {
        return DTR::where('employee_id', $this->employee_id)
            ->whereBetween('date', [$this->pay_period_start, $this->pay_period_end])
            ->where('is_paid', false)
            ->get();
    }

    /**
     * Calculate total regular hours worked in this pay period
     */
    public function calculateRegularHours(): float
    {
        $records = $this->dtrRecords();
        return $records->sum('hours_worked');
    }

    /**
     * Calculate total overtime hours in this pay period
     */
    public function calculateOvertimeHours(): float
    {
        $records = $this->dtrRecords();
        return $records->sum('overtime_hours');
    }

    /**
     * Calculate and set payroll amounts based on DTR records
     */
    public function calculatePayroll(float $hourlyRate, float $overtimeRate): void
    {
        $records = $this->dtrRecords();

        $regularHours = $this->calculateRegularHours();
        $overtimeHours = $this->calculateOvertimeHours();

        $this->basic_salary = $regularHours * $hourlyRate;
        $this->overtime_pay = $overtimeHours * $overtimeRate;

        // Calculate tax (simplified example - typically more complex)
        $grossPay = $this->basic_salary + $this->overtime_pay + $this->allowances;
        $this->tax = $grossPay * 0.10; // 10% tax rate as an example

        $this->net_salary = $grossPay - $this->deductions - $this->tax;

        $this->save();

        // Mark DTRs as paid
        foreach ($records as $record) {
            $record->is_paid = true;
            $record->save();
        }
    }
}
