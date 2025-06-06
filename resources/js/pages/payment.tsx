import PaymentsTable from '@/components/payments-table';
import PrintableReceipt from '@/components/printable-receipt';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
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
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payments',
        href: '/payments',
    },
];

const TreasuryPaymentPage = ({ studentData = null, receiptData = null, success = false, payments }) => {
    const { auth } = usePage<SharedData>().props;
    console.log(studentData);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [student, setStudent] = useState(studentData);
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [paymentType, setPaymentType] = useState('Tuition'); // New state for payment type
    const [showSuccess, setShowSuccess] = useState(success);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [studentId, setStudentId] = useState('');

    const currentDate = format(new Date(), 'yyyy-MM-dd');
    const formattedDate = format(new Date(), 'MMMM d, yyyy');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('alert') === 'true' && !studentData) {
            setShowAlert(true);
        }

        setStudentId(urlParams.get('student'));
    }, [studentData]);

    useEffect(() => {
        if (studentData) {
            setStudent(studentData);
        }

        if (receiptData) {
            setShowSuccess(true);
        }
    }, [studentData, receiptData]);

    useEffect(() => {
        // Automatically set the amount for document types
        if (paymentType === 'COG') {
            setAmount('100');
        } else if (paymentType === 'TOR') {
            setAmount('150');
        } else if (paymentType === 'Incomplete Form') {
            setAmount('125');
        } else {
            setAmount('');
        }
    }, [paymentType]);

    const handleSearch = () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);

        router.get(
            '/payments',
            { student: searchQuery, alert: 'true' },
            {
                onFinish: () => {
                    setIsSearching(false);

                    if (!studentData) {
                        setShowAlert(true);
                    }
                },
            },
        );
    };

    const handlePaymentSubmit = () => {
        if (!student) return;

        setProcessingPayment(true);

        const paymentData = {
            student_id: student.id,
            amount: parseFloat(amount),
            payment_method: paymentMethod,
            payment_type: paymentType,
            payment_date: currentDate,
        };

        if (paymentType === 'Tuition') {
            paymentData.enrollment_id = student.enrollment[0]?.id;
        } else {
            paymentData.document_type = paymentType;
        }

        router.post('/payments', paymentData, {
            onFinish: () => {
                setProcessingPayment(false);
            },
        });
    };

    const resetForm = () => {
        setSearchQuery('');
        router.get('/payments');
    };

    const startNewPayment = () => {
        setShowSuccess(false);
        setAmount('');
        setPaymentMethod('Cash');
        setPaymentType('Tuition');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payments" />
            <Toaster />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {showAlert && (
                    <Alert className="mb-2" variant="destructive" onClose={() => setShowAlert(false)}>
                        <AlertTitle>Student Not Found: {studentId}</AlertTitle>
                        <AlertDescription>No student was found with the provided ID. Please check the ID and try again.</AlertDescription>
                    </Alert>
                )}
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
                                    placeholder="Enter Student ID"
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

                {student && student.user && (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-primary/5 p-4">
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
                                        <AvatarFallback>{student.user.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <h3 className="text-xl font-bold capitalize">{student.user.name}</h3>
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
                                            {student.course?.name}
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
                                            {student.enrollment[0]?.department?.name}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-muted-foreground text-sm">Academic Year</p>
                                        <p className="flex items-center font-medium">
                                            <Calendar className="text-primary/70 mr-1 h-4 w-4" />
                                            {student.enrollment[0]?.academic_year}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-muted-foreground text-sm">Semester</p>
                                        <p className="font-medium">{student.enrollment[0]?.semester}</p>
                                    </div>
                                </div>

                                <div className="bg-primary/5 mt-6 rounded-md p-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">Enrollment Status</p>
                                        <Badge variant={student.enrollment[0]?.status === 'Enrolled' ? 'default' : 'outline'}>
                                            {student.enrollment[0]?.status}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="bg-primary/5 p-4">
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Payment Details
                                </CardTitle>
                                <CardDescription>Enter payment information</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {paymentType === 'Tuition' && (
                                    <div className="bg-muted/30 mb-6 grid grid-cols-2 gap-4 rounded-lg p-4">
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground text-sm">Total Fee</p>
                                            <p className="text-lg font-bold">₱{student.enrollment[0]?.total_fee?.toLocaleString() || '0'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground text-sm">Remaining Balance</p>
                                            <p className="text-lg font-bold text-red-500">
                                                ₱{student.enrollment[0]?.remaining_balance?.toLocaleString() || '0'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="paymentType">Payment Type</Label>
                                        <Select value={paymentType} onValueChange={setPaymentType}>
                                            <SelectTrigger id="paymentType" className="mt-1 w-full">
                                                <SelectValue placeholder="Select payment type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Tuition">Tuition</SelectItem>
                                                <SelectItem value="COG">Certificate of Grades (COG)</SelectItem>
                                                <SelectItem value="TOR">Transcript of Records (TOR)</SelectItem>
                                                <SelectItem value="Incomplete Form">Incomplete Form</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

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
                                                readOnly={paymentType !== 'Tuition'} // Make amount read-only for document types
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
                        <div className="col-span-full">
                            <PaymentsTable data={payments} />
                        </div>
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
                                {receiptData && (
                                    <>
                                        Payment of ₱{receiptData.amount.toLocaleString()} has been successfully recorded for student{' '}
                                        {receiptData.student_name}.
                                        <div className="mt-4 rounded-md bg-green-50 p-4">
                                            <div className="font-medium">Payment Details:</div>
                                            <div className="mt-1 text-sm">
                                                <div>
                                                    <span className="font-medium">Amount:</span> ₱{receiptData.amount.toLocaleString()}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Method:</span> {receiptData.payment_method}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Date:</span> {receiptData.payment_date}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Status:</span> Completed
                                                </div>
                                                {receiptData.new_balance !== undefined && (
                                                    <div className="mt-2">
                                                        <span className="font-medium">New Remaining Balance:</span> ₱
                                                        {receiptData.new_balance.toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex flex-col gap-3 sm:flex-row">
                            <Button variant="outline" className="sm:flex-1" onClick={resetForm}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                New Student
                            </Button>
                            {receiptData && <PrintableReceipt receiptData={receiptData} />}
                            <Button className="sm:flex-1" onClick={startNewPayment}>
                                Another Payment
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
};

export default TreasuryPaymentPage;
