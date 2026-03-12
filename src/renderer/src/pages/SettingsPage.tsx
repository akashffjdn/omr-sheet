import { motion } from 'framer-motion'
import {
    Palette,
    Database,
    ScanLine,
    Monitor,
    Info,
    Save,
    RotateCcw,
    Sun,
    Moon,
    Laptop,
    HardDrive,
    FolderOpen,
    Clock,
    Shield,
    Bell,
    Globe,
    FileText,
    Github,
    Heart,
    ExternalLink,
    ChevronRight,
    Check,
    RefreshCw
} from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/stores'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'
import { confirm as confirmDialog } from '@/components/ui/ConfirmDialog'
import Tooltip from '@/components/ui/Tooltip'
import { Toggle } from '@/components/ui/Toggle'

// ─── Setting Row Component ───────────────────────────
function SettingRow({
    label,
    description,
    children,
    className
}: {
    label: string
    description?: string
    children: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn('flex items-center justify-between gap-4 py-3', className)}>
            <div className="min-w-0">
                <p className="text-sm font-medium text-surface-200">{label}</p>
                {description && <p className="text-2xs text-surface-500 mt-0.5">{description}</p>}
            </div>
            <div className="flex-shrink-0">{children}</div>
        </div>
    )
}

// ─── Section Card ──────────────────────────────────
function SectionCard({
    title,
    description,
    icon: Icon,
    children
}: {
    title: string
    description: string
    icon: React.ElementType
    children: React.ReactNode
}) {
    return (
        <div className="glass-card overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-surface-800/40">
                <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
                    <Icon size={16} />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-surface-100">{title}</h4>
                    <p className="text-2xs text-surface-500">{description}</p>
                </div>
            </div>
            <div className="px-5 divide-y divide-surface-800/30">
                {children}
            </div>
        </div>
    )
}

