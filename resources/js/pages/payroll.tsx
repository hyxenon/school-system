import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, FileText, Filter as FilterIcon, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payroll',
        href: '/payroll',
    },
];

interface PayrollProps {
    payrolls: {
        data: PayrollRecord[];
        links: any;
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            path: string;
            per_page: number;
            to: number;
            total: number;
        };
    };
    stats: {
        total: number;
        pending: number;
        completed: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

interface PayrollRecord {
    id: number;
    employee_id: number;
    employee: {
        id: number;
        first_name: string;
        last_name: string;
        position: string;
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

function PayrollPage({ payrolls, stats, filters }: PayrollProps) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/payroll', { search: searchQuery, status: statusFilter });
    };

    const handleFilterStatus = (status: string) => {
        setStatusFilter(status);
        router.get('/payroll', { search: searchQuery, status: status === 'all' ? '' : status });
    };

    const handleDelete = (payroll: PayrollRecord) => {
        setSelectedPayroll(payroll);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedPayroll) {
            router.delete(`/payroll/${selectedPayroll.id}`, {
                onSuccess: () => {
                    toast.success('Payroll deleted successfully');
                    setIsDeleteDialogOpen(false);
                },
                onError: () => {
                    toast.error('Failed to delete payroll');
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payroll Management" />
            <Toaster />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Payroll Management</h1>
                    <div className="flex gap-2">
                        <Link href="/payroll/create">
                            <Button className="flex items-center gap-2">
                                <Plus size={16} />
                                New Payroll
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Payrolls</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Pending Payrolls</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Completed Payrolls</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.completed || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Payroll Records</CardTitle>
                        <CardDescription>Manage employee payroll records</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex items-center justify-between">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <Input
                                    placeholder="Search by employee name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-64"
                                />
                                <Button type="submit" variant="secondary">
                                    Search
                                </Button>
                            </form>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <FilterIcon size={16} />
                                        {statusFilter ? `Status: ${statusFilter}` : 'Filter Status'}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleFilterStatus('all')}>All</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilterStatus('pending')}>Pending</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilterStatus('processing')}>Processing</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilterStatus('completed')}>Completed</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilterStatus('rejected')}>Rejected</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Pay Period</TableHead>
                                        <TableHead>Basic Salary</TableHead>
                                        <TableHead>Overtime Pay</TableHead>
                                        <TableHead>Net Salary</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!payrolls?.data || payrolls.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-4 text-center">
                                                No payroll records found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        payrolls.data.map((payroll) => (
                                            <TableRow key={payroll.id}>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {payroll.employee.first_name} {payroll.employee.last_name}
                                                    </div>
                                                    <div className="text-muted-foreground text-sm capitalize">
                                                        {payroll.employee.user.name} - {payroll.employee.id}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(payroll.pay_period_start)} to {formatDate(payroll.pay_period_end)}
                                                </TableCell>
                                                <TableCell>{formatCurrency(payroll.basic_salary)}</TableCell>
                                                <TableCell>{formatCurrency(payroll.overtime_pay)}</TableCell>
                                                <TableCell className="font-medium">{formatCurrency(payroll.net_salary)}</TableCell>
                                                <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/payroll/${payroll.id}`}>
                                                            <Button variant="ghost" size="icon">
                                                                <FileText size={16} />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/payroll/${payroll.id}/edit`}>
                                                            <Button variant="ghost" size="icon">
                                                                <Edit size={16} />
                                                            </Button>
                                                        </Link>
                                                        {payroll.status === 'pending' && (
                                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(payroll)}>
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {payrolls?.meta && payrolls.meta.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-muted-foreground text-sm">
                                    Showing {payrolls.meta.from || 0} to {payrolls.meta.to || 0} of {payrolls.meta.total || 0} entries
                                </div>
                                <div className="flex gap-2">
                                    {payrolls.meta.current_page > 1 && (
                                        <Link href={`/payroll?page=${payrolls.meta.current_page - 1}`}>
                                            <Button variant="outline" size="sm">
                                                Previous
                                            </Button>
                                        </Link>
                                    )}
                                    {payrolls.meta.current_page < payrolls.meta.last_page && (
                                        <Link href={`/payroll?page=${payrolls.meta.current_page + 1}`}>
                                            <Button variant="outline" size="sm">
                                                Next
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>Are you sure you want to delete this payroll record? This action cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

export default PayrollPage;
