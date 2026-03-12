import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Upload,
    ScanLine,
    FileText,
    PenLine,
    Save,
    ChevronRight,
    ChevronLeft,
    X,
    Check,
    Star,
    Trash2,
    ImageIcon,
    ZoomIn,
    ZoomOut,
    AlertCircle
} from 'lucide-react'
import { useTemplateCreationStore, useTemplateStore, useAppStore } from '@/stores'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'
import { useConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { AnswerOption } from '@/types'

const steps = [
    { label: 'Upload & Details', icon: FileText },
    { label: 'Answer Key', icon: PenLine }
]

export default function NewTemplatePage() {
    const store = useTemplateCreationStore()
    const { addTemplate, updateTemplate } = useTemplateStore()
    const { setPage } = useAppStore()
    const { step, setStep, editingTemplateId } = store
    const isEditing = !!editingTemplateId

    const canGoNext = () => {
        if (step === 0) return store.templateName.trim().length > 0 && store.totalQuestions > 0
        return true
    }

    const handleSave = () => {
        const answered = store.answerKeys.filter((k) => {
            const a = k.correctAnswer
            return Array.isArray(a) ? a.length > 0 : a !== ''
        }).length

        if (isEditing) {
            updateTemplate(editingTemplateId, {
                name: store.templateName.trim(),
                totalQuestions: store.totalQuestions,
                answerKeys: store.answerKeys,
                masterSheetImagePath: store.masterSheetImagePath || undefined,
                markingScheme: store.markingScheme,
                examName: store.examName.trim() || undefined,
                subject: store.subject.trim() || undefined
            })
            toast.success(`Template "${store.templateName}" updated with ${answered}/${store.totalQuestions} answers`)
        } else {
            addTemplate({
                id: crypto.randomUUID(),
                name: store.templateName.trim(),
                createdAt: new Date().toISOString(),
                totalQuestions: store.totalQuestions,
                answerKeys: store.answerKeys,
                masterSheetImagePath: store.masterSheetImagePath || undefined,
                markingScheme: store.markingScheme,
                examName: store.examName.trim() || undefined,
                subject: store.subject.trim() || undefined
            })
            toast.success(`Template "${store.templateName}" created with ${answered}/${store.totalQuestions} answers`)
        }

        store.reset()
        setPage('templates')
    }

    const handleCancel = () => {
        const hasData = store.templateName.trim() || store.answerKeys.some(k => {
            const a = k.correctAnswer
            return Array.isArray(a) ? a.length > 0 : a !== ''
        })
        if (hasData) {
            useConfirmDialog.getState().open({
                title: 'Discard Template?',
                message: 'You have unsaved changes. Discard them?',
                confirmLabel: 'Discard',
                variant: 'warning',
                onConfirm: () => {
                    store.reset()
                    setPage('templates')
                }
            })
        } else {
            store.reset()
            setPage('templates')
        }
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Stepper */}
            <div className="px-8 py-4 border-b border-surface-800/50">
                <div className="flex items-center justify-center gap-1">
                    {steps.map((s, i) => {
                        const Icon = s.icon
                        const isActive = i === step
                        const isDone = i < step
                        return (
                            <div key={i} className="flex items-center">
                                <button
                                    onClick={() => i < step && setStep(i)}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all',
                                        isActive && 'bg-brand-500/15 text-brand-400 font-semibold',
                                        isDone && 'text-emerald-400 cursor-pointer hover:bg-surface-800/40',
                                        !isActive && !isDone && 'text-surface-600'
                                    )}
                                >
                                    <div className={cn(
                                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                                        isActive && 'bg-brand-500/20 text-brand-400',
                                        isDone && 'bg-emerald-500/20 text-emerald-400',
                                        !isActive && !isDone && 'bg-surface-800/60 text-surface-600'
                                    )}>
                                        {isDone ? <Check size={12} /> : i + 1}
                                    </div>
                                    <span className="hidden sm:inline">{s.label}</span>
                                </button>
                                {i < steps.length - 1 && (
                                    <div className={cn(
                                        'w-8 h-px mx-1',
                                        i < step ? 'bg-emerald-500/40' : 'bg-surface-800/60'
                                    )} />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Step content */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {step === 0 && <StepUploadAndDetails />}
                        {step === 1 && <StepAnswerKey />}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom actions */}
            <div className="px-8 py-4 border-t border-surface-800/50 flex items-center justify-between">
                <button onClick={handleCancel} className="btn-ghost text-sm flex items-center gap-2">
                    <X size={14} />
                    Cancel
                </button>
                <div className="flex items-center gap-3">
                    {step > 0 && (
                        <button onClick={() => setStep(step - 1)} className="btn-ghost text-sm flex items-center gap-2">
                            <ChevronLeft size={14} />
                            Back
                        </button>
                    )}
                    {step < steps.length - 1 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={!canGoNext()}
                            className={cn(
                                'btn-glow text-sm flex items-center gap-2',
                                !canGoNext() && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            Next
                            <ChevronRight size={14} />
                        </button>
                    ) : (
                        <button onClick={handleSave} className="btn-glow text-sm flex items-center gap-2">
                            <Save size={14} />
                            {isEditing ? 'Update Template' : 'Save Template'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

// ============================================
// Step 0: Upload + Details (combined)
// ============================================
function StepUploadAndDetails() {
    const store = useTemplateCreationStore()
    const { masterSheetImagePath, setMasterSheetImage } = store
    const [zoom, setZoom] = useState(1)

    const handleSelectImage = async () => {
        const result = await window.api.selectFile({
            title: 'Select Master Answer Key Sheet',
            filters: [{ name: 'Image Files', extensions: ['jpg', 'jpeg', 'png', 'tif', 'tiff', 'bmp'] }]
        })
        if (!result.canceled && result.filePaths.length > 0) {
            setMasterSheetImage(result.filePaths[0])
        }
    }

    const optionTypes = [
        { value: 'A-D' as const, label: 'A – D', desc: '4 options' },
        { value: 'A-E' as const, label: 'A – E', desc: '5 options' },
        { value: 'TF' as const, label: 'T / F', desc: 'True or False' }
    ]

    return (
        <div className="flex h-full overflow-hidden">
            {/* Left: Notes or Image Preview */}
            <div className="flex-1 flex flex-col border-r border-surface-800/50">
                {masterSheetImagePath ? (
                    /* Image preview after upload */
                    <div className="flex flex-col h-full">
                        <div className="px-4 py-3 border-b border-surface-800/40 flex items-center justify-between">
                            <p className="text-sm text-surface-300 font-medium">Master Sheet Preview</p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="btn-ghost p-1.5">
                                    <ZoomOut size={14} />
                                </button>
                                <span className="text-2xs text-surface-500 font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
                                <button onClick={() => setZoom(Math.min(3, zoom + 0.25))} className="btn-ghost p-1.5">
                                    <ZoomIn size={14} />
                                </button>
                                <button
                                    onClick={() => setMasterSheetImage(null)}
                                    className="btn-ghost p-1.5 text-red-400 hover:text-red-300"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            <div className="rounded-xl border border-surface-800/60 bg-surface-900/40 overflow-hidden">
                                <img
                                    src={`omr-local://${masterSheetImagePath}`}
                                    alt="Master Sheet"
                                    className="w-full transition-transform origin-top-left"
                                    style={{ transform: `scale(${zoom})` }}
                                />
                            </div>
                            <p className="text-2xs text-surface-600 truncate mt-2">
                                {masterSheetImagePath}
                            </p>
                        </div>
                    </div>
                ) : (
                    /* Info notes + upload area */
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <div className="max-w-sm 3xl:max-w-md space-y-6">
                            <div className="text-center">
                                <div className="w-14 h-14 rounded-2xl bg-surface-800/60 flex items-center justify-center mx-auto mb-4">
                                    <ScanLine size={28} className="text-surface-500" />
                                </div>
                                <h3 className="text-sm font-bold text-surface-200 mb-2">Upload Master Sheet</h3>
                                <p className="text-2xs text-surface-500 leading-relaxed">
                                    The master answer key sheet is a pre-filled OMR sheet with all correct answers marked.
                                    Upload it here for reference while entering answers.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                                        <ScanLine size={12} className="text-brand-400" />
                                    </div>
                                    <p className="text-2xs text-surface-500">Scan at 300 DPI for best quality</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                                        <ImageIcon size={12} className="text-brand-400" />
                                    </div>
                                    <p className="text-2xs text-surface-500">Black & white scan works best, avoid shadows</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                                        <AlertCircle size={12} className="text-brand-400" />
                                    </div>
                                    <p className="text-2xs text-surface-500">This step is optional — you can skip uploading</p>
                                </div>
                            </div>

                            <div
                                onClick={handleSelectImage}
                                className="border-2 border-dashed border-surface-700/60 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500/40 hover:bg-brand-500/5 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-surface-800/60 flex items-center justify-center mb-3 group-hover:bg-brand-500/15 transition-colors">
                                    <Upload size={22} className="text-surface-500 group-hover:text-brand-400 transition-colors" />
                                </div>
                                <p className="text-2xs text-surface-500 text-center mb-3">
                                    JPG, PNG, TIFF, BMP
                                </p>
                                <button className="btn-glow text-sm flex items-center gap-2">
                                    <ImageIcon size={14} />
                                    Choose File
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Template Details form */}
            <div className="flex-1 flex flex-col justify-center p-8 overflow-y-auto">
                <div className="max-w-md 3xl:max-w-lg mx-auto w-full space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-surface-100 mb-1">Template Details</h3>
                        <p className="text-2xs text-surface-500">Configure the basic information for your answer key template</p>
                    </div>

                    <div className="space-y-4">
                        {/* Template Name */}
                        <div>
                            <label className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5 block">
                                Template Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={store.templateName}
                                onChange={(e) => store.setTemplateName(e.target.value)}
                                placeholder="e.g., JEE Main 2026 Set A"
                                className={cn('input-field w-full', !store.templateName.trim() && 'border-amber-500/30')}
                                autoFocus
                            />
                            {!store.templateName.trim() && (
                                <p className="text-2xs text-amber-400 mt-1">Required</p>
                            )}
                        </div>

                        {/* Total Questions */}
                        <div>
                            <label className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5 block">
                                Total Questions <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                value={store.totalQuestions}
                                onChange={(e) => {
                                    const n = Math.max(1, Math.min(300, parseInt(e.target.value) || 1))
                                    store.setTotalQuestions(n)
                                }}
                                min={1}
                                max={300}
                                className="input-field w-32"
                            />
                            <p className="text-2xs text-surface-600 mt-1">Range: 1 – 300 questions</p>
                        </div>

                        {/* Option Type */}
                        <div>
                            <label className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5 block">
                                Answer Options
                            </label>
                            <div className="flex gap-2">
                                {optionTypes.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => store.setOptionType(opt.value)}
                                        className={cn(
                                            'flex-1 py-3 px-4 rounded-xl border text-center transition-all',
                                            store.optionType === opt.value
                                                ? 'border-brand-500/50 bg-brand-500/10 text-brand-400'
                                                : 'border-surface-800/60 bg-surface-800/20 text-surface-400 hover:bg-surface-800/40'
                                        )}
                                    >
                                        <p className="text-sm font-bold">{opt.label}</p>
                                        <p className="text-2xs text-surface-500 mt-0.5">{opt.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ============================================
// Step 1: Answer Key Entry
// ============================================
function StepAnswerKey() {
    const { answerKeys, updateAnswer, toggleBonus, clearAllAnswers, totalQuestions, optionType } = useTemplateCreationStore()

    const options: AnswerOption[] = optionType === 'TF'
        ? ['A', 'B']
        : optionType === 'A-E'
            ? ['A', 'B', 'C', 'D', 'E']
            : ['A', 'B', 'C', 'D']

    const optionLabels: Record<string, string> = optionType === 'TF'
        ? { A: 'T', B: 'F' }
        : {}

    const answered = answerKeys.filter((k) => {
        const a = k.correctAnswer
        return Array.isArray(a) ? a.length > 0 : a !== ''
    }).length

    const bonusCount = answerKeys.filter((k) => k.isBonus).length
    const remaining = totalQuestions - answered
    const pct = totalQuestions > 0 ? Math.round((answered / totalQuestions) * 100) : 0

    return (
        <div className="flex h-full overflow-hidden">
            {/* Left: Answer Grid Card */}
            <div className="flex-1 flex flex-col overflow-hidden p-6 pr-3">
                <div className="glass-card flex flex-col flex-1 overflow-hidden">
                    {/* Card header */}
                    <div className="px-6 py-4 flex items-center justify-between border-b border-surface-800/40">
                        <div>
                            <h3 className="text-sm font-bold text-surface-100">Answer Grid</h3>
                            <p className="text-2xs text-surface-500 mt-0.5">
                                Click to select the correct answer. Star icon marks bonus questions.
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold font-mono">
                                <span className="text-brand-400">{answered}</span>
                                <span className="text-surface-500 text-base">/{totalQuestions}</span>
                            </p>
                            <p className="text-2xs text-surface-500">answered</p>
                        </div>
                    </div>

                    {/* Grid of questions */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2">
                            {answerKeys.map((k) => {
                                const currentAnswer = k.correctAnswer
                                return (
                                    <div
                                        key={k.questionNo}
                                        className={cn(
                                            'flex items-center gap-2 py-2 px-2 rounded-lg transition-colors',
                                            k.isBonus && 'bg-amber-500/5'
                                        )}
                                    >
                                        <span className="text-2xs font-mono text-surface-500 w-7 text-right flex-shrink-0">
                                            {k.questionNo}.
                                        </span>
                                        <div className="flex gap-1">
                                            {options.map((opt) => {
                                                const isSelected = Array.isArray(currentAnswer)
                                                    ? currentAnswer.includes(opt)
                                                    : currentAnswer === opt
                                                return (
                                                    <button
                                                        key={opt}
                                                        onClick={() => updateAnswer(k.questionNo, opt)}
                                                        className={cn(
                                                            'w-8 h-7 rounded-md text-xs font-bold transition-all border',
                                                            isSelected
                                                                ? 'bg-brand-500/20 text-brand-300 border-brand-500/50'
                                                                : 'bg-surface-800/40 text-surface-500 border-surface-700/30 hover:bg-surface-800/70 hover:text-surface-300'
                                                        )}
                                                    >
                                                        {optionLabels[opt] || opt}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        <button
                                            onClick={() => toggleBonus(k.questionNo)}
                                            className={cn(
                                                'p-0.5 rounded transition-colors flex-shrink-0',
                                                k.isBonus
                                                    ? 'text-amber-400'
                                                    : 'text-surface-700 hover:text-surface-500'
                                            )}
                                            title="Toggle bonus question"
                                        >
                                            <Star size={13} fill={k.isBonus ? 'currentColor' : 'none'} />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Summary + Legend */}
            <div className="w-[260px] 3xl:w-[320px] flex-shrink-0 p-6 pl-3 flex flex-col gap-4 overflow-y-auto">
                {/* Answer Key Summary card */}
                <div className="glass-card p-5">
                    <h4 className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-4">
                        Answer Key Summary
                    </h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-2xs text-surface-500">Total Questions</span>
                            <span className="text-sm font-bold font-mono text-surface-100">{totalQuestions}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-2xs text-surface-500">Answered</span>
                            <span className="text-sm font-bold font-mono text-emerald-400">{answered}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-2xs text-surface-500">Remaining</span>
                            <span className="text-sm font-bold font-mono text-red-400">{remaining}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-2xs text-surface-500">Bonus Questions</span>
                            <span className="text-sm font-bold font-mono text-brand-400">{bonusCount}</span>
                        </div>
                        <div className="pt-2">
                            <div className="w-full h-1.5 rounded-full bg-surface-800/60 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-brand-500 transition-all"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <p className="text-2xs text-surface-600 mt-1.5 text-center">{pct}% complete</p>
                        </div>
                    </div>
                </div>

                {/* Legend card */}
                <div className="glass-card p-5">
                    <h4 className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-4">
                        Legend
                    </h4>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-6 rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/50 flex items-center justify-center text-xs font-bold">
                                A
                            </div>
                            <span className="text-2xs text-surface-400">Selected answer</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-6 rounded-md bg-surface-800/40 text-surface-500 border border-surface-700/30 flex items-center justify-center text-xs font-bold">
                                B
                            </div>
                            <span className="text-2xs text-surface-400">Unselected option</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Star size={16} className="text-amber-400 ml-1" fill="currentColor" />
                            <span className="text-2xs text-surface-400">Bonus question</span>
                        </div>
                    </div>
                </div>

                {/* Clear All button */}
                <button
                    onClick={() => {
                        useConfirmDialog.getState().open({
                            title: 'Clear All Answers',
                            message: `Remove all ${totalQuestions} answers and bonus marks?`,
                            confirmLabel: 'Clear All',
                            variant: 'warning',
                            onConfirm: () => {
                                clearAllAnswers()
                                toast.info('Answers Cleared', 'All answers and bonus marks removed')
                            }
                        })
                    }}
                    className="btn-ghost text-2xs text-red-400 hover:text-red-300 flex items-center justify-center gap-1.5 py-2"
                >
                    <Trash2 size={12} />
                    Clear All Answers
                </button>
            </div>
        </div>
    )
}

