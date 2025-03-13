'use client';

import { format } from 'date-fns';
import {
    Banknote,
    BookOpen,
    Building2,
    Calendar,
    CalendarIcon,
    CreditCard,
    DollarSign,
    FileText,
    GraduationCap,
    Loader2,
    RefreshCw,
    Search,
    User,
} from 'lucide-react';
import { useState } from 'react';

import PrintableReceipt from '@/components/printable-receipt';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { usePage } from '@inertiajs/react';

// Define the type for the shared data from Inertia
type SharedData = {
    auth: {
        user: {
            name: string;
        };
    };
};

const TreasuryPaymentPage = () => {
    // Get authenticated user
    const { auth } = usePage<SharedData>().props;

    // Application states
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [student, setStudent] = useState<any>(null);
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [showSuccess, setShowSuccess] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);

    // Current date is automatically set and fixed
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    const formattedDate = format(new Date(), 'MMMM d, yyyy');

    // Generate a unique receipt number
    const generateReceiptNumber = () => {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        return `RCP-${timestamp}-${random}`;
    };

    // Mock student data - in a real app, this would come from your API
    const mockStudentData = {
        ST12345: {
            id: 'ST12345',
            user: { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
            course: { id: 1, name: 'Bachelor of Science in Computer Science' },
            year_level: 2,
            block: 1,
            status: 'Regular',
            enrollment_status: 'Enrolled',
            enrollment: {
                id: 1,
                course: { id: 1, name: 'Bachelor of Science in Computer Science' },
                department: { id: 1, name: 'College of Computer Studies' },
                academic_year: '2024-2025',
                semester: 1,
                enrollment_date: '2024-06-01',
                status: 'Enrolled',
                payment_status: 'Pending',
                total_fee: 40000,
                remaining_balance: 32000,
            },
        },
        ST67890: {
            id: 'ST67890',
            user: { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' },
            course: { id: 2, name: 'Bachelor of Science in Information Technology' },
            year_level: 3,
            block: 2,
            status: 'Regular',
            enrollment_status: 'Enrolled',
            enrollment: {
                id: 2,
                course: { id: 2, name: 'Bachelor of Science in Information Technology' },
                department: { id: 1, name: 'College of Computer Studies' },
                academic_year: '2024-2025',
                semester: 1,
                enrollment_date: '2024-06-01',
                status: 'Enrolled',
                payment_status: 'Pending',
                total_fee: 40000,
                remaining_balance: 40000,
            },
        },
    };

    const handleSearch = () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);

        // Simulate API call delay
        setTimeout(() => {
            const foundStudent = mockStudentData[searchQuery];
            setStudent(foundStudent || null);
            setIsSearching(false);

            if (!foundStudent) {
            }
        }, 800);
    };

    const handlePaymentSubmit = () => {
        if (!student) return;

        setProcessingPayment(true);

        // Simulate processing payment
        setTimeout(() => {
            const paymentAmount = Number.parseFloat(amount);
            const newBalance = student.enrollment.remaining_balance - paymentAmount;

            // Create receipt data
            const receipt = {
                receipt_number: generateReceiptNumber(),
                student_id: student.id,
                student_name: student.user.name,
                payment_date: formattedDate,
                payment_time: format(new Date(), 'h:mm a'),
                amount: paymentAmount,
                payment_method: paymentMethod,
                cashier: auth.user.name,
                previous_balance: student.enrollment.remaining_balance,
                new_balance: newBalance,
                course: student.course.name,
                academic_year: student.enrollment.academic_year,
                semester: student.enrollment.semester,
            };

            setReceiptData(receipt);
            setProcessingPayment(false);
            setShowSuccess(true);
        }, 1000);
    };

    const resetForm = () => {
        setSearchQuery('');
        setStudent(null);
        setAmount('');
        setPaymentMethod('Cash');
        setShowSuccess(false);
        setReceiptData(null);
    };

    const startNewPayment = () => {
        setShowSuccess(false);
        setAmount('');
        setPaymentMethod('Cash');
    };

    return (
        <div className="container mx-auto py-8">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <FileText className="h-6 w-6" />
                        Treasury Payment Processing
                    </CardTitle>
                    <CardDescription>Search for a student by their ID number to process a payment</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Enter Student ID (try ST12345 or ST67890)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <Button onClick={handleSearch} disabled={isSearching}>
                            {isSearching ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {student && (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Student Information
                            </CardTitle>
                            <CardDescription>Review student details before processing payment</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="mb-6 flex flex-col items-center">
                                <Avatar className="mb-3 h-24 w-24">
                                    <AvatarImage
                                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.user.name}`}
                                        alt={student.user.name}
                                    />
                                    <AvatarFallback>{student.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <h3 className="text-xl font-bold">{student.user.name}</h3>
                                <Badge className="mt-1">{student.status}</Badge>
                            </div>

                            <Separator className="my-4" />

                            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-sm">Student ID</p>
                                    <p className="flex items-center font-medium">
                                        <FileText className="text-primary/70 mr-1 h-4 w-4" />
                                        {student.id}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-sm">Email</p>
                                    <p className="font-medium">{student.user.email}</p>
                                </div>

                                <div className="col-span-2 space-y-1">
                                    <p className="text-muted-foreground text-sm">Course</p>
                                    <p className="flex items-center font-medium">
                                        <BookOpen className="text-primary/70 mr-1 h-4 w-4" />
                                        {student.course.name}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-sm">Year Level / Block</p>
                                    <p className="flex items-center font-medium">
                                        <GraduationCap className="text-primary/70 mr-1 h-4 w-4" />
                                        Year {student.year_level} - Block {student.block}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-sm">Department</p>
                                    <p className="flex items-center font-medium">
                                        <Building2 className="text-primary/70 mr-1 h-4 w-4" />
                                        {student.enrollment.department.name}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-sm">Academic Year</p>
                                    <p className="flex items-center font-medium">
                                        <Calendar className="text-primary/70 mr-1 h-4 w-4" />
                                        {student.enrollment.academic_year}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-sm">Semester</p>
                                    <p className="font-medium">{student.enrollment.semester}</p>
                                </div>
                            </div>

                            <div className="bg-primary/5 mt-6 rounded-md p-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">Enrollment Status</p>
                                    <Badge variant={student.enrollment.status === 'Enrolled' ? 'default' : 'outline'}>
                                        {student.enrollment.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="bg-primary/5 pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Payment Details
                            </CardTitle>
                            <CardDescription>Enter payment information</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="bg-muted/30 mb-6 grid grid-cols-2 gap-4 rounded-lg p-4">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-sm">Total Fee</p>
                                    <p className="text-lg font-bold">₱{student.enrollment.total_fee.toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-sm">Remaining Balance</p>
                                    <p className="text-lg font-bold text-red-500">₱{student.enrollment.remaining_balance.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="amount">Payment Amount</Label>
                                    <div className="relative mt-1">
                                        <DollarSign className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="amount"
                                            type="number"
                                            className="pl-10"
                                            placeholder="Enter amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="paymentMethod">Payment Method</Label>
                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger id="paymentMethod" className="mt-1 w-full">
                                            <SelectValue placeholder="Select payment method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Cash">
                                                <div className="flex items-center">
                                                    <Banknote className="mr-2 h-4 w-4" />
                                                    Cash
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="Bank Transfer">
                                                <div className="flex items-center">
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Bank Transfer
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="Online">
                                                <div className="flex items-center">
                                                    <DollarSign className="mr-2 h-4 w-4" />
                                                    Online
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="paymentDate">Payment Date</Label>
                                    <div className="relative mt-1">
                                        <CalendarIcon className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                        <Input id="paymentDate" className="bg-muted/30 pl-10" value={formattedDate} readOnly />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="cashier">Cashier</Label>
                                    <div className="relative mt-1">
                                        <User className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                        <Input id="cashier" className="bg-muted/30 pl-10" value={auth.user.name} readOnly />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3 sm:flex-row">
                            <Button variant="outline" className="w-full sm:w-1/3" onClick={resetForm}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                            <Button
                                className="w-full sm:w-2/3"
                                onClick={handlePaymentSubmit}
                                disabled={!amount || Number.parseFloat(amount) <= 0 || processingPayment}
                            >
                                {processingPayment ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Process Payment'
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            Payment Successful
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Payment of ₱{Number.parseFloat(amount || '0').toLocaleString()} has been successfully recorded for student{' '}
                            {student?.user.name}.
                            <div className="mt-4 rounded-md bg-green-50 p-4">
                                <div className="font-medium">Payment Details:</div>
                                <div className="mt-1 text-sm">
                                    <div>
                                        <span className="font-medium">Amount:</span> ₱{Number.parseFloat(amount || '0').toLocaleString()}
                                    </div>
                                    <div>
                                        <span className="font-medium">Method:</span> {paymentMethod}
                                    </div>
                                    <div>
                                        <span className="font-medium">Date:</span> {formattedDate}
                                    </div>
                                    <div>
                                        <span className="font-medium">Status:</span> Completed
                                    </div>
                                    <div className="mt-2">
                                        <span className="font-medium">New Remaining Balance:</span> ₱
                                        {student ? (student.enrollment.remaining_balance - Number.parseFloat(amount || '0')).toLocaleString() : '0'}
                                    </div>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col gap-3 sm:flex-row">
                        <Button variant="outline" className="sm:flex-1" onClick={resetForm}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            New Student
                        </Button>
                        <PrintableReceipt receiptData={receiptData} />
                        <Button className="sm:flex-1" onClick={startNewPayment}>
                            Another Payment
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default TreasuryPaymentPage;
