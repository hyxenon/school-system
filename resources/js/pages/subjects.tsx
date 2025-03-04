'use client';
import type React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Course, Department, Subject } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Edit, FilterX, Plus, Search, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Subjects',
        href: '/subjects',
    },
];

// Define the pagination type
interface PaginationData {
    current_page: number;
    data: Subject[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

// Define props interface
interface SubjectPageProps {
    subjects: PaginationData;
    courses: Course[];
    departments: Department[];
    filters: {
        search?: string;
        department?: string;
        course?: string;
    };
}

function SubjectPage({ subjects, courses, departments, filters }: SubjectPageProps) {
    // State for filter values
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedDepartment, setSelectedDepartment] = useState(filters.department || 'all');
    const [selectedCourse, setSelectedCourse] = useState(filters.course || 'all');

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<Subject>>({
        code: '',
        name: '',
        credits: 3,
        description: '',
        course_id: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Get flash messages from the page props
    const { flash } = usePage().props as any;

    // Show toast notifications for flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== filters.search) {
                applyFilters();
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Apply filters
    const applyFilters = () => {
        router.get(
            '/subjects',
            {
                search: searchTerm,
                department: selectedDepartment,
                course: selectedCourse,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Reset filters
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedDepartment('all');
        setSelectedCourse('all');

        router.get(
            '/subjects',
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Handle pagination
    const handlePageChange = (url: string) => {
        if (url) {
            // Extract the page number from the URL
            const urlObj = new URL(url);
            const page = urlObj.searchParams.get('page');

            router.get(
                '/subjects',
                {
                    page,
                    search: searchTerm,
                    department: selectedDepartment,
                    course: selectedCourse,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }
    };

    // Form handling
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error when field is edited
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: Number.parseInt(value) || 0 });

        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });

        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    // Select handlers for filters
    const handleDepartmentChange = (value: string) => {
        setSelectedDepartment(value);
        router.get(
            '/subjects',
            {
                search: searchTerm,
                department: value,
                course: selectedCourse,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleCourseChange = (value: string) => {
        setSelectedCourse(value);
        router.get(
            '/subjects',
            {
                search: searchTerm,
                department: selectedDepartment,
                course: value,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Validation
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.code || formData.code.trim() === '') {
            newErrors.code = 'Subject code is required';
        }

        if (!formData.name || formData.name.trim() === '') {
            newErrors.name = 'Subject name is required';
        }

        if (!formData.credits || formData.credits <= 0) {
            newErrors.credits = 'Credits must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // CRUD operations
    const handleAddSubject = () => {
        if (!validateForm()) return;

        router.post('/subjects', formData, {
            onSuccess: () => {
                setIsAddModalOpen(false);
                toast.success('Subject added successfully');
                resetForm();
            },
            onError: (errors) => {
                setErrors(errors);
            },
        });
    };

    const handleEditSubject = () => {
        if (!validateForm() || !currentSubject) return;

        router.put(`/subjects/${currentSubject.id}`, formData, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                resetForm();
                toast.success('Subject updated successfully');
            },
            onError: (errors) => {
                setErrors(errors);
            },
        });
    };

    const handleDeleteSubject = () => {
        if (!currentSubject) return;

        router.delete(`/subjects/${currentSubject.id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                toast.success('Subject deleted successfully');
            },
        });
    };

    // Open edit modal with current subject data
    const openEditModal = (subject: Subject) => {
        setCurrentSubject(subject);
        setFormData({
            code: subject.code,
            name: subject.name,
            credits: subject.credits,
            description: subject.description,
            course_id: subject.course?.id.toString() || '',
        });
        setIsEditModalOpen(true);
    };

    // Open delete modal with current subject
    const openDeleteModal = (subject: Subject) => {
        setCurrentSubject(subject);
        setIsDeleteModalOpen(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            credits: 3,
            description: '',
            course_id: '',
        });
        setErrors({});
        setCurrentSubject(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subjects" />
            <Toaster />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card>
                    <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div>
                            <CardTitle>Subjects</CardTitle>
                            <CardDescription>Manage all subjects</CardDescription>
                        </div>
                        <Button onClick={() => setIsAddModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Subject
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                <Input
                                    placeholder="Search by name or code..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id.toString()}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedCourse} onValueChange={handleCourseChange}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Course" />
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
                            <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto">
                                <FilterX className="mr-2 h-4 w-4" /> Reset
                            </Button>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Credits</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subjects.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-6 text-center text-gray-500">
                                                No subjects found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        subjects.data.map((subject) => (
                                            <TableRow key={subject.id}>
                                                <TableCell className="font-medium">{subject.code}</TableCell>
                                                <TableCell>{subject.name}</TableCell>
                                                <TableCell>{subject.course?.course_code || '-'}</TableCell>
                                                <TableCell>{subject.credits}</TableCell>
                                                <TableCell className="max-w-xs truncate">{subject.description}</TableCell>
                                                <TableCell className="space-x-2 text-right">
                                                    <Button variant={'outline'} onClick={() => openEditModal(subject)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant={'outline'} onClick={() => openDeleteModal(subject)}>
                                                        <Trash className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>

                    {/* Pagination */}
                    {subjects.last_page > 1 && (
                        <CardFooter className="flex items-center justify-between px-6 py-4">
                            <div className="text-sm text-gray-500">
                                Showing {subjects.from} to {subjects.to} of {subjects.total} subjects
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(subjects.prev_page_url || '')}
                                    disabled={!subjects.prev_page_url}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                {subjects.links
                                    .filter((link) => !link.label.includes('Previous') && !link.label.includes('Next'))
                                    .map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handlePageChange(link.url || '')}
                                            disabled={!link.url}
                                        >
                                            {link.label}
                                        </Button>
                                    ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(subjects.next_page_url || '')}
                                    disabled={!subjects.next_page_url}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>
            {/* Add Subject Modal */}
            <Dialog
                open={isAddModalOpen}
                onOpenChange={(open) => {
                    setIsAddModalOpen(open);
                    if (open) {
                        resetForm();
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Subject</DialogTitle>
                        <DialogDescription>Create a new subject with the form below.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="code">Subject Code *</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    placeholder="CS101"
                                    className={errors.code ? 'border-red-500' : ''}
                                />
                                {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="credits">Credits *</Label>
                                <Input
                                    id="credits"
                                    name="credits"
                                    type="number"
                                    value={formData.credits}
                                    onChange={handleNumberChange}
                                    min="1"
                                    className={errors.credits ? 'border-red-500' : ''}
                                />
                                {errors.credits && <p className="text-sm text-red-500">{errors.credits}</p>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">Subject Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Introduction to Programming"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="course_id">Course</Label>
                            <Select value={formData.course_id as string} onValueChange={(value) => handleSelectChange('course_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
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
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter subject description"
                                rows={3}
                            />
                            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsAddModalOpen(false);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAddSubject}>Add Subject</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Subject Modal */}
            <Dialog
                open={isEditModalOpen}
                onOpenChange={(open) => {
                    setIsEditModalOpen(open);
                    if (!open) {
                        resetForm();
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Subject</DialogTitle>
                        <DialogDescription>Update the subject details with the form below.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-code">Subject Code *</Label>
                                <Input
                                    id="edit-code"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    placeholder="CS101"
                                    className={errors.code ? 'border-red-500' : ''}
                                />
                                {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="edit-credits">Credits *</Label>
                                <Input
                                    id="edit-credits"
                                    name="credits"
                                    type="number"
                                    value={formData.credits}
                                    onChange={handleNumberChange}
                                    min="1"
                                    className={errors.credits ? 'border-red-500' : ''}
                                />
                                {errors.credits && <p className="text-sm text-red-500">{errors.credits}</p>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="edit-name">Subject Name *</Label>
                            <Input
                                id="edit-name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Introduction to Programming"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="edit-course_id">Course</Label>
                            <Select value={formData.course_id as string} onValueChange={(value) => handleSelectChange('course_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
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
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter subject description"
                                rows={3}
                            />
                            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditModalOpen(false);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleEditSubject}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the subject "{currentSubject?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteSubject}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

export default SubjectPage;
