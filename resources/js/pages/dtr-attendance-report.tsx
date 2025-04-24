import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, Download, Printer } from 'lucide-react';
import { useState } from 'react';
import { useForm as useReactHookForm } from 'react-hook-form';
import { Toaster } from 'sonner';
import * as z from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'DTR',
        href: '/DTR',
    },
    {
        title: 'Attendance Report',
        href: '/DTR-attendance-report',
    },
];

type Department = {
    id: number;
    name: string;
};

type EmployeeStat = {
    name: string;
    position: string;
    present: number;
    absent: number;
    late: number;
    on_leave: number;
    total_hours: number;
    overtime_hours: number;
};

type AttendanceReportData = {
    total_employees: number;
    total_attendance_records: number;
    present_count: number;
    absent_count: number;
    late_count: number;
    on_leave_count: number;
    average_hours: number;
    total_overtime_hours: number;
    employee_stats: EmployeeStat[];
};

interface AttendanceReportProps {
    reportData?: AttendanceReportData;
    departments?: Department[];
    startDate?: string;
    endDate?: string;
}

// Create schema for form validation
const formSchema = z
    .object({
        start_date: z.date({ required_error: 'Start date is required' }),
        end_date: z.date({ required_error: 'End date is required' }),
        department_id: z.string().optional(),
    })
    .refine(
        (data) => {
            return data.start_date <= data.end_date;
        },
        {
            message: 'End date must be after start date',
            path: ['end_date'],
        },
    );

