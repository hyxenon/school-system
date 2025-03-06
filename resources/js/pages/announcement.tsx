'use client';

import AppLayout from '@/layouts/app-layout';
import type { Announcements, BreadcrumbItem, Department } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { AlertTriangle, BookOpen, Building, Calendar, Clock, Edit, Info, Pin, PinOff, PlusCircle, Tag, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Toaster, toast } from 'sonner';
import * as z from 'zod';

// shadcn/ui components
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface AnnouncementPageProps {
    announcements: Announcements[];
    departments: Department[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Announcements',
        href: '/announcements',
    },
];

// Form validation schema
const formSchema = z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters' }).max(100, { message: 'Title must be less than 100 characters' }),
    content: z.string().min(10, { message: 'Content must be at least 10 characters' }),
    type: z.enum(['general', 'academic', 'administrative', 'emergency']),
    department_id: z.number().optional().nullable(),
    starts_at: z.string().optional().nullable(),
    ends_at: z.string().optional().nullable(),
    is_pinned: z.boolean().default(false),
    visibility: z.enum(['all', 'students', 'teachers', 'staff']),
});

// Type for our form
type AnnouncementFormValues = z.infer<typeof formSchema>;

function AnnouncementPage({ announcements = [], departments = [] }: AnnouncementPageProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcements | null>(null);
    const [announcementsList, setAnnouncementsList] = useState<Announcements[]>(announcements);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState('all');
    const [isPinnedChecked, setIsPinnedChecked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Setup form with react-hook-form and zod validation
    const form = useForm<AnnouncementFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            content: '',
            type: 'general',
            department_id: undefined,
            starts_at: '',
            ends_at: '',
            is_pinned: false,
            visibility: 'all',
        },
    });

    useEffect(() => {
        setAnnouncementsList(announcements);
    }, [announcements]);

    const openModal = (announcement?: Announcements) => {
        if (announcement) {
            setEditingAnnouncement(announcement);
            form.reset({
                title: announcement.title,
                content: announcement.content,
                type: announcement.type as any,
                department_id: announcement.department_id as number | undefined,
                starts_at: announcement.starts_at || '',
                ends_at: announcement.ends_at || '',
                is_pinned: announcement.is_pinned,
                visibility: announcement.visibility as any,
            });
            setIsPinnedChecked(announcement.is_pinned);
        } else {
            setEditingAnnouncement(null);
            form.reset({
                title: '',
                content: '',
                type: 'general',
                department_id: undefined,
                starts_at: '',
                ends_at: '',
                is_pinned: false,
                visibility: 'all',
            });
            setIsPinnedChecked(false);
        }
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setEditingAnnouncement(null);
        form.reset({
            title: '',
            content: '',
            type: 'general',
            department_id: undefined,
            starts_at: '',
            ends_at: '',
            is_pinned: false,
            visibility: 'all',
        });
        setIsPinnedChecked(false);
    };

    const onSubmit = (values: AnnouncementFormValues) => {
        setIsSubmitting(true);
        if (editingAnnouncement) {
            router.put(
                `/announcements/${editingAnnouncement.id}`,
                {
                    ...values,
                    is_pinned: values.is_pinned, // Send the value as is
                } as any,
                {
                    onSuccess: () => {
                        toast.success('Announcement updated successfully');
                        closeModal();
                        router.reload({ only: ['announcements'] });
                        setIsSubmitting(false);
                    },
                    onError: (errors) => {
                        toast.error('Failed to update announcement');
                        // Map backend validation errors to form errors
                        Object.keys(errors).forEach((key) => {
                            form.setError(key as any, {
                                type: 'manual',
                                message: errors[key],
                            });
                        });
                        setIsSubmitting(false);
                    },
                },
            );
        } else {
            router.post('/announcements', values as any, {
                onSuccess: () => {
                    toast.success('Announcement created successfully');
                    closeModal();
                    router.reload({ only: ['announcements'] });
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    toast.error('Failed to create announcement');
                    // Map backend validation errors to form errors
                    Object.keys(errors).forEach((key) => {
                        form.setError(key as any, {
                            type: 'manual',
                            message: errors[key],
                        });
                    });
                    setIsSubmitting(false);
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        router.delete(`/announcements/${id}`, {
            onSuccess: () => {
                toast.success('Announcement deleted successfully');
                setConfirmDelete(null);
                setAnnouncementsList(announcementsList.filter((a) => a.id !== id));
            },
            onError: () => {
                toast.error('Failed to delete announcement');
            },
        });
    };

    const togglePin = (announcement: Announcements) => {
        router.put(
            `/announcements/${announcement.id}/pin`,
            {
                is_pinned: !announcement.is_pinned,
            },
            {
                onSuccess: () => {
                    toast.success(`Announcement ${announcement.is_pinned ? 'unpinned' : 'pinned'} successfully`);
                    setAnnouncementsList(announcementsList.map((a) => (a.id === announcement.id ? { ...a, is_pinned: !a.is_pinned } : a)));
                },
                onError: () => {
                    toast.error('Failed to update pin status');
                },
            },
        );
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'general':
                return <Info className="h-4 w-4" />;
            case 'academic':
                return <BookOpen className="h-4 w-4" />;
            case 'administrative':
                return <Building className="h-4 w-4" />;
            case 'emergency':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    const getTypeBadgeVariant = (type: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
        switch (type) {
            case 'general':
                return 'default';
            case 'academic':
                return 'secondary';
            case 'administrative':
                return 'outline';
            case 'emergency':
                return 'destructive';
            default:
                return 'default';
        }
    };

    const filteredAnnouncements = activeTab === 'all' ? announcementsList : announcementsList.filter((a) => a.type === activeTab);

    // Sort announcements with pinned ones first
    const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Announcements" />
            <Toaster />
            <div className="flex h-full flex-1 flex-col gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="text-2xl font-bold">Announcements</CardTitle>
                            <CardDescription>Create and manage announcements for your organization</CardDescription>
                        </div>
                        <Button onClick={() => openModal()}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Announcement
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="mb-4 grid w-full grid-cols-5">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="general">General</TabsTrigger>
                                <TabsTrigger value="academic">Academic</TabsTrigger>
                                <TabsTrigger value="administrative">Administrative</TabsTrigger>
                                <TabsTrigger value="emergency">Emergency</TabsTrigger>
                            </TabsList>
                            <TabsContent value={activeTab} className="mt-0">
                                {sortedAnnouncements.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                                        <div className="bg-primary/10 rounded-full p-3">
                                            <Info className="text-primary h-6 w-6" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold">No announcements found</h3>
                                        <p className="text-muted-foreground mt-2 text-sm">
                                            {activeTab === 'all'
                                                ? 'Get started by creating your first announcement.'
                                                : `No ${activeTab} announcements found. Create one by clicking the button above.`}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {sortedAnnouncements.map((announcement) => (
                                            <Card
                                                key={announcement.id}
                                                className={`overflow-hidden transition-all ${announcement.is_pinned ? 'border-primary/50 shadow-md' : ''}`}
                                            >
                                                {announcement.is_pinned ? (
                                                    <div className="bg-primary text-primary-foreground flex items-center px-3 py-1 text-xs font-medium">
                                                        <Pin className="mr-1 h-3 w-3" />
                                                        Pinned Announcement
                                                    </div>
                                                ) : null}
                                                <CardHeader className="pb-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <h3 className="text-lg font-semibold">{announcement.title}</h3>
                                                            <Badge variant={getTypeBadgeVariant(announcement.type)} className="ml-2">
                                                                <span className="flex items-center">
                                                                    {getTypeIcon(announcement.type)}
                                                                    <span className="ml-1 capitalize">{announcement.type}</span>
                                                                </span>
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => togglePin(announcement)}
                                                                title={announcement.is_pinned ? 'Unpin' : 'Pin'}
                                                            >
                                                                {announcement.is_pinned ? (
                                                                    <PinOff className="h-4 w-4" />
                                                                ) : (
                                                                    <Pin className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => openModal(announcement)} title="Edit">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setConfirmDelete(announcement.id)}
                                                                title="Delete"
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-muted-foreground text-sm whitespace-pre-line">{announcement.content}</div>
                                                    <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                                                        {announcement.starts_at && (
                                                            <div className="flex items-center">
                                                                <Calendar className="mr-1 h-3 w-3" />
                                                                <span>
                                                                    {format(new Date(announcement.starts_at), 'MMM d, yyyy')}
                                                                    {announcement.ends_at &&
                                                                        ` - ${format(new Date(announcement.ends_at), 'MMM d, yyyy')}`}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center">
                                                            <Clock className="mr-1 h-3 w-3" />
                                                            <span>{format(new Date(announcement.created_at), 'MMM d, yyyy')}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Users className="mr-1 h-3 w-3" />
                                                            <span className="capitalize">{announcement.visibility}</span>
                                                        </div>
                                                        {announcement.department_id && (
                                                            <div className="flex items-center">
                                                                <Tag className="mr-1 h-3 w-3" />
                                                                <span>
                                                                    {departments.find((d) => d.id === announcement.department_id)?.name ||
                                                                        'Department'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Create/Edit Announcement Dialog */}
                <Dialog
                    open={isOpen}
                    onOpenChange={(open) => {
                        if (!open) closeModal();
                    }}
                >
                    <DialogContent className="sm:max-w-[625px]">
                        <DialogHeader>
                            <DialogTitle>{editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
                            <DialogDescription>
                                {editingAnnouncement
                                    ? "Make changes to the announcement here. Click save when you're done."
                                    : 'Fill in the details to create a new announcement.'}
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Announcement title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Content</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Enter the announcement content here..." className="min-h-[120px]" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="general">General</SelectItem>
                                                        <SelectItem value="academic">Academic</SelectItem>
                                                        <SelectItem value="administrative">Administrative</SelectItem>
                                                        <SelectItem value="emergency">Emergency</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="visibility"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Visibility</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select visibility" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Users</SelectItem>
                                                        <SelectItem value="students">Students Only</SelectItem>
                                                        <SelectItem value="teachers">Teachers Only</SelectItem>
                                                        <SelectItem value="staff">Staff Only</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="department_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department (Optional)</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(value ? Number.parseInt(value) : undefined)}
                                                defaultValue={field.value?.toString() || ''}
                                                value={field.value?.toString() || ''}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="All Departments" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="0">All Departments</SelectItem>
                                                    {departments.map((department) => (
                                                        <SelectItem key={department.id} value={department.id.toString()}>
                                                            {department.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Leave blank to show to all departments</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="starts_at"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Date (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="ends_at"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Date (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="is_pinned"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={isPinnedChecked}
                                                    onCheckedChange={(checked) => {
                                                        setIsPinnedChecked(checked as boolean);
                                                        field.onChange(checked);
                                                    }}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Pin this announcement</FormLabel>
                                                <FormDescription>Pinned announcements will appear at the top of the list</FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={closeModal}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : editingAnnouncement ? 'Update' : 'Create'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={confirmDelete !== null} onOpenChange={(open) => !open && setConfirmDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this announcement? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => confirmDelete !== null && handleDelete(confirmDelete)}
                                className="bg-destructive hover:bg-destructive/90 text-white"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}

export default AnnouncementPage;
