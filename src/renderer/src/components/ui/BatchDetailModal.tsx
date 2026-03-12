import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    FileStack,
    Calendar,
    BookOpen,
    CheckCircle2,
    Loader2,
    Clock,
    AlertCircle,
    TrendingUp,
    Users,
    Award,
    BarChart3,
    Copy,
    Pencil,
    Play
} from 'lucide-react'
import { create } from 'zustand'
import type { Batch } from '@/types'
import { formatDate, formatPercentage, cn } from '@/lib/utils'
import { useAppStore, useBatchStore } from '@/stores'

// ─── Modal Store ─────────────────────────────
interface BatchDetailStore {
    isOpen: boolean
    batch: Batch | null
    open: (batch: Batch) => void
    close: () => void
}

export const useBatchDetailStore = create<BatchDetailStore>((set) => ({
    isOpen: false,
    batch: null,
    open: (batch) => set({ isOpen: true, batch }),
    close: () => set({ isOpen: false, batch: null })
}))

// ─── Status Config ───────────────────────────
const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
    complete: {
        bg: 'bg-emerald-500/12',
        text: 'text-emerald-400',
        icon: <CheckCircle2 size={14} />,
        label: 'Completed'
    },
    processing: {
        bg: 'bg-brand-500/12',
        text: 'text-brand-400',
        icon: <Loader2 size={14} className="animate-spin" />,
        label: 'Processing'
    },
    draft: {
        bg: 'bg-amber-500/12',
        text: 'text-amber-400',
        icon: <Clock size={14} />,
        label: 'Draft'
    },
    error: {
        bg: 'bg-red-500/12',
        text: 'text-red-400',
        icon: <AlertCircle size={14} />,
        label: 'Error'
    }
}

// ─── Component ───────────────────────────────
export function BatchDetailModal() {
    const { isOpen, batch, close } = useBatchDetailStore()
    const { setPage } = useAppStore()
    const { resetWorkspace, setActiveBatch, setStep } = useBatchStore()

    if (!batch) return null

    const status = statusConfig[batch.status] || statusConfig.draft

    const openBatch = (step: number) => {
        resetWorkspace()
        setActiveBatch(batch)
        setStep(step)
        setPage('batch-workspace')
        close()
    }

    const infoPairs = [
        { icon: BookOpen, label: 'Subject', value: batch.subject },
        { icon: Calendar, label: 'Created', value: formatDate(batch.createdAt) },
        { icon: FileStack, label: 'Total Sheets', value: batch.totalSheets.toString() },
        { icon: BarChart3, label: 'Questions', value: batch.totalQuestions.toString() }
    ]

    const scorePairs = batch.status === 'complete'
        ? [
            { icon: TrendingUp, label: 'Average Score', value: formatPercentage(batch.averageScore || 0), color: 'text-brand-400' },
            { icon: Users, label: 'Pass Rate', value: formatPercentage(batch.passPercentage || 0), color: 'text-emerald-400' },
            { icon: Award, label: 'Highest Score', value: formatPercentage(Math.min(100, (batch.averageScore || 0) + 15)), color: 'text-amber-400' }
        ]
        : []

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={close}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-[201] flex items-center justify-center p-4"
                    >
                        <div className="w-full max-w-lg bg-surface-900 border border-surface-700/60 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="relative px-5 pt-5 pb-4 border-b border-surface-800/50">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 to-brand-400" />
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-brand-500/15 flex items-center justify-center text-brand-400">
                                            <FileStack size={22} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-surface-100">{batch.name}</h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-2xs font-semibold', status.bg, status.text)}>
                                                    {status.icon} {status.label}
                                                </span>
                                                <span className="text-2xs text-surface-500 font-mono">{formatDate(batch.date)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={close} className="text-surface-500 hover:text-surface-300 transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Info grid */}
                            <div className="px-5 py-4">
                                <h4 className="text-2xs font-semibold uppercase tracking-widest text-surface-500 mb-3">Details</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {infoPairs.map((item) => {
                                        const Icon = item.icon
                                        return (
                                            <div key={item.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-800/30 border border-surface-800/30">
                                                <Icon size={15} className="text-surface-500 flex-shrink-0" />
                                                <div>
                                                    <p className="text-2xs text-surface-500">{item.label}</p>
                                                    <p className="text-sm font-medium text-surface-200">{item.value}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Score section (only for complete) */}
                            {scorePairs.length > 0 && (
                                <div className="px-5 pb-4">
                                    <h4 className="text-2xs font-semibold uppercase tracking-widest text-surface-500 mb-3">Performance</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        {scorePairs.map((item) => {
                                            const Icon = item.icon
                                            return (
                                                <div key={item.label} className="text-center p-3 rounded-xl bg-surface-800/30 border border-surface-800/30">
                                                    <Icon size={16} className={cn('mx-auto mb-1.5', item.color)} />
                                                    <p className="text-lg font-bold text-surface-100">{item.value}</p>
                                                    <p className="text-2xs text-surface-500">{item.label}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2.5 px-5 py-4 border-t border-surface-800/50 bg-surface-950/30">
                                {batch.status === 'complete' && (
                                    <button
                                        onClick={() => openBatch(3)}
                                        className="btn-glow flex items-center gap-2 flex-1 justify-center"
                                    >
                                        <BarChart3 size={16} />
                                        View Results
                                    </button>
                                )}
                                {batch.status === 'draft' && (
                                    <>
                                        <button
                                            onClick={() => openBatch(0)}
                                            className="btn-glow flex items-center gap-2 flex-1 justify-center"
                                        >
                                            <Pencil size={16} />
                                            Edit Setup
                                        </button>
                                        <button
                                            onClick={() => openBatch(0)}
                                            className="btn-ghost flex items-center gap-2"
                                        >
                                            <Play size={16} />
                                            Start
                                        </button>
                                    </>
                                )}
                                {batch.status === 'processing' && (
                                    <button
                                        onClick={() => openBatch(2)}
                                        className="btn-glow flex items-center gap-2 flex-1 justify-center"
                                    >
                                        <Loader2 size={16} className="animate-spin" />
                                        View Progress
                                    </button>
                                )}
                                {batch.status === 'error' && (
                                    <button
                                        onClick={() => openBatch(2)}
                                        className="btn-glow flex items-center gap-2 flex-1 justify-center"
                                    >
                                        <AlertCircle size={16} />
                                        View Error Log
                                    </button>
                                )}
                                <button onClick={close} className="btn-ghost">
                                    Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
