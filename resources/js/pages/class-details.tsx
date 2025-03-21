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
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Calendar, Clock, GraduationCap, Home, MoreHorizontal, Pencil, Plus, Trash, Users } from 'lucide-react';
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
                period: string; // Add this
                total_points: number; // Add this
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
            submissions?: Array<{
                id: number;
                assignment_id: number;
                grade?: number;
                feedback?: string;
                assignment?: {
                    // Add this structure
                    id: number;
                    assessment_type: string;
                    period: string;
                    total_points: number;
                };
            }>;
        }>;
    };
    userRole: 'teacher' | 'student';
}

// Add this interface near the top with other interfaces
interface GradeWeights {
    Assignment: number;
    Quiz: number;
    Exam: number;
}

function ClassDetailsPage({ class: classDetails, userRole }: ClassDetailsPageProps) {
    const { auth } = usePage<SharedData>().props;

    // Add comprehensive console logs to debug the issue
    console.log('FULL CLASS DETAILS RESPONSE:', classDetails);
    console.log('Does classDetails have grade_weights?', classDetails.hasOwnProperty('grade_weights'));

    // Check if we need to fetch grade weights separately
    const [gradeWeightsData, setGradeWeightsData] = useState(null);
    const [isLoadingWeights, setIsLoadingWeights] = useState(false);

    // Fetch grade weights if not already included in the response
    useEffect(() => {
        const fetchGradeWeights = async () => {
            if (!classDetails.grade_weights) {
                setIsLoadingWeights(true);
                console.log('Grade weights not found in initial data, attempting to fetch separately...');

                try {
                    const response = await fetch(`/api/classes/${classDetails.id}/grade-weights`);
                    if (response.ok) {
                        const data = await response.json();
                        console.log('Fetched grade weights:', data);
                        setGradeWeightsData(data);
                    } else {
                        console.error('Failed to fetch grade weights:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error fetching grade weights:', error);
                } finally {
                    setIsLoadingWeights(false);
                }
            }
        };

        fetchGradeWeights();
    }, [classDetails.id]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<null | any>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState<null | any>(null);
    const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [isWeightsModalOpen, setIsWeightsModalOpen] = useState(false);

    // Get weights from either the classDetails or the separately fetched data
    const getWeightsFromData = () => {
        if (classDetails.grade_weights) {
            console.log('Using grade_weights from classDetails:', classDetails.grade_weights);
            return {
                Assignment: classDetails.grade_weights.assignment_weight,
                Quiz: classDetails.grade_weights.quiz_weight,
                Exam: classDetails.grade_weights.exam_weight,
            };
        }

        if (gradeWeightsData) {
            console.log('Using separately fetched grade weights:', gradeWeightsData);
            return {
                Assignment: gradeWeightsData.assignment_weight,
                Quiz: gradeWeightsData.quiz_weight,
                Exam: gradeWeightsData.exam_weight,
            };
        }

        console.log('Using default weights');
        return {
            Assignment: 30,
            Quiz: 30,
            Exam: 40,
        };
    };

    const [weights, setWeights] = useState<GradeWeights>(getWeightsFromData());

    // Update weights when gradeWeightsData changes
    useEffect(() => {
        if (gradeWeightsData) {
            console.log('Updating weights from fetched data');
            setWeights({
                Assignment: gradeWeightsData.assignment_weight,
                Quiz: gradeWeightsData.quiz_weight,
                Exam: gradeWeightsData.exam_weight,
            });
        }
    }, [gradeWeightsData]);

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

    const {
        data: gradingData,
        setData: setGradingData,
        post: submitGrade,
        processing: gradingProcessing,
        reset: resetGrading,
    } = useForm({
        student_id: '',
        assignment_id: '',
        grade: '',
        feedback: '',
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

    const handleGradeSubmit = () => {
        submitGrade('/assignment-submissions', {
            preserveScroll: true,
            onSuccess: () => {
                setIsGradingModalOpen(false);
                resetGrading();
                toast.success('Grade submitted successfully');
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] as string);
            },
        });
    };

    const openGradingModal = (student) => {
        setSelectedStudent(student);
        setGradingData('student_id', student.id);
        setIsGradingModalOpen(true);
    };

    const filterAssignmentsByType = (type: string) => {
        const assignments = classDetails.subject.assignments?.filter((assignment) => assignment.assessment_type === type) || [];
        return assignments;
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

    const ActionMenu = ({ assignment }) => {
        return (
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
                    {userRole === 'teacher' && (
                        <DropdownMenuItem onClick={() => router.get(`/assignments/${assignment.id}/grade`)}>
                            <GraduationCap className="mr-2 h-4 w-4" />
                            Grade Students
                        </DropdownMenuItem>
                    )}
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
    };

    // Add this new function to handle weights update
    const handleWeightsSubmit = () => {
        const total = weights.Assignment + weights.Quiz + weights.Exam;
        if (total !== 100) {
            toast.error('Weights must sum to 100%');
            return;
        }

        console.log('Submitting weights to server:', weights);
        router.post(`/classes/${classDetails.id}/weights`, weights, {
            preserveScroll: true,
            onSuccess: (response) => {
                console.log('Weight update response:', response);
                setIsWeightsModalOpen(false);
                toast.success('Grade weights updated successfully');

                // Try to fetch updated weights
                fetch(`/api/classes/${classDetails.id}/grade-weights`)
                    .then((res) => res.json())
                    .then((data) => {
                        console.log('Refreshed grade weights after update:', data);
                        setGradeWeightsData(data);
                    })
                    .catch((err) => {
                        console.error('Failed to refresh weights:', err);
                    });
            },
            onError: (errors) => {
                console.error('Weight update errors:', errors);
                toast.error('Failed to update grade weights');
            },
        });
    };

    // Update the assessment card sections to show grades for students
    const AssessmentCard = ({ assignment, userRole, currentStudent = null }) => {
        const studentSubmission = currentStudent?.submissions?.find((sub) => sub.assignment_id === assignment.id);

        return (
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="font-medium">{assignment.title}</h4>
                    <p className="text-muted-foreground mt-1 text-sm">{assignment.description}</p>
                    <div className="mt-2 flex items-center gap-4">
                        <Badge variant="outline">{assignment.assessment_type}</Badge>
                        <Badge>{assignment.period}</Badge>
                        {studentSubmission?.grade ? (
                            <Badge variant="secondary">
                                Score: {studentSubmission.grade}/{assignment.total_points}
                            </Badge>
                        ) : (
                            <Badge variant="secondary">Points: {assignment.total_points}</Badge>
                        )}
                        <span className="text-muted-foreground flex items-center text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                    </div>
                    {studentSubmission?.feedback && <p className="text-muted-foreground mt-2 text-sm">Feedback: {studentSubmission.feedback}</p>}
                </div>
                {userRole === 'teacher' && <ActionMenu assignment={assignment} />}
            </div>
        );
    };

    // Update the Students section to only show current student's grades for student users
    const StudentSection = ({ students, userRole, currentUserId, weights }) => {
        if (userRole === 'student') {
            const currentStudent = students.find((student) => student.user_id === currentUserId);
            if (!currentStudent) return null;

            return (
                <div className="divide-y">
                    <div key={currentStudent.id} className="py-4">
                        {/* Show only current student's grades */}
                        <StudentGrades student={currentStudent} weights={weights} />
                    </div>
                </div>
            );
        }

        return (
            <div className="divide-y">
                {students.map((student) => (
                    <div key={student.id} className="py-4">
                        <StudentGrades student={student} weights={weights} />
                    </div>
                ))}
            </div>
        );
    };

    // Update the weights state handler to prevent re-renders
    const handleWeightChange = (type: string, value: string) => {
        const numValue = parseInt(value) || 0;
        setWeights((prev) => ({
            ...prev,
            [type]: numValue,
        }));
    };

    // Update the WeightsModal component to prevent focus loss on typing
    const WeightsModal = () => {
        if (!isWeightsModalOpen) return null;

        console.log('WEIGHTS MODAL OPENED');
        console.log('Current weights in state:', weights);
        console.log('Grade weights from classDetails:', classDetails.grade_weights);
        console.log('Grade weights from separate fetch:', gradeWeightsData);

        // Create a separate state for the modal inputs to avoid modifying parent state while typing
        const [modalWeights, setModalWeights] = useState({
            Assignment: weights.Assignment,
            Quiz: weights.Quiz,
            Exam: weights.Exam,
        });

        // This component manages its own state entirely with string values to prevent focus loss
        const WeightInput = ({ type }) => {
            // Use string values in state to maintain input field values during typing
            const [localValue, setLocalValue] = useState(modalWeights[type].toString());

            // Update the parent modalWeights state only when focus is lost or Enter is pressed
            const updateParentState = () => {
                const numValue = parseInt(localValue) || 0;
                setModalWeights((prev) => ({
                    ...prev,
                    [type]: numValue,
                }));
            };

            return (
                <div className="grid gap-2">
                    <Label htmlFor={`weight-${type}`}>{type}</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id={`weight-${type}`}
                            type="number"
                            min="0"
                            max="100"
                            value={localValue}
                            onChange={(e) => {
                                // Only update the local input value, not the parent state
                                setLocalValue(e.target.value);
                            }}
                            // Only update parent state on blur or Enter key
                            onBlur={updateParentState}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    updateParentState();
                                    // Move focus to the next input or submit button
                                    const form = e.currentTarget.form;
                                    if (form) {
                                        const index = Array.from(form.elements).indexOf(e.currentTarget);
                                        if (index !== -1 && form.elements[index + 1]) {
                                            (form.elements[index + 1] as HTMLElement).focus();
                                        }
                                    }
                                }
                            }}
                        />
                        <span>%</span>
                    </div>
                </div>
            );
        };

        // Save changes only when the Save button is clicked
        const handleSaveChanges = () => {
            const total = modalWeights.Assignment + modalWeights.Quiz + modalWeights.Exam;
            if (total !== 100) {
                toast.error('Weights must sum to 100%');
                return;
            }

            console.log('Submitting weights to server:', modalWeights);

            // Update the parent state once when saving
            setWeights(modalWeights);

            // Submit to server
            router.post(`/classes/${classDetails.id}/weights`, modalWeights, {
                preserveScroll: true,
                onSuccess: (response) => {
                    console.log('Weight update response:', response);
                    setIsWeightsModalOpen(false);
                    toast.success('Grade weights updated successfully');
                },
                onError: (errors) => {
                    console.error('Weight update errors:', errors);
                    toast.error('Failed to update grade weights');
                },
            });
        };

        // Handle closing the modal when clicking the backdrop
        const handleBackdropClick = (e) => {
            if (e.target === e.currentTarget) {
                setIsWeightsModalOpen(false);
            }
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleBackdropClick}>
                <div className="bg-background w-full max-w-md rounded-lg p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold">Grade Weights</h2>
                        <p className="text-muted-foreground text-sm">
                            Adjust the weight percentages for each assessment type. Total must equal 100%.
                        </p>
                    </div>

                    {/* Add a form element to enable proper Enter key navigation */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveChanges();
                        }}
                    >
                        <div className="grid gap-4 py-4">
                            {Object.keys(modalWeights).map((type) => (
                                <WeightInput key={type} type={type} />
                            ))}
                            <div className="text-muted-foreground mt-2 text-sm">Total: {Object.values(modalWeights).reduce((a, b) => a + b, 0)}%</div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsWeightsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

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
                        <div className="flex items-center justify-between">
                            <CardTitle>Assessments</CardTitle>
                            {userRole === 'teacher' && (
                                <Button variant="outline" onClick={() => setIsWeightsModalOpen(true)}>
                                    Adjust Grade Weights
                                </Button>
                            )}
                        </div>
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
                                                <AssessmentCard
                                                    assignment={assignment}
                                                    userRole={userRole}
                                                    currentStudent={
                                                        userRole === 'student' ? classDetails.students.find((s) => s.user_id === auth.user.id) : null
                                                    }
                                                />
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
                                                <AssessmentCard
                                                    assignment={assignment}
                                                    userRole={userRole}
                                                    currentStudent={
                                                        userRole === 'student' ? classDetails.students.find((s) => s.user_id === auth.user.id) : null
                                                    }
                                                />
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
                                                <AssessmentCard
                                                    assignment={assignment}
                                                    userRole={userRole}
                                                    currentStudent={
                                                        userRole === 'student' ? classDetails.students.find((s) => s.user_id === auth.user.id) : null
                                                    }
                                                />
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
                        <StudentSection students={classDetails.students} userRole={userRole} currentUserId={auth.user.id} weights={weights} />
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

                {/* Grading Modal */}
                {userRole === 'teacher' && (
                    <Dialog open={isGradingModalOpen} onOpenChange={setIsGradingModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Grade Student: {selectedStudent?.name}</DialogTitle>
                                <DialogDescription>Enter grades for assignments, quizzes and exams.</DialogDescription>
                            </DialogHeader>

                            <Tabs defaultValue="assignments">
                                <TabsList>
                                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                                    <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                                    <TabsTrigger value="exams">Exams</TabsTrigger>
                                </TabsList>

                                <TabsContent value="assignments">
                                    {filterAssignmentsByType('Assignment').map((assignment) => (
                                        <div key={assignment.id} className="mb-4 space-y-4 border-b pb-4">
                                            <h4 className="font-medium">{assignment.title}</h4>
                                            <div className="grid gap-4">
                                                <div className="grid gap-2">
                                                    <Label>Grade (out of {assignment.total_points})</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max={assignment.total_points}
                                                        value={gradingData.grade}
                                                        onChange={(e) => {
                                                            setGradingData({
                                                                ...gradingData,
                                                                assignment_id: assignment.id,
                                                                grade: e.target.value,
                                                            });
                                                        }}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Feedback</Label>
                                                    <Textarea
                                                        value={gradingData.feedback}
                                                        onChange={(e) => setGradingData('feedback', e.target.value)}
                                                        placeholder="Optional feedback for the student"
                                                    />
                                                </div>
                                                <Button onClick={handleGradeSubmit} disabled={gradingProcessing}>
                                                    Submit Grade
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </TabsContent>

                                {/* Similar content for quizzes and exams tabs */}
                            </Tabs>
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
            <WeightsModal />
        </AppLayout>
    );
}

const calculateGradeByPeriodAndType = (submissions, period: string, type: string) => {
    if (!submissions?.length) return 0;
    // ...rest of the function without console.logs
    const filteredSubmissions = submissions.filter((submission) => {
        return submission.grade && submission.assignment && submission.assignment.period === period && submission.assignment.assessment_type === type;
    });

    if (!filteredSubmissions.length) {
        return 0;
    }

    const sum = filteredSubmissions.reduce((acc, submission) => {
        const percentage = (submission.grade / submission.assignment.total_points) * 100;
        return acc + percentage;
    }, 0);

    const average = (sum / filteredSubmissions.length).toFixed(1);
    return average;
};

// Update the calculatePeriodAverage function to accept weights parameter
const calculatePeriodAverage = (submissions, period: string, weights: GradeWeights) => {
    if (!submissions?.length) return 0;

    const types = ['Assignment', 'Quiz', 'Exam'];
    let weightedSum = 0;
    let totalWeight = 0;

    types.forEach((type) => {
        const grade = parseFloat(calculateGradeByPeriodAndType(submissions, period, type));
        if (!isNaN(grade) && grade > 0) {
            weightedSum += grade * (weights[type] / 100);
            totalWeight += weights[type] / 100;
        }
    });

    if (totalWeight === 0) return 0;
    return (weightedSum / totalWeight).toFixed(1);
};

const calculateOverallGrade = (submissions, weights: GradeWeights) => {
    if (!submissions?.length) return 0;

    const periods = ['Prelims', 'Midterms', 'Finals'];
    const validPeriodGrades = periods
        .map((period) => {
            const average = parseFloat(calculatePeriodAverage(submissions, period, weights));
            return isNaN(average) || average === 0 ? null : average;
        })
        .filter((grade) => grade !== null);

    if (!validPeriodGrades.length) return 0;

    const sum = validPeriodGrades.reduce((a, b) => a + b, 0);
    return (sum / validPeriodGrades.length).toFixed(1);
};

// Update the StudentGrades component to accept weights prop
const StudentGrades = ({ student, weights }: { student: any; weights: GradeWeights }) => {
    return (
        <>
            <div className="mb-2 flex items-center justify-between">
                <div>
                    <p className="font-medium capitalize">{student.name}</p>
                    <p className="text-muted-foreground text-sm">{student.student_number}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold">Overall: {calculateOverallGrade(student.submissions, weights)}%</p>
                </div>
            </div>
            <div className="mt-4 grid gap-4">
                {['Prelims', 'Midterms', 'Finals'].map((period) => (
                    <div key={period} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">{period}</h4>
                            <Badge>{calculatePeriodAverage(student.submissions, period, weights)}%</Badge>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline">Assignments: {calculateGradeByPeriodAndType(student.submissions, period, 'Assignment')}%</Badge>
                            <Badge variant="outline">Quizzes: {calculateGradeByPeriodAndType(student.submissions, period, 'Quiz')}%</Badge>
                            <Badge variant="outline">Exams: {calculateGradeByPeriodAndType(student.submissions, period, 'Exam')}%</Badge>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default ClassDetailsPage;
