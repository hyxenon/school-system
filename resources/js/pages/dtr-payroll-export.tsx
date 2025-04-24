import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, Download } from 'lucide-react';
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
        title: 'Payroll Export',
        href: '/DTR-payroll',
    },
];

type Employee = {
    id: number;
    name: string;
    position: string;
};

type PayrollRecord = {
    employee: string;
    position: string;
    total_hours: number;
    overtime_hours: number;
    days_present: number;
    days_absent: number;
    days_late: number;
    days_on_leave: number;
};

interface PayrollPageProps {
    payrollData?: Record<string, PayrollRecord>;
    employees?: Employee[];
    startDate?: string;
    endDate?: string;
}

// Create schema for form validation
const formSchema = z
    .object({
        start_date: z.date({ required_error: 'Start date is required' }),
        end_date: z.date({ required_error: 'End date is required' }),
        employee_id: z.string().optional(),
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

const DTRPayrollExportPage = ({ payrollData = {}, employees = [], startDate = '', endDate = '' }: PayrollPageProps) => {
    const [start, setStart] = useState<Date | undefined>(startDate ? new Date(startDate) : new Date());
    const [end, setEnd] = useState<Date | undefined>(endDate ? new Date(endDate) : new Date());

    const form = useReactHookForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            start_date: startDate ? new Date(startDate) : new Date(),
            end_date: endDate ? new Date(endDate) : new Date(),
            employee_id: '',
        },
    });

    const { control, handleSubmit } = form;

    // Inertia form for submission
    const { data, setData, get, processing } = useForm({
        start_date: startDate || format(new Date(), 'yyyy-MM-dd'),
        end_date: endDate || format(new Date(), 'yyyy-MM-dd'),
        employee_id: '',
    });

    const onSubmit = handleSubmit((values) => {
        // Set data to Inertia form
        setData({
            start_date: format(values.start_date, 'yyyy-MM-dd'),
            end_date: format(values.end_date, 'yyyy-MM-dd'),
            employee_id: values.employee_id || '',
        });

        // Submit the form
        get('/DTR-payroll', {
            preserveScroll: true,
        });
    });

    // Calculate totals for all employees
    const calculateTotals = () => {
        const employeeRecords = Object.values(payrollData);
        if (employeeRecords.length === 0) return null;

        return {
            total_employees: employeeRecords.length,
            total_hours: employeeRecords.reduce((sum, record) => sum + record.total_hours, 0),
            total_overtime: employeeRecords.reduce((sum, record) => sum + record.overtime_hours, 0),
            total_days_present: employeeRecords.reduce((sum, record) => sum + record.days_present, 0),
            total_days_absent: employeeRecords.reduce((sum, record) => sum + record.days_absent, 0),
            total_days_late: employeeRecords.reduce((sum, record) => sum + record.days_late, 0),
            total_days_on_leave: employeeRecords.reduce((sum, record) => sum + record.days_on_leave, 0),
        };
    };

    const totals = calculateTotals();

    // Calculate hourly and overtime rates based on position (sample rates)
    const calculateRates = (position: string) => {
        const positionRates: Record<string, { hourly: number; overtime: number }> = {
            'program head': { hourly: 500, overtime: 600 },
            professor: { hourly: 400, overtime: 480 },
            staff: { hourly: 300, overtime: 360 },
            hr: { hourly: 350, overtime: 420 },
            registrar: { hourly: 450, overtime: 540 },
            treasurer: { hourly: 450, overtime: 540 },
        };

        const defaultRate = { hourly: 350, overtime: 420 };
        const lowerPosition = position.toLowerCase();

        for (const [key, value] of Object.entries(positionRates)) {
            if (lowerPosition.includes(key)) {
                return value;
            }
        }

        return defaultRate;
    };

    // Format as currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    // Handle export to CSV
    const exportToCSV = () => {
        if (Object.keys(payrollData).length === 0) return;

        const headers = [
            'Employee Name',
            'Position',
            'Regular Hours',
            'Overtime Hours',
            'Days Present',
            'Days Absent',
            'Days Late',
            'Days on Leave',
            'Regular Pay',
            'Overtime Pay',
            'Total Pay',
        ];

        const csvRows = [headers];

        for (const record of Object.values(payrollData)) {
            const rates = calculateRates(record.position);
            const regularPay = record.total_hours * rates.hourly;
            const overtimePay = record.overtime_hours * rates.overtime;
            const totalPay = regularPay + overtimePay;

            csvRows.push([
                record.employee,
                record.position,
                record.total_hours.toString(),
                record.overtime_hours.toString(),
                record.days_present.toString(),
                record.days_absent.toString(),
                record.days_late.toString(),
                record.days_on_leave.toString(),
                regularPay.toFixed(2),
                overtimePay.toFixed(2),
                totalPay.toFixed(2),
            ]);
        }

        // Add total row
        if (totals) {
            const totalRow = [
                'TOTALS',
                '',
                totals.total_hours.toString(),
                totals.total_overtime.toString(),
                totals.total_days_present.toString(),
                totals.total_days_absent.toString(),
                totals.total_days_late.toString(),
                totals.total_days_on_leave.toString(),
                '',
                '',
                '',
            ];
            csvRows.push(totalRow);
        }

        // Convert to CSV format
        const csvContent = csvRows.map((row) => row.join(',')).join('\n');

        // Create a blob and trigger a download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `payroll_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payroll Export" />
            <Toaster />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Payroll Export</h1>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Select Date Range</CardTitle>
                    <CardDescription>Choose the date range for the payroll data you want to export</CardDescription>
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
                                    name="employee_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Employee (Optional)</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    setData('employee_id', value);
                                                }}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="All Employees" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="all">All Employees</SelectItem>
                                                    {employees.map((employee) => (
                                                        <SelectItem key={employee.id} value={employee.id.toString()}>
                                                            {employee.name} ({employee.position})
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
                                    Generate Payroll Data
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {startDate && endDate && Object.keys(payrollData).length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Payroll Data</CardTitle>
                            <CardDescription>
                                Showing data from {format(new Date(startDate), 'MMM d, yyyy')} to {format(new Date(endDate), 'MMM d, yyyy')}
                            </CardDescription>
                        </div>
                        <Button onClick={exportToCSV} variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export to CSV
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee Name</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Regular Hours</TableHead>
                                    <TableHead>Overtime Hours</TableHead>
                                    <TableHead>Days Present</TableHead>
                                    <TableHead>Days Absent</TableHead>
                                    <TableHead>Days Late</TableHead>
                                    <TableHead>Days on Leave</TableHead>
                                    <TableHead>Regular Pay</TableHead>
                                    <TableHead>Overtime Pay</TableHead>
                                    <TableHead>Total Pay</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.values(payrollData).length > 0 ? (
                                    <>
                                        {Object.values(payrollData).map((record, index) => {
                                            const rates = calculateRates(record.position);
                                            const regularPay = record.total_hours * rates.hourly;
                                            const overtimePay = record.overtime_hours * rates.overtime;
                                            const totalPay = regularPay + overtimePay;

                                            return (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{record.employee}</TableCell>
                                                    <TableCell>{record.position}</TableCell>
                                                    <TableCell>{record.total_hours.toFixed(2)}</TableCell>
                                                    <TableCell>{record.overtime_hours.toFixed(2)}</TableCell>
                                                    <TableCell>{record.days_present}</TableCell>
                                                    <TableCell>{record.days_absent}</TableCell>
                                                    <TableCell>{record.days_late}</TableCell>
                                                    <TableCell>{record.days_on_leave}</TableCell>
                                                    <TableCell>{formatCurrency(regularPay)}</TableCell>
                                                    <TableCell>{formatCurrency(overtimePay)}</TableCell>
                                                    <TableCell className="font-bold">{formatCurrency(totalPay)}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {/* Summary row for totals */}
                                        {totals && (
                                            <TableRow className="bg-muted/50">
                                                <TableCell className="font-bold">TOTALS</TableCell>
                                                <TableCell>({totals.total_employees} employees)</TableCell>
                                                <TableCell className="font-bold">{totals.total_hours.toFixed(2)}</TableCell>
                                                <TableCell className="font-bold">{totals.total_overtime.toFixed(2)}</TableCell>
                                                <TableCell className="font-bold">{totals.total_days_present}</TableCell>
                                                <TableCell className="font-bold">{totals.total_days_absent}</TableCell>
                                                <TableCell className="font-bold">{totals.total_days_late}</TableCell>
                                                <TableCell className="font-bold">{totals.total_days_on_leave}</TableCell>
                                                <TableCell colSpan={3}></TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-muted-foreground py-8 text-center">
                                            No payroll data found for the selected criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <p className="text-muted-foreground text-sm">
                            Note: This payroll data is calculated based on attendance records and standard rates for each position. Adjustments may be
                            required for holidays, special rates, deductions, and other factors.
                        </p>
                    </CardFooter>
                </Card>
            )}

            {startDate && endDate && Object.keys(payrollData).length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-12">
                        <div className="space-y-2 text-center">
                            <h3 className="text-lg font-medium">No payroll data found</h3>
                            <p className="text-muted-foreground text-sm">
                                There are no attendance records for the selected date range. Try selecting a different date range or employee.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </AppLayout>
    );
};

export default DTRPayrollExportPage;
