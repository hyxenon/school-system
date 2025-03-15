// Pages/Buildings/Index.tsx
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Building, Room } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, Building as BuildingIcon, DoorOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Buildings and Rooms',
        href: '/buildings',
    },
];

interface Props {
    buildings: {
        data: Building[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    rooms: {
        data: Room[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters?: {
        search?: string;
        page?: number;
    };
}

interface FormErrors {
    name?: string;
    building_id?: string;
}

export default function Index({ buildings, rooms, filters = {} }: Props) {
    const [activeTab, setActiveTab] = useState('buildings');
    const [buildingDialogOpen, setBuildingDialogOpen] = useState(false);
    const [roomDialogOpen, setRoomDialogOpen] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(filters.search || '');

    // Form state
    const [buildingName, setBuildingName] = useState('');
    const [roomName, setRoomName] = useState('');
    const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    // Confirmation dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'building' | 'room'; item: Building | Room } | null>(null);

    // Debounce search term
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    // Apply filters when debounced search term changes
    useEffect(() => {
        if (debouncedSearchTerm !== filters.search) {
            applyFilters({ search: debouncedSearchTerm, page: 1 });
        }
    }, [debouncedSearchTerm]);

    // Handle pagination
    const handlePageChange = (page: number) => {
        applyFilters({ search: searchTerm, page });
    };

    // Apply filters function
    const applyFilters = (newFilters: { search?: string; page?: number }) => {
        router.get(
            '/buildings',
            { ...newFilters },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Building form handlers
    const handleAddBuilding = () => {
        setSelectedBuilding(null);
        setBuildingName('');
        setFormErrors({});
        setBuildingDialogOpen(true);
    };

    const handleEditBuilding = (building: Building) => {
        setSelectedBuilding(building);
        setBuildingName(building.name);
        setFormErrors({});
        setBuildingDialogOpen(true);
    };

    const handleDeleteBuilding = (building: Building) => {
        setItemToDelete({ type: 'building', item: building });
        setDeleteDialogOpen(true);
    };

    // Room form handlers
    const handleAddRoom = () => {
        setSelectedRoom(null);
        setRoomName('');
        setSelectedBuildingId('');
        setFormErrors({});
        setRoomDialogOpen(true);
    };

    const handleEditRoom = (room: Room) => {
        setSelectedRoom(room);
        setRoomName(room.name);
        setSelectedBuildingId(room.building.id.toString());
        setFormErrors({});
        setRoomDialogOpen(true);
    };

    const handleDeleteRoom = (room: Room) => {
        setItemToDelete({ type: 'room', item: room });
        setDeleteDialogOpen(true);
    };

    // Form submission handlers
    const handleBuildingSubmit = () => {
        // Validate
        const errors: FormErrors = {};
        if (!buildingName.trim()) {
            errors.name = 'Building name is required';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        if (selectedBuilding) {
            router.put(
                `/buildings/${selectedBuilding.id}`,
                {
                    name: buildingName,
                },
                {
                    onSuccess: () => {
                        setBuildingDialogOpen(false);
                        toast.success(`${buildingName} updated successfully`);
                    },
                    onError: () => {
                        toast.warning('Building already exists');
                    },
                },
            );
        } else {
            router.post(
                '/buildings',
                {
                    name: buildingName,
                },
                {
                    onSuccess: () => {
                        setBuildingDialogOpen(false);
                        toast.success(`${buildingName} added successfully`);
                    },
                    onError: () => {
                        toast.warning('Building already exists');
                    },
                },
            );
        }

        setBuildingDialogOpen(false);
    };

    const handleRoomSubmit = () => {
        // Validate
        const errors: FormErrors = {};
        if (!roomName.trim()) {
            errors.name = 'Room name is required';
        }
        if (!selectedBuildingId) {
            errors.building_id = 'Please select a building';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        if (selectedRoom) {
            router.put(
                `/rooms/${selectedRoom.id}`,
                {
                    name: roomName,
                    building_id: selectedBuildingId,
                },
                {
                    onSuccess: () => {
                        setRoomDialogOpen(false);
                        toast.success(`${roomName} updated successfully`);
                    },
                    onError: () => {
                        toast.warning('Room already exists');
                    },
                },
            );
        } else {
            router.post(
                `/rooms`,
                {
                    name: roomName,
                    building_id: selectedBuildingId,
                },
                {
                    onSuccess: () => {
                        setRoomDialogOpen(false);
                        toast.success(`${roomName} Added successfully`);
                    },
                    onError: () => {
                        toast.warning('Room already exists');
                    },
                },
            );
        }

        setRoomDialogOpen(false);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            if (itemToDelete.type === 'building') {
                router.delete(`/buildings/${itemToDelete.item.id}`, {
                    onSuccess: () => {
                        toast.success(`${itemToDelete.item.name} deleted successfully`);
                    },
                });
            } else {
                router.delete(`/rooms/${itemToDelete.item.id}`, {
                    onSuccess: () => {
                        toast.success(`${itemToDelete.item.name} deleted successfully`);
                    },
                });
            }
        }
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    // Render pagination
    const renderPagination = (data: { current_page: number; last_page: number }) => {
        if (data.last_page <= 1) return null;

        return (
            <Pagination className="mt-4">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => data.current_page > 1 && handlePageChange(data.current_page - 1)}
                            className={data.current_page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>

                    {Array.from({ length: Math.min(5, data.last_page) }, (_, i) => {
                        let pageNumber;

                        // Logic to determine which page numbers to show
                        if (data.last_page <= 5) {
                            // Show all pages if 5 or fewer
                            pageNumber = i + 1;
                        } else if (data.current_page <= 3) {
                            // Show first 5 pages
                            pageNumber = i + 1;
                        } else if (data.current_page >= data.last_page - 2) {
                            // Show last 5 pages
                            pageNumber = data.last_page - 4 + i;
                        } else {
                            // Show 2 pages before and after current page
                            pageNumber = data.current_page - 2 + i;
                        }

                        return (
                            <PaginationItem key={`page-${pageNumber}`}>
                                <PaginationLink onClick={() => handlePageChange(pageNumber)} isActive={pageNumber === data.current_page}>
                                    {pageNumber}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}

                    {data.last_page > 5 && data.current_page < data.last_page - 2 && (
                        <>
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink onClick={() => handlePageChange(data.last_page)}>{data.last_page}</PaginationLink>
                            </PaginationItem>
                        </>
                    )}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => data.current_page < data.last_page && handlePageChange(data.current_page + 1)}
                            className={data.current_page >= data.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Building & Room Management" />
            <Toaster />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="mb-4 flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="buildings" className="flex items-center gap-2">
                                <BuildingIcon className="h-4 w-4" />
                                Buildings
                            </TabsTrigger>
                            <TabsTrigger value="rooms" className="flex items-center gap-2">
                                <DoorOpen className="h-4 w-4" />
                                Rooms
                            </TabsTrigger>
                        </TabsList>

                        {activeTab === 'buildings' ? (
                            <Button onClick={handleAddBuilding} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Add Building
                            </Button>
                        ) : (
                            <Button onClick={handleAddRoom} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Add Room
                            </Button>
                        )}
                    </div>

                    {/* Search Box */}
                    <div className="relative mb-4">
                        <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                        <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>

                    <TabsContent value="buildings" className="mt-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>Buildings</CardTitle>
                                <CardDescription>
                                    Manage all buildings in your Wistleyan University.
                                    {buildings.total > 0 && (
                                        <span className="ml-2">{/* Showing {buildings.from}-{buildings.to} of {buildings.total} items */}</span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {buildings.data.length === 0 ? (
                                    <div className="text-muted-foreground py-6 text-center">
                                        {searchTerm
                                            ? `No buildings matching "${searchTerm}" found.`
                                            : 'No buildings found. Click "Add Building" to create one.'}
                                    </div>
                                ) : (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>ID</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Created At</TableHead>
                                                    <TableHead>Updated At</TableHead>
                                                    <TableHead className="w-32 text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {buildings.data.map((building) => (
                                                    <TableRow key={building.id}>
                                                        <TableCell>{building.id}</TableCell>
                                                        <TableCell className="font-medium">{building.name}</TableCell>
                                                        <TableCell>{new Date(building.created_at).toLocaleDateString()}</TableCell>
                                                        <TableCell>{new Date(building.updated_at).toLocaleDateString()}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 px-2"
                                                                    onClick={() => handleEditBuilding(building)}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                    <span className="sr-only">Edit</span>
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-destructive hover:bg-destructive/10 h-8 px-2"
                                                                    onClick={() => handleDeleteBuilding(building)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    <span className="sr-only">Delete</span>
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        {renderPagination(buildings)}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="rooms" className="mt-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>Rooms</CardTitle>
                                <CardDescription>
                                    Manage all rooms across your buildings.
                                    {rooms.total > 0 && <span className="ml-2">{/* Showing {rooms.from}-{rooms.to} of {rooms.total} items */}</span>}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {rooms.data.length === 0 ? (
                                    <div className="text-muted-foreground py-6 text-center">
                                        {searchTerm ? `No rooms matching "${searchTerm}" found.` : 'No rooms found. Click "Add Room" to create one.'}
                                    </div>
                                ) : (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>ID</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Building</TableHead>
                                                    <TableHead>Created At</TableHead>
                                                    <TableHead>Updated At</TableHead>
                                                    <TableHead className="w-32 text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {rooms.data.map((room) => (
                                                    <TableRow key={room.id}>
                                                        <TableCell>{room.id}</TableCell>
                                                        <TableCell className="font-medium">{room.name}</TableCell>
                                                        <TableCell>{room.building.name}</TableCell>
                                                        <TableCell>{new Date(room.created_at).toLocaleDateString()}</TableCell>
                                                        <TableCell>{new Date(room.updated_at).toLocaleDateString()}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 px-2"
                                                                    onClick={() => handleEditRoom(room)}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                    <span className="sr-only">Edit</span>
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-destructive hover:bg-destructive/10 h-8 px-2"
                                                                    onClick={() => handleDeleteRoom(room)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    <span className="sr-only">Delete</span>
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        {renderPagination(rooms)}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Building Dialog */}
                <Dialog open={buildingDialogOpen} onOpenChange={setBuildingDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{selectedBuilding ? 'Edit Building' : 'Add Building'}</DialogTitle>
                            <DialogDescription>
                                {selectedBuilding ? 'Update the building details.' : 'Enter the details of the new building.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="building-name">Building Name</Label>
                                <Input
                                    id="building-name"
                                    value={buildingName}
                                    onChange={(e) => setBuildingName(e.target.value)}
                                    placeholder="Enter building name"
                                    className={formErrors.name ? 'border-destructive' : ''}
                                />
                                {formErrors.name && (
                                    <Alert variant="destructive" className="mt-1 py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="ml-2">{formErrors.name}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setBuildingDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleBuildingSubmit}>{selectedBuilding ? 'Save Changes' : 'Create Building'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Room Dialog */}
                <Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{selectedRoom ? 'Edit Room' : 'Add Room'}</DialogTitle>
                            <DialogDescription>{selectedRoom ? 'Update the room details.' : 'Enter the details of the new room.'}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="room-name">Room Name</Label>
                                <Input
                                    id="room-name"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="Enter room name"
                                    className={formErrors.name ? 'border-destructive' : ''}
                                />
                                {formErrors.name && (
                                    <Alert variant="destructive" className="mt-1 py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="ml-2">{formErrors.name}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="room-building">Building</Label>
                                <Select value={selectedBuildingId} onValueChange={(value) => setSelectedBuildingId(value)}>
                                    <SelectTrigger
                                        id="room-building"
                                        className={`flex h-10 w-full rounded-md border ${formErrors.building_id ? 'border-destructive' : 'border-input'} bg-background ring-offset-background focus-visible:ring-ring px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none`}
                                    >
                                        <SelectValue placeholder="Select a building" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {buildings.data.map((building) => (
                                            <SelectItem key={building.id} value={building.id}>
                                                {building.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formErrors.building_id && (
                                    <Alert variant="destructive" className="mt-1 py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="ml-2">{formErrors.building_id}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRoomDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleRoomSubmit}>{selectedRoom ? 'Save Changes' : 'Create Room'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            {itemToDelete?.type === 'building' && (
                                <p>
                                    Building: <strong>{(itemToDelete.item as Building).name}</strong>
                                </p>
                            )}
                            {itemToDelete?.type === 'room' && (
                                <p>
                                    Room: <strong>{(itemToDelete.item as Room).name}</strong> in building{' '}
                                    <strong>{(itemToDelete.item as Room).building.name}</strong>
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
