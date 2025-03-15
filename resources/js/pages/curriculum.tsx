'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Course, Curriculum, Department, Subject } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Curriculum',
        href: '/curriculum',
    },
];

function CurriculumPage() {
    const {
        departments,
        courses,
        subjects,
        curriculums: initialCurriculums,
    } = usePage().props as {
        departments: Department[];
        courses: Course[];
        subjects: Subject[];
        curriculums: Curriculum[];
    };

    const [selectedDepartment, setSelectedDepartment] = useState<number>(departments[0]?.id);
    const [selectedCourse, setSelectedCourse] = useState<number>(courses[0]?.id);
    const [availableSubjects, setAvailableSubjects] = useState<Subject[]>(subjects);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [curriculums, setCurriculums] = useState<Curriculum[]>(initialCurriculums);

    const { data, setData, post, processing, errors, reset } = useForm({
        course_id: selectedCourse,
        year_level: 1,
        semester: 1,
        subject_id: '',
    });

    // Make sure the form data is set correctly when the component mounts
    useEffect(() => {
        if (departments.length > 0 && courses.length > 0) {
            const initialDepartment = departments[0]?.id;
            // Find the first course in the selected department
            const initialCourse = courses.find((course) => course.department_id === initialDepartment)?.id || courses[0]?.id;

            setSelectedDepartment(initialDepartment);
            setSelectedCourse(initialCourse);
            setData('course_id', initialCourse);
        }
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            // Fetch subjects for the selected course
            fetch(`/api/curriculum/subjects?course_id=${selectedCourse}`)
                .then((response) => response.json())
                .then((data) => setAvailableSubjects(data))
                .catch((error) => console.error('Error fetching subjects:', error));
        }
    }, [selectedCourse]);

    const filteredCourses = courses.filter((course) => course.department_id === selectedDepartment);

    useEffect(() => {
        if (!filteredCourses.find((course) => course.id === selectedCourse) && filteredCourses.length > 0) {
            setSelectedCourse(filteredCourses[0].id);
        }
    }, [selectedCourse, filteredCourses]);

    // Add this effect to update form data when selected course changes
    useEffect(() => {
        setData('course_id', selectedCourse);
    }, [selectedCourse, setData]);

    const filteredCurriculums = useMemo(
        () => curriculums.filter((curriculum) => curriculum.course.id === selectedCourse),
        [curriculums, selectedCourse],
    );

    const subjectsInCurriculum = useMemo(
        () => filteredCurriculums.flatMap((curriculum) => curriculum.subjects.map((subject) => subject.id)),
        [filteredCurriculums],
    );

    const availableSubjectsForAdd = useMemo(
        () => availableSubjects.filter((subject) => !subjectsInCurriculum.includes(subject.id)),
        [availableSubjects, subjectsInCurriculum],
    );

    const handleAddSubject = () => {
        // Create the form data with the current selected course
        const formData = {
            ...data,
            course_id: selectedCourse,
        };

        console.log('Adding subject to course ID:', selectedCourse);
        console.log('Form data being sent:', formData);

        // Pass formData directly as the second argument
        router.post('/curriculum', formData, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                setDialogOpen(false);
                reset();
                // Make sure to update with the latest data
                setCurriculums(page.props.curriculums);
                toast.success('Subject added successfully');
            },
            onError: (errors) => {
                if (errors.subject_id) {
                    toast.error(errors.subject_id);
                } else {
                    toast.error('Failed to add subject');
                }
            },
        });
    };

    const handleRemoveSubject = (curriculumId: number, subjectId: number) => {
        router.delete(`/curriculum/${curriculumId}`, {
            data: { subject_id: subjectId },
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                // Update the curriculums state with the new data
                setCurriculums(page.props.curriculums);
                toast.success('Subject removed successfully');
            },
            onError: () => {
                toast.error('Failed to remove subject');
            },
        });
    };

    const groupedCurriculums = filteredCurriculums.reduce(
        (acc, curriculum) => {
            const yearLevel = curriculum.year_level;
            if (!acc[yearLevel]) {
                acc[yearLevel] = [];
            }
            acc[yearLevel].push(curriculum);
            return acc;
        },
        {} as Record<number, Curriculum[]>,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Curriculum" />
            <Toaster />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Curriculum Management</h1>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Subject to Curriculum
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Subject to Curriculum</DialogTitle>
                                <DialogDescription>Select a year level, semester, and subject to add to the curriculum.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col space-y-2">
                                        <Label htmlFor="year-level">Year Level</Label>
                                        <Select
                                            value={data.year_level.toString()}
                                            onValueChange={(value) => setData('year_level', Number.parseInt(value))}
                                        >
                                            <SelectTrigger id="year-level">
                                                <SelectValue placeholder="Select Year Level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1st Year</SelectItem>
                                                <SelectItem value="2">2nd Year</SelectItem>
                                                <SelectItem value="3">3rd Year</SelectItem>
                                                <SelectItem value="4">4th Year</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <Label htmlFor="semester">Semester</Label>
                                        <Select
                                            value={data.semester.toString()}
                                            onValueChange={(value) => setData('semester', Number.parseInt(value))}
                                        >
                                            <SelectTrigger id="semester">
                                                <SelectValue placeholder="Select Semester" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1st Semester</SelectItem>
                                                <SelectItem value="2">2nd Semester</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Select value={data.subject_id.toString()} onValueChange={(value) => setData('subject_id', value)}>
                                        <SelectTrigger id="subject">
                                            <SelectValue placeholder="Select Subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableSubjectsForAdd.map((subject) => (
                                                <SelectItem key={subject.id} value={subject.id.toString()}>
                                                    {subject.code} - {subject.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddSubject} disabled={processing || availableSubjectsForAdd.length === 0}>
                                    Add Subject
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Department Filter */}
                <div className="mb-4 w-full max-w-xs">
                    <Label htmlFor="department-filter" className="mb-2 block">
                        Department
                    </Label>
                    <Select value={selectedDepartment.toString()} onValueChange={(value) => setSelectedDepartment(Number.parseInt(value))}>
                        <SelectTrigger id="department-filter">
                            <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map((department) => (
                                <SelectItem key={department.id} value={department.id.toString()}>
                                    {department.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {filteredCourses.length > 0 ? (
                    <Tabs value={selectedCourse.toString()} onValueChange={(value) => setSelectedCourse(Number.parseInt(value))}>
                        <TabsList className="mb-4">
                            {filteredCourses.map((course) => (
                                <TabsTrigger key={course.id} value={course.id.toString()}>
                                    {course.course_code}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {filteredCourses.map((course) => (
                            <TabsContent key={course.id} value={course.id.toString()}>
                                <div className="grid gap-6">
                                    {Object.entries(groupedCurriculums).map(([yearLevel, curriculums]) => (
                                        <div key={yearLevel}>
                                            {curriculums.map((curriculum) => (
                                                <Card key={curriculum.id} className="mb-6">
                                                    <CardHeader>
                                                        <CardTitle>
                                                            {course.course_code} {curriculum.year_level}
                                                            {curriculum.year_level === 1
                                                                ? 'st'
                                                                : curriculum.year_level === 2
                                                                  ? 'nd'
                                                                  : curriculum.year_level === 3
                                                                    ? 'rd'
                                                                    : 'th'}{' '}
                                                            Year,
                                                            {curriculum.semester === 1 ? ' 1st' : ' 2nd'} Semester
                                                        </CardTitle>
                                                        <CardDescription>
                                                            Total Credits:{' '}
                                                            {curriculum.subjects.reduce((sum, subject) => sum + subject.credits, 0).toFixed(1)}
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead className="w-[120px]">Code</TableHead>
                                                                    <TableHead>Subject Name</TableHead>
                                                                    <TableHead className="w-[100px] text-right">Credits</TableHead>
                                                                    <TableHead className="w-[80px]"></TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {curriculum.subjects.map((subject) => (
                                                                    <TableRow key={subject.id}>
                                                                        <TableCell className="font-medium">{subject.code}</TableCell>
                                                                        <TableCell>{subject.name}</TableCell>
                                                                        <TableCell className="text-right">{subject.credits.toFixed(1)}</TableCell>
                                                                        <TableCell>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => handleRemoveSubject(curriculum.id, subject.id)}
                                                                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                                <span className="sr-only">Remove subject</span>
                                                                            </Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ))}
                                    {Object.keys(groupedCurriculums).length === 0 && (
                                        <div className="text-muted-foreground p-8 text-center">
                                            No curriculum data available for this course. Add subjects to get started.
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                ) : (
                    <div className="text-muted-foreground p-8 text-center">
                        No courses available for this department. Please select a different department.
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

export default CurriculumPage;
