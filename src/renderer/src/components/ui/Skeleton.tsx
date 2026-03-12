import { cn } from '@/lib/utils'

// ─── Base Skeleton ───────────────────────────
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-xl bg-surface-800/60',
                className
            )}
            style={style}
        />
    )
}

// ─── Stat Card Skeleton ──────────────────────
export function StatCardSkeleton() {
    return (
        <div className="stat-card">
            <div className="flex items-start justify-between mb-4">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="w-16 h-5 rounded-full" />
            </div>
            <Skeleton className="w-24 h-8 mb-2" />
            <Skeleton className="w-32 h-4" />
        </div>
    )
}

// ─── Batch Card Skeleton ─────────────────────
export function BatchCardSkeleton() {
    return (
        <div className="glass-card p-5">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div>
                        <Skeleton className="w-36 h-4 mb-1.5" />
                        <Skeleton className="w-20 h-3" />
                    </div>
                </div>
                <Skeleton className="w-6 h-6 rounded-lg" />
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
                {[1, 2, 3].map((i) => (
                    <div key={i}>
                        <Skeleton className="w-12 h-3 mb-1" />
                        <Skeleton className="w-10 h-5" />
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between">
                <Skeleton className="w-20 h-5 rounded-full" />
                <Skeleton className="w-20 h-3" />
            </div>
        </div>
    )
}

// ─── Table Row Skeleton ──────────────────────
export function TableRowSkeleton({ cols = 7 }: { cols?: number }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-3 border-b border-surface-800/50">
                    <Skeleton className={cn('h-4', i === 0 ? 'w-40' : 'w-16')} />
                </td>
            ))}
        </tr>
    )
}

// ─── Chart Skeleton ──────────────────────────
export function ChartSkeleton() {
    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Skeleton className="w-36 h-4 mb-1.5" />
                    <Skeleton className="w-52 h-3" />
                </div>
                <Skeleton className="w-28 h-5" />
            </div>
            <div className="flex items-end gap-4 h-48 px-4">
                {[60, 75, 45, 85, 65, 70].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <Skeleton className="w-10 h-3 mb-1" />
                        <Skeleton className={`w-full rounded-t-lg`} style={{ height: `${h}%` }} />
                        <Skeleton className="w-8 h-3" />
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Full Page Skeleton ──────────────────────
export function PageSkeleton() {
    return (
        <div className="p-6 space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>
            <ChartSkeleton />
        </div>
    )
}
