import { Toaster } from '@/components/ui/sonner';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payments',
        href: '/payments',
    },
];

function PaymentPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payments" />
            <Toaster />
        </AppLayout>
    );
}

export default PaymentPage;
