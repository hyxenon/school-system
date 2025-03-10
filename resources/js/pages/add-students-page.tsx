'use client';

import type React from 'react';

import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Course, Student } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Add Student',
        href: '/add-students',
    },
];

function AddStudentPage({ auth, courses }: { auth: any; courses: Course[] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Mock data for students table - in a real app, this would come from props
    const [students, setStudents] = useState<Student[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        year_level: '',
        block: '',
        course_id: '',
        status: 'Regular' as 'Regular' | 'Irregular',
        enrollment_status: 'Enrolled' as 'Enrolled' | 'Not Enrolled' | 'Graduated' | 'Dropped Out',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/students', {
            onSuccess: () => {
                toast.success('Student added successfully');
                reset();
                setIsDialogOpen(false);
            },
        });
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
        // In a real app, this would be an Inertia delete request
        if (confirm('Are you sure you want to delete this student?')) {
            toast.success('Student deleted successfully');
        }
    };

    const filteredStudents = students.filter(
        (student) =>
            student.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.course.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Student" />
            <Toaster />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Tabs defaultValue="list" className="w-full">
                    <div className="mb-4 flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="list">Student List</TabsTrigger>
                            <TabsTrigger value="add">Add Student</TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-64"
                                icon={<Search className="h-4 w-4" />}
                            />
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        onClick={() => {
                                            setEditingStudent(null);
                                            reset();
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Student
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[550px]">
                                    <DialogHeader>
                                        <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                                        <DialogDescription>
                                            {editingStudent
                                                ? 'Update the student information below.'
                                                : 'Fill in the student details to add them to the system.'}
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
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                    />
                                                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="year_level">Year Level</Label>
                                                    <Select value={data.year_level} onValueChange={(value) => setData('year_level', value)}>
                                                        <SelectTrigger>
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
                                                        <SelectTrigger>
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
                                                    <Select
                                                        value={data.status}
                                                        onValueChange={(value) => setData('status', value as 'Regular' | 'Irregular')}
                                                    >
                                                        <SelectTrigger>
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
                                                        setData(
                                                            'enrollment_status',
                                                            value as 'Enrolled' | 'Not Enrolled' | 'Graduated' | 'Dropped Out',
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
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
                                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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
                    </div>

                    <TabsContent value="list" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Students</CardTitle>
                                <CardDescription>Manage students in your department courses.</CardDescription>
                            </CardHeader>
                            <CardContent>
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
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map((student) => (
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
                                                    {searchQuery
                                                        ? 'No students found matching your search criteria.'
                                                        : 'No students added yet. Add your first student!'}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="add">
                        <Card>
                            <CardHeader>
                                <CardTitle>Add New Student</CardTitle>
                                <CardDescription>Fill in the student details to add them to the system.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSubmit}>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name-full">Full Name</Label>
                                            <Input id="name-full" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email-full">Email</Label>
                                            <Input
                                                id="email-full"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                            />
                                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="year_level-full">Year Level</Label>
                                            <Select value={data.year_level} onValueChange={(value) => setData('year_level', value)}>
                                                <SelectTrigger id="year_level-full">
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
                                            <Label htmlFor="block-full">Block</Label>
                                            <Input
                                                id="block-full"
                                                type="number"
                                                min="1"
                                                value={data.block}
                                                onChange={(e) => setData('block', e.target.value)}
                                            />
                                            {errors.block && <p className="text-sm text-red-500">{errors.block}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="course-full">Course</Label>
                                            <Select value={data.course_id} onValueChange={(value) => setData('course_id', value)}>
                                                <SelectTrigger id="course-full">
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
                                            <Label htmlFor="status-full">Status</Label>
                                            <Select
                                                value={data.status}
                                                onValueChange={(value) => setData('status', value as 'Regular' | 'Irregular')}
                                            >
                                                <SelectTrigger id="status-full">
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
                                        <Label htmlFor="enrollment_status-full">Enrollment Status</Label>
                                        <Select
                                            value={data.enrollment_status}
                                            onValueChange={(value) =>
                                                setData('enrollment_status', value as 'Enrolled' | 'Not Enrolled' | 'Graduated' | 'Dropped Out')
                                            }
                                        >
                                            <SelectTrigger id="enrollment_status-full">
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
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button type="button" variant="outline" onClick={() => reset()}>
                                        Reset
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Add Student
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

export default AddStudentPage;
