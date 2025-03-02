<?php

use App\Http\Controllers\CourseController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EmployeeController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');


    // Registrar 

    Route::resource('employees', EmployeeController::class);
    Route::post('/employees/{employee}/toggle-active', [EmployeeController::class, 'toggleActive']);

    Route::resource('departments', DepartmentController::class);
    Route::resource('courses', CourseController::class);
});




require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
