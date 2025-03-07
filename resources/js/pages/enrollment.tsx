'use client';
import { EnrollmentForm } from '@/components/enrollment-form';
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
import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle2, Clock, Download, MoreHorizontal, Plus, Search, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Enrollment', href: '/enrollment' }];

interface EnrollmentPageProps {
    enrollments: Enrollment[];
    courses: Course[];
    departments: Department[];
    students: Student[];
    filters: any;
}

export default function EnrollmentPage({ enrollments, courses, departments, students, filters }: EnrollmentPageProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentEnrollment, setCurrentEnrollment] = useState<Enrollment | null>(null);
    console.log(students);
    // Initialize filters from props
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [paymentFilter, setPaymentFilter] = useState(filters?.payment || 'all');
    const [academicYearFilter, setAcademicYearFilter] = useState(filters?.academic_year || 'all');
    const [semesterFilter, setSemesterFilter] = useState(filters?.semester || 'all');

    // Debounce search input
    useEffect(() => {
        const timeout = setTimeout(() => {
            applyFilters();
        }, 500);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    // Apply filters to the backend
    const applyFilters = () => {
        router.get(
            '/enrollment',
            {
                search: searchQuery,
                status: statusFilter,
                payment: paymentFilter,
                academic_year: academicYearFilter,
                semester: semesterFilter,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Form validation for create
    const createForm = useForm({
        student_id: '',
        course_id: '',
        department_id: '',
        academic_year: '',
        semester: '',
        status: 'Pending',
        payment_status: 'Pending',
    });

    // Form validation for edit
    const editForm = useForm({
        course_id: '',
        department_id: '',
        academic_year: '',
        semester: '',
        status: 'Pending',
        payment_status: 'Pending',
    });

    // Handle create enrollment
    const handleCreateEnrollment = () => {
        createForm.post(route('enrollment.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
                toast.success('Enrollment created successfully');
            },
            onError: () => {
                toast.error('Please fill in all required fields correctly');
            },
        });
    };

    // Handle edit enrollment
    const handleEditEnrollment = () => {
        if (!currentEnrollment) return;

        editForm.put(route('enrollment.update', currentEnrollment.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setCurrentEnrollment(null);
                editForm.reset();
                toast.success('Enrollment updated successfully');
            },
            onError: () => {
                toast.error('Please fill in all required fields correctly');
            },
        });
    };

    // Handle delete enrollment
    const handleDeleteEnrollment = () => {
        if (!currentEnrollment) return;

        router.delete(route('enrollment.destroy', currentEnrollment.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setCurrentEnrollment(null);
                toast.success('Enrollment deleted successfully');
            },
        });
    };

    // Export PDF
    const handleExportPdf = (enrollment) => {
        window.location.href = route('enrollment.exportPdf', enrollment.id);
    };

    // Set form data for editing
    const prepareEditForm = (enrollment) => {
        editForm.setData({
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

                            <Select
                                value={statusFilter}
                                onValueChange={(value) => {
                                    setStatusFilter(value);
                                    setTimeout(applyFilters, 100);
                                }}
                            >
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

                            <Select
                                value={paymentFilter}
                                onValueChange={(value) => {
                                    setPaymentFilter(value);
                                    setTimeout(applyFilters, 100);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Payment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Payments</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={academicYearFilter}
                                onValueChange={(value) => {
                                    setAcademicYearFilter(value);
                                    setTimeout(applyFilters, 100);
                                }}
                            >
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

                            <Select
                                value={semesterFilter}
                                onValueChange={(value) => {
                                    setSemesterFilter(value);
                                    setTimeout(applyFilters, 100);
                                }}
                            >
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
                                    {enrollments.data && enrollments.data.length > 0 ? (
                                        enrollments.data.map((enrollment) => (
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
                                                            <DropdownMenuItem onClick={() => handleExportPdf(enrollment)}>
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
                        {enrollments.links && (
                            <div className="mt-4">
                                <Pagination>
                                    <PaginationContent>
                                        {enrollments.links.map((link, i) => {
                                            if (link.url === null) {
                                                return (
                                                    <PaginationItem key={i}>
                                                        {link.label.includes('Previous') ? (
                                                            <PaginationPrevious disabled />
                                                        ) : link.label.includes('Next') ? (
                                                            <PaginationNext disabled />
                                                        ) : (
                                                            <PaginationEllipsis />
                                                        )}
                                                    </PaginationItem>
                                                );
                                            }

                                            return (
                                                <PaginationItem key={i}>
                                                    {link.label.includes('Previous') ? (
                                                        <PaginationPrevious href={link.url} />
                                                    ) : link.label.includes('Next') ? (
                                                        <PaginationNext href={link.url} />
                                                    ) : (
                                                        <PaginationLink href={link.url} isActive={link.active}>
                                                            {link.label}
                                                        </PaginationLink>
                                                    )}
                                                </PaginationItem>
                                            );
                                        })}
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
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
                        formData={createForm.data}
                        errors={createForm.errors}
                        updateFormData={(field, value) => createForm.setData(field, value)}
                        students={students}
                        courses={courses}
                        departments={departments}
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                createForm.reset();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleCreateEnrollment} disabled={createForm.processing}>
                            {createForm.processing ? 'Creating...' : 'Create Enrollment'}
                        </Button>
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
                            formData={editForm.data}
                            errors={editForm.errors}
                            updateFormData={(field, value) => editForm.setData(field, value)}
                            courses={courses}
                            departments={departments}
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
                                editForm.reset();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleEditEnrollment} disabled={editForm.processing}>
                            {editForm.processing ? 'Saving...' : 'Save Changes'}
                        </Button>
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
