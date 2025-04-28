import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Printer } from 'lucide-react';

interface PayrollShowProps {
    payroll: {
        id: number;
        employee_id: number;
        employee?: {
            id: number;
            user?: {
                name: string;
                email: string;
            };
            position?: string;
            department?: {
                name: string;
            };
        };
        pay_period_start: string;
        pay_period_end: string;
        basic_salary: number;
        overtime_pay: number;
        allowances: number;
        deductions: number;
        tax: number;
        net_salary: number;
        payment_method: string;
        status: 'pending' | 'processing' | 'completed' | 'rejected';
        remarks?: string;
        paid_at?: string;
        created_at: string;
        updated_at: string;
    };
    dtrRecords: {
        id: number;
        date: string;
        time_in: string;
        time_out: string;
        hours_worked: number;
        overtime_hours: number;
        status: string;
        remarks?: string;
    }[];
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'pending':
            return (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    Pending
                </Badge>
            );
        case 'processing':
            return (
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    Processing
                </Badge>
            );
        case 'completed':
            return (
                <Badge variant="outline" className="bg-green-100 text-green-800">
                    Completed
                </Badge>
            );
        case 'rejected':
            return (
                <Badge variant="outline" className="bg-red-100 text-red-800">
                    Rejected
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

function PayrollShowPage({ payroll, dtrRecords }: PayrollShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Payroll',
            href: '/payroll',
        },
        {
            title: `View Payroll #${payroll.id}`,
            href: `/payroll/${payroll.id}`,
        },
    ];

    // Calculate totals
    const totalRegularHours = dtrRecords.reduce((sum, record) => sum + record.hours_worked, 0);
    const totalOvertimeHours = dtrRecords.reduce((sum, record) => sum + record.overtime_hours, 0);

    // Safe access to nested properties
    const employeeName = payroll.employee?.user?.name || 'Unknown Employee';
    const employeeEmail = payroll.employee?.user?.email || 'N/A';
    const employeePosition = payroll.employee?.position || 'Unknown';
    const departmentName = payroll.employee?.department?.name || 'Not Assigned';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Payroll Details #${payroll.id}`} />
            <Toaster />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/payroll">
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <ArrowLeft className="h-4 w-4" /> Back
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">Payroll Details #{payroll.id}</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex items-center gap-2" onClick={() => window.print()}>
                            <Printer size={16} />
                            Print
                        </Button>
                        <Link href={`/payroll/${payroll.id}/edit`}>
                            <Button className="flex items-center gap-2">
                                <Edit size={16} />
                                Edit
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payroll Summary</CardTitle>
                                <CardDescription>
                                    Pay period: {formatDate(payroll.pay_period_start)} to {formatDate(payroll.pay_period_end)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <h3 className="mb-4 text-lg font-medium">Earnings</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Regular Pay ({totalRegularHours} hrs)</span>
                                                <span className="font-medium">{formatCurrency(payroll.basic_salary)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Overtime Pay ({totalOvertimeHours} hrs)</span>
                                                <span className="font-medium">{formatCurrency(payroll.overtime_pay)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Allowances</span>
                                                <span className="font-medium">{formatCurrency(payroll.allowances)}</span>
                                            </div>
                                            <div className="border-border border-t pt-2">
                                                <div className="flex items-center justify-between font-medium">
                                                    <span>Gross Pay</span>
                                                    <span>{formatCurrency(payroll.basic_salary + payroll.overtime_pay + payroll.allowances)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="mb-4 text-lg font-medium">Deductions</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Tax</span>
                                                <span className="font-medium">{formatCurrency(payroll.tax)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Other Deductions</span>
                                                <span className="font-medium">{formatCurrency(payroll.deductions)}</span>
                                            </div>
                                            <div className="border-border border-t pt-2">
                                                <div className="flex items-center justify-between font-medium">
                                                    <span>Total Deductions</span>
                                                    <span>{formatCurrency(payroll.tax + payroll.deductions)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-muted mt-6 rounded-md p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold">Net Salary</span>
                                        <span className="text-lg font-bold">{formatCurrency(payroll.net_salary)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Attendance Records</CardTitle>
                                <CardDescription>Time records used in this payroll calculation</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Time In</TableHead>
                                                <TableHead>Time Out</TableHead>
                                                <TableHead>Hours</TableHead>
                                                <TableHead>Overtime</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {dtrRecords.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="py-6 text-center">
                                                        No attendance records found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                dtrRecords.map((record) => (
                                                    <TableRow key={record.id}>
                                                        <TableCell>{formatDate(record.date)}</TableCell>
                                                        <TableCell>
                                                            {record.time_in
                                                                ? new Date(record.time_in).toLocaleTimeString([], {
                                                                      hour: '2-digit',
                                                                      minute: '2-digit',
                                                                  })
                                                                : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {record.time_out
                                                                ? new Date(record.time_out).toLocaleTimeString([], {
                                                                      hour: '2-digit',
                                                                      minute: '2-digit',
                                                                  })
                                                                : '-'}
                                                        </TableCell>
                                                        <TableCell>{record.hours_worked.toFixed(2)}</TableCell>
                                                        <TableCell>{record.overtime_hours.toFixed(2)}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={record.status === 'Present' ? 'default' : 'outline'}>
                                                                {record.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                            <TableRow className="bg-muted/50">
                                                <TableCell colSpan={3} className="font-medium">
                                                    Total
                                                </TableCell>
                                                <TableCell className="font-medium">{totalRegularHours.toFixed(2)}</TableCell>
                                                <TableCell className="font-medium">{totalOvertimeHours.toFixed(2)}</TableCell>
                                                <TableCell></TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Employee Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-muted-foreground text-sm">Name</dt>
                                        <dd className="font-medium">{employeeName}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground text-sm">Email</dt>
                                        <dd className="font-medium">{employeeEmail}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground text-sm">Position</dt>
                                        <dd className="font-medium capitalize">{employeePosition}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground text-sm">Department</dt>
                                        <dd className="font-medium">{departmentName}</dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-muted-foreground text-sm">Payment Method</dt>
                                        <dd className="font-medium capitalize">{payroll.payment_method.replace('_', ' ')}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground text-sm">Status</dt>
                                        <dd className="font-medium">{getStatusBadge(payroll.status)}</dd>
                                    </div>
                                    {payroll.paid_at && (
                                        <div>
                                            <dt className="text-muted-foreground text-sm">Paid Date</dt>
                                            <dd className="font-medium">{formatDate(payroll.paid_at)}</dd>
                                        </div>
                                    )}
                                    {payroll.remarks && (
                                        <div>
                                            <dt className="text-muted-foreground text-sm">Remarks</dt>
                                            <dd className="font-medium">{payroll.remarks}</dd>
                                        </div>
                                    )}
                                </dl>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default PayrollShowPage;
