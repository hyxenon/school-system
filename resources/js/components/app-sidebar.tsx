import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookA,
    BookOpen,
    BriefcaseBusiness,
    BuildingIcon,
    CalendarIcon,
    CircleDollarSign,
    CurlyBracesIcon,
    LayoutGrid,
    Mic,
    Notebook,
    UserPlus,
} from 'lucide-react';
import AppLogo from './app-logo';

const roleBasedNavItems: Record<string, NavItem[]> = {
    registrar: [
        {
            title: 'Employees',
            url: '/employees',
            icon: BriefcaseBusiness,
        },
        {
            title: 'Enrollment',
            url: '/enrollment',
            icon: UserPlus,
        },

        {
            title: 'Department',
            url: '/departments',
            icon: BookOpen,
        },
        {
            title: 'Buildings',
            url: '/buildings',
            icon: BuildingIcon,
        },
        {
            title: 'Subjects',
            url: '/subjects',
            icon: BookA,
        },
        {
            title: 'Curriculum',
            url: '/curriculum',
            icon: CurlyBracesIcon,
        },

        {
            title: 'Announcements',
            url: '/announcements',
            icon: Mic,
        },
    ],
    professor: [
        {
            title: 'My Schedules',
            url: '/my-schedules',
            icon: CalendarIcon, // Change to appropriate icon
        },
        {
            title: 'My Classes',
            url: '/my-classes',
            icon: Notebook, // Change to appropriate icon
        },
    ],
    student: [
        {
            title: 'My Schedules',
            url: '/my-schedules',
            icon: CalendarIcon, // Change to appropriate icon
        },
        {
            title: 'My Classes',
            url: '/my-classes',
            icon: Notebook, // Change to appropriate icon
        },
    ],
    'program head': [
        {
            title: 'Add Student',
            url: '/add-students',
            icon: BriefcaseBusiness, // Change to appropriate icon
        },
        {
            title: 'Schedules',
            url: '/schedules',
            icon: CalendarIcon,
        },
    ],
    treasurer: [
        {
            title: 'Payments',
            url: '/payments',
            icon: CircleDollarSign, // Change to appropriate icon
        },
    ],
};

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     url: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     url: 'https://laravel.com/docs/starter-kits',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth.user.employee ? auth.user.employee.position : auth.user.student ? 'student' : '';
    const roleNavItems = roleBasedNavItems[userRole] || [];

    const navItems = [...mainNavItems, ...roleNavItems];

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
