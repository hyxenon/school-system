'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, Clock, Home, MoreHorizontal, Pencil, Plus, Trash, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

interface ClassDetailsPageProps {
    class: {
        id: number;
        subject: {
            id: number;
            name: string;
            code: string;
            assignments: Array<{
                id: number;
                title: string;
                description: string;
                due_date: string;
                assessment_type: string;
                created_at: string;
            }>;
        };
        room: {
            name: string;
            building: {
                name: string;
            };
        };
        day: string;
        start_time: string;
        end_time: string;
        year_level: number;
        block: string;
        max_students: number;
        schedule_type: string;
        students: Array<{
            id: number;
            name: string;
            student_number: string;
        }>;
    };
    userRole: 'teacher' | 'student';
}

function ClassDetailsPage({ class: classDetails, userRole }: ClassDetailsPageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<null | any>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState<null | any>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        description: '',
        due_date: '',
        assessment_type: 'Assignment',
        period: 'Prelims',
        total_points: 100,
        subject_id: classDetails.subject.id,
        schedule_id: classDetails.id,
        year_level: classDetails.year_level,
        block: classDetails.block,
    });

    const [activeTab, setActiveTab] = useState('assignments');

    useEffect(() => {
        const assessmentTypes = {
            assignments: 'Assignment',
            quizzes: 'Quiz',
            exams: 'Exam',
        };
        setData('assessment_type', assessmentTypes[activeTab]);
    }, [activeTab]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'My Classes', href: '/my-classes' },
        { title: `Class ${classDetails.subject.code}`, href: `/classes/${classDetails.id}` },
    ];

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    const handleSubmit = () => {
        if (editingAssignment) {
            put(`/assignments/${editingAssignment.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingAssignment(null);
                    reset();
                    toast.success('Assessment updated successfully');
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string);
                },
            });
        } else {
            post('/assignments', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    toast.success('Assessment created successfully');
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string);
                },
            });
        }
    };

    const handleDelete = () => {
        if (!assignmentToDelete) return;

        router.delete(`/assignments/${assignmentToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setAssignmentToDelete(null);
                toast.success('Assessment deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete assessment');
            },
        });
    };

    const filterAssignmentsByType = (type: string) => {
        return classDetails.subject.assignments?.filter((assignment) => assignment.assessment_type === type) || [];
    };

    const getAddButtonText = (type: string) => {
        return `Add ${type}`;
    };

    const handleEdit = (assignment) => {
        setEditingAssignment(assignment);

        // Format the date to YYYY-MM-DD for the input field
        const formattedDate = new Date(assignment.due_date).toISOString().split('T')[0];

        setData({
            ...data,
            title: assignment.title,
            description: assignment.description,
            due_date: formattedDate, // Use formatted date
            assessment_type: assignment.assessment_type,
            period: assignment.period,
            total_points: assignment.total_points,
        });
        setIsModalOpen(true);
    };

    const handlePencilClick = (assignment) => {
        handleEdit(assignment);
    };

    const ActionMenu = ({ assignment }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handlePencilClick(assignment)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => {
                        setAssignmentToDelete(assignment);
                        setIsDeleteDialogOpen(true);
                    }}
                >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${classDetails.subject.code}`} />
            <Toaster />
            <div className="flex flex-col gap-6 p-4">
                {/* Class Details Card */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl">{classDetails.subject.name}</CardTitle>
                                <CardDescription className="mt-2">
                                    <Badge variant="outline" className="mr-2">
                                        {classDetails.subject.code}
                                    </Badge>
                                    <Badge>{classDetails.schedule_type}</Badge>
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                                    <Calendar className="text-primary h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-base font-medium">{classDetails.day}</p>
                                    <p className="text-muted-foreground mt-0.5 text-sm">
                                        {formatTime(classDetails.start_time)} - {formatTime(classDetails.end_time)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                                    <Home className="text-primary h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-base font-medium">{classDetails.room.name}</p>
                                    <p className="text-muted-foreground mt-0.5 text-sm">{classDetails.room.building.name}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                                    <Users className="text-primary h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-base font-medium">Class Details</p>
                                    <p className="text-muted-foreground mt-0.5 text-sm">
                                        Year {classDetails.year_level} - Block {classDetails.block}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Assessments Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Assessments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="assignments" className="w-full" onValueChange={setActiveTab}>
                            <div className="mb-4 flex items-center justify-between">
                                <TabsList>
                                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                                    <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                                    <TabsTrigger value="exams">Exams</TabsTrigger>
                                </TabsList>
                                {userRole === 'teacher' && (
                                    <Button onClick={() => setIsModalOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        {getAddButtonText(data.assessment_type)}
                                    </Button>
                                )}
                            </div>

                            <TabsContent value="assignments">
                                <div className="divide-y">
                                    {filterAssignmentsByType('Assignment').length > 0 ? (
                                        filterAssignmentsByType('Assignment').map((assignment) => (
                                            <div key={assignment.id} className="py-4 first:pt-0 last:pb-0">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium">{assignment.title}</h4>
                                                        <p className="text-muted-foreground mt-1 text-sm">{assignment.description}</p>
                                                        <div className="mt-2 flex items-center gap-4">
                                                            <Badge variant="outline">{assignment.assessment_type}</Badge>
                                                            <span className="text-muted-foreground flex items-center text-xs">
                                                                <Clock className="mr-1 h-3 w-3" />
                                                                Due: {new Date(assignment.due_date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {userRole === 'teacher' && <ActionMenu assignment={assignment} />}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground py-4 text-center">No assignments yet.</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="quizzes">
                                <div className="divide-y">
                                    {filterAssignmentsByType('Quiz').length > 0 ? (
                                        filterAssignmentsByType('Quiz').map((assignment) => (
                                            <div key={assignment.id} className="py-4 first:pt-0 last:pb-0">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium">{assignment.title}</h4>
                                                        <p className="text-muted-foreground mt-1 text-sm">{assignment.description}</p>
                                                        <div className="mt-2 flex items-center gap-4">
                                                            <Badge variant="outline">{assignment.assessment_type}</Badge>
                                                            <span className="text-muted-foreground flex items-center text-xs">
                                                                <Clock className="mr-1 h-3 w-3" />
                                                                Due: {new Date(assignment.due_date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {userRole === 'teacher' && <ActionMenu assignment={assignment} />}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground py-4 text-center">No quizzes yet.</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="exams">
                                <div className="divide-y">
                                    {filterAssignmentsByType('Exam').length > 0 ? (
                                        filterAssignmentsByType('Exam').map((assignment) => (
                                            <div key={assignment.id} className="py-4 first:pt-0 last:pb-0">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium">{assignment.title}</h4>
                                                        <p className="text-muted-foreground mt-1 text-sm">{assignment.description}</p>
                                                        <div className="mt-2 flex items-center gap-4">
                                                            <Badge variant="outline">{assignment.assessment_type}</Badge>
                                                            <span className="text-muted-foreground flex items-center text-xs">
                                                                <Clock className="mr-1 h-3 w-3" />
                                                                Due: {new Date(assignment.due_date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {userRole === 'teacher' && <ActionMenu assignment={assignment} />}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground py-4 text-center">No exams yet.</p>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Students Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Students</CardTitle>
                            <Badge variant="secondary">
                                {classDetails.students.length} {classDetails.students.length === 1 ? 'Student' : 'Students'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y">
                            {classDetails.students.length > 0 ? (
                                classDetails.students.map((student) => (
                                    <div key={student.id} className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-medium capitalize">{student.name}</p>
                                            <p className="text-muted-foreground text-sm">{student.student_number}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground py-4 text-center">No students enrolled yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Add/Edit Assignment Modal */}
                {userRole === 'teacher' && (
                    <Dialog
                        open={isModalOpen}
                        onOpenChange={(open) => {
                            setIsModalOpen(open);
                            if (!open) {
                                setEditingAssignment(null);
                                reset();
                            }
                        }}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingAssignment ? 'Edit' : 'Add'} {data.assessment_type}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingAssignment ? 'Update' : 'Create a new'} {data.assessment_type.toLowerCase()} for this class.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Assignment title"
                                        className={errors.title ? 'border-red-500' : ''}
                                    />
                                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Assignment description"
                                        className={errors.description ? 'border-red-500' : ''}
                                    />
                                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="due_date">Due Date</Label>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                        className={errors.due_date ? 'border-red-500' : ''}
                                    />
                                    {errors.due_date && <p className="text-sm text-red-500">{errors.due_date}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="assessment_type">Assessment Type</Label>
                                    <Select value={data.assessment_type} onValueChange={(value) => setData('assessment_type', value)}>
                                        <SelectTrigger className={errors.assessment_type ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select assessment type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Assignment">Assignment</SelectItem>
                                            <SelectItem value="Quiz">Quiz</SelectItem>
                                            <SelectItem value="Exam">Exam</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.assessment_type && <p className="text-sm text-red-500">{errors.assessment_type}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="period">Period</Label>
                                    <Select value={data.period} onValueChange={(value) => setData('period', value)}>
                                        <SelectTrigger className={errors.period ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select period" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Prelims">Prelims</SelectItem>
                                            <SelectItem value="Midterms">Midterms</SelectItem>
                                            <SelectItem value="Finals">Finals</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.period && <p className="text-sm text-red-500">{errors.period}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="total_points">Total Points</Label>
                                    <Input
                                        id="total_points"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={data.total_points}
                                        onChange={(e) => setData('total_points', e.target.value)}
                                        className={errors.total_points ? 'border-red-500' : ''}
                                    />
                                    {errors.total_points && <p className="text-sm text-red-500">{errors.total_points}</p>}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} disabled={processing}>
                                    {processing ? (editingAssignment ? 'Updating...' : 'Creating...') : editingAssignment ? 'Update' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete this {assignmentToDelete?.assessment_type.toLowerCase()}. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setAssignmentToDelete(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}

export default ClassDetailsPage;
