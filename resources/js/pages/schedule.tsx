'use client';

import { ScheduleCreateModal } from '@/components/schedule-add-modal';
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
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Building, Course, Employee, Room, Schedule, Subject } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Clock, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Toaster } from 'sonner';

interface SchedulesIndexProps {
    schedules: Schedule[];
    subjects: Subject[];
    professors: Employee[];
    rooms: Room[];
    buildings: Building[];
    courses: Course[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Schedules',
        href: '/schedules',
    },
];

export default function SchedulesIndex({ schedules, subjects, professors, rooms, buildings, courses }: SchedulesIndexProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [subjectFilter, setSubjectFilter] = useState<string>('');
    const [roomFilter, setRoomFilter] = useState<string>('');
    const [dayFilter, setDayFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { route } = usePage().props;

    // Filter schedules based on search term and filters
    const filteredSchedules = useMemo(() => {
        return schedules.filter((schedule) => {
            const matchesSearch =
                schedule.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                schedule.professor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                schedule.room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                schedule.day.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesSubject = !subjectFilter || subjectFilter === 'all' || schedule.subject_id.toString() === subjectFilter;
            const matchesRoom = !roomFilter || roomFilter === 'all' || schedule.room_id.toString() === roomFilter;
            const matchesDay = !dayFilter || dayFilter === 'all' || schedule.day === dayFilter;

            return matchesSearch && matchesSubject && matchesRoom && matchesDay;
        });
    }, [schedules, searchTerm, subjectFilter, roomFilter, dayFilter]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
    const paginatedSchedules = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredSchedules.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredSchedules, currentPage]);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(route('schedules.destroy', deleteId), {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSubjectFilter('');
        setRoomFilter('');
        setDayFilter('');
        setCurrentPage(1);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800';
            case 'Inactive':
                return 'bg-gray-100 text-gray-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Schedules" />
            <Toaster />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Schedules</h1>
                    <ScheduleCreateModal subjects={subjects} professors={professors} rooms={rooms} buildings={buildings} courses={courses} />
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                                    <Input
                                        id="search"
                                        placeholder="Search schedules..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <Label htmlFor="subject-filter">Subject</Label>
                                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                                    <SelectTrigger id="subject-filter">
                                        <SelectValue placeholder="All Subjects" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="p-2">
                                            <div className="relative">
                                                <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                                                <Input
                                                    placeholder="Search subjects..."
                                                    className="pl-8"
                                                    onChange={(e) => {
                                                        // This just filters the dropdown items, not the actual data
                                                        const searchValue = e.target.value.toLowerCase();
                                                        const subjectItems = document.querySelectorAll('[data-subject-item]');
                                                        subjectItems.forEach((item) => {
                                                            const text = item.textContent?.toLowerCase() || '';
                                                            if (text.includes(searchValue)) {
                                                                item.classList.remove('hidden');
                                                            } else {
                                                                item.classList.add('hidden');
                                                            }
                                                        });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <SelectItem value="all" data-subject-item>
                                            All Subjects
                                        </SelectItem>
                                        {subjects.map((subject) => (
                                            <SelectItem key={subject.id} value={subject.id.toString()} data-subject-item>
                                                {subject.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-48">
                                <Label htmlFor="room-filter">Room</Label>
                                <Select value={roomFilter} onValueChange={setRoomFilter}>
                                    <SelectTrigger id="room-filter">
                                        <SelectValue placeholder="All Rooms" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="p-2">
                                            <div className="relative">
                                                <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                                                <Input
                                                    placeholder="Search rooms..."
                                                    className="pl-8"
                                                    onChange={(e) => {
                                                        // This just filters the dropdown items, not the actual data
                                                        const searchValue = e.target.value.toLowerCase();
                                                        const roomItems = document.querySelectorAll('[data-room-item]');
                                                        roomItems.forEach((item) => {
                                                            const text = item.textContent?.toLowerCase() || '';
                                                            if (text.includes(searchValue)) {
                                                                item.classList.remove('hidden');
                                                            } else {
                                                                item.classList.add('hidden');
                                                            }
                                                        });
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <SelectItem value="all" data-room-item>
                                            All Rooms
                                        </SelectItem>
                                        {rooms.map((room) => (
                                            <SelectItem key={room.id} value={room.id.toString()} data-room-item>
                                                {room.name} ({room.building.name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-48">
                                <Label htmlFor="day-filter">Day</Label>
                                <Select value={dayFilter} onValueChange={setDayFilter}>
                                    <SelectTrigger id="day-filter">
                                        <SelectValue placeholder="All Days" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Days</SelectItem>
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                            <SelectItem key={day} value={day}>
                                                {day}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                                <X className="h-4 w-4" /> Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Professor</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead>Day</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Year & Block</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedSchedules.length > 0 ? (
                                paginatedSchedules.map((schedule) => (
                                    <TableRow key={schedule.id}>
                                        <TableCell className="font-medium">{schedule.subject.name}</TableCell>
                                        <TableCell>{schedule.professor.user.name}</TableCell>
                                        <TableCell>
                                            {schedule.room.name}
                                            <div className="text-muted-foreground text-xs">{schedule.room.building.name}</div>
                                        </TableCell>
                                        <TableCell>{schedule.day}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Clock className="text-muted-foreground h-3 w-3" />
                                                <span>
                                                    {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            Year {schedule.year_level}
                                            <div className="text-muted-foreground text-xs">Block {schedule.block}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{schedule.schedule_type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(schedule.status)}>{schedule.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" onClick={() => router.get(route('schedules.edit', schedule.id))}>
                                                    Edit
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => setDeleteId(schedule.id)}>
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center">
                                        No schedules found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {filteredSchedules.length > 0 && (
                    <div className="flex items-center justify-between">
                        <div className="text-muted-foreground text-sm">
                            Showing {Math.min(filteredSchedules.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
                            {Math.min(filteredSchedules.length, currentPage * itemsPerPage)} of {filteredSchedules.length} schedules
                        </div>
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    />
                                </PaginationItem>

                                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                                    let pageNumber: number;

                                    // Logic to show pages around current page
                                    if (totalPages <= 5) {
                                        pageNumber = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNumber = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNumber = totalPages - 4 + i;
                                    } else {
                                        pageNumber = currentPage - 2 + i;
                                    }

                                    if (pageNumber > 0 && pageNumber <= totalPages) {
                                        return (
                                            <PaginationItem key={pageNumber}>
                                                <PaginationLink isActive={pageNumber === currentPage} onClick={() => setCurrentPage(pageNumber)}>
                                                    {pageNumber}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    }
                                    return null;
                                })}

                                {totalPages > 5 && currentPage < totalPages - 2 && (
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Delete confirmation dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the schedule.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

function formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hourNum = parseInt(hours, 10);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const formattedHours = hourNum % 12 || 12;
    return `${formattedHours}:${minutes} ${period}`;
}
