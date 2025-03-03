import { AddEmployeeDialog } from '@/components/employee-add-dialog';
import { EmployeeTable } from '@/components/employee-table';
import { StatCard } from '@/components/stat-card';

import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Department, Employee } from '@/types';
import { Head } from '@inertiajs/react';
import { Building2, GraduationCap, Users } from 'lucide-react';
import { Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employees',
        href: '/employees',
    },
];

interface EmployeePageProps {
    employees: Employee[];
    totalEmployees: number;
    departments: Department[];
}

function EmployeePage({ employees, totalEmployees, departments }: EmployeePageProps) {
    const totalProfessor = employees.filter((employee) => employee.position === 'professor');
    const totalRegistrar = employees.filter((employee) => employee.position === 'registrar');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee" />
            <Toaster />
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
                        value={totalProfessor.length}
                        icon={GraduationCap}
                        description="Academic teaching staff"
                        trend={{ value: 8, isPositive: true }}
                    />
                    <StatCard title="Total Registrar" value={totalRegistrar.length} icon={Building2} description="Active Registrar" />
                </div>
                <div className="flex justify-end">
                    <AddEmployeeDialog departments={departments} />
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 rounded-xl border p-4 md:min-h-min">
                    <EmployeeTable employees={employees} />
                </div>
            </div>
        </AppLayout>
    );
}

export default EmployeePage;
