'use client';

import { EnrollmentForm } from '@/components/enrollment-form';
import { useFormValidation } from '@/components/enrollment-form-validation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Course, Department, Enrollment, Student } from '@/types';
import { Head } from '@inertiajs/react';
import { CheckCircle2, Clock, Download, MoreHorizontal, Plus, Search, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Toaster, toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Enrollment', href: '/enrollment' }];

// Mock data for demonstration
const mockEnrollments: Enrollment[] = [
    {
        id: 1,
        student: {
            id: 'STD001',
            user: {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                email_verified_at: null,
                created_at: '2023-01-01',
                updated_at: '2023-01-01',
            },
            course: {
                id: 1,
                name: 'Computer Science',
                course_code: 'CS',
                description: 'Bachelor of Science in Computer Science',
                department_id: 1,
                created_at: '2023-01-01',
                updated_at: '2023-01-01',
            },
            year_level: 2,
            block: 1,
            status: 'Regular',
            enrollment_status: 'Enrolled',
            created_at: '2023-01-01',
            updated_at: '2023-01-01',
        },
        course: {
            id: 1,
            name: 'Computer Science',
            course_code: 'CS',
            description: 'Bachelor of Science in Computer Science',
            department_id: 1,
            created_at: '2023-01-01',
            updated_at: '2023-01-01',
        },
        department: {
            id: 1,
            name: 'Information Technology',
            department_code: 'IT',
            program_head_id: 'EMP001',
            courses: [],
            created_at: '2023-01-01',
            updated_at: '2023-01-01',
        },
        academic_year: '2023-2024',
        semester: 1,
        enrollment_date: '2023-08-15',
        status: 'Enrolled',
        created_at: '2023-08-15',
        updated_at: '2023-08-15',
        payment_status: 'Completed',
    },
    {
        id: 2,
        student: {
            id: 'STD002',
            user: {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                email_verified_at: null,
                created_at: '2023-01-02',
                updated_at: '2023-01-02',
            },
            course: {
                id: 2,
                name: 'Business Administration',
                course_code: 'BA',
                description: 'Bachelor of Science in Business Administration',
                department_id: 2,
                created_at: '2023-01-01',
                updated_at: '2023-01-01',
            },
            year_level: 3,
            block: 2,
            status: 'Regular',
            enrollment_status: 'Enrolled',
            created_at: '2023-01-02',
            updated_at: '2023-01-02',
        },
        course: {
            id: 2,
            name: 'Business Administration',
            course_code: 'BA',
            description: 'Bachelor of Science in Business Administration',
            department_id: 2,
            created_at: '2023-01-01',
            updated_at: '2023-01-01',
        },
        department: {
            id: 2,
            name: 'Business',
            department_code: 'BUS',
            program_head_id: 'EMP002',
            courses: [],
            created_at: '2023-01-01',
            updated_at: '2023-01-01',
        },
        academic_year: '2023-2024',
        semester: 1,
        enrollment_date: '2023-08-16',
        status: 'Enrolled',
        created_at: '2023-08-16',
        updated_at: '2023-08-16',
        payment_status: 'Completed',
    },
    {
        id: 3,
        student: {
            id: 'STD003',
            user: {
                id: 3,
                name: 'Robert Johnson',
                email: 'robert@example.com',
                email_verified_at: null,
                created_at: '2023-01-03',
                updated_at: '2023-01-03',
            },
            course: {
                id: 1,
                name: 'Computer Science',
                course_code: 'CS',
                description: 'Bachelor of Science in Computer Science',
                department_id: 1,
                created_at: '2023-01-01',
                updated_at: '2023-01-01',
            },
            year_level: 1,
            block: 3,
            status: 'Regular',
            enrollment_status: 'Enrolled',
            created_at: '2023-01-03',
            updated_at: '2023-01-03',
        },
        course: {
            id: 1,
            name: 'Computer Science',
            course_code: 'CS',
            description: 'Bachelor of Science in Computer Science',
            department_id: 1,
            created_at: '2023-01-01',
            updated_at: '2023-01-01',
        },
        department: {
            id: 1,
            name: 'Information Technology',
            department_code: 'IT',
            program_head_id: 'EMP001',
            courses: [],
            created_at: '2023-01-01',
            updated_at: '2023-01-01',
        },
        academic_year: '2023-2024',
        semester: 1,
        enrollment_date: '2023-08-17',
        status: 'Pending',
        created_at: '2023-08-17',
        updated_at: '2023-08-17',
        payment_status: 'Pending',
    },
];

// Mock data for dropdowns
const mockCourses: Course[] = [
    {
        id: 1,
        name: 'Computer Science',
        course_code: 'CS',
        description: 'Bachelor of Science in Computer Science',
        department_id: 1,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
    },
    {
        id: 2,
        name: 'Business Administration',
        course_code: 'BA',
        description: 'Bachelor of Science in Business Administration',
        department_id: 2,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
    },
    {
        id: 3,
        name: 'Engineering',
        course_code: 'ENG',
        description: 'Bachelor of Science in Engineering',
        department_id: 3,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
    },
    {
        id: 4,
        name: 'Psychology',
        course_code: 'PSY',
        description: 'Bachelor of Arts in Psychology',
        department_id: 4,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
    },
];

const mockDepartments: Department[] = [
    {
        id: 1,
        name: 'Information Technology',
        department_code: 'IT',
        program_head_id: 'EMP001',
        courses: [mockCourses[0], mockCourses[3]],
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
    },
    {
        id: 2,
        name: 'Business',
        department_code: 'BUS',
        program_head_id: 'EMP002',
        courses: [mockCourses[1]],
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
    },
    {
        id: 3,
        name: 'Engineering',
        department_code: 'ENG',
        program_head_id: 'EMP003',
        courses: [mockCourses[2]],
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
    },
    {
        id: 4,
        name: 'Social Sciences',
        department_code: 'SOC',
        program_head_id: 'EMP004',
        courses: [],
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
    },
];

const mockStudents: Student[] = [
    {
        id: 'STD001',
        user: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            email_verified_at: null,
            created_at: '2023-01-01',
            updated_at: '2023-01-01',
        },
        course: {
            id: 1,
            name: 'Computer Science',
            course_code: 'CS',
            description: 'Bachelor of Science in Computer Science',
            department_id: 1,
            created_at: '2023-01-01',
            updated_at: '2023-01-01',
        },
        year_level: 2,
        block: 1,
        status: 'Regular',
        enrollment_status: 'Not Enrolled',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
    },
    {
        id: 'STD002',
        user: {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            email_verified_at: null,
            created_at: '2023-01-02',
            updated_at: '2023-01-02',
        },
        course: {
            id: 2,
            name: 'Business Administration',
            course_code: 'BA',
            description: 'Bachelor of Science in Business Administration',
            department_id: 2,
            created_at: '2023-01-01',
            updated_at: '2023-01-01',
        },
        year_level: 3,
        block: 2,
        status: 'Regular',
        enrollment_status: 'Not Enrolled',
        created_at: '2023-01-02',
        updated_at: '2023-01-02',
    },
];

