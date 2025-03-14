<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $student = null;
        $payments = [];

        // Check if student ID is provided in the URL
        if ($request->has('student')) {
            // Find the student by ID and get the latest enrollment
            $student = Student::with(['user', 'course', 'enrollment.department' => function ($query) {
                $query->latest()->first();
            }])->find($request->student);

            // Get the latest enrollment
            if ($student && $student->enrollment) {
                $student->enrollment = $student->enrollment->first();
            }

            if ($student) {
                $payments = Payment::where('student_id', $student->id)
                    ->with('enrollment')
                    ->paginate(10);
            }
        }

        return Inertia::render('payment', [
            'studentData' => $student,
            'payments' => $payments
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the request
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string',
            'enrollment_id' => 'required|exists:enrollments,id',
        ]);

        // Create the payment record
        $payment = Payment::create([
            'student_id' => $validated['student_id'],
            'enrollment_id' => $validated['enrollment_id'],
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'payment_date' => now(),
            'cashier_id' => auth()->id(),
            'receipt_number' => $this->generateReceiptNumber(),
            'status' => 'Completed',
        ]);

        // Update student's remaining balance
        $student = Student::with(['user', 'course', 'enrollment' => function ($query) {
            $query->latest()->first();
        }])->find($validated['student_id']);

        // Get the latest enrollment
        if ($student && $student->enrollment) {
            $student->enrollment = $student->enrollment->first();
        }

        // Calculate the total amount paid by the student
        $totalPaid = Payment::where('student_id', $validated['student_id'])
            ->where('enrollment_id', $validated['enrollment_id'])
            ->sum('amount');

        // Calculate the new remaining balance
        $totalFee = $student->enrollment->total_fee;
        $newBalance = $totalFee - $totalPaid;

        $student->enrollment->update([
            'remaining_balance' => $newBalance
        ]);

        // Create receipt data
        $receiptData = [
            'receipt_number' => $payment->receipt_number,
            'student_id' => $student->id,
            'student_name' => $student->user->name,
            'payment_date' => $payment->payment_date->format('F d, Y'),
            'payment_time' => $payment->payment_date->format('h:mm a'),
            'amount' => $payment->amount,
            'payment_method' => $payment->payment_method,
            'cashier' => auth()->user()->name,
            'previous_balance' => $newBalance + $validated['amount'],
            'new_balance' => $newBalance,
            'course' => $student->course->name,
            'academic_year' => $student->enrollment->academic_year,
            'semester' => $student->enrollment->semester,
        ];


        if ($student) {
            $payments = Payment::where('student_id', $student->id)
                ->with('enrollment')
                ->paginate(10);
        }

        return Inertia::render('payment', [
            'studentData' => $student,
            'receiptData' => $receiptData,
            'payments' => $payments,
            'success' => true,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        // Find the payment record
        $payment = Payment::findOrFail($id);

        // Get the student and enrollment details
        $student = Student::with(['user', 'course', 'enrollment' => function ($query) {
            $query->latest()->first();
        }])->find($payment->student_id);

        // Get the latest enrollment
        if ($student && $student->enrollment) {
            $student->enrollment = $student->enrollment->first();
        }

        // Calculate the new remaining balance
        $totalFee = $student->enrollment->total_fee;
        $totalPaid = Payment::where('student_id', $payment->student_id)
            ->where('enrollment_id', $payment->enrollment_id)
            ->sum('amount') - $payment->amount;
        $newBalance = $totalFee - $totalPaid;

        // Update the student's remaining balance
        $student->enrollment->update([
            'remaining_balance' => $newBalance
        ]);

        // Delete the payment record
        $payment->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Generate a unique receipt number
     */
    private function generateReceiptNumber()
    {
        $timestamp = now()->timestamp;
        $random = rand(100, 999);
        return "RCP-{$timestamp}-{$random}";
    }

    // Other methods remain unchanged...
}
