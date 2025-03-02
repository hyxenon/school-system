'use client';

import { Head, useForm } from '@inertiajs/react';
import { ChevronDown, Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Toaster, toast } from 'sonner';

import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

// Define types
interface Course {
    id: number;
    name: string;
    description?: string;
    course_code: string;
}

interface Department {
    id: number;
    name: string;
    department_code: string;
    program_head_id?: string;
    courses: Course[];
}

interface DepartmentPageProps {
    departments: Department[];
    totalDepartments: number;
    totalCourses: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Departments',
        href: '/department',
    },
];

export default function Department({ departments = [], totalDepartments = 12, totalCourses = 5 }: DepartmentPageProps) {
    // State for modals
    const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
    const [courseModalOpen, setCourseModalOpen] = useState(false);
    const [deleteDepartmentModalOpen, setDeleteDepartmentModalOpen] = useState(false);
    const [deleteCourseModalOpen, setDeleteCourseModalOpen] = useState(false);
    const [currentDepartmentId, setCurrentDepartmentId] = useState<number | null>(null);
    const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Department form
    const departmentForm = useForm({
        id: '',
        department_code: '',
        name: '',
        program_head_id: '',
        _errors: {},
    });

    // Course form
    const courseForm = useForm({
        id: '',
        course_code: '',
        name: '',
        department_id: '',
        _errors: {},
    });

    // Open department modal for adding
    const openAddDepartmentModal = () => {
        departmentForm.reset();
        setIsEditMode(false);
        setDepartmentModalOpen(true);
    };

    // Open department modal for editing
    const editDepartment = (department: Department) => {
        departmentForm.setData({
            id: department.id.toString(),
            department_code: department.department_code,
            name: department.name,
            program_head_id: department.program_head_id || '',
        });
        setIsEditMode(true);
        setCurrentDepartmentId(department.id);
        setDepartmentModalOpen(true);
    };

    // Open course modal for adding
    const openAddCourseModal = (departmentId: number) => {
        courseForm.reset();
        courseForm.setData('department_id', departmentId.toString());
        setIsEditMode(false);
        setCourseModalOpen(true);
    };

    // Open course modal for editing
    const editCourse = (course: Course, departmentId: number) => {
        courseForm.setData({
            id: course.id.toString(),
            course_code: course.course_code,
            name: course.name,
            department_id: departmentId.toString(),
        });
        setIsEditMode(true);
        setCurrentCourseId(course.id);
        setCourseModalOpen(true);
    };

    // Confirm department deletion
    const confirmDepartmentDelete = (departmentId: number, departmentName: string) => {
        setCurrentDepartmentId(departmentId);
        departmentForm.setData('name', departmentName);
        setDeleteDepartmentModalOpen(true);
    };

    // Confirm course deletion
    const confirmCourseDelete = (courseId: number, courseName: string) => {
        setCurrentCourseId(courseId);
        courseForm.setData('name', courseName);
        setDeleteCourseModalOpen(true);
    };

    // Submit department form
    const submitDepartmentForm = () => {
        // Client-side validation
        let hasErrors = false;
        const errors = {};

        if (!departmentForm.data.department_code.trim()) {
            errors.department_code = 'Department code is required';
            hasErrors = true;
        }

        if (!departmentForm.data.name.trim()) {
            errors.name = 'Department name is required';
            hasErrors = true;
        }

        if (hasErrors) {
            departmentForm.setError(errors);
            return;
        }

        if (isEditMode) {
            departmentForm.put(`/departments/${currentDepartmentId}`, {
                onSuccess: () => {
                    setDepartmentModalOpen(false);
                    toast.success('Department updated successfully');
                },
            });
        } else {
            departmentForm.post('/departments', {
                onSuccess: () => {
                    setDepartmentModalOpen(false);
                    toast.success('Department added successfully');
                },
            });
        }
    };

    // Submit course form
    const submitCourseForm = () => {
        // Client-side validation
        let hasErrors = false;
        const errors = {};

        if (!courseForm.data.course_code.trim()) {
            errors.course_code = 'Course code is required';
            hasErrors = true;
        }

        if (!courseForm.data.name.trim()) {
            errors.name = 'Course name is required';
            hasErrors = true;
        }

        if (hasErrors) {
            courseForm.setError(errors);
            return;
        }

        if (isEditMode) {
            courseForm.put(`/courses/${currentCourseId}`, {
                onSuccess: () => {
                    setCourseModalOpen(false);
                    toast.success('Course updated successfully');
                },
            });
        } else {
            courseForm.post('/courses', {
                onSuccess: () => {
                    setCourseModalOpen(false);
                    toast.success('Course added successfully');
                },
            });
        }
    };

    // Delete department
    const deleteDepartment = () => {
        departmentForm.delete(`/departments/${currentDepartmentId}`, {
            onSuccess: () => {
                setDeleteDepartmentModalOpen(false);
                toast.success('Department deleted successfully');
            },
        });
    };

    // Delete course
    const deleteCourse = () => {
        courseForm.delete(`/courses/${currentCourseId}`, {
            onSuccess: () => {
                setDeleteCourseModalOpen(false);
                toast.success('Course deleted successfully');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Department Management" />
            <Toaster position="top-right" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Stats Section */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    <StatCard
                        title="Total Departments"
                        value={totalDepartments}
                        icon={Plus}
                        description="All Departments"
                        trend={{ value: 12, isPositive: true }}
                    />
                    <StatCard
                        title="Total Courses"
                        value={totalCourses}
                        icon={Plus}
                        description="Currently Active"
                        trend={{ value: 8, isPositive: true }}
                    />
                </div>

                {/* Department List Section */}
                <div className="mt-8 mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold"></h2>
                    <Button onClick={openAddDepartmentModal}>
                        <Plus className="mr-2 h-4 w-4" /> Add Department
                    </Button>
                </div>

                <div className="space-y-4">
                    {departments.map((department) => (
                        <Card key={department.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/50 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CardTitle>{department.name}</CardTitle>
                                        <Badge variant="outline">{department.department_code}</Badge>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => editDepartment(department)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <Collapsible defaultOpen className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold">Courses</h4>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                        </CollapsibleTrigger>
                                    </div>
                                    <CollapsibleContent>
                                        <ul className="space-y-2 pl-2">
                                            {department.courses.map((course) => (
                                                <li key={course.id} className="rounded-md border p-2">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="font-medium">{course.name}</span>
                                                            <span className="text-muted-foreground ml-2 text-sm">{course.description}</span>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <Button variant="outline" size="sm" onClick={() => editCourse(course, department.id)}>
                                                                <Edit className="mr-1 h-3 w-3" /> Edit
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => confirmCourseDelete(course.id, course.name)}
                                                            >
                                                                <Trash2 className="mr-1 h-3 w-3" /> Delete
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                        <Button variant="ghost" size="sm" className="mt-2" onClick={() => openAddCourseModal(department.id)}>
                                            <Plus className="mr-1 h-3 w-3" /> Add Course
                                        </Button>
                                    </CollapsibleContent>
                                </Collapsible>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Department Modal */}
                <Dialog open={departmentModalOpen} onOpenChange={setDepartmentModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{isEditMode ? 'Edit Department' : 'Add Department'}</DialogTitle>
                            <DialogDescription>
                                {isEditMode ? 'Update the department details below.' : 'Fill in the department details below.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="department_code" className="col-span-4">
                                    Department Code
                                </Label>
                                <Input
                                    id="department_code"
                                    placeholder="CECT"
                                    className={`col-span-4 ${departmentForm.errors.department_code ? 'border-red-500' : ''}`}
                                    value={departmentForm.data.department_code}
                                    onChange={(e) => {
                                        departmentForm.setData('department_code', e.target.value);
                                        if (e.target.value.trim()) {
                                            departmentForm.clearErrors('department_code');
                                        }
                                    }}
                                    required
                                />
                                {departmentForm.errors.department_code && (
                                    <p className="col-span-4 text-sm text-red-500">{departmentForm.errors.department_code}</p>
                                )}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="col-span-4">
                                    Department Name
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="College of Engineering"
                                    className={`col-span-4 ${departmentForm.errors.name ? 'border-red-500' : ''}`}
                                    value={departmentForm.data.name}
                                    onChange={(e) => {
                                        departmentForm.setData('name', e.target.value);
                                        if (e.target.value.trim()) {
                                            departmentForm.clearErrors('name');
                                        }
                                    }}
                                    required
                                />
                                {departmentForm.errors.name && <p className="col-span-4 text-sm text-red-500">{departmentForm.errors.name}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="program_head_id" className="col-span-4">
                                    Program Head ID (Optional)
                                </Label>
                                <Input
                                    id="program_head_id"
                                    placeholder="21-0477-551"
                                    className="col-span-4"
                                    value={departmentForm.data.program_head_id}
                                    onChange={(e) => departmentForm.setData('program_head_id', e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter className="flex justify-between">
                            {isEditMode && (
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        setDepartmentModalOpen(false);
                                        confirmDepartmentDelete(Number(departmentForm.data.id), departmentForm.data.name);
                                    }}
                                >
                                    Delete Department
                                </Button>
                            )}
                            <div className="flex space-x-2">
                                <Button variant="outline" onClick={() => setDepartmentModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" onClick={submitDepartmentForm}>
                                    {isEditMode ? 'Save Changes' : 'Add Department'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Course Modal */}
                <Dialog open={courseModalOpen} onOpenChange={setCourseModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{isEditMode ? 'Edit Course' : 'Add Course'}</DialogTitle>
                            <DialogDescription>
                                {isEditMode ? 'Update the course details below.' : 'Fill in the course details below.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="course_code" className="col-span-4">
                                    Course Code
                                </Label>
                                <Input
                                    id="course_code"
                                    placeholder="BSIT"
                                    className={`col-span-4 ${courseForm.errors.course_code ? 'border-red-500' : ''}`}
                                    value={courseForm.data.course_code}
                                    onChange={(e) => {
                                        courseForm.setData('course_code', e.target.value);
                                        if (e.target.value.trim()) {
                                            courseForm.clearErrors('course_code');
                                        }
                                    }}
                                    required
                                />
                                {courseForm.errors.course_code && <p className="col-span-4 text-sm text-red-500">{courseForm.errors.course_code}</p>}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="course_name" className="col-span-4">
                                    Course Name
                                </Label>
                                <Input
                                    id="course_name"
                                    placeholder="Bachelor of Science in Information Technology"
                                    className={`col-span-4 ${courseForm.errors.name ? 'border-red-500' : ''}`}
                                    value={courseForm.data.name}
                                    onChange={(e) => {
                                        courseForm.setData('name', e.target.value);
                                        if (e.target.value.trim()) {
                                            courseForm.clearErrors('name');
                                        }
                                    }}
                                    required
                                />
                                {courseForm.errors.name && <p className="col-span-4 text-sm text-red-500">{courseForm.errors.name}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCourseModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" onClick={submitCourseForm}>
                                {isEditMode ? 'Save Changes' : 'Add Course'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Department Confirmation Modal */}
                <Dialog open={deleteDepartmentModalOpen} onOpenChange={setDeleteDepartmentModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Confirm Department Deletion</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete the department <strong>{departmentForm.data.name}</strong>? This action cannot be
                                undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDepartmentModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={deleteDepartment}>
                                Delete Department
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Course Confirmation Modal */}
                <Dialog open={deleteCourseModalOpen} onOpenChange={setDeleteCourseModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Confirm Course Deletion</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete the course <strong>{courseForm.data.name}</strong>? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteCourseModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={deleteCourse}>
                                Delete Course
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
