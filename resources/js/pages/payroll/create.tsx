import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payroll',
        href: '/payroll',
    },
    {
        title: 'Create',
        href: '/payroll/create',
    },
];

interface CreatePayrollProps {
    employees: {
        id: number;
        first_name: string;
        last_name: string;
        hourly_rate: number;
    }[];
    hasUnpaidDTRs: boolean;
}

function CreatePayrollPage({ employees, hasUnpaidDTRs }: CreatePayrollProps) {
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);

    const { data, setData, post, processing, errors } = useForm({
        employee_id: '',
        pay_period_start: '',
        pay_period_end: '',
        allowances: '0',
        deductions: '0',
        payment_method: 'bank_transfer',
        remarks: '',
    });

    const handleStartDateSelect = (date: Date | undefined) => {
        setStartDate(date);
        if (date) {
            setData('pay_period_start', format(date, 'yyyy-MM-dd'));
        }
    };

    const handleEndDateSelect = (date: Date | undefined) => {
        setEndDate(date);
        if (date) {
            setData('pay_period_end', format(date, 'yyyy-MM-dd'));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/payroll', {
            onSuccess: () => {
                toast.success('Payroll created successfully');
                router.visit('/payroll');
            },
            onError: () => {
                toast.error('Failed to create payroll');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Payroll" />
            <Toaster />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Create Payroll</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>New Payroll Record</CardTitle>
                        <CardDescription>Create a new payroll record based on employee's attendance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!hasUnpaidDTRs ? (
                            <div className="p-6 text-center">
                                <div className="mb-2 text-amber-500">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="48"
                                        height="48"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="mx-auto"
                                    >
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                        <line x1="12" y1="9" x2="12" y2="13"></line>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                </div>
                                <h3 className="mb-1 text-lg font-medium">No Unpaid DTR Records</h3>
                                <p className="mb-4 text-gray-500">There are no employees with unpaid attendance records in the system.</p>
                                <div className="flex justify-center">
                                    <Link href="/DTR">
                                        <Button>Go to DTR Records</Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="employee_id">Select Employee</Label>
                                        <Select value={data.employee_id} onValueChange={(value) => setData('employee_id', value)}>
                                            <SelectTrigger id="employee_id" className="w-full">
                                                <SelectValue placeholder="Select an employee" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employees.length === 0 ? (
                                                    <SelectItem value="no-employees" disabled>
                                                        No employees with unpaid DTR records
                                                    </SelectItem>
                                                ) : (
                                                    employees.map((employee) => (
                                                        <SelectItem key={employee.id} value={employee.id.toString()}>
                                                            {employee.first_name} {employee.last_name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.employee_id && <p className="text-sm text-red-500">{errors.employee_id}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="pay_period_start">Pay Period Start</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                        <Calendar className="mr-2 h-4 w-4" />
                                                        {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <CalendarComponent
                                                        mode="single"
                                                        selected={startDate}
                                                        onSelect={handleStartDateSelect}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {errors.pay_period_start && <p className="text-sm text-red-500">{errors.pay_period_start}</p>}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="pay_period_end">Pay Period End</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                        <Calendar className="mr-2 h-4 w-4" />
                                                        {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <CalendarComponent
                                                        mode="single"
                                                        selected={endDate}
                                                        onSelect={handleEndDateSelect}
                                                        disabled={(date) => (startDate ? date < startDate : false)}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {errors.pay_period_end && <p className="text-sm text-red-500">{errors.pay_period_end}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="allowances">Allowances (PHP)</Label>
                                            <Input
                                                id="allowances"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.allowances}
                                                onChange={(e) => setData('allowances', e.target.value)}
                                            />
                                            {errors.allowances && <p className="text-sm text-red-500">{errors.allowances}</p>}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="deductions">Deductions (PHP)</Label>
                                            <Input
                                                id="deductions"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.deductions}
                                                onChange={(e) => setData('deductions', e.target.value)}
                                            />
                                            {errors.deductions && <p className="text-sm text-red-500">{errors.deductions}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="payment_method">Payment Method</Label>
                                        <Select value={data.payment_method} onValueChange={(value) => setData('payment_method', value)}>
                                            <SelectTrigger id="payment_method">
                                                <SelectValue placeholder="Select payment method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="check">Check</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.payment_method && <p className="text-sm text-red-500">{errors.payment_method}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="remarks">Remarks</Label>
                                        <Textarea
                                            id="remarks"
                                            rows={3}
                                            value={data.remarks}
                                            onChange={(e) => setData('remarks', e.target.value)}
                                            placeholder="Any additional notes about this payroll"
                                        />
                                        {errors.remarks && <p className="text-sm text-red-500">{errors.remarks}</p>}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        className="ml-auto"
                                        disabled={processing || !data.employee_id || !data.pay_period_start || !data.pay_period_end}
                                    >
                                        {processing ? 'Processing...' : 'Create Payroll'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

export default CreatePayrollPage;
