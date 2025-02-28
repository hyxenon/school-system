import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Department',
        href: '/Department',
    },
];
function Department() {
    return (
        <AppLayout>
            <Head title="Department" />
        </AppLayout>
    );
}

export default Department;
