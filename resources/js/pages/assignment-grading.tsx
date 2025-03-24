'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface GradingPageProps {
    assignment: {
        id: number;
        title: string;
        description: string;
        assessment_type: string;
        total_points: number;
        period: string;
        subject: {
            code: string;
            name: string;
        };
        schedule: {
            // Add this missing property
            id: number;
        };
    };
    students: Array<{
        id: number;
        user: {
            // Add user property
            name: string;
        };
        student_number: string;
        submissions?: Array<{
            // Change to array of submissions
            id: number;
            grade: number;
            feedback: string;
            assignment_id: number;
        }>;
    }>;
}

export default function AssignmentGradingPage({ assignment, students }: GradingPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'My Classes', href: '/my-classes' },
        { title: `${assignment.subject.code}`, href: `/my-classes/${assignment.schedule.id}` },
        { title: 'Grade Assignment', href: '#' },
    ];

    console.log('Assignment:', assignment);
    console.log('Students with submissions:', students);

    const { data, setData, post, processing } = useForm({
        grades: students.map((student) => {
            // Find the submission for this assignment
            const submission = student.submissions?.find((sub) => sub.assignment_id === assignment.id);

            return {
                student_id: student.id,
                grade: submission ? submission.grade.toString() : '',
                feedback: submission ? submission.feedback || '' : '',
            };
        }),
    });

    console.log('Form data:', data);

    const handleSubmit = () => {
        post(`/assignments/${assignment.id}/grades`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Grades saved successfully');
            },
            onError: () => {
                toast.error('Failed to save grades');
            },
        });
    };

    const updateGrade = (index: number, field: 'grade' | 'feedback', value: string) => {
        const newGrades = [...data.grades];
        newGrades[index][field] = value;
        setData('grades', newGrades);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Grade ${assignment.title}`} />
            <Toaster />

            <div className="flex flex-col gap-6 p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                                <div className="mt-2 flex gap-2">
                                    <Badge>{assignment.assessment_type}</Badge>
                                    <Badge variant="outline">{assignment.period}</Badge>
                                    <Badge variant="secondary">Total Points: {assignment.total_points}</Badge>
                                </div>
                            </div>
                            <Button onClick={handleSubmit} disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Save All Grades
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Student Number</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Feedback</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student, index) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium capitalize">{student.user.name}</TableCell>
                                        <TableCell>{student.id}</TableCell>
                                        <TableCell className="w-32">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max={assignment.total_points}
                                                    value={data.grades[index].grade}
                                                    onChange={(e) => updateGrade(index, 'grade', e.target.value)}
                                                />
                                                <span className="text-sm text-gray-500">/ {assignment.total_points}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-96">
                                            <Textarea
                                                value={data.grades[index].feedback}
                                                onChange={(e) => updateGrade(index, 'feedback', e.target.value)}
                                                placeholder="Optional feedback"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
