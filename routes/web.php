<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\AssignmentSubmissionController;
use App\Http\Controllers\BuildingController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CurriculumController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DTRController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Middleware\CheckRole;
use App\Models\Schedule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', [AnnouncementController::class, 'getAnnouncements'])->name('dashboard');

    // Registrar only access
    Route::middleware([CheckRole::class . ':registrar'])->group(function () {
        Route::resource('buildings', BuildingController::class);
        Route::resource('rooms', RoomController::class);
        Route::resource('departments', DepartmentController::class);
        Route::resource('courses', CourseController::class);
        Route::resource('subjects', SubjectController::class);
        Route::resource('curriculum', CurriculumController::class);
        Route::delete('/curriculum/{curriculum}', [CurriculumController::class, 'destroy'])->name('curriculum.destroy');

        Route::resource('enrollment', EnrollmentController::class);
        Route::get('enrollment/filter', [EnrollmentController::class, 'filter'])->name('enrollment.filter');
        Route::get('enrollment/{enrollment}/export-pdf', [EnrollmentController::class, 'exportPdf'])->name('enrollment.export-pdf');
    });



    Route::get('/api/curriculum/subjects', [CurriculumController::class, 'getSubjects']);
    Route::resource('schedules', ScheduleController::class);
    Route::resource('announcements', AnnouncementController::class);
    Route::put('announcements/{announcement}/pin', [AnnouncementController::class, 'togglePin'])->name('announcements.pin');

    // Program Head
    Route::resource('add-students', StudentController::class);



    // Treasury
    Route::middleware([CheckRole::class . ':treasurer'])->group(function () {
        Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
        Route::post('/payments', [PaymentController::class, 'store'])->name('payments.store');
    });


    Route::middleware([CheckRole::class . ':studentAndProfessor'])->group(function () {
        // Schedule Routes
        Route::get('/my-schedules', function () {
            $user = auth()->user();
            if ($user->employee) {
                return app(ScheduleController::class)->getTeacherSchedule(request());
            }
            if ($user->student) {
                return app(ScheduleController::class)->getStudentSchedule(request());
            }
            return redirect()->route('dashboard')->with('error', 'Unauthorized access');
        })->name('my-schedules');

        Route::get('/my-classes', function () {
            $user = auth()->user();
            if ($user->employee) {
                return app(ScheduleController::class)->getTeacherClasses(request());
            }
            if ($user->student) {
                return app(ScheduleController::class)->getStudentClasses(request());
            }
            return redirect()->route('dashboard')->with('error', 'Unauthorized access');
        });

        Route::get('/my-classes/{id}', [ScheduleController::class, 'show'])->name('classes.show');
        Route::post('/assignments', [AssignmentController::class, 'store'])->name('assignments.store');
        Route::post('/classes/{schedule}/weights', [ScheduleController::class, 'updateWeights'])->name('classes.weights.update');
    });

    // HR access only
    Route::middleware([CheckRole::class . ':hr'])->group(function () {
        Route::resource('employees', EmployeeController::class);
        Route::post('/employees/{employee}/toggle-active', [EmployeeController::class, 'toggleActive']);
        Route::resource('/DTR', DTRController::class);

        // Additional DTR routes
        Route::post('/DTR/mark-as-paid', [DTRController::class, 'markAsPaid'])->name('dtr.mark-as-paid');
        Route::get('/DTR-payroll', [DTRController::class, 'exportForPayroll'])->name('dtr.payroll');
        Route::get('/DTR-attendance-report', [DTRController::class, 'attendanceReport'])->name('dtr.attendance-report');
    });
});

// Assignment routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/assignments', [AssignmentController::class, 'store'])->name('assignments.store');
    Route::put('/assignments/{assignment}', [AssignmentController::class, 'update'])->name('assignments.update');
    Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy'])->name('assignments.destroy');
    Route::post('/assignment-submissions', [AssignmentSubmissionController::class, 'store'])->name('assignment-submissions.store');
    Route::put('/assignment-submissions/{submission}', [AssignmentSubmissionController::class, 'update'])->name('assignment-submissions.update');
    Route::get('/assignments/{assignment}/grade', [AssignmentController::class, 'showGrading'])->name('assignments.grading');
    Route::post('/assignments/{assignment}/grades', [AssignmentController::class, 'submitGrades'])->name('assignments.submit-grades');


    Route::get('/api/classes/{schedule}/grade-weights', function (Schedule $schedule) {
        $weights = $schedule->gradeWeights;
        if (!$weights) {
            return response()->json([
                'assignment_weight' => 30,
                'quiz_weight' => 30,
                'exam_weight' => 40
            ]);
        }
        return response()->json($weights);
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
