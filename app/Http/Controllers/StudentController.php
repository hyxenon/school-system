<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $employee = Auth::user()->employee;
        $courses = [];

        if ($employee && $employee->position === 'program head') {
            $courses = $employee->department->courses;

            // Get students from the department's courses with pagination
            $query = Student::query()
                ->whereIn('course_id', $courses->pluck('id'))
                ->with(['user', 'course']);

            // Handle search
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->whereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                        ->orWhereHas('course', function ($courseQuery) use ($search) {
                            $courseQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('course_code', 'like', "%{$search}%");
                        });
                });
            }

            // Filter by course
            if ($request->has('course_id') && !empty($request->course_id)) {
                $query->where('course_id', $request->course_id);
            }

            $students = $query->paginate(10)->withQueryString();
        } else {
            // If not a program head, return empty paginated collection
            $students = new \Illuminate\Pagination\LengthAwarePaginator(
                [],
                0,
                10,
                1,
                ['path' => $request->url()]
            );
        }

        return Inertia::render('add-students-page', [
            'courses' => $courses,
            'students' => $students
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the request with detailed error messages
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'year_level' => ['required', 'integer', 'min:1', 'max:5'],
            'block' => ['required', 'integer', 'min:1'],
            'course_id' => ['required', 'exists:courses,id'],
            'status' => ['required', Rule::in(['Regular', 'Irregular'])],
            'enrollment_status' => ['required', Rule::in(['Enrolled', 'Not Enrolled', 'Graduated', 'Dropped Out'])],
        ], [
            'name.required' => 'The student name is required.',
            'name.max' => 'The student name cannot exceed 255 characters.',
            'email.required' => 'The email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already in use.',
            'year_level.required' => 'The year level is required.',
            'year_level.integer' => 'The year level must be a number.',
            'year_level.min' => 'The year level must be at least 1.',
            'year_level.max' => 'The year level cannot exceed 5.',
            'block.required' => 'The block number is required.',
            'block.integer' => 'The block must be a number.',
            'block.min' => 'The block must be at least 1.',
            'course_id.required' => 'Please select a course.',
            'course_id.exists' => 'The selected course does not exist.',
            'status.required' => 'Please select a student status.',
            'status.in' => 'The student status must be either Regular or Irregular.',
            'enrollment_status.required' => 'Please select an enrollment status.',
            'enrollment_status.in' => 'The enrollment status is invalid.',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $validated = $validator->validated();

        try {
            // Create a new user
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make('password'), // Default password, should be changed
                'role' => 'student',
            ]);

            // Create a new student
            $student = Student::create([
                'user_id' => $user->id,
                'course_id' => $validated['course_id'],
                'year_level' => $validated['year_level'],
                'block' => $validated['block'],
                'status' => $validated['status'],
                'enrollment_status' => $validated['enrollment_status'],
            ]);

            return redirect()->back()->with('success', 'Student added successfully');
        } catch (\Exception $e) {
            // If there's an error, we should clean up any created records
            if (isset($user)) {
                $user->delete();
            }

            return redirect()->back()->withErrors(['error' => 'Failed to add student: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Update the specified resource in storage.
     */
    /**
     * Update the specified resource in storage.
     */
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $studentId)
    {

        $student = Student::with('user')->find($studentId);


        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($student->user_id)],  // Ignore the current student's email
            'year_level' => ['required', 'integer', 'min:1', 'max:5'],
            'block' => ['required', 'integer', 'min:1'],
            'course_id' => ['required', 'exists:courses,id'],
            'status' => ['required', Rule::in(['Regular', 'Irregular'])],
            'enrollment_status' => ['required', Rule::in(['Enrolled', 'Not Enrolled', 'Graduated', 'Dropped Out'])],
        ]);

        // Step 6: Handle validation errors
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $validated = $validator->validated();

        try {
            // Step 7: Update the user record
            $user = $student->user;
            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            // Step 8: Update the student record
            $student->update([
                'course_id' => $validated['course_id'],
                'year_level' => $validated['year_level'],
                'block' => $validated['block'],
                'status' => $validated['status'],
                'enrollment_status' => $validated['enrollment_status'],
            ]);

            // Step 9: Redirect with success message
            return redirect()->back()->with('success', 'Student updated successfully');
        } catch (\Exception $e) {
            // Step 10: Handle errors
            return redirect()->back()->withErrors(['error' => 'Failed to update student: ' . $e->getMessage()])->withInput();
        }
    }






    /**
     * Remove the specified resource from storage.
     */
    public function destroy($studentId)
    {
        try {
            // First, get the user_id associated with this student
            $student = DB::table('students')->where('id', $studentId)->first();

            if (!$student) {
                return redirect()->route('add-students.index')
                    ->with('error', "No student found with ID: $studentId");
            }

            $userId = $student->user_id;

            // Begin a transaction to ensure both operations succeed or fail together
            DB::beginTransaction();

            // Delete the student record
            $studentDeleted = DB::table('students')->where('id', $studentId)->delete();

            // Delete the associated user
            $userDeleted = DB::table('users')->where('id', $userId)->delete();

            if ($studentDeleted && $userDeleted) {
                DB::commit();
                return redirect()->route('add-students.index')
                    ->with('success', "Student and user accounts deleted successfully");
            } else {
                // Something went wrong, rollback the transaction
                DB::rollBack();
                return redirect()->route('add-students.index')
                    ->with('error', "Failed to delete student or user account");
            }
        } catch (\Exception $e) {
            // If an exception occurs, rollback the transaction
            DB::rollBack();
            return redirect()->route('add-students.index')
                ->with('error', "Database error: " . $e->getMessage());
        }
    }
}
