import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Schedule } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Schedules',
        href: '/my-schedules',
    },
];

interface MySchedulesPageProps {
    schedules: Schedule[];
    type: 'teacher' | 'student';
}

function MySchedulesPage({ schedules, type }: MySchedulesPageProps) {
    console.log(schedules);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Schedules" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4"></div>
        </AppLayout>
    );
}

export default MySchedulesPage;
