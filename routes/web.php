<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\BuildingController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CurriculumController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
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
    Route::resource('enrollment', EnrollmentController::class);
    Route::get('enrollment/filter', [EnrollmentController::class, 'filter'])->name('enrollment.filter');
    Route::get('enrollment/{enrollment}/export-pdf', [EnrollmentController::class, 'exportPdf'])->name('enrollment.export-pdf');
    Route::resource('departments', DepartmentController::class);
    Route::resource('courses', CourseController::class);
    Route::resource('buildings', BuildingController::class);
    Route::resource('rooms', RoomController::class);
    Route::resource('subjects', SubjectController::class);
    Route::resource('curriculum', CurriculumController::class);
    Route::delete('/curriculum/{curriculum}', [CurriculumController::class, 'destroy'])->name('curriculum.destroy');
    Route::get('/api/curriculum/subjects', [CurriculumController::class, 'getSubjects']);
    Route::resource('schedules', ScheduleController::class);
    Route::resource('announcements', AnnouncementController::class);
    Route::put('announcements/{announcement}/pin', [AnnouncementController::class, 'togglePin'])->name('announcements.pin');


    // Program Head
    Route::resource('add-students', StudentController::class);



    // Treasury
    Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::post('/payments', [PaymentController::class, 'store'])->name('payments.store');
});




require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
