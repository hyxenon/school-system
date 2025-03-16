import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { router } from '@inertiajs/react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';

const PaymentTransactionTable = ({ data }) => {
    const transactions = data.data || [];
    const { current_page, last_page, next_page_url, prev_page_url } = data;

    const formatCurrency = (value) => {
        const numValue = parseFloat(value);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP',
        }).format(numValue);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handlePageChange = (url) => {
        // Create URL object from the pagination link
        const newUrl = new URL(url, window.location.origin);

        // Get current query params from window location
        const queryParams = new URLSearchParams(window.location.search);

        // Remove the page parameter from existing params to avoid duplication
        queryParams.delete('page');

        // Add all existing params (except page) to the new URL
        queryParams.forEach((value, key) => {
            newUrl.searchParams.set(key, value);
        });

        // Navigate to the new URL
        router.get(newUrl.toString());
    };

    if (!transactions.length) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardDescription>No payment transactions found</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardDescription>Payments Transaction of student ID: {transactions[0].student_id}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Document Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Payment Date</TableHead>
                            <TableHead>Total Fee</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>{transaction.enrollment_id ? 'Tuition' : transaction.document_type}</TableCell>
                                <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                                <TableCell>{transaction.payment_method}</TableCell>
                                <TableCell>{formatDate(transaction.payment_date)}</TableCell>
                                <TableCell>{formatCurrency(transaction.enrollment_id ? transaction.enrollment.total_fee : 100)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="mt-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                {prev_page_url ? (
                                    <PaginationPrevious onClick={() => handlePageChange(prev_page_url)} />
                                ) : (
                                    <PaginationPrevious disabled />
                                )}
                            </PaginationItem>

                            {/* Generate page links */}
                            {Array.from({ length: last_page }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        onClick={() => handlePageChange(`${window.location.pathname}?page=${page}`)}
                                        isActive={page === current_page}
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                {next_page_url ? <PaginationNext onClick={() => handlePageChange(next_page_url)} /> : <PaginationNext disabled />}
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </CardContent>
        </Card>
    );
};

export default PaymentTransactionTable;
