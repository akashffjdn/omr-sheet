import { Activity, HardDrive, Keyboard, Cpu } from 'lucide-react'
import { useDashboardStore, useAppStore, useBatchStore } from '@/stores'
import { useShortcutsStore } from './KeyboardShortcuts'
import { cn } from '@/lib/utils'

export default function StatusBar() {
    const { stats } = useDashboardStore()
    const { theme, accentColor, currentPage } = useAppStore()
    const { toggle: toggleShortcuts } = useShortcutsStore()
    const { activeBatch } = useBatchStore()

    // Dynamic status
    const getStatus = () => {
        if (currentPage === 'batch-workspace') {
            return { label: activeBatch ? `Editing: ${activeBatch.name}` : 'New Batch', color: 'bg-blue-400' }
        }
        if (currentPage === 'new-template') {
            return { label: 'Creating Template', color: 'bg-blue-400' }
        }
        return { label: 'Ready', color: 'bg-emerald-400' }
    }
    const status = getStatus()

    const accentNames: Record<string, string> = {
        '#6366f1': 'Indigo',
        '#22d3ee': 'Cyan',
        '#f59e0b': 'Amber',
        '#22c55e': 'Emerald',
        '#f43f5e': 'Rose',
        '#a855f7': 'Purple',
        '#f97316': 'Orange',
        '#06b6d4': 'Teal'
    }

    return (
        <footer className="h-7 flex items-center justify-between px-3 bg-surface-950 border-t border-surface-800/40 text-2xs text-surface-500 select-none z-20 flex-shrink-0">
            {/* Left */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                    <div className={cn('w-1.5 h-1.5 rounded-full animate-pulse-soft', status.color)} />
                    <span className="max-w-[160px] truncate">{status.label}</span>
                </div>
                <div className="w-px h-3 bg-surface-800" />
                <div className="flex items-center gap-1">
                    <HardDrive size={11} />
                    <span>{stats.totalBatches} batches</span>
                </div>
                <div className="hidden xl:flex items-center gap-1">
                    <div className="w-px h-3 bg-surface-800 mr-3" />
                    <Activity size={11} />
                    <span>{stats.totalSheetsProcessed.toLocaleString()} sheets</span>
                </div>
            </div>

            {/* Center — hide on narrow windows */}
            <div className="hidden xl:flex items-center gap-1 text-surface-600">
                <span>Made by</span>
                <a
                    href="https://unitednexa.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:text-brand-300 transition-colors font-medium"
                >
                    United Nexa Tech
                </a>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                <div className="hidden 3xl:flex items-center gap-1">
                    <Cpu size={11} />
                    <span>OMR Engine v1.0</span>
                    <div className="w-px h-3 bg-surface-800 ml-3" />
                </div>
                <div className="flex items-center gap-1.5">
                    <div
                        className="w-2.5 h-2.5 rounded-full border border-surface-700"
                        style={{ backgroundColor: accentColor }}
                    />
                    <span className="hidden xl:inline">{accentNames[accentColor] || 'Custom'}</span>
                </div>
                <div className="w-px h-3 bg-surface-800" />
                <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
                <div className="hidden xl:contents">
                    <div className="w-px h-3 bg-surface-800" />
                    <button
                        onClick={toggleShortcuts}
                        className="flex items-center gap-1 hover:text-surface-300 transition-colors"
                        title="Keyboard shortcuts (?)"
                    >
                        <Keyboard size={11} />
                        <span>Shortcuts</span>
                    </button>
                </div>
            </div>
        </footer>
    )
}
