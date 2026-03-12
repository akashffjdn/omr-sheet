import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Plus,
    FileStack,
    CheckCircle2,
    Clock,
    Loader2,
    AlertCircle,
    MoreHorizontal,
    FolderOpen,
    BarChart3,
    Download,
    FileDown,
    Share2,
    Activity,
    XCircle,
    Pencil,
    Play,
    Upload,
    AlertTriangle,
    RotateCw,
    Copy,
    Archive,
    Trash2,
    Eye,
    X
} from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useDashboardStore, useAppStore, useBatchStore } from '@/stores'
import { formatDate, formatPercentage, cn } from '@/lib/utils'
import type { Batch } from '@/types'
import { toast } from '@/components/ui/Toast'
import { confirm as confirmDialog } from '@/components/ui/ConfirmDialog'
import { useExportStore } from '@/components/ui/ExportModal'
import { useBatchDetailStore } from '@/components/ui/BatchDetailModal'

// ============================================
// Status Badge
// ============================================
function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { cls: string; icon: React.ReactNode }> = {
        complete: { cls: 'badge-success', icon: <CheckCircle2 size={10} /> },
        processing: { cls: 'badge-info', icon: <Loader2 size={10} className="animate-spin" /> },
        draft: { cls: 'badge-warning', icon: <Clock size={10} /> },
        error: { cls: 'badge-danger', icon: <AlertCircle size={10} /> }
    }
    const c = config[status] || config.draft
    return (
        <span className={cn('inline-flex items-center gap-1', c.cls)}>
            {c.icon} {status}
        </span>
    )
}

// ============================================
// Menu Action Types & Definitions
// ============================================
interface MenuAction {
    id: string
    label: string
    icon: React.ReactNode
    destructive?: boolean
    onClick: (batch: Batch) => void
}

interface MenuSection {
    label?: string
    actions: MenuAction[]
}

