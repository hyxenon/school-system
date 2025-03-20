'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Schedule } from '@/types';
import { Head } from '@inertiajs/react';
import { format, parse } from 'date-fns';
import { Calendar, Clock, Download, Filter, Info, List, Printer, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Schedules',
        href: '/my-schedules',
    },
];

interface MySchedulesPageProps {
    schedules: Schedule[];
    type: 'teacher' | 'student';
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am to 8pm

// Color palette for schedule items
const COLOR_PALETTE = [
    { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-800', light: 'bg-red-50', name: 'Red' },
    { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-800', light: 'bg-blue-50', name: 'Blue' },
    { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-800', light: 'bg-green-50', name: 'Green' },
    { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-800', light: 'bg-yellow-50', name: 'Yellow' },
    { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-800', light: 'bg-purple-50', name: 'Purple' },
    { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-800', light: 'bg-pink-50', name: 'Pink' },
    { bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-800', light: 'bg-indigo-50', name: 'Indigo' },
    { bg: 'bg-teal-100', border: 'border-teal-400', text: 'text-teal-800', light: 'bg-teal-50', name: 'Teal' },
    { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-800', light: 'bg-orange-50', name: 'Orange' },
    { bg: 'bg-cyan-100', border: 'border-cyan-400', text: 'text-cyan-800', light: 'bg-cyan-50', name: 'Cyan' },
];

// Add new interface for academic year and semester options
interface AcademicFilter {
    academic_year: string;
    semester: string;
}

function MySchedulesPage({ schedules, type }: MySchedulesPageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDay, setSelectedDay] = useState<string | 'all'>('all');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [filters, setFilters] = useState<AcademicFilter>({
        academic_year: schedules[0]?.academic_year || '', // Default to first schedule's year
        semester: schedules[0]?.semester.toString() || '', // Default to first schedule's semester
    });

    // Get unique subjects for filtering
    const uniqueSubjects = useMemo(() => {
        const subjects = new Set<string>();
        schedules.forEach((schedule) => {
            subjects.add(schedule.subject.code);
        });
        return Array.from(subjects);
    }, [schedules]);

    // Create a map of subject codes to colors for consistency
    const subjectColors = useMemo(() => {
        const colorMap = new Map();

        schedules.forEach((schedule) => {
            if (!colorMap.has(schedule.subject.code)) {
                const colorIndex = Math.floor(Math.random() * COLOR_PALETTE.length);
                colorMap.set(schedule.subject.code, COLOR_PALETTE[colorIndex]);
            }
        });

        return colorMap;
    }, [schedules]);

    // Get unique academic years and semesters
    const academicYears = useMemo(() => {
        const years = new Set<string>();
        schedules.forEach((schedule) => {
            years.add(schedule.academic_year);
        });
        return Array.from(years).sort().reverse();
    }, [schedules]);

    const semesters = ['1', '2', '3'];

    // Filter schedules based on search and filters
    const filteredSchedules = useMemo(() => {
        return schedules.filter((schedule) => {
            const matchesSearch =
                searchTerm === '' ||
                schedule.subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                schedule.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                schedule.room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                schedule.room.building.name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDay = selectedDay === 'all' || schedule.day === selectedDay;

            const matchesAcademicYear = schedule.academic_year === filters.academic_year;
            const matchesSemester = schedule.semester.toString() === filters.semester;

            return matchesSearch && matchesDay && matchesAcademicYear && matchesSemester;
        });
    }, [schedules, searchTerm, selectedDay, filters]);

    // Group schedules by day
    const schedulesByDay: Record<string, Schedule[]> = useMemo(() => {
        const result: Record<string, Schedule[]> = {};

        DAYS_OF_WEEK.forEach((day) => {
            result[day] = filteredSchedules.filter((schedule) => schedule.day === day);
        });

        return result;
    }, [filteredSchedules]);

    // Helper function to convert time string to hour number (for positioning)
    const timeToHour = (timeString: string): number => {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours + minutes / 60;
    };

    // Helper function to calculate schedule item height and top position
    const calculatePosition = (startTime: string, endTime: string): { height: number; top: number } => {
        const startHour = timeToHour(startTime);
        const endHour = timeToHour(endTime);
        const top = (startHour - 7) * 100; // 7am is our starting point
        const height = (endHour - startHour) * 100; // 100px per hour
        return { height, top };
    };

    // Helper function to format time for display
    const formatTime = (timeString: string): string => {
        try {
            const date = parse(timeString, 'HH:mm:ss', new Date());
            return format(date, 'h:mm a');
        } catch (error) {
            return timeString;
        }
    };

    // Get current time indicator position
    const currentTimePosition = useMemo(() => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        if (hours < 7 || hours >= 20) return null; // Outside our time range

        return (hours - 7 + minutes / 60) * 100; // Position in pixels
    }, [currentDate]); // Re-calculate when date changes

    // Get current day of week
    const currentDayOfWeek = useMemo(() => {
        const now = new Date();
        const day = format(now, 'EEEE');
        return day;
    }, [currentDate]);

    // Handle printing the schedule
    const handlePrint = () => {
        window.print();
    };

    // Handle exporting the schedule (simplified example)
    const handleExport = () => {
        alert('Soon...');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Schedules" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">My Schedule</h1>
                        <p className="text-muted-foreground">
                            {type === 'teacher' ? 'Your teaching schedule' : 'Your class schedule'} for the current semester
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={handlePrint}>
                                        <Printer className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Print Schedule</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={handleExport}>
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Export Schedule</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                    <div className="relative max-w-sm flex-1">
                        <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                        <Input
                            type="search"
                            placeholder="Search schedules..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Select value={filters.academic_year} onValueChange={(value) => setFilters((prev) => ({ ...prev, academic_year: value }))}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Academic Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYears.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filters.semester} onValueChange={(value) => setFilters((prev) => ({ ...prev, semester: value }))}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {semesters.map((sem) => (
                                    <SelectItem key={sem} value={sem}>
                                        {`${sem}${sem === '1' ? 'st' : sem === '2' ? 'nd' : 'rd'} Semester`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Filter className="text-muted-foreground h-4 w-4" />
                        <Select value={selectedDay} onValueChange={(value) => setSelectedDay(value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by day" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Days</SelectItem>
                                {DAYS_OF_WEEK.map((day) => (
                                    <SelectItem key={day} value={day}>
                                        {day}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Color Legend */}
                <div className="bg-background rounded-lg border p-3 print:hidden">
                    <div className="mb-2 flex items-center gap-2">
                        <Info className="text-muted-foreground h-4 w-4" />
                        <h3 className="font-medium">Subject Color Legend</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {uniqueSubjects.map((subject) => {
                            const color = subjectColors.get(subject);
                            return (
                                <Badge key={subject} variant="outline" className={`${color.bg} ${color.border}`}>
                                    <span className={color.text}>{subject}</span>
                                </Badge>
                            );
                        })}
                    </div>
                </div>

                <Tabs defaultValue="calendar" className="w-full">
                    <TabsList className="mb-4 print:hidden">
                        <TabsTrigger value="calendar" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Calendar View</span>
                        </TabsTrigger>
                        <TabsTrigger value="list" className="flex items-center gap-2">
                            <List className="h-4 w-4" />
                            <span>List View</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Calendar View */}
                    <TabsContent value="calendar" className="animate-in fade-in-50 mt-0">
                        <div className="overflow-x-auto">
                            <div className="min-w-[900px]">
                                {/* Schedule Grid */}
                                <div className="bg-background grid grid-cols-[100px_repeat(7,1fr)] rounded-lg border">
                                    {/* Header Row */}
                                    <div className="bg-background sticky top-0 z-10 border-b p-2 text-center font-medium">Time</div>
                                    {DAYS_OF_WEEK.map((day) => (
                                        <div
                                            key={day}
                                            className={`bg-background sticky top-0 z-10 border-b border-l p-2 text-center font-medium ${
                                                day === currentDayOfWeek ? 'bg-muted' : ''
                                            }`}
                                        >
                                            {day}
                                            {day === currentDayOfWeek && <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-green-500"></span>}
                                        </div>
                                    ))}

                                    {/* Time Slots */}
                                    {TIME_SLOTS.map((hour) => (
                                        <React.Fragment key={hour}>
                                            <div className="bg-background sticky left-0 z-10 flex h-[100px] items-center justify-center border-b p-2 text-center">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="text-muted-foreground h-3 w-3" />
                                                    <span>
                                                        {hour % 12 === 0 ? '12' : hour % 12}
                                                        {hour < 12 ? 'am' : 'pm'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Day cells for this time slot */}
                                            {DAYS_OF_WEEK.map((day) => {
                                                const isCurrentDay = day === currentDayOfWeek;

                                                return (
                                                    <div
                                                        key={`${day}-${hour}`}
                                                        className={`relative h-[100px] border-b border-l p-0 ${isCurrentDay ? 'bg-muted/30' : ''}`}
                                                    >
                                                        {/* Current time indicator */}
                                                        {isCurrentDay &&
                                                            currentTimePosition &&
                                                            hour <= new Date().getHours() &&
                                                            hour + 1 > new Date().getHours() && (
                                                                <div
                                                                    className="absolute right-0 left-0 z-20 h-0.5 bg-red-500"
                                                                    style={{
                                                                        top: `${(new Date().getMinutes() / 60) * 100}px`,
                                                                    }}
                                                                >
                                                                    <div className="absolute -top-1.5 -left-1 h-3 w-3 rounded-full bg-red-500"></div>
                                                                </div>
                                                            )}

                                                        {/* Schedule items */}
                                                        {schedulesByDay[day]
                                                            .filter((schedule) => {
                                                                const startHour = timeToHour(schedule.start_time);
                                                                const endHour = timeToHour(schedule.end_time);
                                                                return startHour >= hour && startHour < hour + 1;
                                                            })
                                                            .map((schedule) => {
                                                                const { height, top } = calculatePosition(schedule.start_time, schedule.end_time);
                                                                const color = subjectColors.get(schedule.subject.code);

                                                                return (
                                                                    <TooltipProvider key={schedule.id}>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <div
                                                                                    className={`absolute right-0 left-0 mx-1 rounded-md ${color.bg} ${color.border} cursor-pointer overflow-hidden p-2 transition-opacity hover:opacity-90`}
                                                                                    style={{
                                                                                        height: `${height}px`,
                                                                                        top: `${top - (hour - 7) * 100}px`,
                                                                                        zIndex: 10,
                                                                                    }}
                                                                                >
                                                                                    <div className={`text-xs font-medium ${color.text}`}>
                                                                                        {schedule.subject.code}
                                                                                    </div>
                                                                                    <div className="truncate text-xs">{schedule.subject.name}</div>
                                                                                    <div className="text-muted-foreground mt-1 truncate text-xs">
                                                                                        {schedule.room.building.name}, {schedule.room.name}
                                                                                    </div>
                                                                                    <div className="text-muted-foreground truncate text-xs">
                                                                                        {formatTime(schedule.start_time)} -{' '}
                                                                                        {formatTime(schedule.end_time)}
                                                                                    </div>
                                                                                </div>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent className="max-w-xs">
                                                                                <div className="space-y-1">
                                                                                    <p className="font-bold">
                                                                                        {schedule.subject.code} - {schedule.subject.name}
                                                                                    </p>
                                                                                    <p>
                                                                                        <span className="font-medium">Time:</span>{' '}
                                                                                        {formatTime(schedule.start_time)} -{' '}
                                                                                        {formatTime(schedule.end_time)}
                                                                                    </p>
                                                                                    <p>
                                                                                        <span className="font-medium">Location:</span>{' '}
                                                                                        {schedule.room.building.name}, {schedule.room.name}
                                                                                    </p>
                                                                                    <p>
                                                                                        <span className="font-medium">Type:</span>{' '}
                                                                                        {schedule.schedule_type}
                                                                                    </p>
                                                                                    {schedule.block && (
                                                                                        <p>
                                                                                            <span className="font-medium">Block:</span>{' '}
                                                                                            {schedule.block}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                );
                                                            })}
                                                    </div>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* List View */}
                    <TabsContent value="list" className="animate-in fade-in-50 mt-0">
                        <div className="space-y-6">
                            {DAYS_OF_WEEK.map((day) => {
                                const daySchedules = schedulesByDay[day];
                                if (daySchedules.length === 0) return null;

                                const isCurrentDay = day === currentDayOfWeek;

                                return (
                                    <Card key={day} className={isCurrentDay ? 'border-primary' : ''}>
                                        <CardContent className="pt-6">
                                            <div className="mb-4 flex items-center justify-between">
                                                <h3 className="flex items-center gap-2 text-lg font-bold">
                                                    {day}
                                                    {isCurrentDay && (
                                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                                                            Today
                                                        </Badge>
                                                    )}
                                                </h3>
                                                <Badge variant="secondary">
                                                    {daySchedules.length} {daySchedules.length === 1 ? 'Class' : 'Classes'}
                                                </Badge>
                                            </div>

                                            <div className="space-y-4">
                                                {daySchedules
                                                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                                    .map((schedule) => {
                                                        const color = subjectColors.get(schedule.subject.code);
                                                        const now = new Date();
                                                        const currentHour = now.getHours();
                                                        const currentMinute = now.getMinutes();

                                                        // Check if this schedule is currently active
                                                        const startHour = Number.parseInt(schedule.start_time.split(':')[0]);
                                                        const startMinute = Number.parseInt(schedule.start_time.split(':')[1]);
                                                        const endHour = Number.parseInt(schedule.end_time.split(':')[0]);
                                                        const endMinute = Number.parseInt(schedule.end_time.split(':')[1]);

                                                        const isActive =
                                                            isCurrentDay &&
                                                            (currentHour > startHour ||
                                                                (currentHour === startHour && currentMinute >= startMinute)) &&
                                                            (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute));

                                                        return (
                                                            <div
                                                                key={schedule.id}
                                                                className={`border-l-4 ${color.border} rounded-r-md py-3 pl-4 ${color.bg} relative transition-all hover:shadow-md`}
                                                            >
                                                                {isActive && (
                                                                    <div className="absolute top-2 right-2">
                                                                        <Badge className="bg-green-500 hover:bg-green-600">In Progress</Badge>
                                                                    </div>
                                                                )}

                                                                <div className={`font-medium ${color.text} text-lg`}>
                                                                    {schedule.subject.code} - {schedule.subject.name}
                                                                </div>

                                                                <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 md:grid-cols-2">
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <Clock className="text-muted-foreground h-4 w-4" />
                                                                        <span>
                                                                            <span className="font-medium">Time:</span>{' '}
                                                                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <span className="font-medium">Location:</span> {schedule.room.building.name},{' '}
                                                                        {schedule.room.name}
                                                                    </div>

                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <span className="font-medium">Type:</span> {schedule.schedule_type}
                                                                    </div>

                                                                    {schedule.block && (
                                                                        <div className="flex items-center gap-2 text-sm">
                                                                            <span className="font-medium">Block:</span> {schedule.block}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}

                            {/* No results message */}
                            {Object.values(schedulesByDay).every((schedules) => schedules.length === 0) && (
                                <div className="py-12 text-center">
                                    <div className="bg-muted mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full">
                                        <Calendar className="text-muted-foreground h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-medium">No schedules found</h3>
                                    <p className="text-muted-foreground mt-1">Try adjusting your filters or search term</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Print-only view */}
                <div className="mt-8 hidden print:block">
                    <h2 className="mb-4 text-xl font-bold">Schedule Summary</h2>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border p-2 text-left">Day</th>
                                <th className="border p-2 text-left">Subject</th>
                                <th className="border p-2 text-left">Time</th>
                                <th className="border p-2 text-left">Location</th>
                                <th className="border p-2 text-left">Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules
                                .sort((a, b) => {
                                    // Sort by day first, then by start time
                                    const dayOrder = DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
                                    if (dayOrder !== 0) return dayOrder;
                                    return a.start_time.localeCompare(b.start_time);
                                })
                                .map((schedule) => (
                                    <tr key={schedule.id}>
                                        <td className="border p-2">{schedule.day}</td>
                                        <td className="border p-2">
                                            {schedule.subject.code} - {schedule.subject.name}
                                        </td>
                                        <td className="border p-2">
                                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                        </td>
                                        <td className="border p-2">
                                            {schedule.room.building.name}, {schedule.room.name}
                                        </td>
                                        <td className="border p-2">{schedule.schedule_type}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

export default MySchedulesPage;
