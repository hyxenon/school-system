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
        \Log::info('Store method called');
        \Log::info('Request payload:', $request->all());

        try {
            // Validate the request
            $validated = $request->validate([
                'student_id' => 'required|exists:students,id',
                'amount' => 'required|numeric|min:1',
                'payment_method' => 'required|string',
                'payment_type' => 'required|string|in:Tuition,COG,TOR,Incomplete Form',
                'enrollment_id' => 'required_if:payment_type,Tuition|exists:enrollments,id',
                'document_type' => 'required_if:payment_type,COG,TOR,Incomplete Form|string',
            ]);

            // Log the validated data
            \Log::info('Validated data:', $validated);

            // Generate a unique receipt number
            $receiptNumber = $this->generateReceiptNumber();

            // Create the payment record
            $paymentData = [
                'student_id' => $validated['student_id'],
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'payment_date' => now(),
                'status' => 'Completed',
                'receipt_number' => $receiptNumber, // Add the receipt number to the payment data
            ];

            if ($validated['payment_type'] === 'Tuition') {
                $paymentData['enrollment_id'] = $validated['enrollment_id'];
            } else {
                $paymentData['document_type'] = $validated['document_type'];
            }

            // Log the payment data
            \Log::info('Payment data:', $paymentData);

            $payment = Payment::create($paymentData);

            // Fetch the student details
            $student = Student::with(['user', 'course', 'enrollment.department' => function ($query) {
                $query->latest()->first();
            }])->find($validated['student_id']);

            // Update student's remaining balance if the payment is for tuition
            if ($validated['payment_type'] === 'Tuition') {
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
            }

            // Create receipt data
            $receiptData = [
                'receipt_number' => $receiptNumber, // Use the generated receipt number
                'student_id' => $payment->student_id,
                'student_name' => $payment->student->user->name,
                'payment_date' => $payment->payment_date->format('F d, Y'),
                'payment_time' => $payment->payment_date->format('h:mm a'),
                'amount' => $payment->amount,
                'payment_method' => $payment->payment_method,
                'cashier' => auth()->user()->name,
                'payment_type' => $validated['payment_type'],
            ];

            if ($validated['payment_type'] === 'Tuition') {
                $receiptData['previous_balance'] = $newBalance + $validated['amount'];
                $receiptData['new_balance'] = $newBalance;
                $receiptData['course'] = $student->course->name;
                $receiptData['academic_year'] = $student->enrollment->academic_year;
                $receiptData['semester'] = $student->enrollment->semester;
            } else {
                $receiptData['document_type'] = $validated['document_type'];
            }

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
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error:', ['errors' => $e->errors()]);
            return back()->withErrors($e->errors());
        } catch (\Exception $e) {
            \Log::error('Error creating payment:', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'An error occurred while processing the payment.']);
        }
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
}
