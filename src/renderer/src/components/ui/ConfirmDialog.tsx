import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Trash2, XCircle, X } from 'lucide-react'
import { create } from 'zustand'
import { cn } from '@/lib/utils'

// ─── Confirm Dialog Store ────────────────────
interface ConfirmDialogState {
    isOpen: boolean
    title: string
    message: string
    confirmLabel: string
    cancelLabel: string
    variant: 'danger' | 'warning' | 'info'
    icon?: React.ReactNode
    onConfirm: (() => void) | null
    onCancel: (() => void) | null
    open: (opts: {
        title: string
        message: string
        confirmLabel?: string
        cancelLabel?: string
        variant?: 'danger' | 'warning' | 'info'
        icon?: React.ReactNode
        onConfirm: () => void
        onCancel?: () => void
    }) => void
    close: () => void
}

export const useConfirmDialog = create<ConfirmDialogState>((set) => ({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'danger',
    icon: undefined,
    onConfirm: null,
    onCancel: null,
    open: (opts) =>
        set({
            isOpen: true,
            title: opts.title,
            message: opts.message,
            confirmLabel: opts.confirmLabel || 'Confirm',
            cancelLabel: opts.cancelLabel || 'Cancel',
            variant: opts.variant || 'danger',
            icon: opts.icon,
            onConfirm: opts.onConfirm,
            onCancel: opts.onCancel || null
        }),
    close: () => set({ isOpen: false, onConfirm: null, onCancel: null })
}))

// Helper for quick confirm
export const confirm = {
    delete: (name: string, onConfirm: () => void) =>
        useConfirmDialog.getState().open({
            title: 'Delete Batch',
            message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            confirmLabel: 'Delete',
            variant: 'danger',
            icon: <Trash2 size={20} />,
            onConfirm
        }),
    cancel: (name: string, onConfirm: () => void) =>
        useConfirmDialog.getState().open({
            title: 'Cancel Processing',
            message: `Cancel processing for "${name}"? Progress will be lost.`,
            confirmLabel: 'Cancel Processing',
            variant: 'warning',
            icon: <XCircle size={20} />,
            onConfirm
        }),
    clearData: (onConfirm: () => void) =>
        useConfirmDialog.getState().open({
            title: 'Clear All Data',
            message: 'This will permanently delete all batches, sheets, and results. This action is irreversible.',
            confirmLabel: 'Clear Everything',
            variant: 'danger',
            icon: <AlertTriangle size={20} />,
            onConfirm
        })
}

// ─── Confirm Dialog Component ────────────────
const variantConfig = {
    danger: {
        iconBg: 'bg-red-500/15',
        iconColor: 'text-red-400',
        btn: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20',
        ring: 'ring-red-500/20'
    },
    warning: {
        iconBg: 'bg-amber-500/15',
        iconColor: 'text-amber-400',
        btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20',
        ring: 'ring-amber-500/20'
    },
    info: {
        iconBg: 'bg-brand-500/15',
        iconColor: 'text-brand-400',
        btn: 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/20',
        ring: 'ring-brand-500/20'
    }
}

export function ConfirmDialog() {
    const { isOpen, title, message, confirmLabel, cancelLabel, variant, icon, onConfirm, onCancel, close } =
        useConfirmDialog()
    const config = variantConfig[variant]

    const handleConfirm = () => {
        onConfirm?.()
        close()
    }

    const handleCancel = () => {
        onCancel?.()
        close()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCancel}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                    />
                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-[201] flex items-center justify-center p-4"
                    >
                        <div className={`w-full max-w-md bg-surface-900 border border-surface-700/60 rounded-2xl shadow-2xl overflow-hidden ring-1 ${config.ring}`}>
                            {/* Header */}
                            <div className="flex items-start gap-4 p-5 pb-0">
                                <div className={cn('p-2.5 rounded-xl', config.iconBg, config.iconColor)}>
                                    {icon || <AlertTriangle size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-surface-100">{title}</h3>
                                    <p className="text-sm text-surface-400 mt-1.5 leading-relaxed">{message}</p>
                                </div>
                                <button
                                    onClick={handleCancel}
                                    className="text-surface-500 hover:text-surface-300 transition-colors -mt-1"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2.5 p-5">
                                <button
                                    onClick={handleCancel}
                                    className="btn-ghost text-sm"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={cn('px-5 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]', config.btn)}
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
