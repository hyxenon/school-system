'use client';

import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface PaginationData {
    current_page: number;
    data: any[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface PaginationLinksProps {
    pagination: PaginationData;
    onPageChange: (page: number) => void;
    className?: string;
}

export default function PaginationLinks({ pagination, onPageChange, className }: PaginationLinksProps) {
    // Don't render pagination if there's only one page
    if (pagination.last_page <= 1) {
        return null;
    }

    return (
        <div className={cn('mt-4 flex justify-center', className)}>
            <Pagination>
                <div className="flex items-center gap-1">
                    {/* Previous button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => pagination.prev_page_url && onPageChange(pagination.current_page - 1)}
                        disabled={!pagination.prev_page_url}
                    >
                        Previous
                    </Button>

                    {/* Page links */}
                    <div className="flex items-center">
                        {pagination.links
                            .filter((link) => link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;')
                            .map((link, index) => {
                                // Handle ellipsis
                                if (link.label === '...') {
                                    return (
                                        <div key={index} className="mx-1 px-3 py-2">
                                            ...
                                        </div>
                                    );
                                }

                                return (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        className="mx-1"
                                        onClick={() => {
                                            if (link.url) {
                                                // Extract page number from URL
                                                const url = new URL(link.url);
                                                const page = url.searchParams.get('page');
                                                if (page) {
                                                    onPageChange(Number.parseInt(page));
                                                }
                                            }
                                        }}
                                        disabled={!link.url}
                                    >
                                        {link.label}
                                    </Button>
                                );
                            })}
                    </div>

                    {/* Next button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => pagination.next_page_url && onPageChange(pagination.current_page + 1)}
                        disabled={!pagination.next_page_url}
                    >
                        Next
                    </Button>
                </div>
            </Pagination>
        </div>
    );
}