function getMenuSections(
    batch: Batch,
    onClose: () => void
): MenuSection[] {
    const { setPage } = useAppStore.getState()
    const { setActiveBatch, setStep, resetWorkspace } = useBatchStore.getState()
    const { removeBatch, duplicateBatch, archiveBatch, updateBatchStatus } =
        useDashboardStore.getState()
    const status = batch.status

    // Helper: open batch workspace at a specific step
    const openAtStep = (step: number) => {
        resetWorkspace()
        setActiveBatch(batch)
        setStep(step)
        setPage('batch-workspace')
        onClose()
    }

    // --- Shared actions ---
    const viewDetails: MenuAction = {
        id: 'view-details',
        label: 'View Details',
        icon: <Eye size={15} />,
        onClick: (b) => {
            useBatchDetailStore.getState().open(b)
            onClose()
        }
    }
    const openBatch: MenuAction = {
        id: 'open',
        label: 'Open Batch',
        icon: <FolderOpen size={15} />,
        onClick: () => openAtStep(status === 'complete' ? 3 : status === 'processing' ? 2 : 0)
    }
    const duplicateAction: MenuAction = {
        id: 'duplicate',
        label: 'Duplicate Batch',
        icon: <Copy size={15} />,
        onClick: (b) => {
            duplicateBatch(b.id)
            toast.success('Batch Duplicated', `"${b.name}" has been duplicated as a draft.`)
            onClose()
        }
    }
    const deleteAction: MenuAction = {
        id: 'delete',
        label: 'Delete Batch',
        icon: <Trash2 size={15} />,
        destructive: true,
        onClick: (b) => {
            onClose()
            confirmDialog.delete(b.name, () => {
                removeBatch(b.id)
                toast.success('Batch Deleted', `"${b.name}" has been permanently removed.`)
            })
        }
    }

    // --- Build sections per status ---
    const sections: MenuSection[] = []
    sections.push({ actions: [viewDetails, openBatch] })

    if (status === 'complete') {
        sections.push({
            label: 'Results',
            actions: [
                {
                    id: 'view-results',
                    label: 'View Results',
                    icon: <BarChart3 size={15} />,
                    onClick: () => openAtStep(3)
                },
                {
                    id: 'download-report',
                    label: 'Download Report',
                    icon: <Download size={15} />,
                    onClick: (b) => {
                        onClose()
                        useExportStore.getState().open(b.name)
                    }
                },
                {
                    id: 'export-csv',
                    label: 'Export as CSV',
                    icon: <FileDown size={15} />,
                    onClick: (b) => {
                        onClose()
                        useExportStore.getState().open(b.name)
                    }
                },
                {
                    id: 'share-results',
                    label: 'Share Results',
                    icon: <Share2 size={15} />,
                    onClick: (b) => {
                        toast.info('Link Copied', `Share link for "${b.name}" copied to clipboard.`)
                        onClose()
                    }
                }
            ]
        })
        sections.push({
            label: 'Manage',
            actions: [
                duplicateAction,
                {
                    id: 'archive',
                    label: 'Archive Batch',
                    icon: <Archive size={15} />,
                    onClick: (b) => {
                        archiveBatch(b.id)
                        toast.info('Batch Archived', `"${b.name}" has been archived.`)
                        onClose()
                    }
                },
                deleteAction
            ]
        })
    }

    if (status === 'processing') {
        sections.push({
            label: 'Processing',
            actions: [
                {
                    id: 'view-progress',
                    label: 'View Progress',
                    icon: <Activity size={15} />,
                    onClick: () => openAtStep(2)
                },
                {
                    id: 'cancel-processing',
                    label: 'Cancel Processing',
                    icon: <XCircle size={15} />,
                    destructive: true,
                    onClick: (b) => {
                        onClose()
                        confirmDialog.cancel(b.name, () => {
                            updateBatchStatus(b.id, 'draft')
                            toast.warning('Processing Cancelled', `"${b.name}" has been reverted to draft.`)
                        })
                    }
                }
            ]
        })
    }

    if (status === 'draft') {
        sections.push({
            label: 'Setup',
            actions: [
                {
                    id: 'edit-setup',
                    label: 'Edit Setup',
                    icon: <Pencil size={15} />,
                    onClick: () => openAtStep(0)
                },
                {
                    id: 'import-sheets',
                    label: 'Import Sheets',
                    icon: <Upload size={15} />,
                    onClick: () => openAtStep(0)
                },
                {
                    id: 'start-processing',
                    label: 'Start Processing',
                    icon: <Play size={15} />,
                    onClick: (b) => {
                        updateBatchStatus(b.id, 'processing')
                        toast.info('Processing Started', `"${b.name}" is now being processed.`)
                        onClose()
                    }
                }
            ]
        })
        sections.push({
            label: 'Manage',
            actions: [duplicateAction, deleteAction]
        })
    }

    if (status === 'error') {
        sections.push({
            label: 'Recovery',
            actions: [
                {
                    id: 'view-error-log',
                    label: 'View Error Log',
                    icon: <AlertTriangle size={15} />,
                    onClick: () => openAtStep(2)
                },
                {
                    id: 'retry-processing',
                    label: 'Retry Processing',
                    icon: <RotateCw size={15} />,
                    onClick: (b) => {
                        updateBatchStatus(b.id, 'processing')
                        toast.info('Retrying Processing', `"${b.name}" processing has been restarted.`)
                        onClose()
                    }
                }
            ]
        })
        sections.push({
            label: 'Manage',
            actions: [duplicateAction, deleteAction]
        })
    }

    return sections
}


