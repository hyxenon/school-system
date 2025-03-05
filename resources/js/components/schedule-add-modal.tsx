import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Employee, Room, Subject } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from '@inertiajs/react';
import { Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const scheduleSchema = z
    .object({
        subject_id: z.coerce.number().min(1, 'Subject is required'),
        professor_id: z.coerce.number().min(1, 'Professor is required'),
        building_id: z.coerce.number().min(1, 'Building is required'),
        room_id: z.coerce.number().min(1, 'Room is required'),
        day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
        start_time: z.string().min(1, 'Start time is required'),
        end_time: z.string().min(1, 'End time is required'),
        year_level: z.coerce.number().min(1, 'Year must be at least 1').max(6, 'Year cannot exceed 6'),
        block: z.string().min(1, 'Block is required'),
        academic_year: z.string().min(1, 'Academic year is required'),
        semester: z.coerce.number().min(1, 'Semester is required').max(3, 'Semester cannot exceed 3'),
        schedule_type: z.enum(['Lecture', 'Laboratory', 'Hybrid']),
        max_students: z.coerce.number().min(1, 'Max students is required'),
        status: z.enum(['Active', 'Inactive', 'Cancelled']),
    })
    .refine((data) => data.end_time > data.start_time, {
        message: 'End time must be after start time',
        path: ['end_time'],
    });

interface ScheduleCreateModalProps {
    subjects?: Subject[];
    professors?: Employee[];
    rooms?: Room[];
    buildings?: Building[];
}

export function ScheduleCreateModal({ subjects = [], professors = [], rooms = [], buildings = [] }: ScheduleCreateModalProps) {
    const [open, setOpen] = useState(false);
    const [subjectSearch, setSubjectSearch] = useState('');
    const [professorSearch, setProfessorSearch] = useState('');
    const [buildingSearch, setBuildingSearch] = useState('');
    const [roomSearch, setRoomSearch] = useState('');
    const { post, processing } = useForm({});

    const form = useHookForm<z.infer<typeof scheduleSchema>>({
        resolver: zodResolver(scheduleSchema),
        defaultValues: {
            subject_id: undefined,
            professor_id: undefined,
            building_id: undefined,
            room_id: undefined,
            day: 'Monday',
            start_time: '',
            end_time: '',
            year_level: 1,
            block: '',
            academic_year: new Date().getFullYear().toString(),
            semester: 1,
            schedule_type: 'Lecture',
            max_students: 30,
            status: 'Active',
        },
    });

    // Filtered search functions
    const filteredSubjects = useMemo(() => {
        return subjects.filter((subject) => subject.name.toLowerCase().includes(subjectSearch.toLowerCase()));
    }, [subjects, subjectSearch]);

    const filteredProfessors = useMemo(() => {
        return professors.filter((professor) => professor.user.name.toLowerCase().includes(professorSearch.toLowerCase()));
    }, [professors, professorSearch]);

    // Filter buildings
    const filteredBuildings = useMemo(() => {
        return buildings.filter((building) => building.name.toLowerCase().includes(buildingSearch.toLowerCase()));
    }, [buildings, buildingSearch]);

    // Filter rooms based on selected building
    const filteredRooms = useMemo(() => {
        // Get the building_id from the form
        const selectedBuildingId = form.getValues('building_id');

        return rooms.filter(
            (room) =>
                (selectedBuildingId ? room.building_id === selectedBuildingId : true) &&
                (room.name.toLowerCase().includes(roomSearch.toLowerCase()) || room.building.name.toLowerCase().includes(roomSearch.toLowerCase())),
        );
    }, [rooms, roomSearch, form.getValues('building_id')]);

    const onSubmit = (values: z.infer<typeof scheduleSchema>) => {
        post(route('schedules.store'), {
            ...values,
            onSuccess: () => {
                toast.success('Schedule created successfully');
                setOpen(false);
                form.reset();
            },
            onError: (error) => {
                if (error.conflict) {
                    toast.error(error.conflict);
                } else {
                    toast.error('Failed to create schedule');
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Create Schedule
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Create New Schedule</DialogTitle>
                    <DialogDescription>Fill out the details for the new schedule</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Subject Selection */}
                            <FormField
                                control={form.control}
                                name="subject_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(Number(value));
                                                setSubjectSearch('');
                                            }}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a subject" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <div className="p-2">
                                                    <div className="relative">
                                                        <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                                                        <Input
                                                            placeholder="Search subjects..."
                                                            value={subjectSearch}
                                                            onChange={(e) => setSubjectSearch(e.target.value)}
                                                            className="mb-2 pl-8"
                                                        />
                                                        {subjectSearch && (
                                                            <X
                                                                className="text-muted-foreground absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 cursor-pointer"
                                                                onClick={() => setSubjectSearch('')}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                {filteredSubjects.length > 0 ? (
                                                    filteredSubjects.map((subject) => (
                                                        <SelectItem key={subject.id} value={subject.id.toString()}>
                                                            {subject.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="text-muted-foreground p-2 text-center">No subjects found</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Professor Selection */}
                            <FormField
                                control={form.control}
                                name="professor_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Professor</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(Number(value));
                                                setProfessorSearch('');
                                            }}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a professor" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <div className="p-2">
                                                    <div className="relative">
                                                        <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                                                        <Input
                                                            placeholder="Search professors..."
                                                            value={professorSearch}
                                                            onChange={(e) => setProfessorSearch(e.target.value)}
                                                            className="mb-2 pl-8"
                                                        />
                                                        {professorSearch && (
                                                            <X
                                                                className="text-muted-foreground absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 cursor-pointer"
                                                                onClick={() => setProfessorSearch('')}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                {filteredProfessors.length > 0 ? (
                                                    filteredProfessors.map((professor) => (
                                                        <SelectItem key={professor.id} value={professor.id.toString()}>
                                                            {professor.user.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="text-muted-foreground p-2 text-center">No professors found</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Building Selection */}
                            <FormField
                                control={form.control}
                                name="building_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Building</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(Number(value));
                                                // Reset room selection when building changes
                                                form.setValue('room_id', undefined);
                                                setBuildingSearch('');
                                            }}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a building" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <div className="p-2">
                                                    <div className="relative">
                                                        <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                                                        <Input
                                                            placeholder="Search buildings..."
                                                            value={buildingSearch}
                                                            onChange={(e) => setBuildingSearch(e.target.value)}
                                                            className="mb-2 pl-8"
                                                        />
                                                        {buildingSearch && (
                                                            <X
                                                                className="text-muted-foreground absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 cursor-pointer"
                                                                onClick={() => setBuildingSearch('')}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                {filteredBuildings.length > 0 ? (
                                                    filteredBuildings.map((building) => (
                                                        <SelectItem key={building.id} value={building.id.toString()}>
                                                            {building.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="text-muted-foreground p-2 text-center">No buildings found</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Room Selection */}
                            <FormField
                                control={form.control}
                                name="room_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Room</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(Number(value));
                                                setRoomSearch('');
                                            }}
                                            value={field.value?.toString()}
                                            disabled={!form.watch('building_id')}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a room" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {form.watch('building_id') ? (
                                                    <>
                                                        <div className="p-2">
                                                            <div className="relative">
                                                                <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
                                                                <Input
                                                                    placeholder="Search rooms..."
                                                                    value={roomSearch}
                                                                    onChange={(e) => setRoomSearch(e.target.value)}
                                                                    className="mb-2 pl-8"
                                                                />
                                                                {roomSearch && (
                                                                    <X
                                                                        className="text-muted-foreground absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 cursor-pointer"
                                                                        onClick={() => setRoomSearch('')}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                        {filteredRooms.length > 0 ? (
                                                            filteredRooms.map((room) => (
                                                                <SelectItem key={room.id} value={room.id.toString()}>
                                                                    {room.name}
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <div className="text-muted-foreground p-2 text-center">
                                                                No rooms found in this building
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="text-muted-foreground p-2 text-center">Select a building first</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Day Selection */}
                            <FormField
                                control={form.control}
                                name="day"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Day</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a day" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                                    <SelectItem key={day} value={day}>
                                                        {day}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Start Time */}
                            <FormField
                                control={form.control}
                                name="start_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* End Time */}
                            <FormField
                                control={form.control}
                                name="end_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Year Level */}
                            <FormField
                                control={form.control}
                                name="year_level"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Year Level</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={6}
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Block */}
                            <FormField
                                control={form.control}
                                name="block"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Block</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Academic Year */}
                            <FormField
                                control={form.control}
                                name="academic_year"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Academic Year</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Semester */}
                            <FormField
                                control={form.control}
                                name="semester"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Semester</FormLabel>
                                        <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select semester" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {[1, 2, 3].map((semester) => (
                                                    <SelectItem key={semester} value={semester.toString()}>
                                                        Semester {semester}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Schedule Type */}
                            <FormField
                                control={form.control}
                                name="schedule_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Schedule Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select schedule type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {['Lecture', 'Laboratory', 'Hybrid'].map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Max Students */}
                            <FormField
                                control={form.control}
                                name="max_students"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Students</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Status */}
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {['Active', 'Inactive', 'Cancelled'].map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Create Schedule
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