const AttendanceReportPage = ({ reportData, departments = [], startDate = '', endDate = '' }: AttendanceReportProps) => {
    const [start, setStart] = useState<Date | undefined>(startDate ? new Date(startDate) : new Date());
    const [end, setEnd] = useState<Date | undefined>(endDate ? new Date(endDate) : new Date());

    const form = useReactHookForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            start_date: startDate ? new Date(startDate) : new Date(),
            end_date: endDate ? new Date(endDate) : new Date(),
            department_id: '',
        },
    });

    const { control, handleSubmit } = form;

    // Inertia form for submission
    const { data, setData, get, processing } = useForm({
        start_date: startDate || format(new Date(), 'yyyy-MM-dd'),
        end_date: endDate || format(new Date(), 'yyyy-MM-dd'),
        department_id: '',
    });

    const onSubmit = handleSubmit((values) => {
        // Set data to Inertia form
        setData({
            start_date: format(values.start_date, 'yyyy-MM-dd'),
            end_date: format(values.end_date, 'yyyy-MM-dd'),
            department_id: values.department_id || '',
        });

        // Submit the form
        get('/DTR-attendance-report', {
            preserveScroll: true,
        });
    });

    // Function to calculate attendance rate from the report data
    const calculateAttendanceRate = () => {
        if (!reportData) return 0;

        const totalWorkingDays = reportData.present_count + reportData.absent_count + reportData.late_count + reportData.on_leave_count;

        if (totalWorkingDays === 0) return 0;

        // Count present and late as present for attendance rate
        const presentDays = reportData.present_count + reportData.late_count;
        return (presentDays / totalWorkingDays) * 100;
    };

    // Function to calculate punctuality rate from the report data
    const calculatePunctualityRate = () => {
        if (!reportData) return 0;

        const totalAttendanceDays = reportData.present_count + reportData.late_count;

        if (totalAttendanceDays === 0) return 0;

        // Only count actual present (not late) for punctuality rate
        return (reportData.present_count / totalAttendanceDays) * 100;
    };

    // Function to print the report
    const printReport = () => {
        window.print();
    };

    // Function to export to CSV
    const exportToCSV = () => {
        if (!reportData) return;

        const headers = [
            'Employee Name',
            'Position',
            'Present Days',
            'Absent Days',
            'Late Days',
            'On Leave Days',
            'Total Hours',
            'Overtime Hours',
            'Attendance Rate',
        ];

        const csvRows = [headers];

        reportData.employee_stats.forEach((employee) => {
            const totalDays = employee.present + employee.absent + employee.late + employee.on_leave;
            const attendanceRate = totalDays ? (((employee.present + employee.late) / totalDays) * 100).toFixed(2) : '0';

            csvRows.push([
                employee.name,
                employee.position,
                employee.present.toString(),
                employee.absent.toString(),
                employee.late.toString(),
                employee.on_leave.toString(),
                employee.total_hours.toFixed(2),
                employee.overtime_hours.toFixed(2),
                attendanceRate + '%',
            ]);
        });

        // Add summary row
        csvRows.push([
            'TOTALS',
            `${reportData.total_employees} employees`,
            reportData.present_count.toString(),
            reportData.absent_count.toString(),
            reportData.late_count.toString(),
            reportData.on_leave_count.toString(),
            (reportData.average_hours * reportData.total_employees).toFixed(2),
            reportData.total_overtime_hours.toFixed(2),
            calculateAttendanceRate().toFixed(2) + '%',
        ]);

        // Convert to CSV format
        const csvContent = csvRows.map((row) => row.join(',')).join('\n');

        // Create a blob and trigger a download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `attendance_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Helper function to calculate individual attendance rate
    const calculateIndividualAttendanceRate = (employee: EmployeeStat) => {
        const totalDays = employee.present + employee.absent + employee.late + employee.on_leave;
        if (totalDays === 0) return 0;

        // Count present and late as present for attendance rate
        return ((employee.present + employee.late) / totalDays) * 100;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance Report" />
            <Toaster />

            <div className="mb-6 flex items-center justify-between print:hidden">
                <h1 className="text-2xl font-bold">Attendance Report</h1>
            </div>

            <Card className="mb-6 print:hidden">
                <CardHeader>
                    <CardTitle>Select Report Parameters</CardTitle>
                    <CardDescription>Choose the date range and department for the attendance report</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <FormField
                                    control={control}
                                    name="start_date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Start Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
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
                                                        onSelect={(date) => {
                                                            field.onChange(date);
                                                            setStart(date);
                                                            setData('start_date', date ? format(date, 'yyyy-MM-dd') : '');
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="end_date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>End Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
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
                                                        onSelect={(date) => {
                                                            field.onChange(date);
                                                            setEnd(date);
                                                            setData('end_date', date ? format(date, 'yyyy-MM-dd') : '');
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="department_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department (Optional)</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    setData('department_id', value);
                                                }}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="All Departments" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="all">All Departments</SelectItem>
                                                    {departments.map((department) => (
                                                        <SelectItem key={department.id} value={department.id.toString()}>
                                                            {department.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    Generate Report
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {reportData && startDate && endDate && (
                <>
                    <div className="mb-4 flex justify-end space-x-2 print:hidden">
                        <Button variant="outline" onClick={printReport}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Report
                        </Button>
                        <Button variant="outline" onClick={exportToCSV}>
                            <Download className="mr-2 h-4 w-4" />
                            Export to CSV
                        </Button>
                    </div>

                    <div className="print:mt-0 print:mb-8 print:border-b print:py-4">
                        <h2 className="text-center text-2xl font-bold print:text-xl">Attendance Report</h2>
                        <p className="text-muted-foreground text-center">
                            {format(new Date(startDate), 'MMMM d, yyyy')} - {format(new Date(endDate), 'MMMM d, yyyy')}
                        </p>
                    </div>

                    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{reportData.total_employees}</div>
                                <p className="text-muted-foreground text-xs">With {reportData.total_attendance_records} attendance records</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{calculateAttendanceRate().toFixed(2)}%</div>
                                <Progress value={calculateAttendanceRate()} className="h-2" />
                                <p className="text-muted-foreground mt-2 text-xs">
                                    {reportData.present_count + reportData.late_count} out of {reportData.total_attendance_records} days
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Punctuality Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{calculatePunctualityRate().toFixed(2)}%</div>
                                <Progress value={calculatePunctualityRate()} className="h-2" />
                                <p className="text-muted-foreground mt-2 text-xs">
                                    {reportData.present_count} on-time out of {reportData.present_count + reportData.late_count} attended
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Average Hours Worked</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{reportData.average_hours.toFixed(2)} hrs</div>
                                <p className="text-muted-foreground text-xs">Total overtime: {reportData.total_overtime_hours.toFixed(2)} hrs</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Attendance Breakdown</CardTitle>
                            <CardDescription>Summary of attendance by status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <div className="flex flex-col items-center rounded-lg bg-green-50 p-4">
                                    <span className="text-lg font-semibold text-green-700">{reportData.present_count}</span>
                                    <span className="text-sm text-green-600">Present</span>
                                    <span className="mt-1 text-xs text-green-500">
                                        {((reportData.present_count / reportData.total_attendance_records) * 100).toFixed(1)}%
                                    </span>
                                </div>

                                <div className="flex flex-col items-center rounded-lg bg-yellow-50 p-4">
                                    <span className="text-lg font-semibold text-yellow-700">{reportData.late_count}</span>
                                    <span className="text-sm text-yellow-600">Late</span>
                                    <span className="mt-1 text-xs text-yellow-500">
                                        {((reportData.late_count / reportData.total_attendance_records) * 100).toFixed(1)}%
                                    </span>
                                </div>

                                <div className="flex flex-col items-center rounded-lg bg-red-50 p-4">
                                    <span className="text-lg font-semibold text-red-700">{reportData.absent_count}</span>
                                    <span className="text-sm text-red-600">Absent</span>
                                    <span className="mt-1 text-xs text-red-500">
                                        {((reportData.absent_count / reportData.total_attendance_records) * 100).toFixed(1)}%
                                    </span>
                                </div>

                                <div className="flex flex-col items-center rounded-lg bg-blue-50 p-4">
                                    <span className="text-lg font-semibold text-blue-700">{reportData.on_leave_count}</span>
                                    <span className="text-sm text-blue-600">On Leave</span>
                                    <span className="mt-1 text-xs text-blue-500">
                                        {((reportData.on_leave_count / reportData.total_attendance_records) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Employee Attendance Details</CardTitle>
                            <CardDescription>Individual attendance statistics for all employees</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee Name</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead className="text-center">Present</TableHead>
                                        <TableHead className="text-center">Late</TableHead>
                                        <TableHead className="text-center">Absent</TableHead>
                                        <TableHead className="text-center">On Leave</TableHead>
                                        <TableHead className="text-right">Hours Worked</TableHead>
                                        <TableHead className="text-right">Attendance Rate</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportData.employee_stats.map((employee, index) => {
                                        const attendanceRate = calculateIndividualAttendanceRate(employee);
                                        let attendanceClass = '';

                                        if (attendanceRate >= 90) attendanceClass = 'text-green-600';
                                        else if (attendanceRate >= 75) attendanceClass = 'text-yellow-600';
                                        else attendanceClass = 'text-red-600';

                                        return (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{employee.name}</TableCell>
                                                <TableCell>{employee.position}</TableCell>
                                                <TableCell className="text-center">{employee.present}</TableCell>
                                                <TableCell className="text-center">{employee.late}</TableCell>
                                                <TableCell className="text-center">{employee.absent}</TableCell>
                                                <TableCell className="text-center">{employee.on_leave}</TableCell>
                                                <TableCell className="text-right">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span>{employee.total_hours.toFixed(1)}</span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Overtime: {employee.overtime_hours.toFixed(1)} hrs</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                                <TableCell className={`text-right font-medium ${attendanceClass}`}>
                                                    {attendanceRate.toFixed(1)}%
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}

            {startDate && endDate && !reportData && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-12">
                        <div className="space-y-2 text-center">
                            <h3 className="text-lg font-medium">No attendance data found</h3>
                            <p className="text-muted-foreground text-sm">
                                There are no attendance records for the selected date range or department. Try selecting a different date range.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </AppLayout>
    );
};

export default AttendanceReportPage;
