'use client';

import type React from 'react';

import { format, isAfter, isBefore, isToday } from 'date-fns';
import { AlertCircle, Bell, Calendar, CheckCircle2, ChevronDown, ChevronUp, Clock, Eye, ListFilter, Pin, Search, SortAsc, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Announcements } from '@/types';

interface AnnouncementsListProps {
    announcements: Announcements[];
}

type SortOrder = 'newest' | 'oldest' | 'pinned';

export function AnnouncementsList({ announcements }: AnnouncementsListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('all');
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [sortOrder, setSortOrder] = useState<SortOrder>('pinned');
    const [showExpired, setShowExpired] = useState(true);
    const [readAnnouncements, setReadAnnouncements] = useState<number[]>([]);
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    // Get unique departments for filter dropdown
    const departments = useMemo(() => {
        const deptSet = new Set<string>();
        announcements.forEach((announcement) => {
            if (announcement.department?.department_code) {
                deptSet.add(announcement.department.department_code);
            }
        });
        return Array.from(deptSet);
    }, [announcements]);

    // Get unique types for filter dropdown
    const types = useMemo(() => {
        const typeSet = new Set<string>();
        announcements.forEach((announcement) => {
            if (announcement.type) {
                typeSet.add(announcement.type);
            }
        });
        return Array.from(typeSet);
    }, [announcements]);

    // Load read announcements from localStorage
    useEffect(() => {
        const savedReadAnnouncements = localStorage.getItem('readAnnouncements');
        if (savedReadAnnouncements) {
            setReadAnnouncements(JSON.parse(savedReadAnnouncements));
        }
    }, []);

    // Save read announcements to localStorage
    const markAsRead = (id: number) => {
        const newReadAnnouncements = [...readAnnouncements, id];
        setReadAnnouncements(newReadAnnouncements);
        localStorage.setItem('readAnnouncements', JSON.stringify(newReadAnnouncements));
    };

    // Check if an announcement is expired
    const isExpired = (announcement: Announcements) => {
        if (!announcement.ends_at) return false;
        return isBefore(new Date(announcement.ends_at), new Date());
    };

    // Check if an announcement is active (started)
    const isActive = (announcement: Announcements) => {
        if (!announcement.starts_at) return true;
        return isAfter(new Date(), new Date(announcement.starts_at));
    };

    // Check if an announcement is read
    const isRead = (id: number) => {
        return readAnnouncements.includes(id);
    };

    // Filter announcements based on search, department, type, tab, and read status
    const filteredAnnouncements = useMemo(() => {
        return announcements.filter((announcement) => {
            // Search filter
            const matchesSearch =
                searchQuery === '' ||
                announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                announcement.content.toLowerCase().includes(searchQuery.toLowerCase());

            // Department filter
            const matchesDepartment =
                departmentFilter === null || departmentFilter === 'all' || announcement.department?.department_code === departmentFilter;

            // Type filter
            const matchesType = typeFilter === null || typeFilter === 'all' || announcement.type === typeFilter;

            // Tab filter
            const matchesTab =
                activeTab === 'all' ||
                (activeTab === 'pinned' && announcement.is_pinned === 1) ||
                (activeTab === 'department' && announcement.department !== null) ||
                (activeTab === 'today' &&
                    ((announcement.starts_at && isToday(new Date(announcement.starts_at))) ||
                        (announcement.ends_at && isToday(new Date(announcement.ends_at)))));

            // Expired filter
            const matchesExpired = showExpired || !isExpired(announcement);

            // Active filter
            const matchesActive = isActive(announcement);

            // Read status filter
            const matchesReadStatus = !showUnreadOnly || !isRead(announcement.id);

            return matchesSearch && matchesDepartment && matchesType && matchesTab && matchesExpired && matchesActive && matchesReadStatus;
        });
    }, [announcements, searchQuery, departmentFilter, typeFilter, activeTab, showExpired, showUnreadOnly, readAnnouncements]);

    // Sort announcements
    const sortedAnnouncements = useMemo(() => {
        return [...filteredAnnouncements].sort((a, b) => {
            if (sortOrder === 'pinned') {
                // First sort by pinned status
                if (a.is_pinned && !b.is_pinned) return -1;
                if (!a.is_pinned && b.is_pinned) return 1;

                // Then sort by date (newest first)
                const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
                const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
                return dateB.getTime() - dateA.getTime();
            } else if (sortOrder === 'newest') {
                const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
                const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
                return dateB.getTime() - dateA.getTime();
            } else {
                // oldest
                const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
                const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
                return dateA.getTime() - dateB.getTime();
            }
        });
    }, [filteredAnnouncements, sortOrder]);

    // Paginate announcements
    const paginatedAnnouncements = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedAnnouncements.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedAnnouncements, currentPage, itemsPerPage]);

    // Calculate total pages
    const totalPages = Math.ceil(sortedAnnouncements.length / itemsPerPage);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, departmentFilter, typeFilter, activeTab, sortOrder, showExpired, showUnreadOnly, itemsPerPage]);

    // Get status badge for an announcement
    const getStatusBadge = (announcement: Announcements) => {
        if (isExpired(announcement)) {
            return (
                <Badge variant="outline" className="bg-muted text-muted-foreground px-1.5 py-0 text-xs">
                    <Clock className="mr-1 h-3 w-3" />
                    Expired
                </Badge>
            );
        }

        if (!isActive(announcement)) {
            return (
                <Badge variant="outline" className="bg-yellow-100 px-1.5 py-0 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    <Clock className="mr-1 h-3 w-3" />
                    Upcoming
                </Badge>
            );
        }

        if (announcement.is_pinned === 1) {
            return (
                <Badge variant="outline" className="bg-primary/10 text-primary px-1.5 py-0 text-xs">
                    <Pin className="mr-1 h-3 w-3" />
                    Pinned
                </Badge>
            );
        }

        return (
            <Badge variant="outline" className="bg-green-100 px-1.5 py-0 text-xs text-green-800 dark:bg-green-900 dark:text-green-300">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Active
            </Badge>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                    <Bell className="text-primary h-5 w-5" />
                    <h2 className="text-2xl font-bold">Announcements</h2>
                    <Badge variant="outline" className="ml-2">
                        {sortedAnnouncements.length} Total
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="ml-2">
                                <SortAsc className="mr-2 h-4 w-4" />
                                Sort
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem checked={sortOrder === 'pinned'} onCheckedChange={() => setSortOrder('pinned')}>
                                Pinned First
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked={sortOrder === 'newest'} onCheckedChange={() => setSortOrder('newest')}>
                                Newest First
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked={sortOrder === 'oldest'} onCheckedChange={() => setSortOrder('oldest')}>
                                Oldest First
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <ListFilter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <div className="p-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="show-expired" className="text-sm">
                                        Show Expired
                                    </Label>
                                    <Switch id="show-expired" checked={showExpired} onCheckedChange={setShowExpired} />
                                </div>
                            </div>

                            <div className="p-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="unread-only" className="text-sm">
                                        Unread Only
                                    </Label>
                                    <Switch id="unread-only" checked={showUnreadOnly} onCheckedChange={setShowUnreadOnly} />
                                </div>
                            </div>

                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs">Items Per Page</DropdownMenuLabel>
                            <div className="grid grid-cols-3 gap-1 p-2">
                                {[5, 10, 15].map((num) => (
                                    <Button
                                        key={num}
                                        variant={itemsPerPage === num ? 'default' : 'outline'}
                                        size="sm"
                                        className="h-8"
                                        onClick={() => setItemsPerPage(num)}
                                    >
                                        {num}
                                    </Button>
                                ))}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="pinned">Pinned</TabsTrigger>
                        <TabsTrigger value="department">Department</TabsTrigger>
                        <TabsTrigger value="today">Today</TabsTrigger>
                    </TabsList>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                            <Input
                                type="search"
                                placeholder="Search announcements..."
                                className="w-full pl-8 sm:w-[200px] md:w-[250px]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => setSearchQuery('')}>
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Clear search</span>
                                </Button>
                            )}
                        </div>

                        {types.length > 0 && (
                            <Select value={typeFilter || 'all'} onValueChange={(value) => setTypeFilter(value === 'all' ? null : value)}>
                                <SelectTrigger className="w-full sm:w-[130px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {types.map((type) => (
                                        <SelectItem key={type} value={type} className="capitalize">
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {departments.length > 0 && (
                            <Select value={departmentFilter || 'all'} onValueChange={(value) => setDepartmentFilter(value === 'all' ? null : value)}>
                                <SelectTrigger className="w-full sm:w-[130px]">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Depts</SelectItem>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>

                <TabsContent value="all" className="mt-0">
                    {renderAnnouncementsList(paginatedAnnouncements)}
                </TabsContent>

                <TabsContent value="pinned" className="mt-0">
                    {renderAnnouncementsList(paginatedAnnouncements)}
                </TabsContent>

                <TabsContent value="department" className="mt-0">
                    {renderAnnouncementsList(paginatedAnnouncements)}
                </TabsContent>

                <TabsContent value="today" className="mt-0">
                    {renderAnnouncementsList(paginatedAnnouncements)}
                </TabsContent>
            </Tabs>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-muted-foreground flex items-center text-sm">
                        Showing <span className="mx-1 font-medium">{Math.min(sortedAnnouncements.length, (currentPage - 1) * itemsPerPage + 1)}</span>
                        to <span className="mx-1 font-medium">{Math.min(sortedAnnouncements.length, currentPage * itemsPerPage)}</span>
                        of <span className="mx-1 font-medium">{sortedAnnouncements.length}</span> announcements
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                            First
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm font-medium">
                            {currentPage} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                            Last
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );

    function renderAnnouncementsList(announcements: Announcements[]) {
        if (announcements.length === 0) {
            return (
                <Card>
                    <CardContent className="text-muted-foreground pt-6 pb-6 text-center">
                        <AlertCircle className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
                        <p className="text-lg font-medium">No announcements available</p>
                        <p className="text-sm">Try adjusting your filters or search criteria</p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {announcements.map((announcement) => (
                    <AnnouncementCard
                        key={announcement.id}
                        announcement={announcement}
                        isRead={isRead(announcement.id)}
                        onMarkAsRead={() => markAsRead(announcement.id)}
                        statusBadge={getStatusBadge(announcement)}
                    />
                ))}
            </div>
        );
    }
}

interface AnnouncementCardProps {
    announcement: Announcements;
    isRead: boolean;
    onMarkAsRead: () => void;
    statusBadge: React.ReactNode;
}

function AnnouncementCard({ announcement, isRead, onMarkAsRead, statusBadge }: AnnouncementCardProps) {
    const [isOpen, setIsOpen] = useState(announcement.is_pinned === 1);

    // Format dates if they exist
    const formattedStartDate = announcement.starts_at ? format(new Date(announcement.starts_at), 'MMM d, yyyy') : null;

    const formattedEndDate = announcement.ends_at ? format(new Date(announcement.ends_at), 'MMM d, yyyy') : null;

    const formattedCreatedDate = announcement.created_at ? format(new Date(announcement.created_at), 'MMM d, yyyy') : null;

    // Handle opening the card
    const handleOpen = () => {
        if (!isOpen && !isRead) {
            onMarkAsRead();
        }
        setIsOpen(!isOpen);
    };

    return (
        <Card
            className={` ${announcement.is_pinned ? 'border-primary/50 shadow-sm' : ''} ${isRead ? 'bg-muted/30' : 'bg-background'} flex h-full flex-col transition-all hover:shadow-sm`}
        >
            <CardHeader className="p-3 pb-1">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="mb-1 flex flex-wrap gap-1.5">
                            {statusBadge}

                            {announcement.type && (
                                <Badge variant="outline" className="px-1.5 py-0 text-xs capitalize">
                                    {announcement.type}
                                </Badge>
                            )}

                            {announcement.department && (
                                <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                                    {announcement.department.department_code}
                                </Badge>
                            )}

                            {!isRead && <Badge className="bg-blue-500 px-1.5 py-0 text-xs text-white">New</Badge>}
                        </div>

                        <CardTitle className="flex items-center gap-2 text-sm">{announcement.title}</CardTitle>

                        <CardDescription className="flex flex-wrap gap-2 text-xs">
                            {formattedStartDate && formattedEndDate && (
                                <span className="text-muted-foreground flex items-center text-xs">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {formattedStartDate} - {formattedEndDate}
                                </span>
                            )}
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-1">
                        {!isRead && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 p-0 text-blue-500"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onMarkAsRead();
                                            }}
                                        >
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">Mark as read</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Mark as read</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}

                        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 p-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpen();
                                    }}
                                >
                                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    <span className="sr-only">Toggle content</span>
                                </Button>
                            </CollapsibleTrigger>
                        </Collapsible>
                    </div>
                </div>
            </CardHeader>

            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleContent className="flex flex-1 flex-col">
                    <CardContent className="flex-1 px-3 py-2">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="text-xs">{announcement.content}</p>
                        </div>
                    </CardContent>

                    <CardFooter className="text-muted-foreground flex justify-between px-3 pt-0 pb-3 text-xs">
                        <div>{announcement.visibility && <span>Visibility: {announcement.visibility}</span>}</div>
                        {formattedCreatedDate && <div>Posted on {formattedCreatedDate}</div>}
                    </CardFooter>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
