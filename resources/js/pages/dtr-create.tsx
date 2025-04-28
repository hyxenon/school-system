import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm as useReactHookForm } from 'react-hook-form';
import { Toaster, toast } from 'sonner';
import * as z from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'DTR',
        href: '/DTR',
    },
    {
        title: 'Add New Record',
        href: '/DTR/create',
    },
];

type Employee = {
    id: number;
    name: string;
    position: string;
    department: string;
    employee_id: string;
};

interface CreateDTRProps {
    employees: Employee[];
    statuses: string[];
    leaveTypes: string[];
}

// Create schema for form validation
const formSchema = z
    .object({
        employee_id: z.string().min(1, { message: 'Employee is required' }),
        date: z.date({ required_error: 'Date is required' }),
        time_in: z.string().optional(),
        time_out: z.string().optional(),
        lunch_start: z.string().optional(),
        lunch_end: z.string().optional(),
        overtime_start: z.string().optional(),
        overtime_end: z.string().optional(),
        status: z.string().min(1, { message: 'Status is required' }),
        leave_type: z.string().optional(),
        remarks: z.string().optional(),
    })
    .refine(
        (data) => {
            // If status is Present, Late, or Half Day, time_in and time_out are required
            if (['Present', 'Late', 'Half Day'].includes(data.status)) {
                return !!data.time_in && !!data.time_out;
            }
            return true;
        },
        {
            message: 'Time in and time out are required for this status',
            path: ['time_in'],
        },
    )
    .refine(
        (data) => {
            // If status is On Leave, leave_type is required
            if (data.status === 'On Leave') {
                return !!data.leave_type;
            }
            return true;
        },
        {
            message: 'Leave type is required when status is On Leave',
            path: ['leave_type'],
        },
    );

