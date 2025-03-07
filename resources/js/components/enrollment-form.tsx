'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Course, Department, Student } from '@/types';
import { useState } from 'react';
import type { EnrollmentFormData } from './enrollment-form-validation';

interface EnrollmentFormProps {
    formData: EnrollmentFormData;
    errors: Partial<Record<keyof EnrollmentFormData, string>>;
    updateFormData: (field: keyof EnrollmentFormData, value: string) => void;
    students: Student[];
    courses: Course[];
    departments: Department[];
    isEditMode?: boolean;
    currentStudentName?: string;
}

export function EnrollmentForm({
    formData,
    errors,
    updateFormData,
    students,
    courses,
    departments,
    isEditMode = false,
    currentStudentName = '',
}: EnrollmentFormProps) {
    // Initialize studentCourse state
    const [studentCourse, setStudentCourse] = useState('');
    const [studentDepartment, setStudentDepartment] = useState('');

    // Find the selected student course whenever student_id changes
    const updateStudentCourse = (studentId: string) => {
        const selectedStudent = students.find((student) => student.id === studentId);
        if (selectedStudent) {
            // Set course information
            setStudentCourse(`${selectedStudent.course.name} (${selectedStudent.course.course_code})`);
            setStudentDepartment(`${selectedStudent.course.department.name} (${selectedStudent.course.department.department_code})`);
            // Also set the course_id in formData
            updateFormData('course_id', selectedStudent.course.id.toString());
            updateFormData('department_id', selectedStudent.course.department.id);
        } else {
            setStudentCourse('');
            setStudentDepartment('');
        }
    };
    return (
        <div className="grid gap-4 py-4">
            {isEditMode ? (
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Student</Label>
                    <div className="col-span-3">
                        <Input className="w-full" value={currentStudentName} disabled />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="student_id" className="text-right">
                        Student <span className="text-red-500">*</span>
                    </Label>
                    <div className="col-span-3">
                        <Select
                            value={formData.student_id}
                            onValueChange={(value) => {
                                updateFormData('student_id', value);
                                updateStudentCourse(value);
                            }}
                        >
                            <SelectTrigger className={errors.student_id ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map((student) => (
                                    <SelectItem key={student.id} value={student.id}>
                                        {student.id} - {student.user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.student_id && <p className="mt-1 text-sm text-red-500">{errors.student_id}</p>}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="course_id" className="text-right">
                    Course <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                    <Input disabled={true} value={studentCourse} placeholder="Please select a student." />
                    {errors.course_id && <p className="mt-1 text-sm text-red-500">{errors.course_id}</p>}
                </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="course_id" className="text-right">
                    Department <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                    <Input disabled={true} value={studentDepartment} placeholder="Please select a student." />
                    {errors.course_id && <p className="mt-1 text-sm text-red-500">{errors.department_id}</p>}
                </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="academic_year" className="text-right">
                    Academic Year <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                    <Select value={formData.academic_year} onValueChange={(value) => updateFormData('academic_year', value)}>
                        <SelectTrigger className={errors.academic_year ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2023-2024">2023-2024</SelectItem>
                            <SelectItem value="2022-2023">2022-2023</SelectItem>
                            <SelectItem value="2021-2022">2021-2022</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.academic_year && <p className="mt-1 text-sm text-red-500">{errors.academic_year}</p>}
                </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="semester" className="text-right">
                    Semester <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                    <Select value={formData.semester} onValueChange={(value) => updateFormData('semester', value)}>
                        <SelectTrigger className={errors.semester ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">First Semester</SelectItem>
                            <SelectItem value="2">Second Semester</SelectItem>
                            <SelectItem value="3">Summer</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.semester && <p className="mt-1 text-sm text-red-500">{errors.semester}</p>}
                </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                    Status <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                    <Select value={formData.status} onValueChange={(value) => updateFormData('status', value as any)}>
                        <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Enrolled">Enrolled</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
                </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment_status" className="text-right">
                    Payment <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                    <Select value={formData.payment_status} onValueChange={(value) => updateFormData('payment_status', value as any)}>
                        <SelectTrigger className={errors.payment_status ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select payment status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.payment_status && <p className="mt-1 text-sm text-red-500">{errors.payment_status}</p>}
                </div>
            </div>
        </div>
    );
}