// ============================================
// Batch Context Menu Component
// ============================================
function BatchContextMenu({
    batch,
    onClose
}: {
    batch: Batch
    onClose: () => void
}) {
    const menuRef = useRef<HTMLDivElement>(null)
    const sections = getMenuSections(batch, onClose)

    // Close on Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [onClose])

    // Close on click outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose()
            }
        }
        // Delay listener to avoid closing instantly on the same click
        const timer = setTimeout(() => {
            window.addEventListener('mousedown', handleClick)
        }, 0)
        return () => {
            clearTimeout(timer)
            window.removeEventListener('mousedown', handleClick)
        }
    }, [onClose])

    return (
        <div ref={menuRef} className="context-menu" onClick={(e) => e.stopPropagation()}>
            {sections.map((section, si) => (
                <div key={si}>
                    {si > 0 && <div className="context-menu-divider" />}
                    {section.label && (
                        <div className="context-menu-label">{section.label}</div>
                    )}
                    {section.actions.map((action) => (
                        <button
                            key={action.id}
                            onClick={(e) => {
                                e.stopPropagation()
                                action.onClick(batch)
                            }}
                            className={cn(
                                'context-menu-item',
                                action.destructive && 'destructive'
                            )}
                        >
                            {action.icon}
                            <span>{action.label}</span>
                        </button>
                    ))}
                </div>
            ))}
        </div>
    )
}

