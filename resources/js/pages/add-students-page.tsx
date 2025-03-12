'use client';

import type React from 'react';

import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Course, Student } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Students',
        href: '/add-students',
    },
];

function AddStudentPage({ auth, courses, students: initialStudents }: { auth: any; courses: Course[]; students: any }) {
    const { errors: pageErrors, flash } = usePage().props as any;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');

    // Initialize with safe defaults to prevent the error
    const [currentPage, setCurrentPage] = useState(initialStudents?.meta?.current_page || 1);
    const [students, setStudents] = useState(initialStudents?.data || []);
    const [meta, setMeta] = useState(
        initialStudents?.meta || {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
        },
    );

    const { data, setData, post, put, processing, errors, reset, setError, clearErrors } = useForm({
        name: '',
        email: '',
        year_level: '',
        block: '',
        course_id: '',
        status: 'Regular' as 'Regular' | 'Irregular',
        enrollment_status: 'Enrolled' as 'Enrolled' | 'Not Enrolled' | 'Graduated' | 'Dropped Out',
    });

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Set server-side validation errors
    useEffect(() => {
        if (pageErrors) {
            Object.keys(pageErrors).forEach((key) => {
                if (typeof pageErrors[key] === 'string') {
                    setError(key, pageErrors[key]);
                } else if (Array.isArray(pageErrors[key])) {
                    setError(key, pageErrors[key][0]);
                }
            });
        }
    }, [pageErrors, setError]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(editingStudent?.id);

        if (editingStudent) {
            put(`/add-students/${editingStudent.id}`, {
                onSuccess: () => {
                    reset();
                    setEditingStudent(null);
                    setIsDialogOpen(false);
                    fetchStudents(currentPage, searchQuery, courseFilter);
                },
                onError: () => {
                    // Keep dialog open if there are errors
                },
            });
        } else {
            post('/add-students', {
                onSuccess: () => {
                    reset();
                    setIsDialogOpen(false);
                    fetchStudents(currentPage, searchQuery, courseFilter);
                },
                onError: () => {
                    // Keep dialog open if there are errors
                },
            });
        }
    };

    const handleEdit = (student: Student) => {
        setEditingStudent(student);
        setData({
            name: student.user.name,
            email: student.user.email,
            year_level: student.year_level.toString(),
            block: student.block.toString(),
            course_id: student.course.id.toString(),
            status: student.status,
            enrollment_status: student.enrollment_status,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (studentId: string) => {
        if (confirm('Are you sure you want to delete this student?')) {
            router.delete(`/add-students/${studentId}`, {
                onSuccess: (page) => {
                    // Check if we have a flash message from the server
                    if (page?.props?.flash?.success) {
                        toast.success(page.props.flash.success);
                    } else {
                        toast.success('Student deleted successfully');
                    }
                    fetchStudents(currentPage, searchQuery, courseFilter);
                },
                onError: (errors) => {
                    console.error('Delete error:', errors);
                    toast.error('Error deleting student: ' + (errors.message || 'Unknown error'));
                },
            });
        }
    };

    const fetchStudents = (page = 1, search = searchQuery, courseId = courseFilter) => {
        let url = `/add-students?page=${page}`;

        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }

        if (courseId && courseId !== 'all') {
            url += `&course_id=${courseId}`;
        }

        router.get(
            url,
            {},
            {
                preserveState: true, // Preserve page state when making the request
                onSuccess: (response) => {
                    if (response.props && response.props.students && response.props.students.data) {
                        setStudents(response.props.students.data);
                        setMeta(response.props.students.meta || {}); // Provide default empty object if meta is undefined
                        setCurrentPage(response.props.students.meta?.current_page || 1); // Use fallback if meta or current_page is undefined
                    } else {
                        console.error('Students data or pagination meta is missing:', response);
                        toast.error('Failed to load students data');
                    }
                },
                onError: (error) => {
                    console.error('Error fetching students:', error);
                    toast.error('Failed to fetch students');
                },
            },
        );
    };

    const clearFilters = () => {
        setSearchQuery('');
        setCourseFilter('all');
        fetchStudents(1, '', 'all');
    };

    useEffect(() => {
        // Debounce search and filter changes
        const timer = setTimeout(() => {
            fetchStudents(1, searchQuery, courseFilter);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, courseFilter]);

    const handlePageChange = (page: number) => {
        fetchStudents(page, searchQuery, courseFilter);
    };

    const handleAddNewClick = () => {
        setEditingStudent(null);
        reset();
        clearErrors();
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setEditingStudent(null);
        reset();
        clearErrors();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Students" />
            <Toaster />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Students</CardTitle>
                                <CardDescription>Manage students in your department courses.</CardDescription>
                            </div>
                            <Button onClick={handleAddNewClick}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Student
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                            <div className="flex flex-1 items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                                    <Input
                                        placeholder="Search by name or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                                <div className="w-[200px]">
                                    <Select value={courseFilter} onValueChange={setCourseFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filter by course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Courses</SelectItem>
                                            {courses.map((course) => (
                                                <SelectItem key={course.id} value={course.id.toString()}>
                                                    {course.course_code}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {(searchQuery || courseFilter !== 'all') && (
                                    <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters">
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Year & Block</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Enrollment</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.length > 0 ? (
                                    students.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.user.name}</TableCell>
                                            <TableCell>{student.user.email}</TableCell>
                                            <TableCell>{student.course.course_code}</TableCell>
                                            <TableCell>
                                                Year {student.year_level}, Block {student.block}
                                            </TableCell>
                                            <TableCell>{student.status}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs ${
                                                        student.enrollment_status === 'Enrolled'
                                                            ? 'bg-green-100 text-green-800'
                                                            : student.enrollment_status === 'Not Enrolled'
                                                              ? 'bg-yellow-100 text-yellow-800'
                                                              : student.enrollment_status === 'Graduated'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {student.enrollment_status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}>
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="sr-only">Edit</span>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Delete</span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                                            {searchQuery || courseFilter
                                                ? 'No students found matching your search criteria.'
                                                : 'No students added yet. Add your first student!'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {meta.last_page > 1 && (
                            <div className="mt-4 flex justify-center">
                                <Pagination>
                                    <Button variant="outline" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                        Previous
                                    </Button>
                                    <div className="mx-4 flex items-center">
                                        Page {currentPage} of {meta.last_page}
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === meta.last_page}
                                    >
                                        Next
                                    </Button>
                                </Pagination>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Student Form Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                    <DialogContent className="sm:max-w-[550px]">
                        <DialogHeader>
                            <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                            <DialogDescription>
                                {editingStudent ? 'Update the student details below.' : 'Fill in the student details to add them to the system.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="year_level">Year Level</Label>
                                        <Select value={data.year_level} onValueChange={(value) => setData('year_level', value)}>
                                            <SelectTrigger id="year_level">
                                                <SelectValue placeholder="Select year level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1st Year</SelectItem>
                                                <SelectItem value="2">2nd Year</SelectItem>
                                                <SelectItem value="3">3rd Year</SelectItem>
                                                <SelectItem value="4">4th Year</SelectItem>
                                                <SelectItem value="5">5th Year</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.year_level && <p className="text-sm text-red-500">{errors.year_level}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="block">Block</Label>
                                        <Input
                                            id="block"
                                            type="number"
                                            min="1"
                                            value={data.block}
                                            onChange={(e) => setData('block', e.target.value)}
                                        />
                                        {errors.block && <p className="text-sm text-red-500">{errors.block}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="course">Course</Label>
                                        <Select value={data.course_id} onValueChange={(value) => setData('course_id', value)}>
                                            <SelectTrigger id="course">
                                                <SelectValue placeholder="Select course" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {courses.map((course) => (
                                                    <SelectItem key={course.id} value={course.id.toString()}>
                                                        {course.course_code} - {course.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.course_id && <p className="text-sm text-red-500">{errors.course_id}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={data.status} onValueChange={(value) => setData('status', value as 'Regular' | 'Irregular')}>
                                            <SelectTrigger id="status">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Regular">Regular</SelectItem>
                                                <SelectItem value="Irregular">Irregular</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="enrollment_status">Enrollment Status</Label>
                                    <Select
                                        value={data.enrollment_status}
                                        onValueChange={(value) =>
                                            setData('enrollment_status', value as 'Enrolled' | 'Not Enrolled' | 'Graduated' | 'Dropped Out')
                                        }
                                    >
                                        <SelectTrigger id="enrollment_status">
                                            <SelectValue placeholder="Select enrollment status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Enrolled">Enrolled</SelectItem>
                                            <SelectItem value="Not Enrolled">Not Enrolled</SelectItem>
                                            <SelectItem value="Graduated">Graduated</SelectItem>
                                            <SelectItem value="Dropped Out">Dropped Out</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.enrollment_status && <p className="text-sm text-red-500">{errors.enrollment_status}</p>}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleDialogClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {editingStudent ? 'Update Student' : 'Add Student'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

export default AddStudentPage;
