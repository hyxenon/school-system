'use client';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BookMarked, BookOpen, Calendar, CalendarDays, ChevronRight, Clock, Grid3X3, Home, List, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

// shadcn components
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Classes',
        href: '/my-classes',
    },
];

interface ClassesByYearAndSemester {
    [year: string]: {
        [semester: string]: any[]; // Using 'any' since the Class interface is imported
    };
}

interface MyClassesPageProps {
    classes: ClassesByYearAndSemester;
    type: string;
}

function MyClassesPage({ classes, type }: MyClassesPageProps) {
    // Extract available academic years and semesters from data
    const academicYears = useMemo(() => Object.keys(classes).sort((a, b) => b.localeCompare(a)), [classes]);

    // Set default filters to the most recent academic year and semester
    const [selectedYear, setSelectedYear] = useState(academicYears[0] || '');

    const availableSemesters = useMemo(() => {
        if (!selectedYear || !classes[selectedYear]) return [];
        return Object.keys(classes[selectedYear]).sort();
    }, [classes, selectedYear]);

    const [selectedSemester, setSelectedSemester] = useState(availableSemesters[0] || '');

    // Search functionality
    const [searchQuery, setSearchQuery] = useState('');

    // View mode (grid, list, or analytics)
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'analytics'>('grid');

    // Get filtered classes
    const filteredClasses = useMemo(() => {
        if (!selectedYear || !selectedSemester || !classes[selectedYear] || !classes[selectedYear][selectedSemester]) {
            return [];
        }

        const semesterClasses = classes[selectedYear][selectedSemester];

        if (!searchQuery) return semesterClasses;

        // Filter by search query
        return semesterClasses.filter(
            (classItem) =>
                classItem.subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                classItem.subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                classItem.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
                classItem.course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                classItem.course.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                classItem.room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                classItem.room.building.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
    }, [classes, selectedYear, selectedSemester, searchQuery]);

    // Format time (e.g., "13:00:00" to "1:00 PM")
    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = Number.parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    // Handle class selection
    const handleClassClick = (classId: number) => {
        // This will be handled by the user for redirection
        console.log(`Clicked on class with ID: ${classId}`);
    };

    // Group classes by day for calendar view
    const classesByDay = useMemo(() => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const result: Record<string, any[]> = {};

        days.forEach((day) => {
            result[day] = filteredClasses.filter((classItem) => classItem.day === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
        });

        return result;
    }, [filteredClasses]);

    // Calculate summary statistics
    const summary = useMemo(() => {
        if (!filteredClasses.length) return { totalClasses: 0, totalHours: 0, uniqueSubjects: 0, uniqueRooms: 0 };

        const uniqueSubjects = new Set(filteredClasses.map((c) => c.subject.id)).size;
        const uniqueRooms = new Set(filteredClasses.map((c) => c.room.id)).size;

        let totalHours = 0;
        filteredClasses.forEach((classItem) => {
            const startTime = new Date(`2000-01-01T${classItem.start_time}`);
            const endTime = new Date(`2000-01-01T${classItem.end_time}`);
            const diffHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
            totalHours += diffHours;
        });

        return {
            totalClasses: filteredClasses.length,
            totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal place
            uniqueSubjects,
            uniqueRooms,
        };
    }, [filteredClasses]);

    // Generate a color for a subject (consistent color for the same subject)
    const getSubjectColor = (subjectId: number) => {
        const colors = [
            'bg-blue-100 text-blue-800 border-blue-200',
            'bg-green-100 text-green-800 border-green-200',
            'bg-purple-100 text-purple-800 border-purple-200',
            'bg-amber-100 text-amber-800 border-amber-200',
            'bg-pink-100 text-pink-800 border-pink-200',
            'bg-indigo-100 text-indigo-800 border-indigo-200',
            'bg-cyan-100 text-cyan-800 border-cyan-200',
            'bg-rose-100 text-rose-800 border-rose-200',
        ];

        return colors[subjectId % colors.length];
    };

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Classes" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold">{type === 'teacher' ? 'My Teaching Schedule' : 'My Class Schedule'}</h1>
                        <p className="text-muted-foreground">
                            {selectedYear && selectedSemester
                                ? `Academic Year ${selectedYear} - Semester ${selectedSemester}`
                                : 'Select an academic year and semester to view your classes'}
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                {filteredClasses.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="pt-3">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-muted-foreground text-sm">Total Classes</p>
                                        <p className="text-2xl font-bold">{summary.totalClasses}</p>
                                    </div>
                                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                                        <BookMarked className="text-primary h-5 w-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-3">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-muted-foreground text-sm">Total Hours</p>
                                        <p className="text-2xl font-bold">{summary.totalHours}</p>
                                    </div>
                                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                                        <Clock className="text-primary h-5 w-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-3">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-muted-foreground text-sm">Unique Subjects</p>
                                        <p className="text-2xl font-bold">{summary.uniqueSubjects}</p>
                                    </div>
                                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                                        <BookOpen className="text-primary h-5 w-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filters */}
                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                        <label htmlFor="academic-year" className="mb-1 block text-sm font-medium">
                            Academic Year
                        </label>
                        <Select
                            value={selectedYear}
                            onValueChange={(value) => {
                                setSelectedYear(value);
                                // Set semester to '1' or first available semester when year changes
                                const availableSems = Object.keys(classes[value] || {}).sort();
                                setSelectedSemester(availableSems[0] || '1');
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Academic Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYears.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label htmlFor="semester" className="mb-1 block text-sm font-medium">
                            Semester
                        </label>
                        <Select value={selectedSemester} onValueChange={setSelectedSemester} disabled={!selectedYear}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableSemesters.map((semester) => (
                                    <SelectItem key={semester} value={semester}>
                                        Semester {semester}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label htmlFor="search" className="mb-1 block text-sm font-medium">
                            Search
                        </label>
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                            <Input
                                type="text"
                                id="search"
                                className="pl-8"
                                placeholder="Search classes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* View Tabs */}
                {filteredClasses.length > 0 ? (
                    <Tabs defaultValue="grid" className="w-full" onValueChange={(value) => setViewMode(value as any)}>
                        <TabsList className="mb-6 grid w-full grid-cols-2">
                            <TabsTrigger value="grid">
                                <Grid3X3 className="mr-2 h-4 w-4" />
                                Card View
                            </TabsTrigger>
                            <TabsTrigger value="list">
                                <List className="mr-2 h-4 w-4" />
                                Schedule View
                            </TabsTrigger>
                        </TabsList>

                        {/* Grid View */}
                        <TabsContent value="grid" className="mt-0">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredClasses.map((classItem) => (
                                    <Card
                                        key={classItem.id}
                                        className="cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-md"
                                        onClick={() => handleClassClick(classItem.id)}
                                    >
                                        <CardHeader className="bg-primary text-primary-foreground py-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle>{classItem.subject.name}</CardTitle>
                                                    <CardDescription className="text-primary-foreground/80">{classItem.subject.code}</CardDescription>
                                                </div>
                                                <Badge variant={classItem.status === 'Active' ? 'default' : 'secondary'}>{classItem.status}</Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4 pt-6">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                                                    <Calendar className="text-primary h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{classItem.day}</p>
                                                    <p className="text-muted-foreground text-sm">
                                                        {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                                                    <Home className="text-primary h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{classItem.room.name}</p>
                                                    <p className="text-muted-foreground text-sm">{classItem.room.building.name}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                                                    <BookOpen className="text-primary h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{classItem.course.name}</p>
                                                    <p className="text-muted-foreground text-sm">{classItem.course.course_code}</p>
                                                </div>
                                            </div>

                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <Badge variant="outline" className={getSubjectColor(classItem.subject.id)}>
                                                    {classItem.schedule_type}
                                                </Badge>
                                                <Badge variant="outline">Year {classItem.year_level}</Badge>
                                                <Badge variant="outline">Block {classItem.block}</Badge>
                                            </div>
                                        </CardContent>

                                        <CardFooter className="bg-muted/50 flex justify-between">
                                            <div className="text-muted-foreground flex items-center gap-1 text-sm">
                                                <Users className="h-4 w-4" />
                                                {classItem.max_students} students
                                            </div>
                                            <Button variant="ghost" size="sm" className="gap-1">
                                                View details
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Schedule View */}
                        <TabsContent value="list" className="mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Weekly Schedule</CardTitle>
                                    <CardDescription>
                                        {selectedYear} - Semester {selectedSemester}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[600px]">
                                        {Object.entries(classesByDay).map(([day, dayClasses]) => (
                                            <div key={day} className="border-b last:border-b-0">
                                                <div className="bg-muted/50 flex items-center p-4 font-medium">
                                                    <CalendarDays className="text-primary mr-2 h-4 w-4" />
                                                    {day}
                                                </div>

                                                {dayClasses.length > 0 ? (
                                                    <div className="divide-y">
                                                        {dayClasses.map((classItem) => (
                                                            <div
                                                                key={classItem.id}
                                                                onClick={() => handleClassClick(classItem.id)}
                                                                className="hover:bg-muted/50 cursor-pointer p-4 transition-colors"
                                                            >
                                                                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                                                    <div className="w-32 flex-shrink-0">
                                                                        <div className="text-sm font-medium">
                                                                            {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex-grow">
                                                                        <div className="flex items-center gap-2">
                                                                            <Avatar className="h-8 w-8">
                                                                                <AvatarFallback className={getSubjectColor(classItem.subject.id)}>
                                                                                    {getInitials(classItem.subject.name)}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                            <div>
                                                                                <h4 className="font-medium">{classItem.subject.name}</h4>
                                                                                <p className="text-muted-foreground text-sm">
                                                                                    {classItem.subject.code}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex flex-shrink-0 items-center gap-4">
                                                                        <div className="flex items-center gap-1 text-sm">
                                                                            <Home className="text-muted-foreground h-4 w-4" />
                                                                            {classItem.room.name}
                                                                        </div>
                                                                        <Badge
                                                                            variant={classItem.status === 'Active' ? 'default' : 'secondary'}
                                                                            className="ml-2"
                                                                        >
                                                                            {classItem.status}
                                                                        </Badge>
                                                                        <Button variant="ghost" size="icon">
                                                                            <ChevronRight className="h-5 w-5" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-muted-foreground p-6 text-center">No classes scheduled for {day}</div>
                                                )}
                                            </div>
                                        ))}
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Calendar className="text-muted-foreground/30 mb-4 h-16 w-16" />
                            {selectedYear && selectedSemester ? (
                                <>
                                    <h3 className="mb-1 text-lg font-medium">No classes found</h3>
                                    <p className="text-muted-foreground max-w-md text-center">
                                        {searchQuery
                                            ? `No classes match your search "${searchQuery}" for ${selectedYear} - Semester ${selectedSemester}.`
                                            : `You don't have any classes for ${selectedYear} - Semester ${selectedSemester}.`}
                                    </p>
                                    {searchQuery && (
                                        <Button variant="ghost" onClick={() => setSearchQuery('')} className="mt-4">
                                            Clear search
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <h3 className="mb-1 text-lg font-medium">Select filters</h3>
                                    <p className="text-muted-foreground text-center">
                                        Please select an academic year and semester to view your classes.
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

export default MyClassesPage;