// ============================================
// Main Page
// ============================================
export default function BatchesPage() {
    const { recentBatches } = useDashboardStore()
    const { setPage, searchQuery, setSearchQuery } = useAppStore()
    const [query, setQuery] = useState(searchQuery || '')
    const [filter, setFilter] = useState<string>('all')
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [visibleCount, setVisibleCount] = useState(12)

    // Consume & clear the global search query on mount
    useEffect(() => {
        if (searchQuery) {
            setQuery(searchQuery)
            setSearchQuery('')
        }
    }, [])

    const filtered = recentBatches.filter((b) => {
        if (filter !== 'all' && b.status !== filter) return false
        if (query && !b.name.toLowerCase().includes(query.toLowerCase())) return false
        return true
    })

    const visibleBatches = filtered.slice(0, visibleCount)
    const hasMore = filtered.length > visibleCount

    // Reset visible count when filters change
    useEffect(() => {
        setVisibleCount(12)
    }, [query, filter])

    const toggleMenu = useCallback((e: React.MouseEvent, batchId: string) => {
        e.stopPropagation()
        setOpenMenuId((prev) => (prev === batchId ? null : batchId))
    }, [])

    const closeMenu = useCallback(() => setOpenMenuId(null), [])

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Sticky toolbar */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="flex-shrink-0 px-6 py-4 border-b border-surface-800/40 bg-surface-950/80 backdrop-blur-xl"
            >
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-900/60 border border-surface-800/50 w-52 xl:w-64 3xl:w-80">
                        <Search size={16} className="text-surface-500" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by batch name..."
                            className="bg-transparent text-sm text-surface-200 placeholder:text-surface-600 outline-none w-full"
                        />
                    </div>

                    {/* Centered filters */}
                    <div className="flex-1 flex justify-center">
                        <div className="flex items-center gap-1 bg-surface-900/60 p-1 rounded-xl">
                            {['all', 'complete', 'processing', 'draft'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-lg text-2xs font-semibold uppercase tracking-wide transition-all',
                                        filter === f
                                            ? 'bg-brand-600/20 text-brand-400'
                                            : 'text-surface-500 hover:text-surface-300'
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* New Batch */}
                    <button
                        onClick={() => setPage('batch-workspace')}
                        className="btn-glow flex items-center gap-2 flex-shrink-0"
                    >
                        <Plus size={16} /> New Batch
                    </button>
                </div>
            </motion.div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 3xl:p-10 space-y-5 3xl:space-y-7">
            {/* Batch cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 5xl:grid-cols-5 gap-4 3xl:gap-5" style={{ overflow: 'visible' }}>
                {visibleBatches.map((batch, i) => {
                    const openStep = batch.status === 'complete' ? 3 : batch.status === 'processing' ? 2 : 0

                    return (
                        <motion.div
                            key={batch.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            onClick={() => {
                                useBatchStore.getState().resetWorkspace()
                                useBatchStore.getState().setActiveBatch(batch)
                                useBatchStore.getState().setStep(openStep)
                                setPage('batch-workspace')
                            }}
                            className={cn(
                                'glass-card p-5 cursor-pointer group hover:border-brand-500/30 transition-all',
                                openMenuId === batch.id && 'relative z-20 overflow-visible'
                            )}
                            style={openMenuId === batch.id ? { overflow: 'visible' } : undefined}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-surface-800/80 flex items-center justify-center text-surface-400 group-hover:bg-brand-500/15 group-hover:text-brand-400 transition-all">
                                        <FileStack size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-surface-200 group-hover:text-brand-400 transition-colors line-clamp-1">
                                            {batch.name}
                                        </h3>
                                        <p className="text-2xs text-surface-500">{batch.subject}</p>
                                    </div>
                                </div>
                                {/* Three-dot menu trigger */}
                                <div className="relative">
                                    <button
                                        onClick={(e) => toggleMenu(e, batch.id)}
                                        className={cn(
                                            'p-1.5 rounded-lg text-surface-600 hover:text-surface-300 hover:bg-surface-800/50 transition-all',
                                            openMenuId === batch.id
                                                ? 'opacity-100 bg-surface-800/50 text-surface-300'
                                                : 'opacity-0 group-hover:opacity-100'
                                        )}
                                    >
                                        <MoreHorizontal size={16} />
                                    </button>

                                    {/* Dropdown menu */}
                                    <AnimatePresence>
                                        {openMenuId === batch.id && (
                                            <BatchContextMenu
                                                batch={batch}
                                                onClose={closeMenu}
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div>
                                    <p className="text-2xs text-surface-500">Sheets</p>
                                    <p className="text-sm font-mono font-bold text-surface-300">{batch.totalSheets}</p>
                                </div>
                                <div>
                                    <p className="text-2xs text-surface-500">Avg Score</p>
                                    <p className="text-sm font-mono font-bold text-surface-300">
                                        {batch.averageScore ? formatPercentage(batch.averageScore) : '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-2xs text-surface-500">Questions</p>
                                    <p className="text-sm font-mono font-bold text-surface-300">{batch.totalQuestions}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <StatusBadge status={batch.status} />
                                <span className="text-2xs text-surface-600 font-mono">{formatDate(batch.date)}</span>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Show More */}
            {hasMore && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center"
                >
                    <button
                        onClick={() => setVisibleCount((prev) => prev + 12)}
                        className="btn-ghost inline-flex items-center gap-2 text-sm"
                    >
                        Show More ({filtered.length - visibleCount} remaining)
                    </button>
                </motion.div>
            )}

            {/* Result count */}
            {(query || filter !== 'all') && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                >
                    <span className="text-2xs text-surface-500">
                        Showing {filtered.length} of {recentBatches.length} batches
                    </span>
                    {(query || filter !== 'all') && (
                        <button
                            onClick={() => { setQuery(''); setFilter('all') }}
                            className="text-2xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
                        >
                            <X size={11} /> Clear filters
                        </button>
                    )}
                </motion.div>
            )}

            {filtered.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20"
                >
                    <div className="w-20 h-20 rounded-2xl bg-surface-800/40 flex items-center justify-center mx-auto mb-4">
                        <FolderOpen size={36} className="text-surface-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-surface-300">No batches found</h3>
                    <p className="text-sm text-surface-500 mt-1 mb-4">
                        {query
                            ? `No results for "${query}"`
                            : filter !== 'all'
                                ? `No ${filter} batches yet`
                                : 'Create your first batch to get started'
                        }
                    </p>
                    {(query || filter !== 'all') ? (
                        <button
                            onClick={() => { setQuery(''); setFilter('all') }}
                            className="btn-ghost text-sm inline-flex items-center gap-2"
                        >
                            <X size={14} /> Clear Filters
                        </button>
                    ) : (
                        <button
                            onClick={() => setPage('batch-workspace')}
                            className="btn-glow inline-flex items-center gap-2"
                        >
                            <Plus size={16} /> Create New Batch
                        </button>
                    )}
                </motion.div>
            )}
            </div>
        </div>
    )
}
