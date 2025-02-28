import { EmployeeTable } from '@/components/employee-table';
import { StatCard } from '@/components/stat-card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Building2, GraduationCap, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employee',
        href: '/employee',
    },
];

function Employee({ employees }: { employees: any }) {
    const stats = {
        totalEmployees: 248,
        totalProfessors: 64,
        totalDepartments: 12,
    };
    console.log(employees);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <StatCard
                        title="Total Employees"
                        value={stats.totalEmployees}
                        icon={Users}
                        description="All staff members"
                        trend={{ value: 12, isPositive: true }}
                    />
                    <StatCard
                        title="Total Professors"
                        value={stats.totalProfessors}
                        icon={GraduationCap}
                        description="Academic teaching staff"
                        trend={{ value: 8, isPositive: true }}
                    />
                    <StatCard title="Total Departments" value={stats.totalDepartments} icon={Building2} description="Active departments" />
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 rounded-xl border p-4 md:min-h-min">
                    <EmployeeTable />
                </div>
            </div>
        </AppLayout>
    );
}

export default Employee;
