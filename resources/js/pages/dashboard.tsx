import { AnnouncementsList } from '@/components/announcements';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { Announcements, BreadcrumbItem } from '@/types';
import { EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import FullCalendar from '@fullcalendar/react';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { MapPin } from 'lucide-react';
import { useState } from 'react';

interface Event {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    status: string;
}

interface DashboardProps {
    announcements: Announcements[];
    events: Event[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ announcements, events = [] }: DashboardProps) {
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const calendarEvents = events.map((event) => ({
        id: event.id.toString(),
        title: event.title,
        start: event.start_date,
        end: event.end_date,
        backgroundColor: event.status === 'scheduled' ? '#3B82F6' : event.status === 'completed' ? '#10B981' : '#EF4444',
        borderColor: 'transparent',
    }));

    const handleEventClick = (clickInfo: EventClickArg) => {
        const event = events.find((e) => e.id.toString() === clickInfo.event.id);
        if (event) {
            setSelectedEvent(event);
            setIsModalOpen(true);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-500';
            case 'completed':
                return 'bg-green-500';
            default:
                return 'bg-red-500';
        }
    };

    const formatEventDate = (startDate: string, endDate: string) => {
        const start = format(new Date(startDate), 'MMM dd, yyyy');
        const end = format(new Date(endDate), 'MMM dd, yyyy');
        return start === end ? start : `${start} - ${end}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Announcements Section */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border bg-background relative rounded-xl border p-4">
                    <AnnouncementsList announcements={announcements} />
                </div>

                {/* Calendar Section */}
                <Card>
                    <CardContent className="p-4">
                        <h2 className="mb-4 text-xl font-semibold">Upcoming Events</h2>
                        <div className="h-[500px]">
                            <FullCalendar
                                plugins={[dayGridPlugin]}
                                initialView="dayGridMonth"
                                events={calendarEvents}
                                headerToolbar={{
                                    left: 'prev,next',
                                    center: 'title',
                                    right: 'today',
                                }}
                                height="100%"
                                dayMaxEvents={2}
                                eventDisplay="block"
                                displayEventTime={false}
                                className="dashboard-calendar"
                                eventClick={handleEventClick}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader className="space-y-4">
                            <DialogTitle className="text-xl">{selectedEvent?.title}</DialogTitle>
                            {selectedEvent && <Badge className={`${getStatusColor(selectedEvent.status)} text-white`}>{selectedEvent.status}</Badge>}
                        </DialogHeader>
                        <div className="space-y-6">
                            {selectedEvent?.description && (
                                <div>
                                    <h4 className="text-muted-foreground mb-2 font-medium">Description</h4>
                                    <p>{selectedEvent.description}</p>
                                </div>
                            )}
                            {selectedEvent?.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="text-muted-foreground h-4 w-4" />
                                    <p>{selectedEvent.location}</p>
                                </div>
                            )}
                            {selectedEvent && (
                                <div>
                                    <h4 className="text-muted-foreground mb-2 font-medium">Date</h4>
                                    <p>{formatEventDate(selectedEvent.start_date, selectedEvent.end_date)}</p>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
