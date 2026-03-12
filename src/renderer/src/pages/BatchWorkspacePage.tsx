import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Settings2,
    KeyRound,
    BarChart3,
    Check,
    ChevronRight,
    Upload,
    FolderOpen,
    Plus,
    Minus,
    Trash2,
    Star,
    FileSpreadsheet,
    ScanLine,
    Grid3X3,
    Zap,
    ImageIcon,
    Info,
    Loader2,
    X,
    CheckCircle2,
    RefreshCw,
    File,
    Save,
    Clock,
    ToggleLeft,
    ToggleRight,
    Search
} from 'lucide-react'
import { useBatchStore, useAppStore, useTemplateStore } from '@/stores'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'
import { useConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { AnswerOption, AnswerKey, Section, MasterSheetTemplate } from '@/types'

// ============================================
// Wizard steps definition
// ============================================
const steps = [
    { id: 0, label: 'Setup & Import', icon: Settings2, description: 'Configure exam and import sheets' },
    { id: 1, label: 'Answer Key', icon: KeyRound, description: 'Set the correct answers' },
    { id: 2, label: 'Preview & Validate', icon: ScanLine, description: 'Review and process sheets' },
    { id: 3, label: 'Results', icon: BarChart3, description: 'View scores and reports' }
]

// ============================================
// Stepper Component
// ============================================
function Stepper({ current, onStep }: { current: number; onStep: (s: number) => void }) {
    return (
        <div className="flex items-center justify-center gap-1 px-6 py-4 border-b border-surface-800/50 bg-surface-950/50 backdrop-blur-sm overflow-x-auto">
            {steps.map((step, i) => {
                const Icon = step.icon
                const isActive = current === i
                const isDone = current > i
                const isClickable = i <= current

                return (
                    <div key={step.id} className="flex items-center">
                        <button
                            onClick={() => isClickable && onStep(i)}
                            disabled={!isClickable}
                            className={cn(
                                'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group',
                                isActive && 'bg-brand-600/15 border border-brand-500/25',
                                isDone && 'hover:bg-surface-800/50',
                                !isClickable && 'opacity-40 cursor-not-allowed',
                                isClickable && !isActive && 'hover:bg-surface-800/30 cursor-pointer'
                            )}
                        >
                            <div
                                className={cn(
                                    'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all',
                                    isActive && 'bg-brand-500 text-white shadow-lg shadow-brand-500/25',
                                    isDone && 'bg-emerald-500/20 text-emerald-400',
                                    !isActive && !isDone && 'bg-surface-800 text-surface-500'
                                )}
                            >
                                {isDone ? <Check size={16} /> : <Icon size={16} />}
                            </div>
                            <div className="hidden lg:block text-left">
                                <p className={cn(
                                    'text-sm font-semibold',
                                    isActive ? 'text-brand-400' : isDone ? 'text-emerald-400' : 'text-surface-500'
                                )}>
                                    {step.label}
                                </p>
                                <p className="text-2xs text-surface-600 whitespace-nowrap">{step.description}</p>
                            </div>
                        </button>
                        {i < steps.length - 1 && (
                            <ChevronRight size={16} className="mx-1 text-surface-700 flex-shrink-0" />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// ============================================
// Step 1: Setup & Import
// ============================================
function SetupStep() {
    const {
        markingScheme, setMarkingScheme,
        examName, setExamName,
        subject, setSubject,
        totalQuestions, setTotalQuestions,
        examDate, setExamDate,
        importedFiles, importedFullPaths, setImportedFiles,
        folderPath, setFolderPath
    } = useBatchStore()
    const [showSections, setShowSections] = useState(false)
    const [isScanning, setIsScanning] = useState(false)
    const [isDragHover, setIsDragHover] = useState(false)

    const handleBrowseFolder = async () => {
        setIsScanning(true)
        try {
            const result = await window.api.selectFolder()
            if (!result.canceled && result.files.length > 0) {
                setImportedFiles(result.files, result.fullPaths || [])
                setFolderPath(result.folderPath || null)
            }
        } catch (err) {
            console.error('Failed to select folder:', err)
        } finally {
            setIsScanning(false)
        }
    }

    const handleClearFiles = () => {
        useConfirmDialog.getState().open({
            title: 'Clear All Sheets',
            message: `Remove all ${importedFiles.length} imported sheets? You'll need to re-import them.`,
            confirmLabel: 'Clear All',
            variant: 'warning',
            onConfirm: () => {
                setImportedFiles([], [])
                setFolderPath(null)
                toast.info('Files Cleared', 'All imported sheets removed')
            }
        })
    }

    const getFileExtension = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase() || ''
        return ext
    }

    const addSection = () => {
        const newSection: Section = {
            id: crypto.randomUUID(),
            name: `Section ${markingScheme.sections.length + 1}`,
            startQuestion: 1,
            endQuestion: 25,
            correctMarks: 4,
            incorrectMarks: -1
        }
        setMarkingScheme({ sections: [...markingScheme.sections, newSection] })
    }

    const removeSection = (id: string) => {
        setMarkingScheme({ sections: markingScheme.sections.filter((s) => s.id !== id) })
    }

    return (
        <div className="flex flex-col gap-4 p-6 h-full overflow-hidden">
            {/* Row 1: Exam Config + Import Sheets — same height */}
            <div className="flex gap-4 min-h-0" style={{ flex: '0 0 auto', maxHeight: '45%' }}>
                {/* Exam Configuration */}
                <div className="flex-[3] glass-card p-5 space-y-4 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1">
                        <Settings2 size={18} className="text-brand-400" />
                        <h3 className="text-sm font-semibold text-surface-200">Exam Configuration</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                                Exam Name
                            </label>
                            <input
                                type="text"
                                value={examName}
                                onChange={(e) => setExamName(e.target.value)}
                                placeholder="e.g., JEE Main Mock Test — Set A"
                                className={cn('input-field', !examName.trim() && 'border-amber-500/30')}
                            />
                            {!examName.trim() && (
                                <p className="text-2xs text-amber-400 mt-1">Required</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                                Subject
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g., Physics + Chemistry + Maths"
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                                Exam Date
                            </label>
                            <input
                                type="date"
                                value={examDate}
                                onChange={(e) => setExamDate(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                                Total Questions
                            </label>
                            <input
                                type="number"
                                value={totalQuestions}
                                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                                className={cn('input-field font-mono', totalQuestions < 1 && 'border-amber-500/30')}
                                min={1}
                                max={300}
                            />
                            {totalQuestions < 1 && (
                                <p className="text-2xs text-amber-400 mt-1">At least 1 required</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Import Scanned Sheets */}
                <div className="flex-[2] glass-card p-5 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Upload size={18} className="text-cyan-400" />
                            <h3 className="text-sm font-semibold text-surface-200">Import Scanned Sheets</h3>
                        </div>
                        {folderPath && (
                            <div className="flex items-center gap-1.5 max-w-[50%]" title={folderPath}>
                                <FolderOpen size={12} className="text-surface-500 flex-shrink-0" />
                                <p className="text-2xs text-surface-500 font-mono truncate">
                                    {folderPath}
                                </p>
                            </div>
                        )}
                    </div>

                    {isScanning ? (
                        /* Scanning / Loading State */
                        <div className="flex-1 flex flex-col items-center justify-center gap-3">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <Loader2 size={36} className="text-brand-400" />
                            </motion.div>
                            <p className="text-sm font-semibold text-surface-300">Scanning folder…</p>
                            <p className="text-2xs text-surface-600">Looking for image files</p>
                        </div>
                    ) : importedFiles.length === 0 ? (
                        /* Empty / Drop Zone State */
                        <div
                            onClick={handleBrowseFolder}
                            onDragOver={(e) => { e.preventDefault(); setIsDragHover(true) }}
                            onDragLeave={() => setIsDragHover(false)}
                            onDrop={(e) => { e.preventDefault(); setIsDragHover(false); handleBrowseFolder() }}
                            className={cn(
                                'drop-zone flex-1 flex flex-col items-center justify-center cursor-pointer transition-all duration-300',
                                isDragHover && 'border-brand-400 bg-brand-500/10 scale-[1.02]'
                            )}
                        >
                            <motion.div
                                animate={isDragHover ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <FolderOpen size={36} className={cn(
                                    'mb-2 transition-colors',
                                    isDragHover ? 'text-brand-400' : 'text-surface-600'
                                )} />
                            </motion.div>
                            <p className="text-sm font-semibold text-surface-300">Click to select images</p>
                            <p className="text-2xs text-surface-600 mt-1">Supports .jpg, .png, .tif — 300 DPI recommended</p>
                        </div>
                    ) : (
                        /* Files Imported State */
                        <div className="flex flex-col flex-1 min-h-0 gap-2">
                            {/* Header with count and actions */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                    >
                                        <CheckCircle2 size={16} className="text-emerald-400" />
                                    </motion.div>
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-sm font-semibold text-emerald-400"
                                    >
                                        {importedFiles.length} sheets imported
                                    </motion.span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleClearFiles}
                                        className="flex items-center gap-1 text-2xs font-semibold text-surface-500 hover:text-red-400 transition-colors"
                                        title="Clear all imported sheets"
                                    >
                                        <X size={12} />
                                        Clear
                                    </button>
                                    <button
                                        onClick={handleBrowseFolder}
                                        className="flex items-center gap-1 text-2xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                                    >
                                        <RefreshCw size={12} />
                                        Change Folder
                                    </button>
                                </div>
                            </div>

                            {/* File grid with actual image thumbnails */}
                            <div className="grid grid-cols-3 gap-2 flex-1 overflow-y-auto pr-1">
                                {importedFiles.map((file, i) => {
                                    const fullPath = importedFullPaths[i]
                                    return (
                                        <motion.div
                                            key={file}
                                            initial={{ opacity: 0, scale: 0.85, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ delay: Math.min(i * 0.02, 0.6), duration: 0.3, ease: 'easeOut' }}
                                            className="relative group"
                                        >
                                            <div className="aspect-square rounded-lg bg-surface-800/60 border border-surface-700/40 flex items-center justify-center overflow-hidden group-hover:border-brand-500/30 group-hover:bg-surface-800/80 transition-all duration-200">
                                                {fullPath ? (
                                                    <img
                                                        src={`omr-local://${fullPath.replace(/\\/g, '/')}`}
                                                        alt={file}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex flex-col items-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-surface-600"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>'
                                                        }}
                                                    />
                                                ) : (
                                                    <ImageIcon size={16} className="text-surface-600" />
                                                )}
                                            </div>
                                            <p className="text-2xs text-surface-500 mt-0.5 truncate text-center font-mono group-hover:text-surface-300 transition-colors">
                                                {file}
                                            </p>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Row 2: Marking Scheme + Batch Summary — fill remaining, same height */}
            <div className="flex gap-4 flex-1 min-h-0">
                {/* Marking Scheme */}
                <div className="flex-[3] glass-card p-5 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Grid3X3 size={18} className="text-emerald-400" />
                            <h3 className="text-sm font-semibold text-surface-200">Marking Scheme</h3>
                        </div>
                        <button
                            onClick={() => setShowSections(!showSections)}
                            className={cn(
                                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all',
                                showSections
                                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25'
                                    : 'bg-surface-800/50 text-surface-400 hover:text-surface-300'
                            )}
                        >
                            Section-wise Marking
                            <div className={cn(
                                'w-[34px] h-[18px] rounded-full transition-all duration-300 relative',
                                showSections ? 'bg-brand-500' : 'bg-surface-700'
                            )}>
                                <div className={cn(
                                    'w-3.5 h-3.5 rounded-full bg-white absolute top-[2px] transition-all duration-300',
                                    showSections ? 'left-[17px]' : 'left-[2px]'
                                )} />
                            </div>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                                    Correct Answer
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 text-sm font-bold">+</span>
                                    <input
                                        type="number"
                                        value={markingScheme.correctMarks}
                                        onChange={(e) => setMarkingScheme({ correctMarks: Number(e.target.value) })}
                                        className="input-field pl-7 font-mono text-emerald-400"
                                        step="0.25"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                                    Incorrect Answer
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={markingScheme.incorrectMarks}
                                        onChange={(e) => setMarkingScheme({ incorrectMarks: Number(e.target.value) })}
                                        className="input-field font-mono text-red-400"
                                        step="0.25"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
                                    Blank / Unattempted
                                </label>
                                <input
                                    type="number"
                                    value={markingScheme.blankMarks}
                                    onChange={(e) => setMarkingScheme({ blankMarks: Number(e.target.value) })}
                                    className="input-field font-mono text-surface-400"
                                    step="0.25"
                                />
                            </div>
                        </div>

                        {/* Multi-response rule */}
                        <div>
                            <label className="block text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                                Multiple Response Rule
                            </label>
                            <div className="flex gap-2">
                                {[
                                    { value: 'incorrect', label: 'Mark as Incorrect', desc: 'Apply negative marks' },
                                    { value: 'blank', label: 'Mark as Blank', desc: 'Treat as unattempted' }
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setMarkingScheme({ multiResponseRule: opt.value as any })}
                                        className={cn(
                                            'flex-1 p-3 rounded-xl border text-left transition-all',
                                            markingScheme.multiResponseRule === opt.value
                                                ? 'border-brand-500/40 bg-brand-500/10'
                                                : 'border-surface-800/50 hover:border-surface-700'
                                        )}
                                    >
                                        <p className={cn(
                                            'text-sm font-semibold',
                                            markingScheme.multiResponseRule === opt.value ? 'text-brand-400' : 'text-surface-300'
                                        )}>
                                            {opt.label}
                                        </p>
                                        <p className="text-2xs text-surface-500 mt-0.5">{opt.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section-wise marking */}
                        <AnimatePresence>
                            {showSections && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-3 overflow-hidden"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-2xs font-semibold text-surface-400 uppercase tracking-wider">
                                            Sections
                                        </p>
                                        <button
                                            onClick={addSection}
                                            className="flex items-center gap-1.5 text-2xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                                        >
                                            <Plus size={14} /> Add Section
                                        </button>
                                    </div>

                                    {markingScheme.sections.map((section) => (
                                        <div key={section.id} className="flex items-center gap-3 bg-surface-800/30 p-3 rounded-xl flex-wrap">
                                            <input
                                                type="text"
                                                value={section.name}
                                                onChange={(e) => {
                                                    const updated = markingScheme.sections.map(s => s.id === section.id ? { ...s, name: e.target.value } : s)
                                                    setMarkingScheme({ sections: updated })
                                                }}
                                                className="input-field w-32 text-2xs py-1.5 px-2.5"
                                                placeholder="Section name"
                                            />
                                            <div className="flex items-center gap-2 text-2xs text-surface-500">
                                                <span>Q</span>
                                                <input
                                                    type="number"
                                                    value={section.startQuestion}
                                                    onChange={(e) => {
                                                        const updated = markingScheme.sections.map(s => s.id === section.id ? { ...s, startQuestion: Number(e.target.value) } : s)
                                                        setMarkingScheme({ sections: updated })
                                                    }}
                                                    className="input-field w-16 text-2xs py-1.5 px-2 font-mono"
                                                />
                                                <span>to</span>
                                                <input
                                                    type="number"
                                                    value={section.endQuestion}
                                                    onChange={(e) => {
                                                        const updated = markingScheme.sections.map(s => s.id === section.id ? { ...s, endQuestion: Number(e.target.value) } : s)
                                                        setMarkingScheme({ sections: updated })
                                                    }}
                                                    className="input-field w-16 text-2xs py-1.5 px-2 font-mono"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 text-2xs text-surface-500">
                                                <span className="text-emerald-400">+</span>
                                                <input
                                                    type="number"
                                                    value={section.correctMarks}
                                                    onChange={(e) => {
                                                        const updated = markingScheme.sections.map(s => s.id === section.id ? { ...s, correctMarks: Number(e.target.value) } : s)
                                                        setMarkingScheme({ sections: updated })
                                                    }}
                                                    className="input-field w-16 text-2xs py-1.5 px-2 font-mono text-emerald-400"
                                                    step="0.25"
                                                />
                                                <span className="text-red-400">−</span>
                                                <input
                                                    type="number"
                                                    value={Math.abs(section.incorrectMarks)}
                                                    onChange={(e) => {
                                                        const updated = markingScheme.sections.map(s => s.id === section.id ? { ...s, incorrectMarks: -Math.abs(Number(e.target.value)) } : s)
                                                        setMarkingScheme({ sections: updated })
                                                    }}
                                                    className="input-field w-16 text-2xs py-1.5 px-2 font-mono text-red-400"
                                                    step="0.25"
                                                />
                                            </div>
                                            <button
                                                onClick={() => removeSection(section.id)}
                                                className="p-1.5 rounded-lg text-surface-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    {markingScheme.sections.length === 0 && (
                                        <div className="text-center py-4 text-surface-600 text-sm">
                                            <Info size={20} className="mx-auto mb-2 opacity-50" />
                                            No sections added yet. Click "Add Section" to create one.
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Batch Summary */}
                <div className="flex-[2] glass-card p-5 overflow-y-auto">
                    <h4 className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                        Batch Summary
                    </h4>
                    <div className="space-y-2.5">
                        {[
                            { label: 'Exam', value: examName || '—' },
                            { label: 'Subject', value: subject || '—' },
                            { label: 'Questions', value: totalQuestions },
                            { label: 'Sheets', value: importedFiles.length || '—' },
                            { label: 'Correct', value: `+${markingScheme.correctMarks}` },
                            { label: 'Incorrect', value: markingScheme.incorrectMarks },
                            { label: 'Sections', value: showSections ? markingScheme.sections.length : 'Off' }
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between">
                                <span className="text-2xs text-surface-500">{item.label}</span>
                                <span className="text-sm font-medium text-surface-300 font-mono">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ============================================
// Step 2: Answer Key
// ============================================
function AnswerKeyStep() {
    const {
        activeBatch, totalQuestions: storeTotalQ, markingScheme,
        answerKeys, setAnswerKeys, updateAnswer: storeUpdateAnswer, toggleBonus: storeToggleBonus
    } = useBatchStore()
    const [activeTab, setActiveTab] = useState<'manual' | 'excel' | 'scan'>('manual')
    const totalQ = storeTotalQ || activeBatch?.totalQuestions || 100
    const [multiAnswerMode, setMultiAnswerMode] = useState(false)
    // File upload local state (doesn't need persistence)
    const [excelFileName, setExcelFileName] = useState<string | null>(null)
    const [excelFilePath, setExcelFilePath] = useState<string | null>(null)
    const [masterSheetFileName, setMasterSheetFileName] = useState<string | null>(null)
    const [masterSheetFilePath, setMasterSheetFilePath] = useState<string | null>(null)
    const [isLoadingExcel, setIsLoadingExcel] = useState(false)
    const [isLoadingScan, setIsLoadingScan] = useState(false)

    // Initialize answer keys in store when totalQ changes or on first mount
    useEffect(() => {
        if (answerKeys.length !== totalQ) {
            const existing = new Map(answerKeys.map((k) => [k.questionNo, k]))
            const keys: AnswerKey[] = Array.from({ length: totalQ }, (_, i) => {
                const qNo = i + 1
                if (existing.has(qNo)) return existing.get(qNo)!
                // Pre-populate for existing batches
                if (activeBatch && (activeBatch.status === 'complete' || activeBatch.status === 'processing')) {
                    const opts: AnswerOption[] = ['A', 'B', 'C', 'D']
                    return { questionNo: qNo, correctAnswer: opts[Math.floor(Math.abs(Math.sin(qNo * 7 + totalQ)) * 4)], isBonus: false }
                }
                return { questionNo: qNo, correctAnswer: '' as AnswerOption, isBonus: false }
            })
            setAnswerKeys(keys)
        }
    }, [totalQ])

    // Dynamic options based on template optionCount (supports A-E)
    const options: AnswerOption[] = useMemo(() => {
        // Check if any section has optionCount 5
        const hasE = markingScheme.sections.some((_s) => false) // extend later with template optionCount
        return hasE ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D']
    }, [markingScheme.sections])

    // Build a lookup from answerKeys for fast access
    const answerMap = useMemo(() => {
        const map: Record<number, AnswerKey> = {}
        answerKeys.forEach((k) => { map[k.questionNo] = k })
        return map
    }, [answerKeys])

    const visibleQuestions = useMemo(() => {
        return Array.from({ length: totalQ }, (_, i) => i + 1)
    }, [totalQ])

    const getAnswer = (q: number): AnswerOption | AnswerOption[] => {
        return answerMap[q]?.correctAnswer || ''
    }

    const isSelected = (q: number, opt: AnswerOption): boolean => {
        const ans = getAnswer(q)
        if (Array.isArray(ans)) return ans.includes(opt)
        return ans === opt
    }

    const isBonus = (q: number): boolean => answerMap[q]?.isBonus || false
    const hasAnswer = (q: number): boolean => {
        const ans = getAnswer(q)
        return Array.isArray(ans) ? ans.length > 0 : ans !== ''
    }
    const isMulti = (q: number): boolean => {
        const ans = getAnswer(q)
        return Array.isArray(ans) && ans.length > 1
    }

    const answeredCount = answerKeys.filter((k) => {
        const ans = k.correctAnswer
        return Array.isArray(ans) ? ans.length > 0 : ans !== ''
    }).length
    const bonusCount = answerKeys.filter((k) => k.isBonus).length
    const multiAnswerCount = answerKeys.filter((k) => Array.isArray(k.correctAnswer) && k.correctAnswer.length > 1).length

    const toggleAnswer = (q: number, opt: AnswerOption) => {
        if (multiAnswerMode) {
            const current = getAnswer(q)
            const arr = Array.isArray(current) ? [...current] : (current ? [current] : [])
            const idx = arr.indexOf(opt)
            if (idx >= 0) arr.splice(idx, 1)
            else arr.push(opt)
            storeUpdateAnswer(q, arr.length === 0 ? '' as AnswerOption : arr.length === 1 ? arr[0] : arr)
        } else {
            const current = getAnswer(q)
            const singleCurrent = Array.isArray(current) ? current[0] : current
            storeUpdateAnswer(q, singleCurrent === opt ? '' as AnswerOption : opt)
        }
    }

    const toggleBonus = (q: number) => storeToggleBonus(q)

    const handleUploadExcel = async () => {
        setIsLoadingExcel(true)
        try {
            const result = await window.api.selectFile({
                title: 'Select Answer Key Excel File',
                filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls', 'csv'] }]
            })
            if (!result.canceled && result.fileNames && result.fileNames.length > 0) {
                setExcelFileName(result.fileNames[0])
                setExcelFilePath(result.filePaths[0] || null)
            }
        } catch (err) {
            console.error('Failed to select Excel file:', err)
        } finally {
            setIsLoadingExcel(false)
        }
    }

    const handleUploadMasterSheet = async () => {
        setIsLoadingScan(true)
        try {
            const result = await window.api.selectFile({
                title: 'Select Master OMR Sheet',
                filters: [{ name: 'Image Files', extensions: ['jpg', 'jpeg', 'png', 'tif', 'tiff', 'bmp'] }]
            })
            if (!result.canceled && result.fileNames && result.fileNames.length > 0) {
                setMasterSheetFileName(result.fileNames[0])
                setMasterSheetFilePath(result.filePaths[0] || null)
            }
        } catch (err) {
            console.error('Failed to select master sheet:', err)
        } finally {
            setIsLoadingScan(false)
        }
    }

    const handleClearExcel = () => {
        setExcelFileName(null)
        setExcelFilePath(null)
    }

    const handleClearMasterSheet = () => {
        setMasterSheetFileName(null)
        setMasterSheetFilePath(null)
    }

    return (
        <div className="p-6 h-full flex flex-col overflow-hidden gap-4">
            {/* Tab bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-surface-900/60 p-1 rounded-xl w-fit">
                    {[
                        { id: 'manual', label: 'Manual Entry', icon: Grid3X3 },
                        { id: 'excel', label: 'Upload Excel', icon: FileSpreadsheet },
                        { id: 'scan', label: 'Use Template', icon: KeyRound }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as any)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                activeTab === id
                                    ? 'bg-brand-600/20 text-brand-400 shadow-sm'
                                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                            )}
                        >
                            <Icon size={16} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Multi-answer toggle (only on manual tab) */}
                {activeTab === 'manual' && (
                    <button
                        onClick={() => setMultiAnswerMode(!multiAnswerMode)}
                        className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-2xs font-semibold transition-all',
                            multiAnswerMode
                                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                                : 'bg-surface-800/50 text-surface-400 hover:text-surface-300'
                        )}
                    >
                        {multiAnswerMode ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        Multi-Answer
                    </button>
                )}
            </div>


            {activeTab === 'manual' && (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-0 overflow-hidden">
                    {/* Answer grid */}
                    <div className="xl:col-span-3 glass-card p-6 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-semibold text-surface-200">Answer Grid</h3>
                                <p className="text-2xs text-surface-500 mt-0.5">
                                    Click to select the correct answer. Star icon marks bonus questions.
                                    {multiAnswerMode && <span className="text-cyan-400 ml-1">(Multi-answer mode active)</span>}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-brand-400 font-mono">{answeredCount}</span>
                                <span className="text-sm text-surface-500">/{totalQ}</span>
                                <p className="text-2xs text-surface-500">answered</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2 flex-1 overflow-y-auto pr-2">
                            {visibleQuestions.map((q) => (
                                <div
                                    key={q}
                                    className={cn(
                                        'flex items-center gap-2 p-2 rounded-xl border transition-all',
                                        isBonus(q)
                                            ? 'border-amber-500/30 bg-amber-500/5'
                                            : isSelected(q, '' as any) ? 'border-surface-800/30'
                                                : getAnswer(q) !== '' ? 'border-surface-700/40 bg-surface-800/20'
                                                    : 'border-surface-800/30'
                                    )}
                                >
                                    <span className="text-2xs font-mono text-surface-500 w-7 text-right">{q}.</span>
                                    <div className="flex gap-1">
                                        {options.map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => toggleAnswer(q, opt)}
                                                className={cn(
                                                    'w-8 h-8 rounded-lg text-xs font-bold transition-all duration-200',
                                                    isSelected(q, opt)
                                                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 scale-105'
                                                        : 'bg-surface-800/60 text-surface-400 hover:bg-surface-700/60 hover:text-surface-200'
                                                )}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => toggleBonus(q)}
                                        className={cn(
                                            'p-1 rounded transition-all',
                                            isBonus(q)
                                                ? 'text-amber-400'
                                                : 'text-surface-700 hover:text-surface-500'
                                        )}
                                    >
                                        <Star size={14} fill={isBonus(q) ? 'currentColor' : 'none'} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-4">
                        <div className="glass-card p-5">
                            <h4 className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                                Answer Key Summary
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-2xs text-surface-500">Total Questions</span>
                                    <span className="text-sm font-mono font-semibold text-surface-200">{totalQ}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xs text-surface-500">Answered</span>
                                    <span className="text-sm font-mono font-semibold text-emerald-400">{answeredCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xs text-surface-500">Remaining</span>
                                    <span className="text-sm font-mono font-semibold text-amber-400">{totalQ - answeredCount}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xs text-surface-500">Bonus Questions</span>
                                    <span className="text-sm font-mono font-semibold text-amber-400">{bonusCount}</span>
                                </div>
                                {multiAnswerMode && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xs text-surface-500">Mode</span>
                                        <span className="text-2xs font-semibold text-cyan-400">Multi-Answer</span>
                                    </div>
                                )}
                                {/* Save as template */}
                                {answeredCount > 0 && (
                                    <SaveAsTemplateCard
                                        totalQ={totalQ}
                                        answerKeys={answerKeys}
                                        markingScheme={markingScheme}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="glass-card p-5">
                            <h4 className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                                Legend
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-brand-500 text-white text-2xs font-bold flex items-center justify-center">A</div>
                                    <span className="text-2xs text-surface-400">Selected answer</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-surface-800/60 text-surface-400 text-2xs font-bold flex items-center justify-center">B</div>
                                    <span className="text-2xs text-surface-400">Unselected option</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star size={14} className="text-amber-400" fill="currentColor" />
                                    <span className="text-2xs text-surface-400">Bonus question</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'excel' && (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-0 overflow-hidden">
                    {/* Answer grid — left 3/4 */}
                    <div className="xl:col-span-3 glass-card p-6 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-semibold text-surface-200">Answer Key Preview</h3>
                                <p className="text-2xs text-surface-500 mt-0.5">Click star to toggle bonus mark</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-brand-400 font-mono">{answeredCount}</span>
                                <span className="text-sm text-surface-500">/{totalQ}</span>
                                <p className="text-2xs text-surface-500">answered</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2 flex-1 overflow-y-auto pr-2">
                            {answeredCount > 0 ? visibleQuestions.map((q) => (
                                <div
                                    key={q}
                                    className={cn(
                                        'flex items-center gap-2 p-2 rounded-xl border transition-all',
                                        isBonus(q)
                                            ? 'border-amber-500/30 bg-amber-500/5'
                                            : isMulti(q)
                                                ? 'border-cyan-500/30 bg-cyan-500/5'
                                                : hasAnswer(q) ? 'border-surface-700/40 bg-surface-800/20' : 'border-surface-800/30'
                                    )}
                                >
                                    <span className="text-2xs font-mono text-surface-500 w-7 text-right">{q}.</span>
                                    <div className="flex gap-1">
                                        {options.map((opt) => (
                                            <div
                                                key={opt}
                                                className={cn(
                                                    'w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center',
                                                    isSelected(q, opt)
                                                        ? isMulti(q)
                                                            ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                                                            : 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                                                        : 'bg-surface-800/60 text-surface-400'
                                                )}
                                            >
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => toggleBonus(q)}
                                        className={cn(
                                            'p-1 rounded transition-all flex-shrink-0',
                                            isBonus(q)
                                                ? 'text-amber-400 hover:text-amber-300'
                                                : 'text-surface-700 hover:text-amber-400/60'
                                        )}
                                        title={isBonus(q) ? 'Remove bonus mark' : 'Mark as bonus (full marks to all)'}
                                    >
                                        <Star size={14} fill={isBonus(q) ? 'currentColor' : 'none'} />
                                    </button>
                                </div>
                            )) : (
                                <div className="col-span-full flex flex-col items-center justify-center h-full text-center">
                                    <Grid3X3 size={40} className="text-surface-700 mb-3" />
                                    <p className="text-sm text-surface-400 font-medium">No answers yet</p>
                                    <p className="text-2xs text-surface-600 mt-1">Upload an Excel file to fill in answers</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right sidebar — 1/4 */}
                    <div className="space-y-4">
                        {/* Upload Excel */}
                        <div className="glass-card p-5">
                            <h4 className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                                Upload Excel
                            </h4>
                            <AnimatePresence mode="wait">
                                {isLoadingExcel ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center gap-2 py-4"
                                    >
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        >
                                            <Loader2 size={24} className="text-brand-400" />
                                        </motion.div>
                                        <p className="text-2xs font-semibold text-surface-300">Selecting file...</p>
                                    </motion.div>
                                ) : excelFileName ? (
                                    <motion.div
                                        key="selected"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                                                <FileSpreadsheet size={16} className="text-emerald-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1 mb-0.5">
                                                    <CheckCircle2 size={10} className="text-emerald-400" />
                                                    <span className="text-2xs font-semibold text-emerald-400">Selected</span>
                                                </div>
                                                <p className="text-2xs font-semibold text-surface-200 truncate">{excelFileName}</p>
                                            </div>
                                            <button
                                                onClick={handleClearExcel}
                                                className="p-1 rounded-lg text-surface-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                        <button onClick={handleUploadExcel} className="btn-ghost w-full mt-2 flex items-center justify-center gap-1.5 text-2xs">
                                            <RefreshCw size={12} />
                                            Change File
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={handleUploadExcel}
                                        className="drop-zone cursor-pointer hover:border-brand-400/40 hover:bg-brand-500/5 transition-all duration-300 flex flex-col items-center justify-center py-6"
                                    >
                                        <FileSpreadsheet size={28} className="text-surface-600 mb-2" />
                                        <p className="text-2xs font-semibold text-surface-300 text-center">
                                            Drop Excel file or click to browse
                                        </p>
                                        <p className="text-2xs text-surface-600 mt-1 text-center">
                                            .xlsx, .xls, .csv
                                        </p>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleUploadExcel() }}
                                            className="btn-ghost mt-2 flex items-center gap-1.5 text-2xs"
                                        >
                                            <Upload size={12} />
                                            Choose File
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {/* Save as template — inside upload card */}
                            {answeredCount > 0 && (
                                <SaveAsTemplateCard
                                    totalQ={totalQ}
                                    answerKeys={answerKeys}
                                    markingScheme={markingScheme}
                                />
                            )}
                        </div>

                        {/* Legend */}
                        <div className="glass-card p-5">
                            <h4 className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                                Legend
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-brand-500 text-white text-2xs font-bold flex items-center justify-center">A</div>
                                    <span className="text-2xs text-surface-400">Selected answer</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-surface-800/60 text-surface-400 text-2xs font-bold flex items-center justify-center">B</div>
                                    <span className="text-2xs text-surface-400">Unselected option</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star size={14} className="text-amber-400" fill="currentColor" />
                                    <span className="text-2xs text-surface-400">Bonus question</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'scan' && (
                <TemplateTab
                    totalQ={totalQ}
                    answerKeys={answerKeys}
                    setAnswerKeys={setAnswerKeys}
                    setTotalQuestions={useBatchStore.getState().setTotalQuestions}
                    toggleBonus={storeToggleBonus}
                />
            )}
        </div>
    )
}

// ============================================
// Save As Template Card (used in summary panel)
// ============================================
function SaveAsTemplateCard({ totalQ, answerKeys, markingScheme }: {
    totalQ: number
    answerKeys: AnswerKey[]
    markingScheme: any
}) {
    const { addTemplate } = useTemplateStore()
    const { examName, subject } = useBatchStore()
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState('')

    const handleSave = () => {
        const tName = name.trim() || `${examName || 'Untitled'} — ${new Date().toLocaleDateString()}`
        const template: MasterSheetTemplate = {
            id: crypto.randomUUID(),
            name: tName,
            createdAt: new Date().toISOString(),
            totalQuestions: totalQ,
            answerKeys: [...answerKeys],
            markingScheme: { ...markingScheme },
            examName: examName || undefined,
            subject: subject || undefined
        }
        addTemplate(template)
        toast.success(`Template "${tName}" saved`)
        setIsOpen(false)
        setName('')
    }

    return (
        <div className="pt-2">
            {isOpen ? (
                <div className="space-y-2">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={`${examName || 'Untitled'} — ${new Date().toLocaleDateString()}`}
                        className="input-field w-full text-2xs"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    />
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="btn-glow flex-1 text-2xs py-1.5">
                            Save
                        </button>
                        <button onClick={() => setIsOpen(false)} className="btn-ghost flex-1 text-2xs py-1.5">
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-brand-500/25 text-brand-400 text-2xs font-semibold hover:bg-brand-500/5 transition-all"
                >
                    <Save size={14} />
                    Save answers as reusable template
                </button>
            )}
        </div>
    )
}

// ============================================
// Template Tab (apply saved templates)
// ============================================
function TemplateTab({
    totalQ, answerKeys, setAnswerKeys, setTotalQuestions, toggleBonus: storeToggleBonus
}: {
    totalQ: number
    answerKeys: AnswerKey[]
    setAnswerKeys: (keys: AnswerKey[]) => void
    setTotalQuestions: (n: number) => void
    toggleBonus: (q: number) => void
}) {
    const { templates, applyTemplate } = useTemplateStore()
    const [templateSearch, setTemplateSearch] = useState('')

    const filteredTemplates = useMemo(() => {
        if (!templateSearch.trim()) return templates
        const q = templateSearch.toLowerCase()
        return templates.filter((t) => t.name.toLowerCase().includes(q))
    }, [templates, templateSearch])

    const handleApplyTemplate = (id: string) => {
        applyTemplate(id, setAnswerKeys, setTotalQuestions)
        const t = templates.find((t) => t.id === id)
        toast.success(`Template "${t?.name}" applied — ${t?.totalQuestions} questions loaded`)
    }

    const answeredCount = answerKeys.filter((k) => {
        const ans = k.correctAnswer
        return Array.isArray(ans) ? ans.length > 0 : ans !== ''
    }).length

    const bonusCount = answerKeys.filter((k) => k.isBonus).length

    const multiAnswerCount = answerKeys.filter((k) => Array.isArray(k.correctAnswer) && k.correctAnswer.length > 1).length

    const formatDate = (iso: string) => {
        const d = new Date(iso)
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    // Answer grid helpers
    const gridOptions: AnswerOption[] = ['A', 'B', 'C', 'D']
    const gridQuestions = useMemo(() => Array.from({ length: totalQ }, (_, i) => i + 1), [totalQ])
    const answerMap = useMemo(() => {
        const map: Record<number, AnswerKey> = {}
        answerKeys.forEach((k) => { map[k.questionNo] = k })
        return map
    }, [answerKeys])
    const getAnswer = (q: number): AnswerOption | AnswerOption[] => answerMap[q]?.correctAnswer || ''
    const isSelected = (q: number, opt: AnswerOption): boolean => {
        const ans = getAnswer(q)
        if (Array.isArray(ans)) return ans.includes(opt)
        return ans === opt
    }
    const hasAnswer = (q: number): boolean => {
        const ans = getAnswer(q)
        return Array.isArray(ans) ? ans.length > 0 : ans !== ''
    }
    const isBonus = (q: number): boolean => answerMap[q]?.isBonus || false
    const isMulti = (q: number): boolean => {
        const ans = getAnswer(q)
        return Array.isArray(ans) && ans.length > 1
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-0 overflow-hidden">
            {/* Answer grid — left 3/4 */}
            <div className="xl:col-span-3 glass-card p-6 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-semibold text-surface-200">Answer Key Preview</h3>
                        <p className="text-2xs text-surface-500 mt-0.5">Click star to toggle bonus mark</p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-brand-400 font-mono">{answeredCount}</span>
                        <span className="text-sm text-surface-500">/{totalQ}</span>
                        <p className="text-2xs text-surface-500">answered</p>
                    </div>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2 flex-1 overflow-y-auto pr-2">
                    {answeredCount > 0 ? gridQuestions.map((q) => (
                        <div
                            key={q}
                            className={cn(
                                'flex items-center gap-2 p-2 rounded-xl border transition-all',
                                isBonus(q)
                                    ? 'border-amber-500/30 bg-amber-500/5'
                                    : isMulti(q)
                                        ? 'border-cyan-500/30 bg-cyan-500/5'
                                        : hasAnswer(q) ? 'border-surface-700/40 bg-surface-800/20' : 'border-surface-800/30'
                            )}
                        >
                            <span className="text-2xs font-mono text-surface-500 w-7 text-right">{q}.</span>
                            <div className="flex gap-1">
                                {gridOptions.map((opt) => (
                                    <div
                                        key={opt}
                                        className={cn(
                                            'w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center',
                                            isSelected(q, opt)
                                                ? isMulti(q)
                                                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                                                    : 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                                                : 'bg-surface-800/60 text-surface-400'
                                        )}
                                    >
                                        {opt}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => storeToggleBonus(q)}
                                className={cn(
                                    'p-1 rounded transition-all flex-shrink-0',
                                    isBonus(q)
                                        ? 'text-amber-400 hover:text-amber-300'
                                        : 'text-surface-700 hover:text-amber-400/60'
                                )}
                                title={isBonus(q) ? 'Remove bonus mark' : 'Mark as bonus (full marks to all)'}
                            >
                                <Star size={14} fill={isBonus(q) ? 'currentColor' : 'none'} />
                            </button>
                        </div>
                    )) : (
                        <div className="col-span-full flex flex-col items-center justify-center h-full text-center">
                            <Grid3X3 size={40} className="text-surface-700 mb-3" />
                            <p className="text-sm text-surface-400 font-medium">No answers yet</p>
                            <p className="text-2xs text-surface-600 mt-1">Apply a template to load answers</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right sidebar — 1/4 */}
            <div className="glass-card p-5 overflow-y-auto">
                <h4 className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                    Saved Templates
                </h4>
                {templates.length > 0 && (
                    <div className="relative mb-3">
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-500" />
                        <input
                            type="text"
                            value={templateSearch}
                            onChange={(e) => setTemplateSearch(e.target.value)}
                            placeholder="Search templates..."
                            className="input-field w-full text-2xs pl-7 py-1.5"
                        />
                    </div>
                )}
                <div className="space-y-2">
                    {templates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-6">
                            <KeyRound size={28} className="text-surface-700 mb-2" />
                            <p className="text-2xs text-surface-500">Create templates from the Templates page.</p>
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-4">
                            <Search size={20} className="text-surface-700 mb-2" />
                            <p className="text-2xs text-surface-500">No templates match "{templateSearch}"</p>
                        </div>
                    ) : (
                        filteredTemplates.map((t) => {
                            const tAnswered = t.answerKeys.filter((k) => {
                                const a = k.correctAnswer
                                return Array.isArray(a) ? a.length > 0 : a !== ''
                            }).length
                            return (
                                <div
                                    key={t.id}
                                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-surface-800/40 hover:border-brand-500/25 hover:bg-surface-800/30 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                                        <KeyRound size={14} className="text-brand-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-2xs font-semibold text-surface-200 truncate">{t.name}</p>
                                        <div className="flex items-center gap-1.5 text-2xs text-surface-500 mt-0.5">
                                            <span className="font-mono">{t.totalQuestions}Q</span>
                                            <span className="text-surface-700">|</span>
                                            <span className="font-mono text-emerald-400">{tAnswered}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleApplyTemplate(t.id)}
                                        className="px-2.5 py-1 rounded-lg text-2xs font-semibold text-white bg-brand-500 hover:bg-brand-400 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        Use
                                    </button>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}

function PreviewStep() {
    const { activeBatch, totalQuestions: storeTotalQ, importedFiles: storeFiles, markingScheme } = useBatchStore()
    const isComplete = activeBatch?.status === 'complete'
    const sheetCount = storeFiles.length > 0 ? storeFiles.length : (activeBatch?.totalSheets || 12)
    const displayCount = Math.min(sheetCount, 30) // cap display

    const studentNames = ['Aarav Sharma', 'Priya Patel', 'Rohan Kumar', 'Sneha Gupta', 'Arjun Singh',
        'Kavya Nair', 'Vikram Reddy', 'Ananya Das', 'Ishaan Mehta', 'Disha Jain',
        'Rahul Verma', 'Meera Iyer', 'Aditya Rao', 'Pooja Mishra', 'Karan Chauhan',
        'Ritika Sinha', 'Siddharth Bose', 'Neha Kapoor', 'Akash Menon', 'Tanya Agarwal',
        'Harsh Pandey', 'Simran Kaur', 'Nikhil Joshi', 'Ritu Saxena', 'Manish Tiwari',
        'Deepika Rajan', 'Varun Shetty', 'Swati Dubey', 'Kunal Malhotra', 'Anjali Desai']

    const [selectedSheet, setSelectedSheet] = useState(0)
    const [sheetSearch, setSheetSearch] = useState('')
    const [sheetStatuses, setSheetStatuses] = useState<string[]>(() =>
        Array.from({ length: displayCount }, (_, i) =>
            isComplete ? 'processed' : (i < 3 ? 'processed' : i === 3 ? 'review' : 'pending')
        )
    )
    const [isProcessing, setIsProcessing] = useState(false)

    const handleValidateAll = () => {
        if (isProcessing) return
        setIsProcessing(true)
        let idx = 0
        // Find first non-processed sheet
        const pending = sheetStatuses.map((s, i) => ({ s, i })).filter(x => x.s !== 'processed')
        if (pending.length === 0) { setIsProcessing(false); return }

        const processNext = () => {
            if (idx >= pending.length) { setIsProcessing(false); return }
            const si = pending[idx].i
            setSheetStatuses(prev => { const n = [...prev]; n[si] = 'processing'; return n })
            setTimeout(() => {
                setSheetStatuses(prev => { const n = [...prev]; n[si] = 'processed'; return n })
                idx++
                setTimeout(processNext, 200)
            }, 400 + Math.random() * 300)
        }
        processNext()
    }

    const statusIcons: Record<string, React.ReactNode> = {
        processed: <Check size={12} className="text-emerald-400" />,
        review: <Info size={12} className="text-amber-400" />,
        pending: <div className="w-2.5 h-2.5 rounded-full bg-surface-700" />,
        processing: <Zap size={12} className="text-brand-400 animate-pulse" />
    }

    // Mock detected answers for processed sheets — uses store's question count
    const totalQ = storeTotalQ || activeBatch?.totalQuestions || 75
    const mockAnswers = (sheetIdx: number) => {
        const opts: AnswerOption[] = ['A', 'B', 'C', 'D']
        return Array.from({ length: totalQ }, (_, q) => ({
            q: q + 1,
            detected: opts[Math.floor(Math.abs(Math.sin((sheetIdx + 1) * (q + 1) * 3)) * 4)],
            correct: opts[Math.floor(Math.abs(Math.sin((q + 1) * 7 + 100)) * 4)]
        }))
    }

    const processedCount = sheetStatuses.filter(s => s === 'processed').length

    const sheetList = Array.from({ length: displayCount }, (_, i) => ({
        idx: i,
        name: studentNames[i % studentNames.length],
        roll: String(1001 + i),
        status: sheetStatuses[i]
    }))

    const filteredSheets = useMemo(() => {
        if (!sheetSearch.trim()) return sheetList
        const q = sheetSearch.toLowerCase().trim()
        return sheetList.filter(s => s.name.toLowerCase().includes(q) || s.roll.includes(q))
    }, [sheetSearch, sheetStatuses, displayCount])

    return (
        <div className="flex h-full">
            {/* Left: sheet list */}
            <div className="w-72 border-r border-surface-800/50 flex flex-col">
                <div className="px-4 py-3 border-b border-surface-800/50">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-surface-200">Sheets</h3>
                        <span className="text-2xs text-surface-500 font-mono">
                            {processedCount}/{displayCount} done
                        </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full"
                            animate={{ width: `${(processedCount / displayCount) * 100}%` }}
                            transition={{ duration: 0.4 }}
                        />
                    </div>
                </div>
                {/* Search bar */}
                <div className="px-3 py-2 border-b border-surface-800/50">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-800/50 border border-surface-700/30 focus-within:border-brand-500/30 transition-colors">
                        <Search size={13} className="text-surface-500 flex-shrink-0" />
                        <input
                            type="text"
                            value={sheetSearch}
                            onChange={(e) => setSheetSearch(e.target.value)}
                            placeholder="Search name or roll..."
                            className="bg-transparent text-2xs text-surface-200 placeholder:text-surface-600 outline-none w-full"
                        />
                        {sheetSearch && (
                            <button onClick={() => setSheetSearch('')} className="text-surface-500 hover:text-surface-300 transition-colors flex-shrink-0">
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredSheets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                            <Search size={24} className="text-surface-700 mb-2" />
                            <p className="text-2xs text-surface-500">No students match "{sheetSearch}"</p>
                        </div>
                    ) : filteredSheets.map((sheet) => (
                        <button
                            key={sheet.idx}
                            onClick={() => setSelectedSheet(sheet.idx)}
                            className={cn(
                                'w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-surface-800/30',
                                selectedSheet === sheet.idx
                                    ? 'bg-brand-500/10 border-l-2 border-l-brand-500'
                                    : 'hover:bg-surface-800/30 border-l-2 border-l-transparent'
                            )}
                        >
                            <div className="w-10 h-12 rounded-lg bg-surface-800/60 border border-surface-700/40 flex items-center justify-center">
                                <ImageIcon size={14} className="text-surface-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    'text-sm font-medium truncate',
                                    selectedSheet === sheet.idx ? 'text-brand-400' : 'text-surface-300'
                                )}>
                                    {sheet.name}
                                </p>
                                <p className="text-2xs text-surface-600 font-mono">
                                    Roll: {sheet.roll}
                                </p>
                            </div>
                            <div>{statusIcons[sheet.status]}</div>
                        </button>
                    ))}
                </div>

                {/* Process all button */}
                <div className="p-4 border-t border-surface-800/50">
                    <button
                        onClick={handleValidateAll}
                        disabled={isProcessing || processedCount === displayCount}
                        className={cn(
                            'btn-glow w-full flex items-center justify-center gap-2',
                            (isProcessing || processedCount === displayCount) && 'opacity-60 cursor-not-allowed'
                        )}
                    >
                        {isProcessing ? (
                            <><Zap size={16} className="animate-pulse" /> Processing...</>
                        ) : processedCount === displayCount ? (
                            <><Check size={16} /> All Validated</>
                        ) : (
                            <><Zap size={16} /> Validate All Sheets</>
                        )}
                    </button>
                </div>
            </div>

            {/* Right: Sheet detail panel */}
            <div className="flex-1 flex flex-col">
                <div className="px-6 py-3 border-b border-surface-800/50 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-surface-200">
                            {studentNames[selectedSheet % studentNames.length]}
                        </h3>
                        <p className="text-2xs text-surface-500">Roll Number: {1001 + selectedSheet}</p>
                    </div>
                    <span className={cn(
                        'badge',
                        sheetStatuses[selectedSheet] === 'processed' ? 'badge-success'
                            : sheetStatuses[selectedSheet] === 'review' ? 'badge-warning'
                                : sheetStatuses[selectedSheet] === 'processing' ? 'badge-info'
                                    : 'badge-info'
                    )}>
                        {sheetStatuses[selectedSheet]}
                    </span>
                </div>

                <div className="flex-1 overflow-hidden p-6">
                    {sheetStatuses[selectedSheet] === 'processed' || sheetStatuses[selectedSheet] === 'review' ? (
                        <div className="flex flex-col gap-4 h-full">
                            <div className="glass-card p-4">
                                <h4 className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Sheet Score Summary</h4>
                                <div className="grid grid-cols-4 gap-4">
                                    {(() => {
                                        const ans = mockAnswers(selectedSheet)
                                        const correct = ans.filter(a => a.detected === a.correct).length
                                        const wrong = ans.length - correct
                                        const score = correct * markingScheme.correctMarks + wrong * Math.abs(markingScheme.incorrectMarks) * -1
                                        const maxScore = ans.length * markingScheme.correctMarks
                                        return [
                                            { label: 'Correct', value: correct, color: 'text-emerald-400' },
                                            { label: 'Incorrect', value: wrong, color: 'text-red-400' },
                                            { label: 'Score', value: `${score}/${maxScore}`, color: 'text-brand-400' },
                                            { label: 'Accuracy', value: `${Math.round((correct / ans.length) * 100)}%`, color: 'text-amber-400' }
                                        ].map(s => (
                                            <div key={s.label} className="text-center">
                                                <p className={cn('text-xl font-bold font-mono', s.color)}>{s.value}</p>
                                                <p className="text-2xs text-surface-500 mt-1">{s.label}</p>
                                            </div>
                                        ))
                                    })()}
                                </div>
                            </div>

                            <div className="glass-card p-4 flex-1 min-h-0 flex flex-col">
                                <h4 className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Detected Answers ({mockAnswers(selectedSheet).length})</h4>
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2 flex-1 overflow-y-auto pr-1">
                                    {mockAnswers(selectedSheet).map(({ q, detected, correct }) => {
                                        const isCorrect = detected === correct
                                        return (
                                            <div key={q} className={cn(
                                                'flex items-center gap-3 px-3 py-2 rounded-lg border',
                                                isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
                                            )}>
                                                <span className="text-2xs font-mono text-surface-500 w-6">{q}.</span>
                                                <span className={cn('text-sm font-bold', isCorrect ? 'text-emerald-400' : 'text-red-400')}>{detected}</span>
                                                {!isCorrect && <span className="text-2xs text-surface-500">→ {correct}</span>}
                                                {isCorrect && <Check size={12} className="text-emerald-400 ml-auto" />}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : sheetStatuses[selectedSheet] === 'processing' ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <Zap size={48} className="text-brand-400 animate-pulse" />
                            <p className="text-sm text-surface-300 font-medium">Processing sheet...</p>
                            <p className="text-2xs text-surface-500">Detecting bubbled answers and validating</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <ScanLine size={48} className="text-surface-700" />
                            <p className="text-sm text-surface-400 font-medium">Pending Validation</p>
                            <p className="text-2xs text-surface-600">Click "Validate All Sheets" to start processing</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ============================================
// Step 4: Results
// ============================================
function ResultsStep() {
    const { activeBatch, totalQuestions: storeTotalQ, importedFiles: storeFiles, markingScheme } = useBatchStore()
    const [activeTab, setActiveTab] = useState<'leaderboard' | 'student' | 'analytics' | 'items'>('leaderboard')
    const [selectedStudentIdx, setSelectedStudentIdx] = useState(0)

    const totalQ = storeTotalQ || activeBatch?.totalQuestions || 75
    const totalSheets = storeFiles.length > 0 ? storeFiles.length : (activeBatch?.totalSheets || 12)
    const maxMarks = markingScheme.sectionWise && markingScheme.sections.length > 0
        ? markingScheme.sections.reduce((sum, sec) => sum + (sec.endQuestion - sec.startQuestion + 1) * sec.correctMarks, 0)
        : totalQ * markingScheme.correctMarks

    // Demo leaderboard data — deterministic sine-based per-question computation
    const studentNames = ['Aarav Sharma', 'Priya Patel', 'Rohan Kumar', 'Sneha Gupta', 'Arjun Singh',
        'Kavya Nair', 'Vikram Reddy', 'Ananya Das', 'Ishaan Mehta', 'Disha Jain',
        'Rahul Verma', 'Meera Iyer']
    const opts: AnswerOption[] = ['A', 'B', 'C', 'D']
    const leaderboard = Array.from({ length: Math.min(totalSheets, 12) }, (_, i) => {
        const seed = i + 1
        let correct = 0, incorrect = 0, blank = 0
        for (let q = 1; q <= totalQ; q++) {
            const correctAns = opts[Math.floor(Math.abs(Math.sin(q * 7 + 100)) * 4)]
            const studentAns = opts[Math.floor(Math.abs(Math.sin(q * 3 + seed)) * 4)]
            // Deterministic blank: ~10-15% of questions left blank based on seed
            const isBlank = Math.abs(Math.sin(q * 13 + seed * 7)) < 0.08 + seed * 0.01
            if (isBlank) {
                blank++
            } else if (correctAns === studentAns) {
                correct++
            } else {
                incorrect++
            }
        }
        const totalMarks = correct * markingScheme.correctMarks + incorrect * markingScheme.incorrectMarks + blank * markingScheme.blankMarks
        const percentage = (totalMarks / maxMarks) * 100
        return {
            rank: 0,
            seed,
            name: studentNames[i],
            rollNo: String(1001 + i),
            correct, incorrect, blank,
            totalMarks,
            percentage,
            status: percentage >= 40 ? 'pass' : 'fail'
        }
    }).sort((a, b) => b.totalMarks - a.totalMarks).map((s, i) => ({ ...s, rank: i + 1 }))

    return (
        <div className="p-6 h-full flex flex-col overflow-hidden gap-4">
            {/* Tab bar */}
            <div className="flex items-center gap-1 bg-surface-900/60 p-1 rounded-xl w-fit">
                {[
                    { id: 'leaderboard', label: 'Leaderboard' },
                    { id: 'student', label: 'Student Detail' },
                    { id: 'analytics', label: 'Batch Analytics' },
                    { id: 'items', label: 'Item Analysis' }
                ].map(({ id, label }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id as any)}
                        className={cn(
                            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                            activeTab === id
                                ? 'bg-brand-600/20 text-brand-400'
                                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'leaderboard' && (
                <div className="glass-card overflow-hidden flex-1 flex flex-col min-h-0">
                    <div className="px-6 py-4 border-b border-surface-800/50 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-surface-200">Leaderboard</h3>
                            <p className="text-2xs text-surface-500 mt-0.5">Ranked by total marks</p>
                        </div>
                        <button className="btn-ghost text-2xs flex items-center gap-1.5">
                            <FileSpreadsheet size={14} />
                            Export to Excel
                        </button>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <table className="data-table table-fixed w-full">
                            <colgroup>
                                <col style={{ width: '6%' }} />
                                <col style={{ width: '18%' }} />
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '14%' }} />
                                <col style={{ width: '12%' }} />
                                <col style={{ width: '10%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th className="text-center">Rank</th>
                                    <th className="text-center">Student</th>
                                    <th className="text-center">Roll No</th>
                                    <th className="text-center">Correct</th>
                                    <th className="text-center">Wrong</th>
                                    <th className="text-center">Blank</th>
                                    <th className="text-center">Total Marks</th>
                                    <th className="text-center">Percentage</th>
                                    <th className="text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((s, i) => (
                                    <motion.tr
                                        key={s.rollNo}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="group cursor-pointer"
                                        onClick={() => { setSelectedStudentIdx(i); setActiveTab('student') }}
                                    >
                                        <td className="text-center">
                                            <span className={cn(
                                                'inline-flex items-center justify-center w-7 h-7 rounded-lg text-2xs font-bold mx-auto',
                                                s.rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                                                    s.rank === 2 ? 'bg-surface-400/15 text-surface-300' :
                                                        s.rank === 3 ? 'bg-amber-700/20 text-amber-600' :
                                                            'bg-surface-800/40 text-surface-500'
                                            )}>
                                                {s.rank}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className="font-medium text-surface-200 group-hover:text-brand-400 transition-colors">
                                                {s.name}
                                            </span>
                                        </td>
                                        <td className="text-center font-mono text-2xs text-surface-500">{s.rollNo}</td>
                                        <td className="text-center font-mono text-emerald-400 font-medium">{s.correct}</td>
                                        <td className="text-center font-mono text-red-400 font-medium">{s.incorrect}</td>
                                        <td className="text-center font-mono text-surface-500">{s.blank}</td>
                                        <td className="text-center font-mono font-bold text-surface-200">{s.totalMarks}/{maxMarks}</td>
                                        <td className="text-center font-mono font-semibold text-brand-400">
                                            {s.percentage.toFixed(1)}%
                                        </td>
                                        <td className="text-center">
                                            <span className={s.status === 'pass' ? 'badge-success' : 'badge-danger'}>
                                                {s.status}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'student' && (() => {
                const s = leaderboard[Math.min(selectedStudentIdx, leaderboard.length - 1)]
                const topper = leaderboard[0]
                const avgMarks = Math.round(leaderboard.reduce((a, st) => a + st.totalMarks, 0) / leaderboard.length)
                const topperMarks = topper.totalMarks

                // Compute section-wise data if sections exist
                const sections = markingScheme.sectionWise ? markingScheme.sections : []
                const sectionData = sections.map(sec => {
                    const qCount = sec.endQuestion - sec.startQuestion + 1
                    const secMaxMarks = qCount * sec.correctMarks
                    let myCorrect = 0, myIncorrect = 0, myBlank = 0
                    let avgMarksTotal = 0
                    for (let q = sec.startQuestion; q <= sec.endQuestion; q++) {
                        const correctAns = opts[Math.floor(Math.abs(Math.sin(q * 7 + 100)) * 4)]
                        const studentAns = opts[Math.floor(Math.abs(Math.sin(q * 3 + s.seed)) * 4)]
                        const isBlank = Math.abs(Math.sin(q * 13 + s.seed * 7)) < 0.08 + s.seed * 0.01
                        if (isBlank) { myBlank++ }
                        else if (correctAns === studentAns) { myCorrect++ }
                        else { myIncorrect++ }
                        // Average across all students
                        for (let si = 0; si < leaderboard.length; si++) {
                            const stSeed = leaderboard[si].seed
                            const sa = opts[Math.floor(Math.abs(Math.sin(q * 3 + stSeed)) * 4)]
                            const stBlank = Math.abs(Math.sin(q * 13 + stSeed * 7)) < 0.08 + stSeed * 0.01
                            if (stBlank) { /* blank = 0 marks */ }
                            else if (correctAns === sa) { avgMarksTotal += sec.correctMarks }
                            else { avgMarksTotal += sec.incorrectMarks }
                        }
                    }
                    const myMarks = myCorrect * sec.correctMarks + myIncorrect * sec.incorrectMarks
                    const avgMarksForSec = Math.round((avgMarksTotal / leaderboard.length) * 100) / 100
                    // Topper for this section
                    const topperSeed = leaderboard[0].seed
                    let topperCorrect = 0, topperIncorrect = 0
                    for (let q = sec.startQuestion; q <= sec.endQuestion; q++) {
                        const correctAns = opts[Math.floor(Math.abs(Math.sin(q * 7 + 100)) * 4)]
                        const topperAns = opts[Math.floor(Math.abs(Math.sin(q * 3 + topperSeed)) * 4)]
                        const topBlank = Math.abs(Math.sin(q * 13 + topperSeed * 7)) < 0.08 + topperSeed * 0.01
                        if (topBlank) { /* blank */ }
                        else if (correctAns === topperAns) { topperCorrect++ }
                        else { topperIncorrect++ }
                    }
                    const topperSecMarks = topperCorrect * sec.correctMarks + topperIncorrect * sec.incorrectMarks
                    return { name: sec.name, myMarks, avgMarks: avgMarksForSec, topperMarks: topperSecMarks, maxMarks: secMaxMarks }
                })

                // Performance comparison bar heights
                const barMax = Math.max(s.totalMarks, avgMarks, topperMarks, 1)

                return (
                    <div className="space-y-5 overflow-y-auto flex-1 min-h-0">
                        {/* Student info + score cards */}
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-surface-200">{s.name}</h3>
                                    <p className="text-2xs text-surface-500 font-mono">Roll No: {s.rollNo} · Rank #{s.rank}</p>
                                </div>
                                <span className={s.status === 'pass' ? 'badge-success text-sm px-4 py-1.5' : 'badge-danger text-sm px-4 py-1.5'}>
                                    {s.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {[
                                    { label: 'Total Marks', value: `${s.totalMarks}/${maxMarks}`, color: 'text-brand-400' },
                                    { label: 'Correct', value: s.correct, color: 'text-emerald-400' },
                                    { label: 'Incorrect', value: s.incorrect, color: 'text-red-400' },
                                    { label: 'Blank', value: s.blank, color: 'text-surface-400' },
                                    { label: 'Percentage', value: `${s.percentage.toFixed(1)}%`, color: 'text-amber-400' }
                                ].map(item => (
                                    <div key={item.label} className="text-center bg-surface-800/30 rounded-xl p-4">
                                        <p className={cn('text-2xl font-bold font-mono', item.color)}>{item.value}</p>
                                        <p className="text-2xs text-surface-500 mt-1">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Visual Analysis */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Performance Comparison */}
                            <div className="glass-card p-5">
                                <h4 className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-4">Performance Comparison</h4>
                                <div className="flex items-end gap-6 h-44 px-4">
                                    {[
                                        { label: 'My Marks', value: s.totalMarks, color: 'from-emerald-600 to-emerald-400' },
                                        { label: 'Average', value: avgMarks, color: 'from-brand-600 to-brand-400' },
                                        { label: 'Topper', value: topperMarks, color: 'from-amber-600 to-amber-400' }
                                    ].map((bar, i) => (
                                        <div key={bar.label} className="flex-1 flex flex-col items-center gap-2 h-full">
                                            <span className="text-xs font-mono font-bold text-surface-200">{bar.value}</span>
                                            <div className="w-full flex-1 flex items-end">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${(bar.value / barMax) * 100}%` }}
                                                    transition={{ delay: 0.1 + i * 0.1, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                                                    className={`w-full rounded-t-lg bg-gradient-to-t ${bar.color} relative`}
                                                    style={{ minHeight: '4px' }}
                                                >
                                                    <div className="absolute inset-0 rounded-t-lg bg-gradient-to-t from-transparent to-white/10" />
                                                </motion.div>
                                            </div>
                                            <p className="text-2xs font-medium text-surface-400">{bar.label}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-center text-2xs text-surface-600 mt-2">Out of {maxMarks} marks</p>
                            </div>

                            {/* Section-wise Marks Distribution */}
                            <div className="glass-card p-5">
                                <h4 className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Section-wise Marks</h4>
                                {sectionData.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-surface-800/50">
                                                    <th className="text-left text-2xs font-semibold text-surface-400 uppercase tracking-wider py-2.5 px-3">S.No</th>
                                                    <th className="text-left text-2xs font-semibold text-surface-400 uppercase tracking-wider py-2.5 px-3">Section</th>
                                                    <th className="text-center text-2xs font-semibold text-surface-400 uppercase tracking-wider py-2.5 px-3">My Marks</th>
                                                    <th className="text-center text-2xs font-semibold text-surface-400 uppercase tracking-wider py-2.5 px-3">Average</th>
                                                    <th className="text-center text-2xs font-semibold text-surface-400 uppercase tracking-wider py-2.5 px-3">Topper</th>
                                                    <th className="text-center text-2xs font-semibold text-surface-400 uppercase tracking-wider py-2.5 px-3">Max</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sectionData.map((sec, i) => (
                                                    <tr key={sec.name} className="border-b border-surface-800/30 hover:bg-surface-800/20 transition-colors">
                                                        <td className="py-2.5 px-3 text-sm text-surface-500 font-mono">{i + 1}</td>
                                                        <td className="py-2.5 px-3 text-sm font-medium text-surface-200">{sec.name}</td>
                                                        <td className="py-2.5 px-3 text-center">
                                                            <span className="text-sm font-bold font-mono text-brand-400">{sec.myMarks}</span>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center">
                                                            <span className="text-sm font-mono text-surface-400">{sec.avgMarks}</span>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center">
                                                            <span className="text-sm font-mono text-amber-400">{sec.topperMarks}</span>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center">
                                                            <span className="text-sm font-mono text-surface-500">{sec.maxMarks}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <p className="text-sm text-surface-400">No sections configured</p>
                                        <p className="text-2xs text-surface-600 mt-1">Enable section-wise marking in Setup to see breakdown</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Question-wise Breakdown */}
                        <div className="glass-card p-5">
                            <h4 className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Question-wise Breakdown ({totalQ})</h4>
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
                                {Array.from({ length: totalQ }, (_, i) => {
                                    const q = i + 1
                                    const correct = opts[Math.floor(Math.abs(Math.sin(q * 7 + 100)) * 4)]
                                    const student = opts[Math.floor(Math.abs(Math.sin(q * 3 + s.seed)) * 4)]
                                    const isBlank = Math.abs(Math.sin(q * 13 + s.seed * 7)) < 0.08 + s.seed * 0.01
                                    const isRight = !isBlank && correct === student
                                    return (
                                        <div key={i} className={cn(
                                            'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm',
                                            isBlank ? 'border-surface-700/30 bg-surface-800/20' : isRight ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
                                        )}>
                                            <span className="text-2xs font-mono text-surface-500 w-6">Q{q}</span>
                                            {isBlank ? (
                                                <span className="font-bold text-surface-500">—</span>
                                            ) : (
                                                <>
                                                    <span className={cn('font-bold', isRight ? 'text-emerald-400' : 'text-red-400')}>{student}</span>
                                                    {!isRight && <span className="text-2xs text-surface-500">({correct})</span>}
                                                </>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )
            })()}

            {activeTab === 'analytics' && (() => {
                const avg = leaderboard.reduce((a, s) => a + s.percentage, 0) / leaderboard.length
                const highest = Math.max(...leaderboard.map(s => s.totalMarks))
                const lowest = Math.min(...leaderboard.map(s => s.totalMarks))
                const passCount = leaderboard.filter(s => s.status === 'pass').length
                const ranges = [
                    { label: '0-20%', count: leaderboard.filter(s => s.percentage < 20).length },
                    { label: '20-40%', count: leaderboard.filter(s => s.percentage >= 20 && s.percentage < 40).length },
                    { label: '40-60%', count: leaderboard.filter(s => s.percentage >= 40 && s.percentage < 60).length },
                    { label: '60-80%', count: leaderboard.filter(s => s.percentage >= 60 && s.percentage < 80).length },
                    { label: '80-100%', count: leaderboard.filter(s => s.percentage >= 80).length }
                ]
                const maxCount = Math.max(...ranges.map(r => r.count), 1)
                return (
                    <div className="space-y-5 overflow-y-auto flex-1 min-h-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Class Average', value: `${avg.toFixed(1)}%`, color: 'text-brand-400' },
                                { label: 'Highest Score', value: `${highest}/${maxMarks}`, color: 'text-emerald-400' },
                                { label: 'Lowest Score', value: `${lowest}/${maxMarks}`, color: 'text-red-400' },
                                { label: 'Pass Rate', value: `${Math.round((passCount / leaderboard.length) * 100)}%`, color: 'text-amber-400' }
                            ].map(item => (
                                <div key={item.label} className="glass-card p-5 text-center">
                                    <p className={cn('text-2xl font-bold font-mono', item.color)}>{item.value}</p>
                                    <p className="text-2xs text-surface-500 mt-1">{item.label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="glass-card p-6">
                            <h4 className="text-sm font-semibold text-surface-200 mb-4">Score Distribution</h4>
                            <div className="flex items-end gap-3 h-40">
                                {ranges.map(r => (
                                    <div key={r.label} className="flex-1 flex flex-col items-center gap-2">
                                        <span className="text-2xs font-mono text-surface-400">{r.count}</span>
                                        <motion.div
                                            className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-lg"
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(r.count / maxCount) * 100}%` }}
                                            transition={{ duration: 0.5 }}
                                            style={{ minHeight: r.count > 0 ? '8px' : '2px' }}
                                        />
                                        <span className="text-2xs text-surface-500 whitespace-nowrap">{r.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="glass-card p-5">
                            <h4 className="text-sm font-semibold text-surface-200 mb-3">Performance Summary</h4>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: 'Total Students', value: leaderboard.length },
                                    { label: 'Passed', value: passCount },
                                    { label: 'Failed', value: leaderboard.length - passCount }
                                ].map(s => (
                                    <div key={s.label} className="bg-surface-800/30 rounded-xl p-4 text-center">
                                        <p className="text-xl font-bold font-mono text-surface-200">{s.value}</p>
                                        <p className="text-2xs text-surface-500 mt-1">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            })()}

            {activeTab === 'items' && (
                <div className="glass-card overflow-hidden flex-1 flex flex-col min-h-0">
                    <div className="px-6 py-4 border-b border-surface-800/50">
                        <h3 className="text-sm font-semibold text-surface-200">Item Analysis</h3>
                        <p className="text-2xs text-surface-500 mt-0.5">Per-question difficulty and option distribution</p>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Q#</th>
                                    <th>Correct Ans</th>
                                    <th className="text-center">A</th>
                                    <th className="text-center">B</th>
                                    <th className="text-center">C</th>
                                    <th className="text-center">D</th>
                                    <th className="text-center">Difficulty</th>
                                    <th className="text-center">Discrimination</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: totalQ }, (_, i) => {
                                    const opts: AnswerOption[] = ['A', 'B', 'C', 'D']
                                    const correct = opts[Math.floor(Math.abs(Math.sin((i + 1) * 7 + 100)) * 4)]
                                    const dist = opts.map(o => ({
                                        opt: o,
                                        count: Math.floor(Math.abs(Math.sin((i + 1) * 3 + o.charCodeAt(0))) * 8) + (o === correct ? 4 : 0),
                                        isCorrect: o === correct
                                    }))
                                    const total = dist.reduce((a, d) => a + d.count, 0) || 1
                                    const difficulty = (dist.find(d => d.isCorrect)!.count / total * 100)
                                    const disc = (0.15 + Math.abs(Math.sin((i + 1) * 5)) * 0.6)

                                    return (
                                        <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                                            <td className="font-mono text-2xs">{i + 1}</td>
                                            <td><span className="font-bold text-brand-400">{correct}</span></td>
                                            {dist.map(d => (
                                                <td key={d.opt} className="text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="w-full bg-surface-800 rounded-full h-1.5 max-w-[60px]">
                                                            <div
                                                                className={cn('h-full rounded-full', d.isCorrect ? 'bg-emerald-400' : 'bg-surface-600')}
                                                                style={{ width: `${(d.count / total) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className={cn('text-2xs font-mono', d.isCorrect ? 'text-emerald-400 font-bold' : 'text-surface-500')}>
                                                            {Math.round((d.count / total) * 100)}%
                                                        </span>
                                                    </div>
                                                </td>
                                            ))}
                                            <td className="text-center">
                                                <span className={cn(
                                                    'text-2xs font-mono font-semibold px-2 py-0.5 rounded-md',
                                                    difficulty > 60 ? 'bg-emerald-500/15 text-emerald-400' :
                                                        difficulty > 30 ? 'bg-amber-500/15 text-amber-400' :
                                                            'bg-red-500/15 text-red-400'
                                                )}>
                                                    {difficulty.toFixed(0)}%
                                                </span>
                                            </td>
                                            <td className="text-center font-mono text-2xs text-surface-300">
                                                {disc.toFixed(2)}
                                            </td>
                                        </motion.tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

// ============================================
// Main Batch Workspace Component
// ============================================
export default function BatchWorkspacePage() {
    const { setPage } = useAppStore()
    const { resetWorkspace, currentStep, setStep } = useBatchStore()

    const canAdvance = (step: number): boolean => {
        const { examName, totalQuestions, answerKeys } = useBatchStore.getState()
        if (step === 0) return examName.trim().length > 0 && totalQuestions >= 1
        if (step === 1) return answerKeys.some(k => {
            const a = k.correctAnswer
            return Array.isArray(a) ? a.length > 0 : a !== ''
        })
        return true
    }

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            if (!canAdvance(currentStep)) {
                if (currentStep === 0) toast.warning('Missing Info', 'Please enter an exam name and set total questions')
                else if (currentStep === 1) toast.warning('No Answers', 'Please fill in at least one answer')
                return
            }
            setStep(currentStep + 1)
        } else {
            handleDone()
        }
    }

    const handleDone = () => {
        toast.success('Batch Complete', 'Results have been saved')
        resetWorkspace()
        setPage('batches')
    }

    const handleBackToDashboard = () => {
        useConfirmDialog.getState().open({
            title: 'Leave Batch Workspace?',
            message: 'Any unsaved progress will be lost. Are you sure you want to go back?',
            confirmLabel: 'Leave',
            variant: 'warning',
            onConfirm: () => {
                resetWorkspace()
                setPage('batches')
            }
        })
    }

    const stepComponents = [SetupStep, AnswerKeyStep, PreviewStep, ResultsStep]
    const StepComponent = stepComponents[currentStep]

    return (
        <div className="flex flex-col h-full">
            {/* Stepper */}
            <Stepper current={currentStep} onStep={setStep} />

            {/* Step content */}
            <div className="flex-1 overflow-hidden min-h-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                    >
                        <StepComponent />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer nav */}
            <div className="px-6 py-4 border-t border-surface-800/50 flex items-center justify-between bg-surface-950/80 backdrop-blur-sm">
                <button
                    onClick={() => currentStep === 0 ? handleBackToDashboard() : setStep(currentStep - 1)}
                    className="btn-ghost"
                >
                    {currentStep === 0 ? 'Back to Batches' : 'Previous Step'}
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-2xs text-surface-500 font-mono">
                        Step {currentStep + 1} of {steps.length}
                    </span>
                </div>
                <button
                    onClick={handleNext}
                    className={cn(
                        'btn-glow flex items-center gap-2',
                        currentStep < steps.length - 1 && !canAdvance(currentStep) && 'opacity-60'
                    )}
                >
                    {currentStep < steps.length - 1 ? (
                        <>
                            Next Step <ChevronRight size={16} />
                        </>
                    ) : (
                        'Done'
                    )}
                </button>
            </div>
        </div>
    )
}