const CreateDTRPage = ({ employees, statuses, leaveTypes }: CreateDTRProps) => {
    const [date, setDate] = useState<Date>(new Date());
    const [selectedStatus, setSelectedStatus] = useState<string>('Present');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [employeeSearch, setEmployeeSearch] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const filteredEmployees = employees.filter(
        (employee) =>
            employee.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
            employee.position.toLowerCase().includes(employeeSearch.toLowerCase()) ||
            employee.department.toLowerCase().includes(employeeSearch.toLowerCase()) ||
            employee.employee_id.includes(employeeSearch),
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmployeeSearch(e.target.value);
        // Maintain focus after state update
        e.target.focus();
    };

    const clearSearch = () => {
        setEmployeeSearch('');
        // Restore focus to input after clearing
        searchInputRef.current?.focus();
    };

    const form = useReactHookForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            employee_id: '',
            date: new Date(),
            time_in: '',
            time_out: '',
            lunch_start: '',
            lunch_end: '',
            overtime_start: '',
            overtime_end: '',
            status: 'Present',
            leave_type: '',
            remarks: '',
        },
    });

    const { control, handleSubmit } = form;

    const onSubmit = handleSubmit((values) => {
        setIsSubmitting(true);

        // Format the values for submission
        const formattedValues = {
            ...values,
            date: format(values.date, 'yyyy-MM-dd'),
            time_in: values.time_in ? `${values.time_in}:00` : null,
            time_out: values.time_out ? `${values.time_out}:00` : null,
            lunch_start: values.lunch_start ? `${values.lunch_start}:00` : null,
            lunch_end: values.lunch_end ? `${values.lunch_end}:00` : null,
            overtime_start: values.overtime_start ? `${values.overtime_start}:00` : null,
            overtime_end: values.overtime_end ? `${values.overtime_end}:00` : null,
            remarks: values.remarks || null,
            leave_type: values.leave_type || null,
        };

        // Submit using Inertia router with proper type annotations
        router.post('/DTR', formattedValues, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                toast.success('DTR record created successfully');
                router.visit('/DTR');
            },
            onError: (errors: Record<string, string>) => {
                setIsSubmitting(false);
                console.error(errors);
                toast.error('Failed to create DTR record');
            },
        });
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add DTR Record" />
            <Toaster />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Add New DTR Record</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daily Time Record Details</CardTitle>
                        <CardDescription>Add a new attendance record for an employee</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={onSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Employee Selection */}
                                    <FormField
                                        control={control}
                                        name="employee_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Employee</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select an employee" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <div className="p-2">
                                                            <div className="relative">
                                                                <Input
                                                                    ref={searchInputRef}
                                                                    placeholder="Search employees..."
                                                                    value={employeeSearch}
                                                                    onChange={handleSearchChange}
                                                                    className="mb-2"
                                                                    onKeyDown={(e) => {
                                                                        // Prevent select from closing on key press
                                                                        e.stopPropagation();
                                                                    }}
                                                                />
                                                                {employeeSearch && (
                                                                    <X
                                                                        className="text-muted-foreground absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 cursor-pointer"
                                                                        onClick={clearSearch}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                        {filteredEmployees.length > 0 ? (
                                                            filteredEmployees.map((employee) => (
                                                                <SelectItem key={employee.id} value={employee.id.toString()}>
                                                                    <div className="flex flex-col">
                                                                        <div className="font-medium">
                                                                            [{employee.employee_id}] {employee.name}
                                                                        </div>
                                                                        <div className="text-muted-foreground text-xs">
                                                                            {employee.position} - {employee.department}
                                                                        </div>
                                                                    </div>
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <div className="text-muted-foreground p-2 text-center">No employees found</div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Date */}
                                    <FormField
                                        control={control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    'w-full pl-3 text-left font-normal',
                                                                    !field.value && 'text-muted-foreground',
                                                                )}
                                                            >
                                                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Status */}
                                    <FormField
                                        control={control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        setSelectedStatus(value);
                                                    }}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {statuses.map((status) => (
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

                                    {/* Leave Type (visible only when status is "On Leave") */}
                                    {selectedStatus === 'On Leave' && (
                                        <FormField
                                            control={control}
                                            name="leave_type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Leave Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select leave type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {leaveTypes.map((type) => (
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
                                    )}
                                </div>

                                {/* Time fields (visible for Present, Late, Half Day) */}
                                {['Present', 'Late', 'Half Day'].includes(selectedStatus) && (
                                    <>
                                        <h3 className="text-lg font-medium">Time Details</h3>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                            {/* Time In */}
                                            <FormField
                                                control={control}
                                                name="time_in"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Time In</FormLabel>
                                                        <FormControl>
                                                            <Input type="time" {...field} className="w-full" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Time Out */}
                                            <FormField
                                                control={control}
                                                name="time_out"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Time Out</FormLabel>
                                                        <FormControl>
                                                            <Input type="time" {...field} className="w-full" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Lunch Start */}
                                            <FormField
                                                control={control}
                                                name="lunch_start"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Lunch Start (Optional)</FormLabel>
                                                        <FormControl>
                                                            <Input type="time" {...field} className="w-full" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Lunch End */}
                                            <FormField
                                                control={control}
                                                name="lunch_end"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Lunch End (Optional)</FormLabel>
                                                        <FormControl>
                                                            <Input type="time" {...field} className="w-full" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <h3 className="text-lg font-medium">Overtime Details (Optional)</h3>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            {/* Overtime Start */}
                                            <FormField
                                                control={control}
                                                name="overtime_start"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Overtime Start</FormLabel>
                                                        <FormControl>
                                                            <Input type="time" {...field} className="w-full" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Overtime End */}
                                            <FormField
                                                control={control}
                                                name="overtime_end"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Overtime End</FormLabel>
                                                        <FormControl>
                                                            <Input type="time" {...field} className="w-full" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Remarks */}
                                <FormField
                                    control={control}
                                    name="remarks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Remarks (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Enter any additional notes or remarks" className="resize-none" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : 'Save DTR Record'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default CreateDTRPage;
