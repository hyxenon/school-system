import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { SharedData } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs = [] }: AppLayoutProps) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="flex min-h-screen">
            <Sidebar user={auth.user} /> {/* Pass auth.user here */}
            <div className="flex-1">
                <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                    {children}
                </AppLayoutTemplate>
            </div>
        </div>
    );
}
