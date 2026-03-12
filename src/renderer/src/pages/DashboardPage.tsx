import { motion } from 'framer-motion'
import {
    FolderOpen,
    FileStack,
    TrendingUp,
    Activity,
    Zap,
    Clock,
    ArrowUpRight,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Eye
} from 'lucide-react'
import { useDashboardStore, useAppStore, useBatchStore } from '@/stores'
import { formatNumber, formatDate, formatPercentage } from '@/lib/utils'
import { useBatchDetailStore } from '@/components/ui/BatchDetailModal'
import Tooltip from '@/components/ui/Tooltip'

const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
}

const stagger = {
    animate: { transition: { staggerChildren: 0.08 } }
}

function StatCard({
    icon: Icon,
    label,
    value,
    suffix,
    trend,
    color,
    delay
}: {
    icon: React.ElementType
    label: string
    value: string | number
    suffix?: string
    trend?: string
    color: string
    delay: number
}) {
    const gradients: Record<string, string> = {
        brand: 'from-brand-500/20 to-brand-600/5',
        cyan: 'from-cyan-500/20 to-cyan-600/5',
        emerald: 'from-emerald-500/20 to-emerald-600/5',
        amber: 'from-amber-500/20 to-amber-600/5'
    }
    const iconBg: Record<string, string> = {
        brand: 'bg-brand-500/15 text-brand-400',
        cyan: 'bg-cyan-500/15 dark:text-cyan-400 text-cyan-600',
        emerald: 'bg-emerald-500/15 dark:text-emerald-400 text-emerald-600',
        amber: 'bg-amber-500/15 dark:text-amber-400 text-amber-600'
    }
    const textColor: Record<string, string> = {
        brand: 'text-brand-400',
        cyan: 'dark:text-cyan-400 text-cyan-600',
        emerald: 'dark:text-emerald-400 text-emerald-600',
        amber: 'dark:text-amber-400 text-amber-600'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
            className="stat-card group"
        >
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradients[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${iconBg[color]}`}>
                        <Icon size={20} />
                    </div>
                    {trend && (
                        <div className="flex items-center gap-1 text-2xs font-semibold dark:text-emerald-400 text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <ArrowUpRight size={12} />
                            {trend}
                        </div>
                    )}
                </div>
                <div className="space-y-1">
                    <div className="flex items-baseline gap-1.5">
                        <span className={`text-3xl font-bold tracking-tight ${textColor[color]}`}>
                            {value}
                        </span>
                        {suffix && (
                            <span className="text-sm font-medium text-surface-500">{suffix}</span>
                        )}
                    </div>
                    <p className="text-sm text-surface-400 font-medium">{label}</p>
                </div>
            </div>
        </motion.div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
        complete: {
            bg: 'bg-emerald-500/12',
            text: 'dark:text-emerald-400 text-emerald-600',
            icon: <CheckCircle2 size={12} />
        },
        processing: {
            bg: 'bg-brand-500/12',
            text: 'text-brand-400',
            icon: <Loader2 size={12} className="animate-spin" />
        },
        draft: {
            bg: 'bg-amber-500/12',
            text: 'dark:text-amber-400 text-amber-600',
            icon: <Clock size={12} />
        },
        error: {
            bg: 'bg-red-500/12',
            text: 'dark:text-red-400 text-red-600',
            icon: <AlertCircle size={12} />
        }
    }

    const c = config[status] || config.draft

    return (
        <span role="status" aria-label={`Status: ${status}`} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-2xs font-semibold uppercase tracking-wide ${c.bg} ${c.text}`}>
            {c.icon}
            {status}
        </span>
    )
}

