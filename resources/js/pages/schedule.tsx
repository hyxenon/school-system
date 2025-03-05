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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Building, Employee, Room, Schedule, Subject } from '@/types';
import { Head, router } from '@inertiajs/react';
import React from 'react';
import { Toaster } from 'sonner';

interface SchedulesIndexProps {
    schedules: Schedule[];
    subjects: Subject[];
    professors: Employee[];
    rooms: Room[];
    buildings: Building[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Schedules',
        href: '/schedules',
    },
];

export default function SchedulesIndex({ schedules, subjects, professors, rooms, buildings }: SchedulesIndexProps) {
    const [deleteId, setDeleteId] = React.useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(route('schedules.destroy', deleteId), {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Schedules" />
            <Toaster />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Schedules</h1>
                    {/* Replace the previous Button with the ScheduleCreateModal */}
                    <ScheduleCreateModal subjects={subjects} professors={professors} rooms={rooms} buildings={buildings} />
                </div>

                {/* Rest of the component remains the same */}
                <div className="rounded-md border">
                    <Table>
                        {/* Table header and body as before */}
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Professor</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead>Day</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>Block</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedules.map((schedule: Schedule) => (
                                <TableRow key={schedule.id}>
                                    {/* Table row content as before */}
                                    <TableCell>{schedule.subject.name}</TableCell>
                                    <TableCell>{schedule.professor.user.name}</TableCell>
                                    {/* ... rest of the table row ... */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Delete confirmation dialog remains the same */}
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
