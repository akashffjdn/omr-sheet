import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { Keyboard, X } from 'lucide-react'
import { create } from 'zustand'
import { useAppStore, useBatchStore } from '@/stores'

// ─── Shortcuts Modal Store ───────────────────
interface ShortcutsStore {
    isOpen: boolean
    toggle: () => void
    close: () => void
}

export const useShortcutsStore = create<ShortcutsStore>((set) => ({
    isOpen: false,
    toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    close: () => set({ isOpen: false })
}))

// ─── Shortcut Definitions ────────────────────
interface ShortcutGroup {
    label: string
    shortcuts: { keys: string[]; description: string }[]
}

const shortcutGroups: ShortcutGroup[] = [
    {
        label: 'Navigation',
        shortcuts: [
            { keys: ['Ctrl', '1'], description: 'Go to Dashboard' },
            { keys: ['Ctrl', '2'], description: 'Go to All Batches' },
            { keys: ['Ctrl', '3'], description: 'Go to Analytics' },
            { keys: ['Ctrl', '4'], description: 'Go to Settings' },
            { keys: ['Ctrl', 'B'], description: 'Toggle Sidebar' }
        ]
    },
    {
        label: 'Actions',
        shortcuts: [
            { keys: ['Ctrl', 'N'], description: 'New Batch' },
            { keys: ['Ctrl', 'K'], description: 'Focus Search' },
            { keys: ['Ctrl', ','], description: 'Open Settings' },
            { keys: ['Ctrl', 'E'], description: 'Export Results' }
        ]
    },
    {
        label: 'General',
        shortcuts: [
            { keys: ['Ctrl', 'Shift', 'T'], description: 'Toggle Theme' },
            { keys: ['?'], description: 'Show Keyboard Shortcuts' },
            { keys: ['Esc'], description: 'Close Modal / Cancel' }
        ]
    }
]

// ─── Global Keyboard Listener ────────────────
export function useKeyboardShortcuts() {
    const { setPage, toggleSidebar, toggleTheme } = useAppStore()
    const { resetWorkspace } = useBatchStore()
    const { toggle: toggleShortcuts } = useShortcutsStore()

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const ctrl = e.ctrlKey || e.metaKey
            const shift = e.shiftKey
            const target = e.target as HTMLElement
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'

            // ? key — show shortcuts (only when not typing)
            if (e.key === '?' && !isInput && !ctrl) {
                e.preventDefault()
                toggleShortcuts()
                return
            }

            if (!ctrl) return

            // Ctrl+1-4 navigation
            if (e.key === '1') { e.preventDefault(); setPage('dashboard') }
            if (e.key === '2') { e.preventDefault(); setPage('batches') }
            if (e.key === '3') { e.preventDefault(); setPage('analytics') }
            if (e.key === '4') { e.preventDefault(); setPage('settings') }

            // Ctrl+B toggle sidebar
            if (e.key === 'b' && !shift) { e.preventDefault(); toggleSidebar() }

            // Ctrl+N new batch
            if (e.key === 'n') { e.preventDefault(); resetWorkspace(); setPage('batch-workspace') }

            // Ctrl+K focus search
            if (e.key === 'k') {
                e.preventDefault()
                const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]')
                searchInput?.focus()
            }

            // Ctrl+, settings
            if (e.key === ',') { e.preventDefault(); setPage('settings') }

            // Ctrl+Shift+T toggle theme
            if (e.key === 't' && shift) { e.preventDefault(); toggleTheme() }
        }

        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [setPage, toggleSidebar, toggleTheme, resetWorkspace, toggleShortcuts])
}

// ─── Kbd Key Component ───────────────────────
function Kbd({ children }: { children: string }) {
    return (
        <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-2xs font-mono font-semibold text-surface-300 bg-surface-800 border border-surface-700/60 rounded-md shadow-sm">
            {children}
        </kbd>
    )
}

// ─── Shortcuts Modal ─────────────────────────
export function KeyboardShortcutsModal() {
    const { isOpen, close } = useShortcutsStore()

    useEffect(() => {
        if (!isOpen) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [isOpen, close])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={close}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
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
                            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-800/50">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
                                        <Keyboard size={16} />
                                    </div>
                                    <h3 className="text-base font-semibold text-surface-100">Keyboard Shortcuts</h3>
                                </div>
                                <button onClick={close} className="text-surface-500 hover:text-surface-300 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            {/* Body */}
                            <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
                                {shortcutGroups.map((group) => (
                                    <div key={group.label}>
                                        <h4 className="text-2xs font-semibold uppercase tracking-widest text-surface-500 mb-2.5">
                                            {group.label}
                                        </h4>
                                        <div className="space-y-1">
                                            {group.shortcuts.map((s) => (
                                                <div
                                                    key={s.description}
                                                    className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-surface-800/40 transition-colors"
                                                >
                                                    <span className="text-sm text-surface-300">{s.description}</span>
                                                    <div className="flex items-center gap-1">
                                                        {s.keys.map((k, i) => (
                                                            <span key={i} className="flex items-center gap-1">
                                                                {i > 0 && <span className="text-surface-600 text-2xs">+</span>}
                                                                <Kbd>{k}</Kbd>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Footer */}
                            <div className="px-5 py-3 border-t border-surface-800/50 bg-surface-950/50">
                                <p className="text-2xs text-surface-600 text-center">
                                    Press <Kbd>?</Kbd> anytime to show this panel
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
