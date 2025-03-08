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
    position: 'registrar' | 'treasurer' | 'professor' | 'program head';
    isActive: boolean;
}

export interface Enrollment {
    id: number;
    student: Student;
    course: Course;
    department: Department;
    academic_year: string;
    semester: 1 | 2 | 3;
    enrollment_date: string;
    status: 'Enrolled' | 'Pending' | 'Cancelled';
    created_at: string;
    updated_at: string;
    payment_status: 'Pending' | 'Completed';
}

export interface Student {
    id: string;
    user: User;
    course: Course;
    year_level: number;
    block: number;
    status: 'Regular' | 'Irregular';
    enrollment_status: 'Enrolled' | 'Not Enrolled' | 'Graduated' | 'Dropped Out';
    created_at: string;
    updated_at: string;
    grades?: Grade[];
    assignments?: AssignmentSubmission[];
    payments?: Payment[];
}

export interface Grade {
    id: number;
    student: Student;
    subject: Subject;
    prelims: number;
    midterms: number;
    finals: number;
    overall_grade?: number;
    created_at: string;
    updated_at: string;
}

export interface Payment {
    id: number;
    student: Student;
    amount: number;
    payment_method: 'Cash' | 'Bank Transfer' | 'Online';
    payment_date: string;
    status: 'Pending' | 'Completed' | 'Failed';
    created_at: string;
    updated_at: string;
}

export interface Assignment {
    id: number;
    subject: Subject;
    title: string;
    description: string;
    due_date: string;
    year_level: number;
    block: number;
    student_submissions: AssignmentSubmission[];
    assessment_type: 'prelims' | 'midterms' | 'finals';
    created_by: Employee;
    created_at: string;
    updated_at: string;
}

export interface AssignmentSubmission {
    id: number;
    assignment: Assignment;
    student: Student;
    submission_date: string;
    grade?: number;
    feedback?: string;
    created_at: string;
    updated_at: string;
}

export interface Department {
    id: number;
    department_code: string;
    name: string;
    programHead?: Employee;
    courses: Course[];
    created_at: string;
    updated_at: string;
}

export interface Course {
    id: number;
    name: string;
    description?: string;
    department_id: number;
    department: Department;
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

export interface Subject {
    id: number;
    code: string;
    name: string;
    course?: Course;
    credits: number;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface Curriculum {
    id: number;
    course: Course;
    year_level: number;
    semester: number;
    subjects: Subject[];
    created_at: string;
    updated_at: string;
}

export interface Schedule {
    id: number;
    subject: Subject;
    room: Room;
    professor: Employee;
    students: Student[];
    year_level: number;
    block: string;
    academic_year: string;
    semester: 1 | 2 | 3;
    schedule_type: 'Lecture' | 'Laboratory' | 'Hybrid';
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    start_time: string;
    end_time: string;
    max_students: number;
    status: 'Active' | 'Inactive' | 'Cancelled';
    created_at: string;
    updated_at: string;
}

export interface Announcements {
    id: number;
    title: string;
    content: string;
    type: 'general' | 'academic' | 'administrative' | 'emergency';
    user_id: User;
    department_id?: Department;
    starts_at?: string;
    ends_at?: string;
    is_pinned: boolean;
    visibility: 'all' | 'students' | 'teachers' | 'staff';
    created_at: string;
    updated_at: string;
}
