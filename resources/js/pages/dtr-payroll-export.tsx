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
        title: 'Payroll Export',
        href: '/DTR-payroll',
    },
];

const DTRPayrollExportPage = () => {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payroll Export" />
            <Toaster />
        </AppLayout>
    );
};

export default DTRPayrollExportPage;
