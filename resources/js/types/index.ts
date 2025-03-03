import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    employee?: Employee;
    [key: string]: unknown;
}

export interface Employee {
    id: string;
    user: User;
    department: Department;
    created_at: string;
    updated_at: string;
    position: 'registrar' | 'treasurer' | 'professor';
    isActive: boolean;
}

export interface Department {
    id: number;
    department_code: string;
    name: string;
    program_head_id?: string;
    courses: Course[];
    created_at: string;
    updated_at: string;
}

export interface Course {
    id: number;
    name: string;
    description?: string;
    course_code: string;
    created_at: string;
    updated_at: string;
}

export interface Building {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface Room {
    id: number;
    name: string;
    building: Building;
    created_at: string;
    updated_at: string;
}
