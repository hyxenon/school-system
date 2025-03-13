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
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->string('academic_year');
            $table->tinyInteger('semester');
            $table->enum('status', ['Enrolled', 'Pending', 'Cancelled']);
            $table->enum('payment_status', ['Pending', 'Completed']);
            $table->timestamps();

            $table->decimal('total_fee', 10, 2)->default(40000);
            $table->decimal('remaining_balance', 10, 2)->default(40000);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
