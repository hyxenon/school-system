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
    [key: string]: unknown; // This allows for additional properties...
}

export interface Employee {
    id: string;
    user_id: User;
    department_id: Department;
    created_at: string;
    updated_at: string;
    position: 'registrar' | 'treasurer' | 'professor';
}

export interface Department {
    id: string;
    department_code: string;
    name: string;
    created_at: string;
    updated_at: string;
}
