import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileDown, FileSpreadsheet, FileText, Printer, Check, Download } from 'lucide-react'
import { create } from 'zustand'
import { cn } from '@/lib/utils'
import { toast } from './Toast'

// ─── Export Modal Store ──────────────────────
interface ExportStore {
    isOpen: boolean
    batchName: string
    open: (batchName: string) => void
    close: () => void
}

export const useExportStore = create<ExportStore>((set) => ({
    isOpen: false,
    batchName: '',
    open: (batchName) => set({ isOpen: true, batchName }),
    close: () => set({ isOpen: false })
}))

// ─── Format Options ──────────────────────────
interface ExportFormat {
    id: string
    label: string
    description: string
    icon: React.ElementType
    ext: string
}

const formats: ExportFormat[] = [
    {
        id: 'csv',
        label: 'CSV Spreadsheet',
        description: 'Comma-separated values, opens in Excel',
        icon: FileSpreadsheet,
        ext: '.csv'
    },
    {
        id: 'pdf',
        label: 'PDF Report',
        description: 'Full report with charts and analysis',
        icon: FileText,
        ext: '.pdf'
    },
    {
        id: 'xlsx',
        label: 'Excel Workbook',
        description: 'Multi-sheet workbook with formatting',
        icon: FileDown,
        ext: '.xlsx'
    },
    {
        id: 'print',
        label: 'Print Report',
        description: 'Send directly to printer',
        icon: Printer,
        ext: ''
    }
]

// ─── Export Options ──────────────────────────
const exportOptions = [
    { id: 'scores', label: 'Student Scores & Rankings' },
    { id: 'answers', label: 'Question-wise Answers' },
    { id: 'analytics', label: 'Item Analysis & Statistics' },
    { id: 'sections', label: 'Section-wise Breakdown' }
]

// ─── Component ───────────────────────────────
export function ExportModal() {
    const { isOpen, batchName, close } = useExportStore()
    const [selectedFormat, setSelectedFormat] = useState('csv')
    const [selectedOptions, setSelectedOptions] = useState<string[]>(['scores', 'answers'])
    const [exporting, setExporting] = useState(false)

    const toggleOption = (id: string) => {
        setSelectedOptions((prev) =>
            prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
        )
    }

    const handleExport = async () => {
        setExporting(true)
        // Simulate export
        await new Promise((r) => setTimeout(r, 1500))
        setExporting(false)
        close()
        const format = formats.find((f) => f.id === selectedFormat)
        toast.success(
            'Export Complete',
            `${batchName} exported as ${format?.label || selectedFormat}`
        )
    }

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
                        <div className="w-full max-w-md bg-surface-900 border border-surface-700/60 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-800/50">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
                                        <Download size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-surface-100">Export Results</h3>
                                        <p className="text-2xs text-surface-500">{batchName}</p>
                                    </div>
                                </div>
                                <button onClick={close} className="text-surface-500 hover:text-surface-300 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Format selection */}
                            <div className="p-5 space-y-4">
                                <div>
                                    <h4 className="text-2xs font-semibold uppercase tracking-widest text-surface-500 mb-2.5">
                                        Export Format
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {formats.map((format) => {
                                            const Icon = format.icon
                                            const isActive = selectedFormat === format.id
                                            return (
                                                <button
                                                    key={format.id}
                                                    onClick={() => setSelectedFormat(format.id)}
                                                    className={cn(
                                                        'relative flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left',
                                                        isActive
                                                            ? 'border-brand-500 bg-brand-500/8'
                                                            : 'border-surface-800/50 hover:border-surface-600'
                                                    )}
                                                >
                                                    <Icon size={18} className={isActive ? 'text-brand-400' : 'text-surface-500'} />
                                                    <div>
                                                        <p className={cn('text-sm font-medium', isActive ? 'text-brand-400' : 'text-surface-300')}>
                                                            {format.label}
                                                        </p>
                                                        <p className="text-2xs text-surface-500 line-clamp-1">{format.description}</p>
                                                    </div>
                                                    {isActive && (
                                                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center">
                                                            <Check size={10} className="text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Include options */}
                                <div>
                                    <h4 className="text-2xs font-semibold uppercase tracking-widest text-surface-500 mb-2.5">
                                        Include In Export
                                    </h4>
                                    <div className="space-y-1.5">
                                        {exportOptions.map((opt) => (
                                            <label
                                                key={opt.id}
                                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-800/30 transition-colors cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOptions.includes(opt.id)}
                                                    onChange={() => toggleOption(opt.id)}
                                                    className="accent-brand-500 w-4 h-4"
                                                />
                                                <span className="text-sm text-surface-300">{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-surface-800/50 bg-surface-950/30">
                                <button onClick={close} className="btn-ghost text-sm">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleExport}
                                    disabled={exporting || selectedOptions.length === 0}
                                    className={cn(
                                        'btn-glow flex items-center gap-2',
                                        (exporting || selectedOptions.length === 0) && 'opacity-50 pointer-events-none'
                                    )}
                                >
                                    {exporting ? (
                                        <>
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                                <Download size={16} />
                                            </motion.div>
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <Download size={16} />
                                            Export
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
