import { Toaster } from '@/components/ui/sonner';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

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

const AttendanceReportPage = () => {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance Report" />
            <Toaster />
        </AppLayout>
    );
};

export default AttendanceReportPage;
