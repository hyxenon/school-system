<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('grade_weights', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained()->onDelete('cascade');
            $table->integer('assignment_weight');
            $table->integer('quiz_weight');
            $table->integer('exam_weight');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('grade_weights');
    }
};
