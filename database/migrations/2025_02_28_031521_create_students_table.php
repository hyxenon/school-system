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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // Link to User table
            $table->foreignId('course_id')->constrained()->onDelete('cascade'); // Link to Course table
            $table->integer('year_level'); // Year level (e.g., 1st year, 2nd year)
            $table->string('block')->nullable(); // Optional block/section
            $table->enum('status', ['Regular', 'Irregular']); // Status: Regular or Irregular
            $table->enum('enrollment_status', ['Enrolled', 'Not Enrolled', 'Graduated', 'Dropped Out']); // Student's current status
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
