import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function StatCard({ title, value, icon: Icon, description, trend, className }: StatCardProps) {
    return (
        <div
            className={cn(
                'border-sidebar-border/70 dark:border-sidebar-border bg-card relative overflow-hidden rounded-xl border p-6 shadow-sm transition-all hover:shadow-md',
                className,
            )}
        >
            <div className="flex justify-between">
                <div className="space-y-2">
                    <p className="text-muted-foreground text-sm font-medium">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                        {trend && (
                            <span className={cn('text-xs font-medium', trend.isPositive ? 'text-emerald-500' : 'text-rose-500')}>
                                {trend.isPositive ? '+' : '-'}
                                {trend.value}%
                            </span>
                        )}
                    </div>
                    {description && <p className="text-muted-foreground text-xs">{description}</p>}
                </div>
                <div className="bg-primary/10 flex max-h-10 items-center justify-center rounded-full p-3">
                    <Icon className="text-primary h-5 w-5" />
                </div>
            </div>
            <div className="from-primary/40 to-primary/80 absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r" />
        </div>
    );
}
