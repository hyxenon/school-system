<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('d_t_r_s', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->time('time_in')->nullable();
            $table->time('time_out')->nullable();
            $table->time('lunch_start')->nullable();
            $table->time('lunch_end')->nullable();
            $table->time('overtime_start')->nullable();
            $table->time('overtime_end')->nullable();
            $table->enum('status', ['Present', 'Absent', 'Late', 'Half Day', 'On Leave'])->default('Present');
            $table->string('leave_type')->nullable(); // Sick, Vacation, Personal, etc.
            $table->text('remarks')->nullable();
            $table->decimal('hours_worked', 5, 2)->default(0);
            $table->decimal('overtime_hours', 5, 2)->default(0);
            $table->boolean('is_paid')->default(false); // For payroll integration
            $table->date('pay_period')->nullable(); // For grouping in payroll processing
            $table->timestamps();

            // Create a unique constraint to prevent duplicate entries for the same employee on the same date
            $table->unique(['employee_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('d_t_r_s');
    }
};
