import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Add Student',
        href: '/add-students',
    },
];

function AddStudentPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Student" />
            <Toaster />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4"></div>
        </AppLayout>
    );
}

export default AddStudentPage;