export default function EnrollmentPage() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>(mockEnrollments);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentEnrollment, setCurrentEnrollment] = useState<Enrollment | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [paymentFilter, setPaymentFilter] = useState<string>('all');
    const [academicYearFilter, setAcademicYearFilter] = useState<string>('all');
    const [semesterFilter, setSemesterFilter] = useState<string>('all');

    // Form validation for create
    const {
        formData: createFormData,
        errors: createErrors,
        validateForm: validateCreateForm,
        updateFormData: updateCreateFormData,
        resetForm: resetCreateForm,
    } = useFormValidation({
        student_id: '',
        course_id: '',
        department_id: '',
        academic_year: '',
        semester: '',
        status: 'Pending',
        payment_status: 'Pending',
    });

    // Form validation for edit
    const {
        formData: editFormData,
        errors: editErrors,
        validateForm: validateEditForm,
        updateFormData: updateEditFormData,
        resetForm: resetEditForm,
    } = useFormValidation({
        student_id: '',
        course_id: '',
        department_id: '',
        academic_year: '',
        semester: '',
        status: 'Pending',
        payment_status: 'Pending',
    });

    // Filter enrollments based on search and filters
    const filteredEnrollments = enrollments.filter((enrollment) => {
        const matchesSearch =
            enrollment.student.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            enrollment.student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            enrollment.course.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
        const matchesPayment = paymentFilter === 'all' || enrollment.payment_status === paymentFilter;
        const matchesAcademicYear = academicYearFilter === 'all' || enrollment.academic_year === academicYearFilter;
        const matchesSemester = semesterFilter === 'all' || enrollment.semester.toString() === semesterFilter;

        return matchesSearch && matchesStatus && matchesPayment && matchesAcademicYear && matchesSemester;
    });

    // Handle create enrollment
    const handleCreateEnrollment = () => {
        if (!validateCreateForm()) {
            toast.error('Please fill in all required fields');
            return;
        }

        // In a real app, you would submit to your Laravel backend
        const newEnrollment: Enrollment = {
            id: enrollments.length + 1,
            student: mockStudents.find((s) => s.id === createFormData.student_id)!,
            course: mockCourses.find((c) => c.id.toString() === createFormData.course_id)!,
            department: mockDepartments.find((d) => d.id.toString() === createFormData.department_id)!,
            academic_year: createFormData.academic_year,
            semester: Number.parseInt(createFormData.semester) as 1 | 2 | 3,
            enrollment_date: new Date().toISOString().split('T')[0],
            status: createFormData.status as 'Enrolled' | 'Pending' | 'Cancelled',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            payment_status: createFormData.payment_status as 'Pending' | 'Completed',
        };

        setEnrollments([...enrollments, newEnrollment]);
        setIsCreateModalOpen(false);
        resetCreateForm();
        toast.success('Enrollment created successfully');
    };

    // Handle edit enrollment
    const handleEditEnrollment = () => {
        if (!currentEnrollment) return;

        if (!validateEditForm()) {
            toast.error('Please fill in all required fields');
            return;
        }

        const updatedEnrollments = enrollments.map((enrollment) => {
            if (enrollment.id === currentEnrollment.id) {
                return {
                    ...enrollment,
                    course: mockCourses.find((c) => c.id.toString() === editFormData.course_id)!,
                    department: mockDepartments.find((d) => d.id.toString() === editFormData.department_id)!,
                    academic_year: editFormData.academic_year,
                    semester: Number.parseInt(editFormData.semester) as 1 | 2 | 3,
                    status: editFormData.status as 'Enrolled' | 'Pending' | 'Cancelled',
                    payment_status: editFormData.payment_status as 'Pending' | 'Completed',
                    updated_at: new Date().toISOString(),
                };
            }
            return enrollment;
        });

        setEnrollments(updatedEnrollments);
        setIsEditModalOpen(false);
        setCurrentEnrollment(null);
        resetEditForm();
        toast.success('Enrollment updated successfully');
    };

    // Handle delete enrollment
    const handleDeleteEnrollment = () => {
        if (!currentEnrollment) return;

        const updatedEnrollments = enrollments.filter((enrollment) => enrollment.id !== currentEnrollment.id);

        setEnrollments(updatedEnrollments);
        setIsDeleteModalOpen(false);
        setCurrentEnrollment(null);
        toast.success('Enrollment deleted successfully');
    };

    // Set form data for editing
    const prepareEditForm = (enrollment: Enrollment) => {
        resetEditForm({
            student_id: enrollment.student.id,
            course_id: enrollment.course.id.toString(),
            department_id: enrollment.department.id.toString(),
            academic_year: enrollment.academic_year,
            semester: enrollment.semester.toString(),
            status: enrollment.status,
            payment_status: enrollment.payment_status,
        });
        setCurrentEnrollment(enrollment);
        setIsEditModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Enrollment" />
            <Toaster />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Student Enrollments</CardTitle>
                                <CardDescription>Manage student enrollments and registration</CardDescription>
                            </div>
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Enrollment
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Filters and Search */}
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                            <div className="relative">
                                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                                <Input
                                    placeholder="Search enrollments..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="Enrolled">Enrolled</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Payment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Payments</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Academic Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Years</SelectItem>
                                    <SelectItem value="2023-2024">2023-2024</SelectItem>
                                    <SelectItem value="2022-2023">2022-2023</SelectItem>
                                    <SelectItem value="2021-2022">2021-2022</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Semesters</SelectItem>
                                    <SelectItem value="1">First Semester</SelectItem>
                                    <SelectItem value="2">Second Semester</SelectItem>
                                    <SelectItem value="3">Summer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Enrollments Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Academic Year</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEnrollments.length > 0 ? (
                                        filteredEnrollments.map((enrollment) => (
                                            <TableRow key={enrollment.id}>
                                                <TableCell className="font-medium">{enrollment.student.id}</TableCell>
                                                <TableCell>{enrollment.student.user.name}</TableCell>
                                                <TableCell>{enrollment.course.name}</TableCell>
                                                <TableCell>{enrollment.academic_year}</TableCell>
                                                <TableCell>
                                                    {enrollment.semester === 1 ? 'First' : enrollment.semester === 2 ? 'Second' : 'Summer'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            enrollment.status === 'Enrolled'
                                                                ? 'default'
                                                                : enrollment.status === 'Pending'
                                                                  ? 'outline'
                                                                  : 'destructive'
                                                        }
                                                    >
                                                        {enrollment.status === 'Enrolled' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                                                        {enrollment.status === 'Pending' && <Clock className="mr-1 h-3 w-3" />}
                                                        {enrollment.status === 'Cancelled' && <XCircle className="mr-1 h-3 w-3" />}
                                                        {enrollment.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={enrollment.payment_status === 'Completed' ? 'default' : 'outline'}>
                                                        {enrollment.payment_status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{new Date(enrollment.enrollment_date).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">Actions</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => prepareEditForm(enrollment)}>Edit</DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setCurrentEnrollment(enrollment);
                                                                    setIsDeleteModalOpen(true);
                                                                }}
                                                            >
                                                                Delete
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Export PDF
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={9} className="h-24 text-center">
                                                No enrollments found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious href="#" />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationLink href="#" isActive>
                                            1
                                        </PaginationLink>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationLink href="#">2</PaginationLink>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationLink href="#">3</PaginationLink>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationNext href="#" />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create Enrollment Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Enrollment</DialogTitle>
                        <DialogDescription>
                            Enter the details to create a new student enrollment. Fields marked with <span className="text-red-500">*</span> are
                            required.
                        </DialogDescription>
                    </DialogHeader>
                    <EnrollmentForm
                        formData={createFormData}
                        errors={createErrors}
                        updateFormData={updateCreateFormData}
                        students={mockStudents}
                        courses={mockCourses}
                        departments={mockDepartments}
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                resetCreateForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleCreateEnrollment}>Create Enrollment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Enrollment Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Enrollment</DialogTitle>
                        <DialogDescription>
                            Update the enrollment details. Fields marked with <span className="text-red-500">*</span> are required.
                        </DialogDescription>
                    </DialogHeader>
                    {currentEnrollment && (
                        <EnrollmentForm
                            formData={editFormData}
                            errors={editErrors}
                            updateFormData={updateEditFormData}
                            students={mockStudents}
                            courses={mockCourses}
                            departments={mockDepartments}
                            isEditMode={true}
                            currentStudentName={currentEnrollment.student.user.name}
                        />
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditModalOpen(false);
                                setCurrentEnrollment(null);
                                resetEditForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleEditEnrollment}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this enrollment? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteModalOpen(false);
                                setCurrentEnrollment(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteEnrollment}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
