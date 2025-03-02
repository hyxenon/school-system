'use client';
import { ChevronDown, ChevronUp, ChevronsUpDown, Eye, Pencil, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import type { Employee } from '@/types';

interface EmployeeTableProps {
    employees: Employee[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [positionFilter, setPositionFilter] = useState<string | null>(null);
    const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Updated default value

    // Sorting state
    const [sortColumn, setSortColumn] = useState<keyof Employee | 'name' | 'department'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Get unique departments and positions for filters
    const departments = Array.from(new Map(employees.filter((emp) => emp.department).map((emp) => [emp.department.id, emp.department])).values());
    const positions = Array.from(new Set(employees.map((emp) => emp.position)));

    // Filter employees based on search and filters
    const filteredEmployees = employees.filter((employee) => {
        const matchesSearch = employee.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchesPosition = !positionFilter || positionFilter === 'All' || employee.position === positionFilter;
        const matchesDepartment = !departmentFilter || departmentFilter === 'All' || employee.department?.name === departmentFilter;
        const matchesStatus =
            !statusFilter ||
            statusFilter === 'All' ||
            (statusFilter === 'active' && employee.isActive) ||
            (statusFilter === 'inactive' && !employee.isActive);

        return matchesSearch && matchesPosition && matchesDepartment && matchesStatus;
    });

    // Sort employees
    const sortedEmployees = [...filteredEmployees].sort((a, b) => {
        if (sortColumn === 'isActive') {
            // Handle boolean sorting
            return sortDirection === 'asc' ? Number(a[sortColumn]) - Number(b[sortColumn]) : Number(b[sortColumn]) - Number(a[sortColumn]);
        } else if (sortColumn === 'name') {
            // Handle nested user.name property
            const aValue = a.user?.name?.toLowerCase() || '';
            const bValue = b.user?.name?.toLowerCase() || '';

            return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else if (sortColumn === 'department') {
            // Handle nested department.name property
            const aValue = a.department?.name?.toLowerCase() || '';
            const bValue = b.department?.name?.toLowerCase() || '';

            return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else {
            // Handle other string properties
            const aValue = String(a[sortColumn] || '').toLowerCase();
            const bValue = String(b[sortColumn] || '').toLowerCase();

            return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
    });

    // Calculate pagination
    const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, sortedEmployees.length);
    const currentEmployees = sortedEmployees.slice(startIndex, endIndex);

    // Handle sort toggle
    const handleSort = (column: keyof Employee | 'name' | 'department') => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column as keyof Employee);
            setSortDirection('asc');
        }
    };

    // Get sort icon for column
    const getSortIcon = (column: keyof Employee) => {
        if (sortColumn !== column) {
            return <ChevronsUpDown className="ml-1 h-4 w-4" />;
        }
        return sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />;
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:w-72">
                    <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                    <Input placeholder="Search employees..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Select onValueChange={(value) => setPositionFilter(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Position" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Positions</SelectItem>
                            {positions.map((position) => (
                                <SelectItem key={position} value={position}>
                                    {position}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select onValueChange={(value) => setDepartmentFilter(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Departments</SelectItem>
                            {departments.map((department) => (
                                <SelectItem key={department.id} value={department.name}>
                                    {department.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select onValueChange={(value) => setStatusFilter(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[250px] cursor-pointer" onClick={() => handleSort('name')}>
                                <div className="flex items-center">
                                    Name
                                    {getSortIcon('name' as keyof Employee)}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('position')}>
                                <div className="flex items-center">
                                    Position
                                    {getSortIcon('position')}
                                </div>
                            </TableHead>
                            <TableHead className="hidden cursor-pointer md:table-cell" onClick={() => handleSort('department')}>
                                <div className="flex items-center">
                                    Department
                                    {getSortIcon('department' as keyof Employee)}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('isActive')}>
                                <div className="flex items-center">
                                    Status
                                    {getSortIcon('isActive')}
                                </div>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentEmployees.length > 0 ? (
                            currentEmployees.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-medium">{employee.user?.name || 'N/A'}</TableCell>
                                    <TableCell className="capitalize">{employee.position}</TableCell>
                                    <TableCell className="hidden max-w-[200px] truncate md:table-cell" title={employee.department?.name || 'N/A'}>
                                        {employee.department?.name || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                                            {employee.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="icon" onClick={() => setViewEmployee(employee)} title="View">
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">View</span>
                                            </Button>
                                            <Button variant="outline" size="icon" title="Edit">
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Edit</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                disabled={!employee.isActive}
                                                title={employee.isActive ? 'Delete' : 'Cannot delete inactive employee'}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No employees found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
                <div className="text-muted-foreground text-sm">
                    Showing {startIndex + 1} to {endIndex} of {filteredEmployees.length} employees
                </div>
                <div className="flex items-center space-x-2">
                    <Select
                        value={String(itemsPerPage)}
                        onValueChange={(value) => {
                            setItemsPerPage(Number(value));
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={itemsPerPage} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <div className="flex items-center">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                // Show pages around current page
                                let pageNum = i + 1;
                                if (totalPages > 5) {
                                    if (currentPage > 3) {
                                        pageNum = currentPage - 3 + i;
                                    }
                                    if (pageNum > totalPages - 4 && currentPage > totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    }
                                }

                                if (pageNum <= totalPages) {
                                    return (
                                        <Button
                                            key={i}
                                            variant={currentPage === pageNum ? 'default' : 'outline'}
                                            size="sm"
                                            className="h-8 w-8"
                                            onClick={() => setCurrentPage(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                }
                                return null;
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* View Employee Dialog */}
            <Dialog open={!!viewEmployee} onOpenChange={(open) => !open && setViewEmployee(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Employee Details</DialogTitle>
                        <DialogDescription>Detailed information about the employee.</DialogDescription>
                    </DialogHeader>
                    {viewEmployee && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-sm font-medium">Name:</span>
                                <span className="col-span-3">{viewEmployee.user?.name || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-sm font-medium">Position:</span>
                                <span className="col-span-3">{viewEmployee.position}</span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-sm font-medium">Department:</span>
                                <span className="col-span-3">{viewEmployee.department?.name || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="text-sm font-medium">Status:</span>
                                <span className="col-span-3">
                                    <Badge variant={viewEmployee.isActive ? 'default' : 'secondary'}>
                                        {viewEmployee.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
