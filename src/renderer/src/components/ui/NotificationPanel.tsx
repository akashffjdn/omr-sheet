import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, CheckCircle2, AlertCircle, Info, Loader2, Trash2, CheckCheck } from 'lucide-react'
import { create } from 'zustand'

interface Notification {
    id: string
    title: string
    message: string
    type: 'success' | 'error' | 'info' | 'processing'
    read: boolean
    time: string
}

interface NotificationStore {
    isOpen: boolean
    notifications: Notification[]
    toggle: () => void
    close: () => void
    markAsRead: (id: string) => void
    markAllRead: () => void
    dismiss: (id: string) => void
    clearAll: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    isOpen: false,
    notifications: [
        {
            id: '1',
            title: 'Batch Complete',
            message: 'Math Final Exam batch processed successfully with 45 sheets.',
            type: 'success',
            read: false,
            time: '2 min ago'
        },
        {
            id: '2',
            title: 'Processing Started',
            message: 'Science Quiz batch is now being processed.',
            type: 'processing',
            read: false,
            time: '5 min ago'
        },
        {
            id: '3',
            title: 'Export Ready',
            message: 'Your CSV export for English Mid-Term is ready to download.',
            type: 'info',
            read: false,
            time: '15 min ago'
        },
        {
            id: '4',
            title: 'Low Confidence Warning',
            message: '3 sheets in Physics batch had marks below confidence threshold.',
            type: 'error',
            read: true,
            time: '1 hour ago'
        },
        {
            id: '5',
            title: 'Welcome to OMR Pro',
            message: 'Get started by creating your first batch.',
            type: 'info',
            read: true,
            time: '2 hours ago'
        }
    ],
    toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    close: () => set({ isOpen: false }),
    markAsRead: (id) =>
        set((s) => ({
            notifications: s.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            )
        })),
    markAllRead: () =>
        set((s) => ({
            notifications: s.notifications.map((n) => ({ ...n, read: true }))
        })),
    dismiss: (id) =>
        set((s) => ({
            notifications: s.notifications.filter((n) => n.id !== id)
        })),
    clearAll: () => set({ notifications: [] })
}))

const typeConfig = {
    success: {
        icon: CheckCircle2,
        bg: 'bg-emerald-500/10',
        text: 'dark:text-emerald-400 text-emerald-600',
        border: 'border-emerald-500/20'
    },
    error: {
        icon: AlertCircle,
        bg: 'bg-red-500/10',
        text: 'dark:text-red-400 text-red-600',
        border: 'border-red-500/20'
    },
    info: {
        icon: Info,
        bg: 'bg-blue-500/10',
        text: 'dark:text-blue-400 text-blue-600',
        border: 'border-blue-500/20'
    },
    processing: {
        icon: Loader2,
        bg: 'bg-brand-500/10',
        text: 'text-brand-400',
        border: 'border-brand-500/20'
    }
}

export function NotificationPanel() {
    const { isOpen, close, notifications, markAsRead, markAllRead, dismiss, clearAll } = useNotificationStore()
    const unreadCount = notifications.filter((n) => !n.read).length

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={close}
                        className="fixed inset-0 z-50 bg-black/20"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="fixed top-[60px] right-4 xl:right-[100px] z-50 w-[340px] xl:w-[400px] max-h-[70vh] flex flex-col rounded-2xl border border-surface-700/50 bg-surface-950/98 dark:backdrop-blur-xl dark:shadow-2xl dark:shadow-black/50 shadow-xl shadow-black/10"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-surface-800/60">
                            <div className="flex items-center gap-2.5">
                                <Bell size={16} className="text-surface-400" />
                                <h3 className="text-sm font-semibold text-surface-100">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="min-w-[20px] h-5 flex items-center justify-center bg-brand-500 text-white text-[10px] font-bold rounded-full px-1.5">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-0.5">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="p-2 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-800/50 transition-all"
                                        title="Mark all read"
                                    >
                                        <CheckCheck size={15} />
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="p-2 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                        title="Clear all"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                )}
                                <button
                                    onClick={close}
                                    className="p-2 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-800/50 transition-all"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Notifications list */}
                        <div className="flex-1 overflow-y-auto overscroll-contain">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Bell size={32} className="text-surface-700 mb-3" />
                                    <p className="text-sm text-surface-400 font-medium">No notifications</p>
                                    <p className="text-2xs text-surface-600 mt-1">You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="py-1">
                                    {notifications.map((notification, idx) => {
                                        const config = typeConfig[notification.type]
                                        const Icon = config.icon
                                        return (
                                            <div key={notification.id}>
                                                <div
                                                    onClick={() => markAsRead(notification.id)}
                                                    className={`group relative flex gap-3 px-5 py-3.5 cursor-pointer transition-all duration-150 hover:bg-surface-800/40 ${
                                                        !notification.read ? 'bg-brand-500/[0.04]' : ''
                                                    }`}
                                                >
                                                    {/* Unread accent bar */}
                                                    {!notification.read && (
                                                        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-brand-500" />
                                                    )}

                                                    {/* Type icon */}
                                                    <div className={`flex-shrink-0 mt-0.5 w-8 h-8 rounded-xl ${config.bg} flex items-center justify-center`}>
                                                        <Icon
                                                            size={15}
                                                            className={`${config.text} ${notification.type === 'processing' ? 'animate-spin' : ''}`}
                                                        />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-[13px] font-semibold leading-tight ${
                                                            !notification.read ? 'text-surface-100' : 'text-surface-400'
                                                        }`}>
                                                            {notification.title}
                                                        </p>
                                                        <p className={`text-2xs mt-1 leading-relaxed ${
                                                            !notification.read ? 'text-surface-400' : 'text-surface-500'
                                                        }`}>
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-2xs text-surface-600 mt-1.5">{notification.time}</p>
                                                    </div>

                                                    {/* Dismiss button — visible on hover */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            dismiss(notification.id)
                                                        }}
                                                        className="absolute top-3 right-3 p-1 rounded-md text-surface-600 hover:text-surface-300 hover:bg-surface-700/50 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <X size={13} />
                                                    </button>
                                                </div>

                                                {/* Divider between items */}
                                                {idx < notifications.length - 1 && (
                                                    <div className="mx-5 border-b border-surface-800/40" />
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
