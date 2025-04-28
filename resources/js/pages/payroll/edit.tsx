import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface PayrollEditProps {
    payroll: {
        id: number;
        employee_id: number;
        employee?: {
            id: number;
            user?: {
                name: string;
            };
            position?: string;
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
    };
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function PayrollEditPage({ payroll }: PayrollEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Payroll',
            href: '/payroll',
        },
        {
            title: `Edit Payroll #${payroll.id}`,
            href: `/payroll/${payroll.id}/edit`,
        },
    ];

    // Safe access to nested properties
    const employeeName = payroll.employee?.user?.name || 'Unknown Employee';
    const employeePosition = payroll.employee?.position || 'Unknown';

    const { data, setData, put, processing, errors } = useForm({
        allowances: payroll.allowances.toString(),
        deductions: payroll.deductions.toString(),
        payment_method: payroll.payment_method,
        status: payroll.status,
        remarks: payroll.remarks || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/payroll/${payroll.id}`, {
            onSuccess: () => {
                toast.success('Payroll updated successfully');
                router.visit(`/payroll/${payroll.id}`);
            },
            onError: () => {
                toast.error('Failed to update payroll');
            },
        });
    };

    // Calculate totals
    const grossPay = payroll.basic_salary + payroll.overtime_pay + parseFloat(data.allowances);
    const totalDeductions = payroll.tax + parseFloat(data.deductions);
    const netSalary = grossPay - totalDeductions;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Payroll #${payroll.id}`} />
            <Toaster />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href={`/payroll/${payroll.id}`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <ArrowLeft className="h-4 w-4" /> Back
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">Edit Payroll #{payroll.id}</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Payroll Details</CardTitle>
                                <CardDescription>Update payroll information for {employeeName}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-4">
                                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label>Employee</Label>
                                                <div className="bg-muted rounded border p-2">
                                                    {employeeName} ({employeePosition})
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Pay Period</Label>
                                                <div className="bg-muted rounded border p-2">
                                                    {formatDate(payroll.pay_period_start)} to {formatDate(payroll.pay_period_end)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label>Basic Salary</Label>
                                                <div className="bg-muted rounded border p-2">{formatCurrency(payroll.basic_salary)}</div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Overtime Pay</Label>
                                                <div className="bg-muted rounded border p-2">{formatCurrency(payroll.overtime_pay)}</div>
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
                                            <Label htmlFor="status">Status</Label>
                                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                                <SelectTrigger id="status">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="processing">Processing</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="rejected">Rejected</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
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

                                    <div className="mt-6 flex justify-end">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Updating...' : 'Update Payroll'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Payroll Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-muted-foreground text-sm">Employee</dt>
                                        <dd className="font-medium">{employeeName}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground text-sm">Pay Period</dt>
                                        <dd className="font-medium">
                                            {formatDate(payroll.pay_period_start)} to {formatDate(payroll.pay_period_end)}
                                        </dd>
                                    </div>
                                    <div className="border-t pt-4">
                                        <dt className="text-muted-foreground text-sm">Basic Salary</dt>
                                        <dd className="font-medium">{formatCurrency(payroll.basic_salary)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground text-sm">Overtime Pay</dt>
                                        <dd className="font-medium">{formatCurrency(payroll.overtime_pay)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground text-sm">Allowances</dt>
                                        <dd className="font-medium">{formatCurrency(parseFloat(data.allowances))}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground text-sm">Tax</dt>
                                        <dd className="font-medium">{formatCurrency(payroll.tax)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground text-sm">Other Deductions</dt>
                                        <dd className="font-medium">{formatCurrency(parseFloat(data.deductions))}</dd>
                                    </div>
                                    <div className="border-t pt-4">
                                        <dt className="text-muted-foreground text-sm">Gross Pay</dt>
                                        <dd className="font-medium">{formatCurrency(grossPay)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-muted-foreground text-sm">Total Deductions</dt>
                                        <dd className="font-medium">{formatCurrency(totalDeductions)}</dd>
                                    </div>
                                    <div className="border-t pt-4">
                                        <dt className="text-muted-foreground text-sm font-medium">Net Salary</dt>
                                        <dd className="text-lg font-bold">{formatCurrency(netSalary)}</dd>
                                    </div>
                                    <div className="border-t pt-4">
                                        <dt className="text-muted-foreground text-sm">Status</dt>
                                        <dd className="font-medium">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    data.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : data.status === 'pending'
                                                          ? 'bg-yellow-100 text-yellow-800'
                                                          : data.status === 'processing'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-red-100 text-red-800'
                                                }
                                            >
                                                {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                                            </Badge>
                                        </dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default PayrollEditPage;
