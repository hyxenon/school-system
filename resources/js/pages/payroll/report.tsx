import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Download, Filter, Printer } from 'lucide-react';
import { useState } from 'react';

interface PayrollReportProps {
    report: {
        id: number;
        employee_id: number;
        employee: {
            id: number;
            user: {
                name: string;
                email: string;
            };
            position: string;
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
    }[];
    totals: {
        basic_salary: number;
        overtime_pay: number;
        allowances: number;
        deductions: number;
        tax: number;
        net_salary: number;
    };
    filters?: {
        start_date?: string;
        end_date?: string;
        status?: string;
    };
}

function formatDate(dateString?: string) {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (e) {
        return 'Invalid Date';
    }
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

export default function PayrollReportPage({ report, totals, filters = {} }: PayrollReportProps) {
    const [startDate, setStartDate] = useState<string>(filters.start_date || '');
    const [endDate, setEndDate] = useState<string>(filters.end_date || '');
    const [status, setStatus] = useState<string>(filters.status || '');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Payroll',
            href: '/payroll',
        },
        {
            title: 'Report',
            href: '/payroll-report',
        },
    ];

    const handleGenerateReport = (e: React.FormEvent) => {
        e.preventDefault();

        const queryParams: { [key: string]: string } = {};
        if (startDate) queryParams.start_date = startDate;
        if (endDate) queryParams.end_date = endDate;
        if (status) queryParams.status = status;

        router.get('/payroll-report', queryParams);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payroll Report" />
            <Toaster />

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/payroll">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <ArrowLeft className="h-4 w-4" /> Back to Payroll
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Payroll Report</h1>
                </div>

                <div className="flex gap-2 print:hidden">
                    <Button variant="outline" className="flex items-center gap-2" onClick={handlePrint}>
                        <Printer size={16} />
                        Print Report
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2" onClick={handlePrint}>
                        <Download size={16} />
                        Export PDF
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                <Card className="print:hidden">
                    <CardHeader>
                        <CardTitle>Generate Payroll Report</CardTitle>
                        <CardDescription>Filter payroll data by date range and status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleGenerateReport} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input id="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="end_date">End Date</Label>
                                    <Input id="end_date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={status} onValueChange={(value) => setStatus(value)}>
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" className="flex items-center gap-2">
                                    <Filter size={16} />
                                    Generate Report
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {report && report.length > 0 ? (
                    <div className="space-y-6">
                        <div className="hidden print:block">
                            <div className="mb-6 text-center">
                                <h1 className="text-2xl font-bold">Payroll Report</h1>
                                <p className="text-muted-foreground">
                                    {startDate && endDate ? `Period: ${formatDate(startDate)} - ${formatDate(endDate)}` : 'All Payroll Records'}
                                </p>
                                <p className="text-muted-foreground">Generated on: {formatDate(new Date().toISOString())}</p>
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Payroll Summary</CardTitle>
                                <CardDescription>
                                    {startDate && endDate
                                        ? `Payroll records from ${formatDate(startDate)} to ${formatDate(endDate)}`
                                        : 'All payroll records'}
                                    {status && ` with status: ${status}`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>Employee</TableHead>
                                                <TableHead>Position</TableHead>
                                                <TableHead>Pay Period</TableHead>
                                                <TableHead>Basic Salary</TableHead>
                                                <TableHead>Overtime</TableHead>
                                                <TableHead>Allowances</TableHead>
                                                <TableHead>Deductions</TableHead>
                                                <TableHead>Tax</TableHead>
                                                <TableHead>Net Salary</TableHead>
                                                <TableHead className="print:hidden">Status</TableHead>
                                                <TableHead className="print:hidden">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {report.map((payroll) => (
                                                <TableRow key={payroll.id}>
                                                    <TableCell>{payroll.id}</TableCell>
                                                    <TableCell>{payroll.employee?.user?.name || 'Unknown'}</TableCell>
                                                    <TableCell>{payroll.employee?.position || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        {formatDate(payroll.pay_period_start)} - {formatDate(payroll.pay_period_end)}
                                                    </TableCell>
                                                    <TableCell>{formatCurrency(payroll.basic_salary)}</TableCell>
                                                    <TableCell>{formatCurrency(payroll.overtime_pay)}</TableCell>
                                                    <TableCell>{formatCurrency(payroll.allowances)}</TableCell>
                                                    <TableCell>{formatCurrency(payroll.deductions)}</TableCell>
                                                    <TableCell>{formatCurrency(payroll.tax)}</TableCell>
                                                    <TableCell className="font-bold">{formatCurrency(payroll.net_salary)}</TableCell>
                                                    <TableCell className="print:hidden">{getStatusBadge(payroll.status)}</TableCell>
                                                    <TableCell className="print:hidden">
                                                        <Link href={`/payroll/${payroll.id}`}>
                                                            <Button variant="ghost" size="sm">
                                                                View
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}

                                            <TableRow className="bg-muted/50 font-bold">
                                                <TableCell colSpan={4} className="text-right">
                                                    Totals:
                                                </TableCell>
                                                <TableCell>{formatCurrency(totals.basic_salary)}</TableCell>
                                                <TableCell>{formatCurrency(totals.overtime_pay)}</TableCell>
                                                <TableCell>{formatCurrency(totals.allowances)}</TableCell>
                                                <TableCell>{formatCurrency(totals.deductions)}</TableCell>
                                                <TableCell>{formatCurrency(totals.tax)}</TableCell>
                                                <TableCell>{formatCurrency(totals.net_salary)}</TableCell>
                                                <TableCell className="print:hidden"></TableCell>
                                                <TableCell className="print:hidden"></TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Report Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="rounded-lg border p-4">
                                        <h3 className="text-muted-foreground text-sm font-medium">Total Records</h3>
                                        <p className="mt-2 text-2xl font-bold">{report.length}</p>
                                    </div>

                                    <div className="rounded-lg border p-4">
                                        <h3 className="text-muted-foreground text-sm font-medium">Total Salary Budget</h3>
                                        <p className="mt-2 text-2xl font-bold">{formatCurrency(totals.basic_salary)}</p>
                                    </div>

                                    <div className="rounded-lg border p-4">
                                        <h3 className="text-muted-foreground text-sm font-medium">Total Net Payroll</h3>
                                        <p className="mt-2 text-2xl font-bold">{formatCurrency(totals.net_salary)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-muted-foreground mx-auto mb-4 h-12 w-12">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                    />
                                </svg>
                            </div>
                            <h3 className="mb-1 text-lg font-medium">No payroll records found</h3>
                            <p className="text-muted-foreground mb-4">
                                {startDate || endDate
                                    ? 'No payroll records match your filter criteria.'
                                    : 'Please select a date range to generate a report.'}
                            </p>
                            {(startDate || endDate) && (
                                <Button variant="outline" onClick={() => router.get('/payroll-report')}>
                                    Clear Filters
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
