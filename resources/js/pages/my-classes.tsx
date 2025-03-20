import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Classes',
        href: '/my-classes',
    },
];

function MyClassesPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Classes" />
        </AppLayout>
    );
}

export default MyClassesPage;
