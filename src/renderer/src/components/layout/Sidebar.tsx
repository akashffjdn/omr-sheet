import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
    LayoutDashboard,
    FolderOpen,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Zap,
    Monitor,
    ScanLine,
    Palette,
    Database,
    Info,
    FileCog
} from 'lucide-react'
import { useAppStore, useBatchStore } from '@/stores'
import appIcon from '@/assets/icon.png'
import { cn } from '@/lib/utils'
import type { PageId } from '@/types'

interface NavItem {
    id: PageId
    label: string
    icon: React.ReactNode
    badge?: number
}

const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'batches', label: 'All Batches', icon: <FolderOpen size={20} /> },
    { id: 'templates', label: 'Templates', icon: <FileCog size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> }
]

const settingsSections = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'omr', label: 'OMR Engine', icon: ScanLine },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Storage', icon: Database },
    { id: 'about', label: 'About', icon: Info }
]

export default function Sidebar() {
    const { currentPage, setPage, sidebarCollapsed, toggleSidebar, settingsSection, setSettingsSection } = useAppStore()
    const { resetWorkspace } = useBatchStore()
    const [settingsExpanded, setSettingsExpanded] = useState(true)

    const handleNewBatch = () => {
        resetWorkspace()
        setPage('batch-workspace')
    }

    const handleSettingsClick = () => {
        if (currentPage === 'settings') {
            setSettingsExpanded(!settingsExpanded)
        } else {
            setPage('settings')
            setSettingsExpanded(true)
        }
    }

    return (
        <motion.aside
            animate={{ width: sidebarCollapsed ? 72 : 220 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="h-screen flex flex-col bg-surface-950 border-r border-surface-800/60 dark:shadow-none shadow-[1px_0_4px_rgba(0,0,0,0.04)] relative z-20"
        >
            {/* Logo area */}
            <div className="h-[56px] flex items-center px-4 drag-region border-b border-surface-800/40">
                <div className="flex items-center gap-2.5 no-drag">
                    <img src={appIcon} alt="OMR Pro" className="w-8 h-8 rounded-lg" />
                    <AnimatePresence>
                        {!sidebarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col"
                            >
                                <span className="text-base font-bold text-surface-100 tracking-tight">
                                    OMR <span className="gradient-text">Pro</span>
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Quick action */}
            <div className="px-3 pt-4 pb-2">
                <button
                    onClick={handleNewBatch}
                    aria-label="New Batch"
                    className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold',
                        'bg-gradient-to-r from-brand-600 to-brand-500 text-white',
                        'shadow-lg shadow-brand-600/20 hover:shadow-xl hover:shadow-brand-500/25',
                        'transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
                        sidebarCollapsed && 'justify-center px-2'
                    )}
                >
                    <Zap size={16} />
                    <AnimatePresence>
                        {!sidebarCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                New Batch
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
                <AnimatePresence>
                    {!sidebarCollapsed && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="px-3 pt-3 pb-2 text-2xs font-semibold uppercase tracking-widest text-surface-500"
                        >
                            Navigation
                        </motion.p>
                    )}
                </AnimatePresence>
                {navItems.map((item) => (
                    <div key={item.id}>
                        {item.id === 'settings' ? (
                            <>
                                <button
                                    onClick={handleSettingsClick}
                                    aria-label="Settings"
                                    className={cn(
                                        'sidebar-item w-full',
                                        currentPage === 'settings' && 'active',
                                        sidebarCollapsed && 'justify-center px-2'
                                    )}
                                >
                                    <span className="flex-shrink-0">{item.icon}</span>
                                    <AnimatePresence>
                                        {!sidebarCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="truncate flex-1"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                    {!sidebarCollapsed && (
                                        <motion.span
                                            animate={{ rotate: (currentPage === 'settings' && settingsExpanded) ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="ml-auto text-surface-500"
                                        >
                                            <ChevronDown size={16} />
                                        </motion.span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {currentPage === 'settings' && settingsExpanded && !sidebarCollapsed && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-surface-800/50 pl-3 py-1">
                                                {settingsSections.map((s) => {
                                                    const Icon = s.icon
                                                    return (
                                                        <button
                                                            key={s.id}
                                                            onClick={() => setSettingsSection(s.id)}
                                                            className={cn(
                                                                'flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                                                                settingsSection === s.id
                                                                    ? 'text-brand-400 bg-brand-500/10'
                                                                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/40'
                                                            )}
                                                        >
                                                            <Icon size={18} className="flex-shrink-0" />
                                                            {s.label}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        ) : (
                            <button
                                onClick={() => setPage(item.id)}
                                aria-label={item.label}
                                className={cn(
                                    'sidebar-item w-full',
                                    currentPage === item.id && 'active',
                                    sidebarCollapsed && 'justify-center px-2'
                                )}
                            >
                                <span className="flex-shrink-0">{item.icon}</span>
                                <AnimatePresence>
                                    {!sidebarCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="truncate"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {item.badge && !sidebarCollapsed && (
                                    <span className="ml-auto bg-brand-500/20 text-brand-400 text-2xs font-bold px-2 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                ))}
            </nav>

            {/* Collapse toggle */}
            <div className="px-3 pb-4">
                <button
                    onClick={toggleSidebar}
                    aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-surface-500 hover:text-surface-300 hover:bg-surface-800/50 transition-all duration-200 text-sm"
                >
                    {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    <AnimatePresence>
                        {!sidebarCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                Collapse
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.aside>
    )
}
