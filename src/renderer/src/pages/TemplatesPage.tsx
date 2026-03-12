import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    Search,
    Trash2,
    KeyRound,
    Clock,
    FileText,
    X,
    Pencil,
    Plus
} from 'lucide-react'
import { useTemplateStore, useTemplateCreationStore, useAppStore } from '@/stores'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'
import { useConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { MasterSheetTemplate, AnswerOption } from '@/types'

export default function TemplatesPage() {
    const { templates, deleteTemplate } = useTemplateStore()
    const { loadTemplate } = useTemplateCreationStore()
    const { setPage } = useAppStore()
    const { open: openConfirm } = useConfirmDialog()
    const [search, setSearch] = useState('')
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const filtered = useMemo(() => {
        if (!search.trim()) return templates
        const q = search.toLowerCase()
        return templates.filter((t) =>
            t.name.toLowerCase().includes(q) ||
            (t.examName || '').toLowerCase().includes(q) ||
            (t.subject || '').toLowerCase().includes(q)
        )
    }, [templates, search])

    const selected = templates.find((t) => t.id === selectedId) || null

    const handleDelete = (t: MasterSheetTemplate) => {
        openConfirm({
            title: 'Delete Template',
            message: `Are you sure you want to delete "${t.name}"? This cannot be undone.`,
            confirmLabel: 'Delete',
            variant: 'danger',
            onConfirm: () => {
                deleteTemplate(t.id)
                if (selectedId === t.id) setSelectedId(null)
                toast.success(`Template "${t.name}" deleted`)
            }
        })
    }

    const handleEdit = (t: MasterSheetTemplate) => {
        loadTemplate(t)
        setPage('new-template')
    }

    const formatDate = (iso: string) => {
        const d = new Date(iso)
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const getAnswerSummary = (t: MasterSheetTemplate) => {
        const answered = t.answerKeys.filter((k) => {
            const a = k.correctAnswer
            return Array.isArray(a) ? a.length > 0 : a !== ''
        }).length
        return { answered, total: t.totalQuestions }
    }

    return (
        <div className="flex h-full overflow-hidden">
            {/* Left: Template list */}
            <div className="flex-[3] flex flex-col border-r border-surface-800/50">
                {/* Toolbar */}
                <div className="px-6 py-4 border-b border-surface-800/50">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search templates..."
                                className="input-field pl-9 pr-24 w-full"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="text-surface-500 hover:text-surface-300"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                                <span className="text-2xs font-medium text-surface-500">
                                    {filtered.length} of {templates.length}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setPage('new-template')}
                            className="btn-glow flex items-center gap-2 text-sm flex-shrink-0"
                        >
                            <Plus size={14} />
                            New Template
                        </button>
                    </div>
                </div>

                {/* Template list */}
                <div className="flex-1 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-6">
                            <KeyRound size={40} className="text-surface-700 mb-3" />
                            <p className="text-sm text-surface-400 font-medium">
                                {templates.length === 0 ? 'No templates yet' : 'No matching templates'}
                            </p>
                            <p className="text-2xs text-surface-600 mt-1 max-w-xs">
                                {templates.length === 0
                                    ? 'Go to a Batch Workspace, fill in the answer key, and save it as a template.'
                                    : 'Try a different search term.'}
                            </p>
                        </div>
                    ) : (
                        <div className="p-3 space-y-1">
                            {filtered.map((t) => {
                                const { answered, total } = getAnswerSummary(t)
                                const isSelected = selectedId === t.id
                                return (
                                    <motion.button
                                        key={t.id}
                                        onClick={() => setSelectedId(t.id)}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={cn(
                                            'w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all',
                                            isSelected
                                                ? 'bg-brand-500/10 border border-brand-500/30'
                                                : 'hover:bg-surface-800/40 border border-transparent'
                                        )}
                                    >
                                        <div className={cn(
                                            'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
                                            isSelected ? 'bg-brand-500/20' : 'bg-surface-800/60'
                                        )}>
                                            <KeyRound size={20} className={isSelected ? 'text-brand-400' : 'text-surface-500'} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                'text-sm font-semibold truncate',
                                                isSelected ? 'text-brand-400' : 'text-surface-200'
                                            )}>
                                                {t.name}
                                            </p>
                                            <div className="flex items-center gap-2 text-2xs text-surface-500 mt-0.5">
                                                <span className="font-mono">{total}Q</span>
                                                <span className="text-surface-700">|</span>
                                                <span className="dark:text-emerald-400 text-emerald-600 font-mono">{answered}/{total}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-2xs text-surface-600 flex-shrink-0">
                                            <Clock size={10} />
                                            {formatDate(t.createdAt)}
                                        </div>
                                    </motion.button>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Template detail / preview */}
            <div className="flex-[2] flex flex-col overflow-hidden">
                {selected ? (
                    <TemplateDetail
                        template={selected}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                        <FileText size={48} className="text-surface-700 mb-4" />
                        <p className="text-sm text-surface-400 font-medium">Select a template to preview</p>
                        <p className="text-2xs text-surface-600 mt-1">
                            Click on any template from the list to see its details and answer key.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

function TemplateDetail({
    template: t,
    onDelete,
    onEdit
}: {
    template: MasterSheetTemplate
    onDelete: (t: MasterSheetTemplate) => void
    onEdit: (t: MasterSheetTemplate) => void
}) {
    const formatDate = (iso: string) => {
        const d = new Date(iso)
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    const answered = t.answerKeys.filter((k) => {
        const a = k.correctAnswer
        return Array.isArray(a) ? a.length > 0 : a !== ''
    }).length

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-surface-800/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-surface-100">{t.name}</h3>
                        <div className="flex items-center gap-3 text-2xs text-surface-500 mt-1">
                            {t.examName && <span>{t.examName}</span>}
                            {t.subject && (
                                <>
                                    <span className="text-surface-700">|</span>
                                    <span>{t.subject}</span>
                                </>
                            )}
                            <span className="text-surface-700">|</span>
                            <span className="flex items-center gap-1">
                                <Clock size={10} />
                                {formatDate(t.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                    <button
                        onClick={() => onEdit(t)}
                        className="btn-ghost flex items-center gap-2 text-2xs"
                    >
                        <Pencil size={12} />
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(t)}
                        className="btn-ghost flex items-center gap-2 text-2xs text-red-400 hover:text-red-300"
                    >
                        <Trash2 size={12} />
                        Delete
                    </button>
                </div>
            </div>

            {/* Stats row */}
            <div className="px-6 py-3 border-b border-surface-800/30">
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center bg-surface-800/30 rounded-xl p-3">
                        <p className="text-lg font-bold font-mono text-brand-400">{t.totalQuestions}</p>
                        <p className="text-2xs text-surface-500">Questions</p>
                    </div>
                    <div className="text-center bg-surface-800/30 rounded-xl p-3">
                        <p className="text-lg font-bold font-mono dark:text-emerald-400 text-emerald-600">{answered}</p>
                        <p className="text-2xs text-surface-500">Answered</p>
                    </div>
                    <div className="text-center bg-surface-800/30 rounded-xl p-3">
                        <p className="text-lg font-bold font-mono text-surface-300">
                            {Math.round((answered / t.totalQuestions) * 100)}%
                        </p>
                        <p className="text-2xs text-surface-500">Complete</p>
                    </div>
                </div>
            </div>

            {/* Answer grid preview */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                <h4 className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                    Answer Key Preview
                </h4>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-1.5">
                    {t.answerKeys.map((k) => {
                        const ans = k.correctAnswer
                        const hasAnswer = Array.isArray(ans) ? ans.length > 0 : ans !== ''
                        const display = Array.isArray(ans) ? ans.join(', ') : ans
                        return (
                            <div
                                key={k.questionNo}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm',
                                    k.isBonus
                                        ? 'border-amber-500/20 bg-amber-500/5'
                                        : hasAnswer
                                            ? 'border-surface-800/40 bg-surface-800/20'
                                            : 'border-surface-800/20'
                                )}
                            >
                                <span className="text-2xs font-mono text-surface-500 w-7 text-right">{k.questionNo}.</span>
                                <span className={cn(
                                    'font-bold',
                                    hasAnswer ? 'text-brand-400' : 'text-surface-700'
                                )}>
                                    {hasAnswer ? display : '\u2014'}
                                </span>
                                {k.isBonus && (
                                    <span className="dark:text-amber-400 text-amber-600 text-2xs font-semibold ml-auto">BONUS</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