export default function DashboardPage() {
    const { stats, recentBatches } = useDashboardStore()
    const { setPage } = useAppStore()
    const { resetWorkspace } = useBatchStore()
    const { open: openBatchDetail } = useBatchDetailStore()

    const handleNewBatch = () => {
        resetWorkspace()
        setPage('batch-workspace')
    }

    // Time-based greeting
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

    return (
        <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="p-6 3xl:p-10 space-y-6 3xl:space-y-8 overflow-y-auto h-full"
        >
            {/* Hero Section */}
            <motion.div
                {...fadeUp}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br dark:from-brand-950 dark:via-surface-900 dark:to-surface-950 from-brand-50 via-white to-surface-950 border dark:border-brand-800/30 border-brand-200/60 p-6 xl:p-8 3xl:p-12"
            >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-brand-600/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-600/8 to-transparent rounded-full translate-y-1/2 -translate-x-1/4" />

                <div className="relative flex items-center justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full dark:bg-emerald-400 bg-emerald-500 animate-pulse-soft" />
                            <span className="text-2xs font-semibold uppercase tracking-widest dark:text-emerald-400 text-emerald-600">
                                System Online
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold text-surface-50">
                            {greeting}! <span className="text-surface-400 font-normal">Ready to process?</span>
                        </h2>
                        <p className="text-surface-400 text-sm max-w-lg">
                            Your OMR processing engine is primed and ready. Start a new batch or review recent results below.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleNewBatch}
                                className="btn-glow flex items-center gap-2"
                            >
                                <Zap size={16} />
                                New Batch
                            </button>
                            <button
                                onClick={() => setPage('batches')}
                                className="btn-ghost flex items-center gap-2"
                            >
                                <FolderOpen size={16} />
                                View All Batches
                            </button>
                        </div>
                    </div>

                    {/* Decorative scanner illustration */}
                    <div className="hidden xl:flex items-center justify-center w-52 h-40 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-brand-600/5 rounded-2xl border border-brand-500/20" />
                        <div className="relative text-center space-y-2">
                            <FileStack size={48} className="text-brand-400/60 mx-auto" />
                            <p className="text-2xs text-brand-400/60 font-medium">Scan • Process • Report</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 3xl:gap-6">
                <StatCard
                    icon={FolderOpen}
                    label="Total Batches"
                    value={stats.totalBatches}
                    color="brand"
                    delay={0.1}
                />
                <StatCard
                    icon={FileStack}
                    label="Sheets Processed"
                    value={formatNumber(stats.totalSheetsProcessed)}
                    color="cyan"
                    delay={0.15}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Average Score"
                    value={stats.averageScore}
                    suffix="%"
                    color="emerald"
                    delay={0.2}
                />
                <StatCard
                    icon={Activity}
                    label="This Month"
                    value={formatNumber(stats.thisMonthActivity)}
                    suffix="sheets"
                    color="amber"
                    delay={0.25}
                />
            </div>

            {/* Recent Batches Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="glass-card overflow-hidden"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800/50">
                    <div>
                        <h3 className="text-sm font-semibold text-surface-100">Recent Batches</h3>
                        <p className="text-2xs text-surface-500 mt-0.5">Your latest exam processing sessions</p>
                    </div>
                    {recentBatches.length > 0 && (
                        <button
                            onClick={() => setPage('batches')}
                            className="flex items-center gap-1 text-2xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                        >
                            View All <ChevronRight size={14} />
                        </button>
                    )}
                </div>

                {recentBatches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6">
                        <div className="w-16 h-16 rounded-2xl bg-surface-800/40 flex items-center justify-center mb-4">
                            <FolderOpen size={32} className="text-surface-600" />
                        </div>
                        <h4 className="text-sm font-semibold text-surface-300 mb-1">No batches yet</h4>
                        <p className="text-2xs text-surface-500 mb-5 text-center max-w-xs">
                            Create your first batch to start processing OMR sheets and see results here.
                        </p>
                        <button
                            onClick={handleNewBatch}
                            className="btn-glow flex items-center gap-2 text-sm"
                        >
                            <Zap size={14} />
                            Create First Batch
                        </button>
                    </div>
                ) : (
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(5 * 64px + 48px)' }}>
                    <table className="data-table table-fixed w-full">
                        <colgroup>
                            <col style={{ width: '28%' }} />
                            <col style={{ width: '18%' }} />
                            <col style={{ width: '12%' }} />
                            <col style={{ width: '8%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '14%' }} />
                            <col style={{ width: '10%' }} />
                        </colgroup>
                        <thead className="sticky top-0 z-10">
                            <tr>
                                <th>Batch Name</th>
                                <th className="text-center">Subject</th>
                                <th className="text-center">Date</th>
                                <th className="text-center">Sheets</th>
                                <th className="text-center">Avg Score</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBatches.slice(0, 8).map((batch, i) => (
                                <motion.tr
                                    key={batch.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.35 + i * 0.05 }}
                                    className="group cursor-pointer"
                                    onClick={() => openBatchDetail(batch)}
                                >
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-surface-800/80 flex items-center justify-center text-surface-400 group-hover:bg-brand-500/15 group-hover:text-brand-400 transition-all">
                                                <FileStack size={16} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-surface-200 group-hover:text-brand-400 transition-colors">
                                                    {batch.name}
                                                </p>
                                                <p className="text-2xs text-surface-500">{batch.totalQuestions} questions</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center text-surface-400">{batch.subject}</td>
                                    <td className="text-center text-surface-400 font-mono text-2xs">{formatDate(batch.date)}</td>
                                    <td className="text-center">
                                        <span className="font-mono font-medium text-surface-300">{batch.totalSheets}</span>
                                    </td>
                                    <td className="text-center">
                                        {batch.averageScore ? (
                                            <span className="font-mono font-semibold text-surface-200">
                                                {formatPercentage(batch.averageScore)}
                                            </span>
                                        ) : (
                                            <span className="text-surface-600">—</span>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <StatusBadge status={batch.status} />
                                    </td>
                                    <td className="text-center">
                                        <Tooltip content="View details" side="left">
                                            <button className="p-1.5 rounded-lg text-surface-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all">
                                                <Eye size={16} />
                                            </button>
                                        </Tooltip>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                )}
            </motion.div>

            {/* Quick tips */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 3xl:gap-6"
            >
                {[
                    {
                        title: 'Scan at 300 DPI',
                        desc: 'For best results, scan your OMR sheets at 300 DPI in grayscale mode.',
                        icon: '🖨️'
                    },
                    {
                        title: 'Use Dark Pencil',
                        desc: 'HB or 2B pencils produce the clearest marks for accurate detection.',
                        icon: '✏️'
                    },
                    {
                        title: 'Keyboard Shortcuts',
                        desc: 'Press ? to view all shortcuts. Use Ctrl+N for new batch, Ctrl+K to search.',
                        icon: '⌨️',
                        action: true
                    }
                ].map((tip, i) => (
                    <div
                        key={i}
                        className="glass-card p-5 flex gap-4 items-start hover:border-surface-700/60"
                    >
                        <span className="text-2xl">{tip.icon}</span>
                        <div>
                            <h4 className="text-sm font-semibold text-surface-200 mb-1">{tip.title}</h4>
                            <p className="text-2xs text-surface-500 leading-relaxed">{tip.desc}</p>
                        </div>
                    </div>
                ))}
            </motion.div>
        </motion.div>
    )
}
