import { EmployeeTable } from '@/components/employee-table';
import { StatCard } from '@/components/stat-card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Employee } from '@/types';
import { Head } from '@inertiajs/react';
import { Building2, GraduationCap, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: '/employees',
    },
];

interface EmployeePageProps {
    employees: Employee[];
    totalEmployees: number;
}

function EmployeePage({ employees, totalEmployees }: EmployeePageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <StatCard
                        title="Total Employees"
                        value={totalEmployees}
                        icon={Users}
                        description="All staff members"
                        trend={{ value: 12, isPositive: true }}
                    />
                    <StatCard
                        title="Total Professors"
                        value={totalEmployees}
                        icon={GraduationCap}
                        description="Academic teaching staff"
                        trend={{ value: 8, isPositive: true }}
                    />
                    <StatCard title="Total Departments" value={totalEmployees} icon={Building2} description="Active departments" />
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 rounded-xl border p-4 md:min-h-min">
                    <EmployeeTable employees={employees} />
                </div>
            </div>
        </AppLayout>
    );
}

export default EmployeePage;
