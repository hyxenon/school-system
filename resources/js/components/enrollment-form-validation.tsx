'use client';

import { useState } from 'react';
import { z } from 'zod';

// Define the validation schema
export const enrollmentSchema = z.object({
    student_id: z.string().min(1, 'Student is required'),
    course_id: z.string().min(1, 'Course is required'),
    department_id: z.string().min(1, 'Department is required'),
    academic_year: z.string().min(1, 'Academic year is required'),
    semester: z.string().min(1, 'Semester is required'),
    status: z.enum(['Enrolled', 'Pending', 'Cancelled'], {
        errorMap: () => ({ message: 'Status is required' }),
    }),
    payment_status: z.enum(['Completed', 'Pending'], {
        errorMap: () => ({ message: 'Payment status is required' }),
    }),
});

export type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

// Custom hook for form validation
export function useFormValidation(initialData: EnrollmentFormData) {
    const [formData, setFormData] = useState<EnrollmentFormData>(initialData);
    const [errors, setErrors] = useState<Partial<Record<keyof EnrollmentFormData, string>>>({});

    const validateForm = () => {
        try {
            enrollmentSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors: Partial<Record<keyof EnrollmentFormData, string>> = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        formattedErrors[err.path[0] as keyof EnrollmentFormData] = err.message;
                    }
                });
                setErrors(formattedErrors);
            }
            return false;
        }
    };

    const updateFormData = (field: keyof EnrollmentFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear error for this field when user updates it
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const resetForm = (newData: EnrollmentFormData = initialData) => {
        setFormData(newData);
        setErrors({});
    };

    return {
        formData,
        errors,
        validateForm,
        updateFormData,
        resetForm,
    };
}
