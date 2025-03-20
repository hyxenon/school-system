'use client';

import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

interface ClassDetailsPageProps {
    class: {
        id: number;
        subject: {
            name: string;
            code: string;
        };
    };
}

function ClassDetailsPage({ class: classDetails }: ClassDetailsPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'My Classes',
            href: '/my-classes',
        },
        {
            title: `Class ${classDetails.subject.code}`,
            href: `/classes/${classDetails.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${classDetails.subject.code}`} />
            <div className="p-4">
                <h1 className="text-2xl font-bold">
                    Class {classDetails.id}: {classDetails.subject.name}
                </h1>
            </div>
        </AppLayout>
    );
}

export default ClassDetailsPage;
