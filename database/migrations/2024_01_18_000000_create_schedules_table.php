<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->foreignId('professor_id')->constrained('employees')->onDelete('cascade');
            $table->string('day');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('block');
            $table->integer('year_level');
            $table->string('academic_year');
            $table->integer('semester');
            $table->string('schedule_type');
            $table->integer('max_students');
            $table->string('status')->default('Active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
