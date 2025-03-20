<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            // First modify the assessment_type enum
            $table->enum('assessment_type', ['Assignment', 'Quiz', 'Exam'])->change();

            // Add new columns
            $table->enum('period', ['Prelims', 'Midterms', 'Finals'])->after('assessment_type');
            $table->integer('total_points')->default(100)->after('period');
        });
    }

    public function down(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            // Revert assessment_type enum
            $table->enum('assessment_type', ['Prelims', 'Midterms', 'Finals'])->change();

            // Remove the new columns
            $table->dropColumn(['period', 'total_points']);
        });
    }
};
