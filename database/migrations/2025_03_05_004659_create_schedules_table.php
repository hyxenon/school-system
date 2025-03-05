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
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->foreignId('professor_id')->constrained('employees')->cascadeOnDelete();
            $table->string('academic_year'); // e.g., "2024-2025"
            $table->tinyInteger('semester'); // 1, 2, or 3
            $table->integer('year_level'); // 1, 2, 3, 4, etc.
            $table->string('block'); // "A", "B", "C"
            $table->enum('schedule_type', ['Lecture', 'Laboratory', 'Hybrid']);
            $table->enum('day', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('max_students')->default(50);
            $table->enum('status', ['Active', 'Inactive', 'Cancelled'])->default('Active');
            $table->timestamps();
        });

        Schema::create('schedule_student', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
        Schema::dropIfExists('schedule_student');
    }
};
