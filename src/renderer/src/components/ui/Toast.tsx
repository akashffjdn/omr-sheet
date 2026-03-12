import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { create } from 'zustand'

// ─── Toast Store ─────────────────────────────
export interface Toast {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
}

interface ToastStore {
    toasts: Toast[]
    addToast: (toast: Omit<Toast, 'id'>) => void
    removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = crypto.randomUUID()
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
        // Auto-remove after duration
        setTimeout(() => {
            set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
        }, toast.duration || 4000)
    },
    removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
}))

// Helper function for quick toasts
export const toast = {
    success: (title: string, message?: string) =>
        useToastStore.getState().addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
        useToastStore.getState().addToast({ type: 'error', title, message, duration: 6000 }),
    warning: (title: string, message?: string) =>
        useToastStore.getState().addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) =>
        useToastStore.getState().addToast({ type: 'info', title, message })
}

// ─── Toast Icons & Colors ────────────────────
const toastConfig = {
    success: {
        icon: CheckCircle2,
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/25',
        iconColor: 'text-emerald-400',
        bar: 'bg-emerald-500'
    },
    error: {
        icon: AlertCircle,
        bg: 'bg-red-500/10',
        border: 'border-red-500/25',
        iconColor: 'text-red-400',
        bar: 'bg-red-500'
    },
    warning: {
        icon: AlertTriangle,
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/25',
        iconColor: 'text-amber-400',
        bar: 'bg-amber-500'
    },
    info: {
        icon: Info,
        bg: 'bg-brand-500/10',
        border: 'border-brand-500/25',
        iconColor: 'text-brand-400',
        bar: 'bg-brand-500'
    }
}

// ─── Toast Container ─────────────────────────
export function ToastContainer() {
    const { toasts, removeToast } = useToastStore()

    return (
        <div className="fixed bottom-16 right-4 z-[100] flex flex-col gap-2 max-w-sm">
            <AnimatePresence mode="popLayout">
                {toasts.map((t) => {
                    const config = toastConfig[t.type]
                    const Icon = config.icon
                    return (
                        <motion.div
                            key={t.id}
                            layout
                            initial={{ opacity: 0, x: 80, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 80, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={`relative overflow-hidden rounded-xl border ${config.border} ${config.bg} backdrop-blur-xl shadow-2xl`}
                        >
                            {/* Progress bar */}
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: (t.duration || 4000) / 1000, ease: 'linear' }}
                                className={`absolute top-0 left-0 h-[2px] ${config.bar}`}
                            />
                            <div className="flex items-start gap-3 p-3.5 pr-10">
                                <div className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>
                                    <Icon size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-surface-100">{t.title}</p>
                                    {t.message && (
                                        <p className="text-2xs text-surface-400 mt-0.5 leading-relaxed">{t.message}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => removeToast(t.id)}
                                    className="absolute top-3 right-3 text-surface-500 hover:text-surface-300 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
