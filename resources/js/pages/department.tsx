import { Head, useForm } from '@inertiajs/react';
import { ChevronDown, Edit, FileText, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Course, Department } from '@/types';

interface DepartmentPageProps {
    departments: Department[];
    totalDepartments: number;
    totalCourses: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Departments and Courses',
        href: '/department',
    },
];

export default function Department({ departments = [], totalDepartments = 12, totalCourses = 5 }: DepartmentPageProps) {
    // State for modals
    console.log(departments);
    const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
    const [courseModalOpen, setCourseModalOpen] = useState(false);
    const [deleteDepartmentModalOpen, setDeleteDepartmentModalOpen] = useState(false);
    const [deleteCourseModalOpen, setDeleteCourseModalOpen] = useState(false);
    const [currentDepartmentId, setCurrentDepartmentId] = useState<number | null>(null);
    const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Search functionality
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(departments);

    // Update filtered departments when search query changes
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredDepartments(departments);
        } else {
            const lowercaseQuery = searchQuery.toLowerCase();
            const filtered = departments.filter(
                (dept) =>
                    dept.name.toLowerCase().includes(lowercaseQuery) ||
                    dept.department_code.toLowerCase().includes(lowercaseQuery) ||
                    dept.courses.some(
                        (course) => course.name.toLowerCase().includes(lowercaseQuery) || course.course_code.toLowerCase().includes(lowercaseQuery),
                    ),
            );
            setFilteredDepartments(filtered);
        }
    }, [searchQuery, departments]);

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
            setIsLoading(true);
            departmentForm.put(`/departments/${currentDepartmentId}`, {
                onSuccess: () => {
                    setDepartmentModalOpen(false);
                    setIsLoading(false);
                    toast.success('Department updated successfully');
                },
                onError: () => {
                    setIsLoading(false);
                },
            });
        } else {
            setIsLoading(true);
            departmentForm.post('/departments', {
                onSuccess: () => {
                    setDepartmentModalOpen(false);
                    setIsLoading(false);
                    toast.success('Department added successfully');
                },
                onError: () => {
                    setIsLoading(false);
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
            setIsLoading(true);
            courseForm.put(`/courses/${currentCourseId}`, {
                onSuccess: () => {
                    setCourseModalOpen(false);
                    toast.success('Course updated successfully');
                    setIsLoading(false);
                },
                onError: () => {
                    setIsLoading(false);
                },
            });
        } else {
            setIsLoading(true);
            courseForm.post('/courses', {
                onSuccess: () => {
                    setCourseModalOpen(false);
                    toast.success('Course added successfully');
                    setIsLoading(false);
                },
                onError: () => {
                    setIsLoading(false);
                },
            });
        }
    };

    // Delete department
    const deleteDepartment = () => {
        setIsLoading(true);
        departmentForm.delete(`/departments/${currentDepartmentId}`, {
            onSuccess: () => {
                setDeleteDepartmentModalOpen(false);
                toast.success('Department deleted successfully');
                setIsLoading(false);
            },
            onError: () => {
                setIsLoading(false);
            },
        });
    };

    // Delete course
    const deleteCourse = () => {
        setIsLoading(true);
        courseForm.delete(`/courses/${currentCourseId}`, {
            onSuccess: () => {
                setDeleteCourseModalOpen(false);
                setIsLoading(false);
                toast.success('Course deleted successfully');
            },
            onError: () => {
                setIsLoading(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Department Management" />
            <Toaster />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Stats Section */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    <StatCard
                        title="Total Departments"
                        value={totalDepartments}
                        icon={FileText}
                        description="All Departments"
                        trend={{ value: 12, isPositive: true }}
                    />
                    <StatCard
                        title="Total Courses"
                        value={totalCourses}
                        icon={FileText}
                        description="Currently Active"
                        trend={{ value: 8, isPositive: true }}
                    />
                </div>

                {/* Search and Add Department Section */}
                <div className="mt-8 mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="relative w-full sm:w-96">
                        <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                        <Input
                            type="search"
                            placeholder="Search departments or courses..."
                            className="w-full pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={openAddDepartmentModal} className="flex w-full items-center gap-2 transition-all sm:w-auto">
                        <Plus className="h-4 w-4" /> Add Department
                    </Button>
                </div>

                {/* Department List Section */}
                <div className="space-y-4">
                    {filteredDepartments.length === 0 ? (
                        <Card className="p-8">
                            <div className="flex flex-col items-center justify-center text-center">
                                <FileText className="text-muted-foreground mb-4 h-12 w-12 opacity-50" />
                                <h3 className="text-lg font-medium">No departments found</h3>
                                <p className="text-muted-foreground mt-1">
                                    {searchQuery ? 'Try adjusting your search query.' : 'Get started by adding a new department.'}
                                </p>
                                {!searchQuery && (
                                    <Button onClick={openAddDepartmentModal} className="mt-4">
                                        <Plus className="mr-2 h-4 w-4" /> Add Department
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ) : (
                        filteredDepartments.map((department) => (
                            <Card key={department.id} className="overflow-hidden transition-all duration-200 hover:shadow-md">
                                <CardHeader className="bg-muted/50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-xl">{department.name}</CardTitle>
                                            <Badge variant="outline" className="bg-primary/10 font-medium">
                                                {department.department_code}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => editDepartment(department)}
                                                className="hover:bg-primary flex items-center gap-1 transition-colors hover:text-white"
                                            >
                                                <Edit className="h-3.5 w-3.5" /> Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => confirmDepartmentDelete(department.id, department.name)}
                                                className="flex items-center gap-1 opacity-80 hover:opacity-100"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Delete
                                            </Button>
                                        </div>
                                    </div>
                                    {department.program_head_id && (
                                        <CardDescription className="mt-2">
                                            Program Head: <span className="capitalize">{department.program_head.user.name}</span>
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="p-4">
                                    <Collapsible defaultOpen className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold">Courses ({department.courses.length})</h4>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                                                    <ChevronDown className="h-4 w-4" />
                                                </Button>
                                            </CollapsibleTrigger>
                                        </div>
                                        <CollapsibleContent>
                                            {department.courses.length === 0 ? (
                                                <div className="rounded-lg border border-dashed p-6 text-center">
                                                    <p className="text-muted-foreground text-sm">No courses available for this department.</p>
                                                </div>
                                            ) : (
                                                <ul className="mt-2 space-y-2">
                                                    {department.courses.map((course) => (
                                                        <li key={course.id} className="hover:bg-muted/50 rounded-md border p-3 transition-all">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <span className="font-medium">{course.name}</span>
                                                                    <Badge variant="secondary" className="ml-2">
                                                                        {course.course_code}
                                                                    </Badge>
                                                                    {course.description && (
                                                                        <p className="text-muted-foreground mt-1 text-sm">{course.description}</p>
                                                                    )}
                                                                </div>
                                                                <div className="flex space-x-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => editCourse(course, department.id)}
                                                                        className="hover:bg-secondary"
                                                                    >
                                                                        <Edit className="mr-1 h-3 w-3" /> Edit
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="hover:bg-destructive hover:text-white"
                                                                        onClick={() => confirmCourseDelete(course.id, course.name)}
                                                                    >
                                                                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-4 w-full justify-center border-dashed"
                                                onClick={() => openAddCourseModal(department.id)}
                                            >
                                                <Plus className="mr-1 h-3 w-3" /> Add New Course
                                            </Button>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </CardContent>
                            </Card>
                        ))
                    )}
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
                                <Label htmlFor="department_code" className="col-span-4 text-sm font-medium">
                                    Department Code <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="department_code"
                                    placeholder="CECT"
                                    className={`col-span-4 ${departmentForm.errors.department_code ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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
                                <Label htmlFor="name" className="col-span-4 text-sm font-medium">
                                    Department Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="College of Engineering"
                                    className={`col-span-4 ${departmentForm.errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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
                                <Label htmlFor="program_head_id" className="col-span-4 text-sm font-medium">
                                    Program Head ID <span className="text-muted-foreground text-xs">(Optional)</span>
                                </Label>
                                <Input
                                    id="program_head_id"
                                    placeholder="21-0477-551"
                                    className={`col-span-4 ${departmentForm.errors.program_head_id ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    value={departmentForm.data.program_head_id}
                                    onChange={(e) => {
                                        departmentForm.setData('program_head_id', e.target.value);
                                        if (departmentForm.errors.program_head_id) {
                                            departmentForm.clearErrors('program_head_id');
                                        }
                                    }}
                                />
                                {departmentForm.errors.program_head_id && (
                                    <p className="col-span-4 text-sm text-red-500">{departmentForm.errors.program_head_id}</p>
                                )}
                                {departmentForm.errors.error && (
                                    <div className="col-span-4 rounded-md bg-red-50 p-3">
                                        <p className="text-sm text-red-600">{departmentForm.errors.error}</p>
                                    </div>
                                )}
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
                                <Button type="submit" disabled={isLoading} onClick={submitDepartmentForm} className="min-w-[100px]">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditMode ? 'Saving...' : 'Adding...'}
                                        </>
                                    ) : (
                                        <>{isEditMode ? 'Save Changes' : 'Add Department'}</>
                                    )}
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
                                <Label htmlFor="course_code" className="col-span-4 text-sm font-medium">
                                    Course Code <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="course_code"
                                    placeholder="BSIT"
                                    className={`col-span-4 ${courseForm.errors.course_code ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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
                                <Label htmlFor="course_name" className="col-span-4 text-sm font-medium">
                                    Course Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="course_name"
                                    placeholder="Bachelor of Science in Information Technology"
                                    className={`col-span-4 ${courseForm.errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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
                            <Button type="submit" disabled={isLoading} onClick={submitCourseForm} className="min-w-[100px]">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditMode ? 'Saving...' : 'Adding...'}
                                    </>
                                ) : (
                                    <>{isEditMode ? 'Save Changes' : 'Add Course'}</>
                                )}
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
                            <Button variant="destructive" disabled={isLoading} onClick={deleteDepartment}>
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
                            <Button variant="destructive" disabled={isLoading} onClick={deleteCourse}>
                                Delete Course
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