// ─── Toggle Switch ─────────────────────────────────
export default function SettingsPage() {
    const { theme, toggleTheme, settingsSection, accentColor, setAccentColor, compactMode, setCompactMode, animations, setAnimations } = useAppStore()
    const [bubbleThreshold, setBubbleThreshold] = useState(40)
    const [deskewTolerance, setDeskewTolerance] = useState(5)
    const [autoSave, setAutoSave] = useState(true)
    const [notifications, setNotifications] = useState(true)
    const [soundEffects, setSoundEffects] = useState(false)
    const [autoBackup, setAutoBackup] = useState(true)

    const themeOptions = [
        { id: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
        { id: 'light', label: 'Light', icon: Sun, desc: 'Bright and clear' }
    ]

    const accentColors = [
        { color: '#6366f1', name: 'Indigo' },
        { color: '#22d3ee', name: 'Cyan' },
        { color: '#f59e0b', name: 'Amber' },
        { color: '#22c55e', name: 'Emerald' },
        { color: '#f43f5e', name: 'Rose' },
        { color: '#a855f7', name: 'Purple' },
        { color: '#f97316', name: 'Orange' },
        { color: '#06b6d4', name: 'Teal' }
    ]

    const handleThemeChange = (id: string) => {
        if ((id === 'dark' && theme !== 'dark') || (id === 'light' && theme !== 'light')) {
            toggleTheme()
            toast.success('Theme Changed', `Switched to ${id} mode.`)
        }
    }

    const handleAccentChange = (color: string, name: string) => {
        setAccentColor(color)
        toast.success('Accent Updated', `Accent color set to ${name}.`)
    }

    const handleCreateBackup = () => {
        toast.success('Backup Created', 'Data backed up to local storage successfully.')
    }

    const handleRestoreBackup = () => {
        confirmDialog.delete('restore from backup', () => {
            toast.info('Restore Started', 'Restoring from latest backup...')
        })
    }

    const handleClearData = () => {
        confirmDialog.clearData(() => {
            toast.success('Data Cleared', 'All data has been permanently removed.')
        })
    }

    return (
        <div className="p-5 3xl:p-8 overflow-y-auto h-full">
            <motion.div
                key={settingsSection}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
            >
                {/* ═══════ GENERAL ═══════ */}
                {settingsSection === 'general' && (
                    <>
                        <div className="mb-1">
                            <h3 className="text-lg font-semibold text-surface-100">General</h3>
                            <p className="text-2xs text-surface-500">Default values and application behavior</p>
                        </div>

                        <SectionCard title="Defaults" description="Pre-filled values for new batches" icon={FileText}>
                            <SettingRow label="Exam Name Prefix" description="Default name when creating a new batch">
                                <input type="text" className="input-field w-44 text-sm py-1.5" defaultValue="Mock Test" />
                            </SettingRow>
                            <div className="grid grid-cols-3 gap-3 py-3">
                                <div>
                                    <label className="block text-2xs font-medium text-surface-400 mb-1">Correct Marks</label>
                                    <input type="number" className="input-field font-mono text-sm py-1.5" defaultValue={4} step="0.25" min={0.25} />
                                </div>
                                <div>
                                    <label className="block text-2xs font-medium text-surface-400 mb-1">Incorrect Marks</label>
                                    <input type="number" className="input-field font-mono text-sm py-1.5" defaultValue={-1} step="0.25" max={0} />
                                </div>
                                <div>
                                    <label className="block text-2xs font-medium text-surface-400 mb-1">Total Questions</label>
                                    <input type="number" className="input-field font-mono text-sm py-1.5" defaultValue={100} min={1} max={300} />
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="Behavior" description="Controls how the app behaves" icon={Monitor}>
                            <SettingRow label="Auto-save" description="Save batch progress automatically">
                                <Toggle checked={autoSave} onChange={setAutoSave} />
                            </SettingRow>
                            {autoSave && (
                                <SettingRow label="Save Interval">
                                    <select className="input-field w-40 text-sm py-1.5">
                                        <option>Every 30 seconds</option>
                                        <option>Every 1 minute</option>
                                        <option>Every 5 minutes</option>
                                    </select>
                                </SettingRow>
                            )}
                            <SettingRow label="Notifications" description="Show system notifications for events">
                                <Toggle checked={notifications} onChange={setNotifications} />
                            </SettingRow>
                            <SettingRow label="Sound Effects" description="Play sounds on processing completion">
                                <Toggle checked={soundEffects} onChange={setSoundEffects} />
                            </SettingRow>
                            <SettingRow label="Language">
                                <select className="input-field w-40 text-sm py-1.5">
                                    <option>English</option>
                                    <option>Hindi</option>
                                </select>
                            </SettingRow>
                        </SectionCard>
                    </>
                )}

                {/* ═══════ OMR ENGINE ═══════ */}
                {settingsSection === 'omr' && (
                    <>
                        <div className="mb-1">
                            <h3 className="text-lg font-semibold text-surface-100">OMR Engine</h3>
                            <p className="text-2xs text-surface-500">Fine-tune mark recognition parameters</p>
                        </div>

                        <SectionCard title="Detection" description="Bubble and mark detection parameters" icon={ScanLine}>
                            <SettingRow label="Bubble Threshold" description="Min filled percentage to register a marked bubble">
                                <div className="flex items-center gap-3 w-48">
                                    <input
                                        type="range"
                                        min="20"
                                        max="80"
                                        value={bubbleThreshold}
                                        onChange={(e) => setBubbleThreshold(Number(e.target.value))}
                                        className="flex-1 accent-brand-500"
                                    />
                                    <span className="text-sm font-mono text-surface-300 w-10 text-right">{bubbleThreshold}%</span>
                                </div>
                            </SettingRow>
                            <SettingRow label="Deskew Tolerance" description="Maximum skew angle before auto-correction">
                                <div className="flex items-center gap-3 w-48">
                                    <input
                                        type="range"
                                        min="1"
                                        max="15"
                                        value={deskewTolerance}
                                        onChange={(e) => setDeskewTolerance(Number(e.target.value))}
                                        className="flex-1 accent-brand-500"
                                    />
                                    <span className="text-sm font-mono text-surface-300 w-10 text-right">{deskewTolerance}°</span>
                                </div>
                            </SettingRow>
                        </SectionCard>

                        <SectionCard title="Color Channels" description="Channels to drop during pre-processing" icon={Palette}>
                            <div className="py-3">
                                <div className="flex flex-wrap gap-2">
                                    {['Magenta', 'Green', 'Red', 'Blue', 'Cyan'].map((c) => (
                                        <label
                                            key={c}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-800/40 border border-surface-700/30 cursor-pointer hover:border-brand-500/30 transition-all"
                                        >
                                            <input
                                                type="checkbox"
                                                defaultChecked={c === 'Magenta' || c === 'Green'}
                                                className="accent-brand-500"
                                            />
                                            <span className="text-sm text-surface-300">{c}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="Performance" description="Processing speed and accuracy tradeoffs" icon={Clock}>
                            <SettingRow label="Processing Mode">
                                <select className="input-field w-40 text-sm py-1.5">
                                    <option>Balanced</option>
                                    <option>Fast</option>
                                    <option>Accurate</option>
                                </select>
                            </SettingRow>
                            <SettingRow label="Parallel Threads" description="Number of concurrent processing threads">
                                <select className="input-field w-40 text-sm py-1.5">
                                    <option>Auto</option>
                                    <option>2</option>
                                    <option>4</option>
                                    <option>8</option>
                                </select>
                            </SettingRow>
                        </SectionCard>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => {
                                    confirmDialog.clearData(() => {
                                        setBubbleThreshold(40)
                                        setDeskewTolerance(5)
                                        toast.success('Settings Reset', 'OMR Engine settings restored to defaults')
                                    })
                                }}
                                className="btn-ghost text-sm text-surface-400 hover:text-red-400"
                            >
                                Reset to Defaults
                            </button>
                        </div>
                    </>
                )}

                {/* ═══════ APPEARANCE ═══════ */}
                {settingsSection === 'appearance' && (
                    <>
                        <div className="mb-1">
                            <h3 className="text-lg font-semibold text-surface-100">Appearance</h3>
                            <p className="text-2xs text-surface-500">Customize the look and feel of the app</p>
                        </div>

                        <SectionCard title="Theme" description="Choose your preferred color scheme" icon={Palette}>
                            <div className="py-3">
                                <div className="grid grid-cols-2 gap-3">
                                    {themeOptions.map((t) => {
                                        const isActive = theme === t.id
                                        const Icon = t.icon
                                        return (
                                            <button
                                                key={t.id}
                                                onClick={() => handleThemeChange(t.id)}
                                                className={cn(
                                                    'relative flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all',
                                                    isActive
                                                        ? 'border-brand-500 bg-brand-500/8'
                                                        : 'border-surface-800/50 hover:border-surface-600'
                                                )}
                                            >
                                                <div className={cn(
                                                    'p-2 rounded-lg',
                                                    isActive ? 'bg-brand-500/15 text-brand-400' : 'bg-surface-800/60 text-surface-400'
                                                )}>
                                                    <Icon size={18} />
                                                </div>
                                                <div className="text-left">
                                                    <p className={cn('text-sm font-semibold', isActive ? 'text-brand-400' : 'text-surface-300')}>
                                                        {t.label}
                                                    </p>
                                                    <p className="text-2xs text-surface-500">{t.desc}</p>
                                                </div>
                                                {isActive && (
                                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                                                        <Check size={12} className="text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="Accent Color" description="Brand color throughout the interface" icon={Palette}>
                            <div className="py-3">
                                <div className="flex gap-2.5 flex-wrap">
                                    {accentColors.map(({ color, name }) => (
                                        <button
                                            key={color}
                                            onClick={() => handleAccentChange(color, name)}
                                            title={name}
                                            className={cn(
                                                'w-9 h-9 rounded-xl border-2 transition-all hover:scale-110 relative',
                                                accentColor === color ? 'border-white/60 scale-110' : 'border-transparent'
                                            )}
                                            style={{ backgroundColor: color }}
                                        >
                                            {accentColor === color && (
                                                <Check size={14} className="text-white absolute inset-0 m-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-2xs text-surface-600 mt-2">
                                    Selected: {accentColors.find(c => c.color === accentColor)?.name || 'Custom'}
                                </p>
                            </div>
                        </SectionCard>

                        <SectionCard title="Interface" description="UI density and animations" icon={Monitor}>
                            <SettingRow label="Animations" description="Enable smooth transitions and effects">
                                <Toggle checked={animations} onChange={setAnimations} />
                            </SettingRow>
                        </SectionCard>
                    </>
                )}

                {/* ═══════ DATA & STORAGE ═══════ */}
                {settingsSection === 'data' && (
                    <>
                        <div className="mb-1">
                            <h3 className="text-lg font-semibold text-surface-100">Data & Storage</h3>
                            <p className="text-2xs text-surface-500">Manage local database and backups</p>
                        </div>

                        <SectionCard title="Database" description="Your local data storage" icon={HardDrive}>
                            <SettingRow label="Location">
                                <div className="flex items-center gap-2">
                                    <code className="text-2xs text-surface-500 font-mono bg-surface-800/40 px-2 py-1 rounded">
                                        ~\AppData\Local\OMR Pro
                                    </code>
                                    <button className="btn-ghost text-2xs py-1 px-2.5">Change</button>
                                </div>
                            </SettingRow>
                            <SettingRow label="Size">
                                <span className="text-sm font-mono text-surface-300">14.2 MB</span>
                            </SettingRow>
                            <SettingRow label="Records">
                                <span className="text-sm text-surface-400">24 batches · 3,847 sheets</span>
                            </SettingRow>
                        </SectionCard>

                        <SectionCard title="Backups" description="Protect your data with backups" icon={Shield}>
                            <SettingRow label="Auto Backup" description="Automatically back up data daily">
                                <Toggle checked={autoBackup} onChange={setAutoBackup} />
                            </SettingRow>
                            <SettingRow label="Last Backup">
                                <span className="text-sm text-surface-400">Today, 10:30 AM</span>
                            </SettingRow>
                            <div className="flex gap-2 py-3">
                                <button
                                    onClick={handleCreateBackup}
                                    className="btn-glow text-2xs py-1.5 px-4 flex items-center gap-1.5"
                                >
                                    <Save size={13} /> Create Backup
                                </button>
                                <button
                                    onClick={handleRestoreBackup}
                                    className="btn-ghost text-2xs py-1.5 px-4 flex items-center gap-1.5"
                                >
                                    <RotateCcw size={13} /> Restore
                                </button>
                            </div>
                        </SectionCard>

                        <SectionCard title="Danger Zone" description="Irreversible data operations" icon={Shield}>
                            <div className="py-3 space-y-2">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-danger-500/5 border border-danger-500/15">
                                    <div>
                                        <p className="text-sm font-medium text-danger-400">Clear All Data</p>
                                        <p className="text-2xs text-surface-500">Delete all batches, sheets, and results</p>
                                    </div>
                                    <button
                                        onClick={handleClearData}
                                        className="px-3 py-1.5 rounded-lg text-2xs font-semibold bg-danger-500/15 text-danger-400 hover:bg-danger-500/25 transition-colors"
                                    >
                                        Clear Data
                                    </button>
                                </div>
                            </div>
                        </SectionCard>
                    </>
                )}

                {/* ═══════ ABOUT ═══════ */}
                {settingsSection === 'about' && (
                    <>
                        <div className="mb-1">
                            <h3 className="text-lg font-semibold text-surface-100">About</h3>
                            <p className="text-2xs text-surface-500">Application info and updates</p>
                        </div>

                        <SectionCard title="OMR Pro" description="Professional OMR sheet processing" icon={ScanLine}>
                            <SettingRow label="Version">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-mono text-surface-300">1.0.0</span>
                                    <span className="text-2xs bg-success-500/15 text-success-400 px-2 py-0.5 rounded-full font-semibold">Latest</span>
                                </div>
                            </SettingRow>
                            <SettingRow label="Electron">
                                <span className="text-sm font-mono text-surface-400">v35.0.0</span>
                            </SettingRow>
                            <SettingRow label="Platform">
                                <span className="text-sm text-surface-400">Windows x64</span>
                            </SettingRow>
                        </SectionCard>

                        <SectionCard title="Links" description="Resources and support" icon={Globe}>
                            {[
                                { label: 'Documentation', desc: 'Guides and API reference', icon: FileText },
                                { label: 'Release Notes', desc: 'What\'s new in this version', icon: ExternalLink },
                                { label: 'Report a Bug', desc: 'Help us improve OMR Pro', icon: Github }
                            ].map((link) => (
                                <button
                                    key={link.label}
                                    className="flex items-center justify-between w-full py-3 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <link.icon size={15} className="text-surface-500 group-hover:text-brand-400 transition-colors" />
                                        <div className="text-left">
                                            <p className="text-sm text-surface-300 group-hover:text-brand-400 transition-colors">{link.label}</p>
                                            <p className="text-2xs text-surface-600">{link.desc}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-surface-600 group-hover:text-surface-400 transition-colors" />
                                </button>
                            ))}
                        </SectionCard>

                    </>
                )}
            </motion.div>
        </div>
    )
}
