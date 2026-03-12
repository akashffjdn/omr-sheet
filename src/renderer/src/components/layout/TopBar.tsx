import { Bell, Search, Moon, Sun, X, Keyboard, LogOut, User } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '@/stores'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Tooltip from '@/components/ui/Tooltip'
import { useNotificationStore } from '@/components/ui/NotificationPanel'
import { useShortcutsStore } from '@/components/ui/KeyboardShortcuts'

const pageTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    batches: 'All Batches',
    'batch-workspace': 'Batch Workspace',
    templates: 'Answer Key Templates',
    'new-template': 'Create New Template',
    analytics: 'Analytics',
    settings: 'Settings'
}

export default function TopBar() {
    const { currentPage, theme, toggleTheme, searchQuery, setSearchQuery, setPage, userEmail, logout } = useAppStore()
    const [searchFocused, setSearchFocused] = useState(false)
    const [localSearch, setLocalSearch] = useState(searchQuery)
    const [profileOpen, setProfileOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const profileRef = useRef<HTMLDivElement>(null)
    const { toggle: toggleNotifications, notifications } = useNotificationStore()
    const { toggle: toggleShortcuts } = useShortcutsStore()
    const unreadCount = notifications.filter((n) => !n.read).length

    // Derive initials from email
    const initials = userEmail
        ? userEmail.split('@')[0].slice(0, 2).toUpperCase()
        : 'OP'

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false)
            }
        }
        if (profileOpen) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [profileOpen])

    // Sync local state if store clears the query (e.g. from BatchesPage)
    useEffect(() => {
        setLocalSearch(searchQuery)
    }, [searchQuery])

    const handleSearchSubmit = () => {
        const q = localSearch.trim()
        if (q) {
            setSearchQuery(q)
            setPage('batches')
            inputRef.current?.blur()
        }
    }

    const handleClearSearch = () => {
        setLocalSearch('')
        setSearchQuery('')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearchSubmit()
        }
        if (e.key === 'Escape') {
            handleClearSearch()
            inputRef.current?.blur()
        }
    }

    const isDark = theme === 'dark'

    return (
        <header className="h-[56px] flex items-center justify-between pl-6 pr-[140px] border-b border-surface-800/40 bg-surface-950/80 dark:backdrop-blur-xl dark:shadow-none shadow-[0_1px_3px_rgba(0,0,0,0.04)] drag-region z-10">
            {/* Left: Page title + breadcrumbs */}
            <div className="flex items-center gap-4 no-drag">
                <div>
                    <h1 className="text-base font-semibold text-surface-100">
                        {pageTitles[currentPage] || 'OMR Pro'}
                    </h1>
                    {(currentPage === 'batch-workspace' || currentPage === 'settings') && (
                        <div className="-mt-0.5">
                            <Breadcrumb />
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 no-drag">
                {/* Search */}
                <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 ${searchFocused
                        ? 'border-brand-500/50 bg-surface-900 w-64'
                        : 'border-surface-800/50 bg-surface-900/50 w-48'
                        }`}
                >
                    <Search size={14} className="text-surface-500 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        data-search-input
                        type="text"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search batches..."
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        className="bg-transparent text-sm text-surface-200 placeholder:text-surface-600 outline-none w-full"
                    />
                    {localSearch ? (
                        <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={handleClearSearch}
                            className="text-surface-500 hover:text-surface-300 flex-shrink-0"
                        >
                            <X size={14} />
                        </button>
                    ) : (
                        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-2xs font-mono text-surface-500 bg-surface-800/80 rounded">
                            Ctrl+K
                        </kbd>
                    )}
                </div>

                {/* Keyboard shortcuts */}
                <Tooltip content="Shortcuts (?)" side="bottom">
                    <button
                        onClick={toggleShortcuts}
                        className="p-2 rounded-xl text-surface-400 hover:text-surface-200 hover:bg-surface-800/50 transition-all duration-200"
                    >
                        <Keyboard size={18} />
                    </button>
                </Tooltip>

                {/* Theme toggle */}
                <Tooltip content={isDark ? 'Light theme' : 'Dark theme'} side="bottom">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl text-surface-400 hover:text-surface-200 hover:bg-surface-800/50 transition-all duration-200"
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </Tooltip>

                {/* Notifications */}
                <Tooltip content="Notifications" side="bottom">
                    <button
                        onClick={toggleNotifications}
                        className="relative p-2 rounded-xl text-surface-400 hover:text-surface-200 hover:bg-surface-800/50 transition-all duration-200"
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center bg-brand-500 text-white text-[9px] font-bold rounded-full px-1 ring-2 ring-surface-950">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </Tooltip>

                {/* Profile */}
                <div className="relative ml-1" ref={profileRef}>
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center cursor-pointer hover:shadow-lg hover:shadow-brand-500/20 transition-all duration-200"
                    >
                        <span className="text-xs font-bold text-white">{initials}</span>
                    </button>

                    <AnimatePresence>
                        {profileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-surface-800/60 bg-surface-900 shadow-2xl shadow-black/40 overflow-hidden z-50"
                            >
                                {/* User info */}
                                <div className="px-4 py-3 border-b border-surface-800/40">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-white">{initials}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-surface-100 truncate">
                                                {userEmail ? userEmail.split('@')[0] : 'User'}
                                            </p>
                                            <p className="text-xs text-surface-500 truncate">
                                                {userEmail || 'user@example.com'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu items */}
                                <div className="py-1.5">
                                    <button
                                        onClick={() => { setProfileOpen(false); setPage('settings'); }}
                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-surface-300 hover:text-surface-100 hover:bg-surface-800/50 transition-colors"
                                    >
                                        <User size={16} className="text-surface-500" />
                                        Profile Settings
                                    </button>
                                    <button
                                        onClick={() => { setProfileOpen(false); logout(); }}
                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    )
}
