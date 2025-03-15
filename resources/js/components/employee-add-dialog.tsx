import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Department, Employee } from '@/types';
import { useForm as useInertiaForm } from '@inertiajs/react';
import { ReactNode, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface EmployeeDialogProps {
    departments: Department[];
    employee?: Employee; // Optional employee for edit mode
    trigger?: ReactNode; // Custom trigger element
}

interface EmployeeFormData {
    name: string;
    email: string;
    position: 'registrar' | 'treasurer' | 'professor';
    department_id: string | null;
}

export function AddEmployeeDialog({ departments, employee, trigger }: EmployeeDialogProps) {
    const [open, setOpen] = useState(false);
    const isEditMode = !!employee;

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors: serverErrors,
        reset: resetInertia,
    } = useInertiaForm({
        name: employee?.user?.name || '',
        email: employee?.user?.email || '',
        position: employee?.position || 'professor',
        department_id: employee?.department_id ? String(employee.department_id) : null,
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset: resetReactHookForm,
        clearErrors,
        formState: { errors },
    } = useForm<EmployeeFormData>({
        defaultValues: {
            name: employee?.user?.name || '',
            email: employee?.user?.email || '',
            position: employee?.position || 'professor',
            department_id: employee?.department_id ? String(employee.department_id) : null,
        },
    });

    const position = watch('position');
    const departmentId = watch('department_id');

    // Set appropriate department_id when position changes
    useEffect(() => {
        if (position === 'registrar' || position === 'treasurer') {
            setValue('department_id', null);
            setData('department_id', null);
        }
    }, [position, setValue, setData]);

    // Sync the two form states
    useEffect(() => {
        setData('position', position);
        setData('department_id', departmentId);
    }, [position, departmentId, setData]);

    const onSubmit = (formData: EmployeeFormData) => {
        // If position is registrar or treasurer, ensure department_id is null
        if (formData.position === 'registrar' || formData.position === 'treasurer') {
            formData.department_id = null;
        }

        // Update Inertia form data
        setData({
            name: formData.name,
            email: formData.email,
            position: formData.position,
            department_id: formData.department_id,
        });

        if (isEditMode && employee) {
            // Make the put request to update existing employee
            put(`/employees/${employee.id}`, {
                onSuccess: () => {
                    setOpen(false);
                    resetReactHookForm();
                    resetInertia();
                    toast.success('Employee updated successfully');
                },
                preserveScroll: true,
            });
        } else {
            // Make the post request to create new employee
            post('/employees', {
                onSuccess: () => {
                    setOpen(false);
                    resetReactHookForm();
                    resetInertia();
                    toast.success('Employee added successfully');
                },
                preserveScroll: true,
            });
        }
    };

    // Reset both forms when dialog closes
    const handleDialogChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            resetReactHookForm();
            resetInertia();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>{trigger || <Button>{isEditMode ? 'Edit Employee' : 'Add Employee'}</Button>}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                        <DialogDescription>
                            {isEditMode ? 'Update the employee details in the system.' : 'Fill in the details to add a new employee to the system.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                className="col-span-3"
                                {...register('name', { required: 'Name is required' })}
                                onChange={(e) => {
                                    setData('name', e.target.value);
                                    clearErrors('name');
                                }}
                            />
                            {(errors.name || serverErrors.name) && (
                                <p className="col-span-3 col-start-2 text-sm text-red-500">
                                    {errors.name?.message || serverErrors.name || 'Name is required'}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                className="col-span-3"
                                {...register('email', {
                                    required: 'Valid email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                                onChange={(e) => {
                                    setData('email', e.target.value);
                                    clearErrors('email');
                                }}
                            />
                            {(errors.email || serverErrors.email) && (
                                <p className="col-span-3 col-start-2 text-sm text-red-500">
                                    {errors.email?.message || serverErrors.email || 'Valid email is required'}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="position" className="text-right">
                                Position
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    onValueChange={(value: 'registrar' | 'treasurer' | 'professor') => {
                                        setValue('position', value);
                                        setData('position', value);
                                    }}
                                    defaultValue={employee?.position || 'professor'}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="registrar">Registrar</SelectItem>
                                        <SelectItem value="treasurer">Treasurer</SelectItem>
                                        <SelectItem value="professor">Professor</SelectItem>
                                    </SelectContent>
                                </Select>
                                {serverErrors.position && <p className="text-red-500">{serverErrors.position}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="department" className="text-right">
                                Department
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    onValueChange={(value) => {
                                        setValue('department_id', value);
                                        setData('department_id', value);
                                    }}
                                    disabled={position === 'registrar' || position === 'treasurer'}
                                    value={departmentId || undefined}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                position === 'registrar' || position === 'treasurer'
                                                    ? 'No Department (Not Required)'
                                                    : 'Select department (Optional)'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                {dept.name} ({dept.department_code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {serverErrors.department_id && <p className="text-red-500">{serverErrors.department_id}</p>}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (isEditMode ? 'Updating...' : 'Adding...') : isEditMode ? 'Update Employee' : 'Add Employee'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
