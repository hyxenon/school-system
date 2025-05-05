import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Head, useForm } from '@inertiajs/react';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Events',
        href: '/events',
    },
];

function EventsPage({ events }: { events: Event[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const {
        data,
        setData,
        post,
        processing,
        errors,
        put,
        delete: destroy,
    } = useForm({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        status: 'scheduled',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/events', {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
        });
    };

    const reset = () => {
        setData({
            title: '',
            description: '',
            start_date: '',
            end_date: '',
            location: '',
            status: 'scheduled',
        });
    };

    const handleEdit = (event: Event) => {
        setData({
            title: event.title,
            description: event.description,
            start_date: event.start_date,
            end_date: event.end_date,
            location: event.location,
            status: event.status,
        });
        setIsDetailsOpen(false);
        setIsEditOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/events/${selectedEvent?.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                reset();
            },
        });
    };

    const handleDelete = () => {
        if (selectedEvent) {
            destroy(`/events/${selectedEvent.id}`, {
                onSuccess: () => {
                    setIsDeleteOpen(false);
                    setIsDetailsOpen(false);
                },
            });
        }
    };

    const getEventColor = (status: string) => {
        switch (status) {
            case 'scheduled':
                return '#3B82F6'; // blue
            case 'completed':
                return '#10B981'; // green
            case 'cancelled':
                return '#EF4444'; // red
            default:
                return '#6B7280'; // gray
        }
    };

    const calendarEvents = events.map((event) => ({
        id: event.id.toString(),
        title: event.title,
        start: event.start_date,
        end: event.end_date,
        extendedProps: {
            description: event.description,
            location: event.location,
            status: event.status,
        },
        backgroundColor: getEventColor(event.status),
        borderColor: getEventColor(event.status),
    }));

    const handleEventClick = (info: any) => {
        const event = events.find((e) => e.id.toString() === info.event.id);
        if (event) {
            setSelectedEvent(event);
            setIsDetailsOpen(true);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Events" />
            <Toaster />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Events Calendar</h1>
                        <p className="text-muted-foreground">Schedule and manage your events</p>
                    </div>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="gap-2">
                                <PlusIcon className="h-4 w-4" />
                                Add Event
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create New Event</DialogTitle>
                                <DialogDescription>Fill in the details for your new event</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <Input placeholder="Event Title" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea
                                        placeholder="Event description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Start Date</label>
                                        <Input
                                            type="datetime-local"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">End Date</label>
                                        <Input type="datetime-local" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Location</label>
                                    <Input placeholder="Event location" value={data.location} onChange={(e) => setData('location', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" className="w-full" disabled={processing}>
                                    Create Event
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardContent className="p-0 sm:p-6">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay',
                            }}
                            events={calendarEvents}
                            eventClick={handleEventClick}
                            height="auto"
                            editable={true}
                            selectable={true}
                            selectMirror={true}
                            dayMaxEvents={true}
                            slotMinTime="06:00:00"
                            slotMaxTime="20:00:00"
                            allDaySlot={false}
                            slotDuration="00:30:00"
                            className="custom-calendar"
                        />
                    </CardContent>
                </Card>

                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <div className="mt-4 flex items-center justify-between">
                                <DialogTitle>{selectedEvent?.title}</DialogTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" onClick={() => handleEdit(selectedEvent!)}>
                                        <PencilIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => {
                                            setIsDetailsOpen(false);
                                            setIsDeleteOpen(true);
                                        }}
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Status</p>
                                    <Badge
                                        variant={
                                            selectedEvent?.status === 'completed'
                                                ? 'success'
                                                : selectedEvent?.status === 'cancelled'
                                                  ? 'destructive'
                                                  : 'default'
                                        }
                                    >
                                        {selectedEvent?.status}
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Location</p>
                                    <p className="text-muted-foreground text-sm">{selectedEvent?.location || 'No location'}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Description</p>
                                <p className="text-muted-foreground text-sm">{selectedEvent?.description || 'No description'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Starts</p>
                                    <p className="text-muted-foreground text-sm">
                                        {selectedEvent?.start_date ? new Date(selectedEvent.start_date).toLocaleString() : ''}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Ends</p>
                                    <p className="text-muted-foreground text-sm">
                                        {selectedEvent?.end_date ? new Date(selectedEvent.end_date).toLocaleString() : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit Event</DialogTitle>
                            <DialogDescription>Make changes to your event</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input placeholder="Event Title" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    placeholder="Event description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Start Date</label>
                                    <Input type="datetime-local" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">End Date</label>
                                    <Input type="datetime-local" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Location</label>
                                <Input placeholder="Event location" value={data.location} onChange={(e) => setData('location', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full" disabled={processing}>
                                Update Event
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Event</DialogTitle>
                            <DialogDescription>Are you sure you want to delete this event? This action cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={processing}>
                                Delete
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

export default EventsPage;
