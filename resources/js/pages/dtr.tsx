import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'DTR',
        href: '/DTR',
    },
];

const DTRPage = () => {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="DTR" />
            <Toaster />
        </AppLayout>
    );
};

export default DTRPage;
