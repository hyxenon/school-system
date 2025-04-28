import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, Search } from 'lucide-react';
import { useState } from 'react';
import { Toaster, toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'DTR',
        href: '/DTR',
    },
];

type Employee = {
    id: number;
    name: string;
    position: string;
    employee_id: string;
};

type DTRRecord = {
    id: number;
    employee: {
        id: number;
        user: {
            name: string;
        };
        position: string;
    };
    date: string;
    time_in: string;
    time_out: string;
    status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave';
    hours_worked: number;
    overtime_hours: number;
    is_paid: boolean;
    pay_period: string;
};

interface DTRPageProps {
    dtrRecords: {
        data: DTRRecord[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    employees: Employee[];
    filters: {
        employee_id?: string;
        start_date?: string;
        end_date?: string;
        status?: string;
        is_paid?: string;
    };
    statuses: string[];
}

const DTRPage = ({ dtrRecords, employees, filters, statuses }: DTRPageProps) => {
    const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
    const [startDate, setStartDate] = useState<Date | undefined>(filters.start_date ? new Date(filters.start_date) : undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(filters.end_date ? new Date(filters.end_date) : undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [statusSearch, setStatusSearch] = useState('');

    const { data, setData } = useForm({
        employee_id: filters.employee_id || '',
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        status: filters.status || 'All',
        is_paid: filters.is_paid || '',
    });

    // Filter records based on search query
    const filteredRecords = dtrRecords.data.filter(
        (record) =>
            record.employee.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.status.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Filter employees for select dropdown
    const filteredEmployees = employees.filter(
        (employee) =>
            employee.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
            employee.position.toLowerCase().includes(employeeSearch.toLowerCase()),
    );

    // Filter statuses for select dropdown
    const filteredStatuses = statuses.filter((status) => status.toLowerCase().includes(statusSearch.toLowerCase()));

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRecords(dtrRecords.data.map((record) => record.id));
        } else {
            setSelectedRecords([]);
        }
    };

    const handleSelectRecord = (id: number) => {
        if (selectedRecords.includes(id)) {
            setSelectedRecords(selectedRecords.filter((recordId) => recordId !== id));
        } else {
            setSelectedRecords([...selectedRecords, id]);
        }
    };

    const handleFilter = () => {
        router.get(
            '/DTR',
            {
                employee_id: data.employee_id === 'all' ? '' : data.employee_id,
                start_date: data.start_date,
                end_date: data.end_date,
                status: data.status === 'All' ? '' : data.status,
                is_paid: data.is_paid === 'all' ? '' : data.is_paid,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleResetFilters = () => {
        setData({
            employee_id: '',
            start_date: '',
            end_date: '',
            status: 'All',
            is_paid: '',
        });
        setStartDate(undefined);
        setEndDate(undefined);
        router.get('/DTR', {}, { preserveState: true });
    };

    const handleMarkAsPaid = () => {
        if (selectedRecords.length === 0) {
            toast.error('Please select records to mark as paid');
            return;
        }

        router.post(
            '/DTR/mark-as-paid',
            { dtr_ids: selectedRecords },
            {
                onSuccess: () => {
                    toast.success('Records marked as paid successfully');
                    setSelectedRecords([]);
                },
                onError: () => {
                    toast.error('Failed to mark records as paid');
                },
            },
        );
    };

    const handleStartDateChange = (date?: Date) => {
        setStartDate(date);
        if (date) {
            setData('start_date', format(date, 'yyyy-MM-dd'));
        } else {
            setData('start_date', '');
        }
    };

    const handleEndDateChange = (date?: Date) => {
        setEndDate(date);
        if (date) {
            setData('end_date', format(date, 'yyyy-MM-dd'));
        } else {
            setData('end_date', '');
        }
    };

    // Status color mapping
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present':
                return 'bg-green-100 text-green-800';
            case 'Absent':
                return 'bg-red-100 text-red-800';
            case 'Late':
                return 'bg-yellow-100 text-yellow-800';
            case 'Half Day':
                return 'bg-orange-100 text-orange-800';
            case 'On Leave':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="DTR Management" />
            <Toaster />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Daily Time Record Management</h1>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href="/DTR/create">+ Add New Record</Link>
                    </Button>
                </div>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Filter DTR records by employee, date, status, and payment status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                            <Input
                                placeholder="Search by employee name, position, or status..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
                        {/* Employee Filter */}
                        <div>
                            <label htmlFor="employee_id" className="mb-1 block text-sm font-medium">
                                Employee
                            </label>
                            <Select value={data.employee_id} onValueChange={(value) => setData('employee_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Employees" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-2">
                                        <div className="relative">
                                            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                                            <Input
                                                placeholder="Search employees..."
                                                value={employeeSearch}
                                                onChange={(e) => setEmployeeSearch(e.target.value)}
                                                className="pl-8"
                                                onKeyDown={(e) => {
                                                    // Prevent select from closing on key press
                                                    e.stopPropagation();
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <SelectItem value="all">All Employees</SelectItem>
                                    {filteredEmployees.map((employee) => (
                                        <SelectItem key={employee.id} value={employee.id.toString()}>
                                            <div className="flex flex-col">
                                                <div className="font-medium">
                                                    [{employee.employee_id}] {employee.name}
                                                </div>
                                                <div className="text-muted-foreground text-xs">{employee.position}</div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Start Date Filter */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">Start Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn('w-full justify-start text-left font-normal', !startDate && 'text-muted-foreground')}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, 'PPP') : <span>Start Date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={startDate} onSelect={handleStartDateChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* End Date Filter */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">End Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn('w-full justify-start text-left font-normal', !endDate && 'text-muted-foreground')}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, 'PPP') : <span>End Date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={endDate} onSelect={handleEndDateChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label htmlFor="status" className="mb-1 block text-sm font-medium">
                                Status
                            </label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-2">
                                        <div className="relative">
                                            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                                            <Input
                                                placeholder="Search statuses..."
                                                value={statusSearch}
                                                onChange={(e) => setStatusSearch(e.target.value)}
                                                className="pl-8"
                                                onKeyDown={(e) => {
                                                    // Prevent select from closing on key press
                                                    e.stopPropagation();
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {filteredStatuses.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Payment Status Filter */}
                        <div>
                            <label htmlFor="is_paid" className="mb-1 block text-sm font-medium">
                                Payment Status
                            </label>
                            <Select value={data.is_paid} onValueChange={(value) => setData('is_paid', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Records" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Records</SelectItem>
                                    <SelectItem value="true">Paid</SelectItem>
                                    <SelectItem value="false">Unpaid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleResetFilters}>
                        Reset Filters
                    </Button>
                    <Button onClick={handleFilter}>Apply Filters</Button>
                </CardFooter>
            </Card>

            {selectedRecords.length > 0 && (
                <div className="bg-muted mb-4 flex items-center justify-between rounded-md p-4">
                    <div>
                        <span className="font-medium">{selectedRecords.length} records selected</span>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="default">Mark as Paid</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Mark records as paid?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will mark {selectedRecords.length} DTR records as paid. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleMarkAsPaid}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>DTR Records</CardTitle>
                    <CardDescription>
                        Showing {filteredRecords.length} of {dtrRecords.total} records
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px]">
                                    <Checkbox
                                        checked={selectedRecords.length === dtrRecords.data.length && dtrRecords.data.length > 0}
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead>Employee</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Time In</TableHead>
                                <TableHead>Time Out</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Hours</TableHead>
                                <TableHead>Overtime</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRecords.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-muted-foreground py-8 text-center">
                                        No DTR records found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRecords.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedRecords.includes(record.id)}
                                                onCheckedChange={() => handleSelectRecord(record.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{record.employee.user.name}</div>
                                            <div className="text-muted-foreground text-xs">{record.employee.position}</div>
                                        </TableCell>
                                        <TableCell>{format(new Date(record.date), 'MMM d, yyyy')}</TableCell>
                                        <TableCell>
                                            {record.time_in
                                                ? (() => {
                                                      try {
                                                          const date = new Date(record.time_in);
                                                          // Add the local timezone offset to correctly display the time
                                                          date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
                                                          return format(date, 'h:mm a');
                                                      } catch (e) {
                                                          console.error('Error formatting time_in:', e, record.time_in);
                                                          return record.time_in.substring(11, 19);
                                                      }
                                                  })()
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {record.time_out
                                                ? (() => {
                                                      try {
                                                          const date = new Date(record.time_out);
                                                          // Add the local timezone offset to correctly display the time
                                                          date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
                                                          return format(date, 'h:mm a');
                                                      } catch (e) {
                                                          console.error('Error formatting time_out:', e, record.time_out);
                                                          return record.time_out.substring(11, 19);
                                                      }
                                                  })()
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                                        </TableCell>
                                        <TableCell>{record.hours_worked}</TableCell>
                                        <TableCell>{record.overtime_hours}</TableCell>
                                        <TableCell>
                                            <Badge variant={record.is_paid ? 'outline' : 'secondary'}>{record.is_paid ? 'Paid' : 'Unpaid'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/DTR/${record.id}`}>View</Link>
                                                </Button>
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/DTR/${record.id}/edit`}>Edit</Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    {dtrRecords.last_page > 1 && (
                        <Pagination className="mx-auto">
                            <PaginationContent>
                                {dtrRecords.current_page > 1 && (
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={`/DTR?page=${dtrRecords.current_page - 1}${
                                                data.employee_id ? `&employee_id=${data.employee_id}` : ''
                                            }${data.start_date ? `&start_date=${data.start_date}` : ''}${
                                                data.end_date ? `&end_date=${data.end_date}` : ''
                                            }${data.status && data.status !== 'All' ? `&status=${data.status}` : ''}${
                                                data.is_paid ? `&is_paid=${data.is_paid}` : ''
                                            }`}
                                        />
                                    </PaginationItem>
                                )}

                                {dtrRecords.links.slice(1, -1).map((link, i) => (
                                    <PaginationItem key={i}>
                                        {link.url ? (
                                            <PaginationLink href={link.url} isActive={link.active}>
                                                {link.label}
                                            </PaginationLink>
                                        ) : (
                                            <PaginationEllipsis />
                                        )}
                                    </PaginationItem>
                                ))}

                                {dtrRecords.current_page < dtrRecords.last_page && (
                                    <PaginationItem>
                                        <PaginationNext
                                            href={`/DTR?page=${dtrRecords.current_page + 1}${
                                                data.employee_id ? `&employee_id=${data.employee_id}` : ''
                                            }${data.start_date ? `&start_date=${data.start_date}` : ''}${
                                                data.end_date ? `&end_date=${data.end_date}` : ''
                                            }${data.status && data.status !== 'All' ? `&status=${data.status}` : ''}${
                                                data.is_paid ? `&is_paid=${data.is_paid}` : ''
                                            }`}
                                        />
                                    </PaginationItem>
                                )}
                            </PaginationContent>
                        </Pagination>
                    )}
                </CardFooter>
            </Card>
        </AppLayout>
    );
};

export default DTRPage;
