import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Course, Department, Subject } from '@/types';
import { Head } from '@inertiajs/react';
import { Edit, FilterX, Plus, Search, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Subjects',
        href: '/subjects',
    },
];

// In a real app, these would come from your API
const mockDepartments: Department[] = [
    { id: 1, department_code: 'CS', name: 'Computer Science', courses: [], created_at: '', updated_at: '' },
    { id: 2, department_code: 'MATH', name: 'Mathematics', courses: [], created_at: '', updated_at: '' },
];

const mockCourses: Course[] = [
    { id: 1, name: 'Bachelor of Science in Computer Science', course_code: 'BSCS', created_at: '', updated_at: '' },
    { id: 2, name: 'Bachelor of Science in Information Technology', course_code: 'BSIT', created_at: '', updated_at: '' },
];

const mockSubjects: Subject[] = [
    {
        id: 1,
        code: 'CS101',
        name: 'Introduction to Programming',
        course: mockCourses[0],
        credits: 3,
        description: 'Basic programming concepts',
        created_at: '',
        updated_at: '',
    },
    {
        id: 2,
        code: 'CS201',
        name: 'Data Structures',
        course: mockCourses[0],
        credits: 4,
        description: 'Advanced data structures',
        created_at: '',
        updated_at: '',
    },
    {
        id: 3,
        code: 'IT101',
        name: 'IT Fundamentals',
        course: mockCourses[1],
        credits: 3,
        description: 'Basic IT concepts',
        created_at: '',
        updated_at: '',
    },
];

function SubjectPage() {
    const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
    const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>(mockSubjects);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [selectedCourse, setSelectedCourse] = useState<string>('all');

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
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        let result = [...subjects];

        if (searchTerm) {
            result = result.filter(
                (subject) =>
                    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) || subject.code.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        if (selectedCourse && selectedCourse !== 'all') {
            result = result.filter((subject) => subject.course?.id.toString() === selectedCourse);
        }

        if (selectedDepartment && selectedDepartment !== 'all') {
            const departmentCourses =
                mockDepartments.find((dept) => dept.id.toString() === selectedDepartment)?.courses.map((course) => course.id) || [];

            result = result.filter((subject) => subject.course && departmentCourses.includes(subject.course.id));
        }

        setFilteredSubjects(result);
    }, [searchTerm, selectedDepartment, selectedCourse, subjects]);

    // Reset filters
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedDepartment('all');
        setSelectedCourse('all');
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
        setFormData({ ...formData, [name]: parseInt(value) || 0 });

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

        const newSubject: Subject = {
            id: subjects.length + 1,
            code: formData.code || '',
            name: formData.name || '',
            credits: formData.credits || 0,
            description: formData.description || '',
            course: mockCourses.find((c) => c.id.toString() === formData.courseId?.toString()) || undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        setSubjects([...subjects, newSubject]);
        setIsAddModalOpen(false);
        toast.success('Subject added successfully');
        resetForm();
    };

    const handleEditSubject = () => {
        if (!validateForm() || !currentSubject) return;

        const updatedSubjects = subjects.map((subject) =>
            subject.id === currentSubject.id
                ? {
                      ...subject,
                      code: formData.code || subject.code,
                      name: formData.name || subject.name,
                      credits: formData.credits !== undefined ? formData.credits : subject.credits,
                      description: formData.description !== undefined ? formData.description : subject.description,
                      course: formData.courseId ? mockCourses.find((c) => c.id.toString() === formData.courseId?.toString()) : subject.course,
                      updated_at: new Date().toISOString(),
                  }
                : subject,
        );

        setSubjects(updatedSubjects);
        setIsEditModalOpen(false);
        toast.success('Subject updated successfully');
        resetForm();
    };

    const handleDeleteSubject = () => {
        if (!currentSubject) return;

        const updatedSubjects = subjects.filter((subject) => subject.id !== currentSubject.id);
        setSubjects(updatedSubjects);
        setIsDeleteModalOpen(false);
        toast.success('Subject deleted successfully');
    };

    // Open edit modal with current subject data
    const openEditModal = (subject: Subject) => {
        setCurrentSubject(subject);
        setFormData({
            code: subject.code,
            name: subject.name,
            credits: subject.credits,
            description: subject.description,
            courseId: subject.course?.id.toString(),
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
            courseId: '',
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

                            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {mockDepartments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id.toString()}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Course" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Courses</SelectItem>
                                    {mockCourses.map((course) => (
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
                                    {filteredSubjects.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-6 text-center text-gray-500">
                                                No subjects found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredSubjects.map((subject) => (
                                            <TableRow key={subject.id}>
                                                <TableCell className="font-medium">{subject.code}</TableCell>
                                                <TableCell>{subject.name}</TableCell>
                                                <TableCell>{subject.course?.course_code || '-'}</TableCell>
                                                <TableCell>{subject.credits}</TableCell>
                                                <TableCell className="max-w-xs truncate">{subject.description}</TableCell>
                                                <TableCell className="space-x-2 text-right">
                                                    <Button className="cursor-pointer" variant={'outline'} onClick={() => openEditModal(subject)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button className="cursor-pointer" variant={'outline'} onClick={() => openDeleteModal(subject)}>
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
                </Card>
            </div>

            {/* Add Subject Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
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
                            <Label htmlFor="courseId">Course</Label>
                            <Select value={formData.courseId as string} onValueChange={(value) => handleSelectChange('courseId', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockCourses.map((course) => (
                                        <SelectItem key={course.id} value={course.id.toString()}>
                                            {course.course_code} - {course.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                        <Button onClick={handleAddSubject}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Subject Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
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
                            <Label htmlFor="edit-courseId">Course</Label>
                            <Select value={formData.courseId as string} onValueChange={(value) => handleSelectChange('courseId', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockCourses.map((course) => (
                                        <SelectItem key={course.id} value={course.id.toString()}>
                                            {course.course_code} - {course.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
