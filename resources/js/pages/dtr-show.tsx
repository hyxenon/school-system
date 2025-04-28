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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { ClockIcon, Edit, Trash2 } from 'lucide-react';
import { Toaster } from 'sonner';

type DTR = {
    id: number;
    employee_id: number;
    date: string;
    time_in: string | null;
    time_out: string | null;
    lunch_start: string | null;
    lunch_end: string | null;
    overtime_start: string | null;
    overtime_end: string | null;
    status: string;
    leave_type: string | null;
    remarks: string | null;
    hours_worked: number;
    overtime_hours: number;
    is_paid: boolean;
    pay_period: string;
    created_at: string;
    updated_at: string;
    employee: {
        id: number;
        user: {
            name: string;
            email: string;
        };
        position: string;
        department: {
            name: string;
        } | null;
    } | null;
};

interface DTRShowPageProps {
    dtr: DTR;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'DTR',
        href: '/DTR',
    },
    {
        title: 'View Record',
        href: '/DTR/show',
    },
];

const formatTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return '-';
    try {
        const date = new Date(dateTimeString);
        // Add the local timezone offset to correctly display the time
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        return format(date, 'h:mm a');
    } catch (error) {
        console.error('Error formatting time:', error);
        return '-';
    }
};

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

const DTRShowPage = ({ dtr }: DTRShowPageProps) => {
    const handleDelete = () => {
        router.delete(`/DTR/${dtr.id}`, {
            onSuccess: () => {
                router.visit('/DTR');
            },
        });
    };

    // Safe date parsing function to handle null or undefined dates
    const safeParseISO = (dateString: string | null | undefined) => {
        if (!dateString) return new Date();
        try {
            return parseISO(dateString);
        } catch (error) {
            console.error('Error parsing date:', error);
            return new Date();
        }
    };

    console.log(dtr);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`DTR Record - ${format(safeParseISO(dtr.date), 'MMM d, yyyy')}`} />
            <Toaster />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">DTR Record Details</h1>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/DTR/${dtr.id}/edit`}>
                                <Edit className="mr-1 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-1 h-4 w-4" />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to delete this record?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this attendance record.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Employee Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {dtr.employee ? (
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-sm">Name</span>
                                        <span className="font-semibold">{dtr.employee.user?.name || 'N/A'}</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-sm">Position</span>
                                        <span>{dtr.employee.position || 'N/A'}</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-sm">Department</span>
                                        <span>{dtr.employee.department?.name || 'Not assigned'}</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-sm">Email</span>
                                        <span>{dtr.employee.user?.email || 'N/A'}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-4 text-center">
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="bg-muted rounded-full p-3">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="text-muted-foreground h-6 w-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                                />
                                            </svg>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-muted-foreground text-sm">Employee information is not available for this DTR record</p>
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={`/DTR/${dtr.id}/edit?assign_employee=true`}>Assign Employee</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-sm">Date</span>
                                    <span className="font-semibold">{format(safeParseISO(dtr.date), 'MMMM d, yyyy')}</span>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-sm">Status</span>
                                    <Badge className={getStatusColor(dtr.status)}>{dtr.status}</Badge>
                                </div>

                                {dtr.status === 'On Leave' && (
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-sm">Leave Type</span>
                                        <span>{dtr.leave_type || '-'}</span>
                                    </div>
                                )}

                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-sm">Payment Status</span>
                                    <Badge variant={dtr.is_paid ? 'outline' : 'secondary'}>{dtr.is_paid ? 'Paid' : 'Unpaid'}</Badge>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-sm">Pay Period</span>
                                    <span>{format(safeParseISO(dtr.pay_period), 'MMM d, yyyy')}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Time Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-primary/10 rounded-full p-2">
                                            <ClockIcon className="text-primary h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Time In</p>
                                            <p className="text-2xl font-bold">{formatTime(dtr.time_in)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="bg-primary/10 rounded-full p-2">
                                            <ClockIcon className="text-primary h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Time Out</p>
                                            <p className="text-2xl font-bold">{formatTime(dtr.time_out)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="rounded-full bg-orange-100 p-2">
                                            <ClockIcon className="h-5 w-5 text-orange-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Lunch Start</p>
                                            <p className="text-lg">{formatTime(dtr.lunch_start)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="rounded-full bg-orange-100 p-2">
                                            <ClockIcon className="h-5 w-5 text-orange-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Lunch End</p>
                                            <p className="text-lg">{formatTime(dtr.lunch_end)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="rounded-full bg-blue-100 p-2">
                                            <ClockIcon className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Overtime Start</p>
                                            <p className="text-lg">{formatTime(dtr.overtime_start)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="rounded-full bg-blue-100 p-2">
                                            <ClockIcon className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Overtime End</p>
                                            <p className="text-lg">{formatTime(dtr.overtime_end)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <div className="bg-muted rounded-lg p-4">
                                    <p className="text-muted-foreground text-sm">Regular Hours</p>
                                    <p className="text-2xl font-bold">{dtr.hours_worked} hrs</p>
                                </div>

                                <div className="bg-muted rounded-lg p-4">
                                    <p className="text-muted-foreground text-sm">Overtime Hours</p>
                                    <p className="text-2xl font-bold">{dtr.overtime_hours} hrs</p>
                                </div>

                                <div className="bg-muted rounded-lg p-4">
                                    <p className="text-muted-foreground text-sm">Total Hours</p>
                                    <p className="text-2xl font-bold">{dtr.hours_worked + dtr.overtime_hours} hrs</p>
                                </div>

                                <div className="bg-muted rounded-lg p-4">
                                    <p className="text-muted-foreground text-sm">Record Created</p>
                                    <p className="text-sm font-medium">{format(safeParseISO(dtr.created_at), 'MMM d, yyyy')}</p>
                                    <p className="text-muted-foreground text-xs">
                                        Last updated: {format(safeParseISO(dtr.updated_at), 'MMM d, yyyy h:mm a')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {dtr.remarks && (
                    <div className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Remarks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{dtr.remarks}</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <Button onClick={() => router.visit('/DTR')} variant="outline">
                        Back to DTR List
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
};

export default DTRShowPage;
