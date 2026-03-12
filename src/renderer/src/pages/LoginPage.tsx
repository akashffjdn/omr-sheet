import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Loader2, ScanLine, BarChart3, Zap, Shield, FileStack, TrendingUp } from 'lucide-react'
import { useAppStore } from '@/stores'
import { toast } from '@/components/ui/Toast'
import appIcon from '@/assets/icon.png'
import { cn } from '@/lib/utils'

// Dot grid SVG pattern
function DotGrid() {
    return (
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="dotgrid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="0.8" fill="white" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotgrid)" />
        </svg>
    )
}

export default function LoginPage() {
    const { login } = useAppStore()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = () => {
        if (!email.trim() || !password.trim()) {
            toast.warning('Missing fields', 'Please fill in all fields')
            return
        }
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            login(email.trim())
        }, 1500)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) handleLogin()
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-surface-950">
            {/* ========== LEFT PANEL — Hero Dashboard Preview ========== */}
            <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-indigo-950 flex-col">
                <DotGrid />

                {/* Animated gradient blobs */}
                <motion.div
                    className="absolute top-[-8%] left-[-8%] w-[500px] h-[500px] rounded-full bg-brand-600/12 blur-[120px]"
                    animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-[-12%] right-[-8%] w-[400px] h-[400px] rounded-full bg-accent-cyan/8 blur-[120px]"
                    animate={{ x: [0, -30, 0], y: [0, 25, 0] }}
                    transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Glowing right border */}
                <motion.div
                    className="absolute top-0 right-0 w-[1px] h-full z-20"
                    style={{ background: 'linear-gradient(to bottom, transparent 5%, rgba(99,102,241,0.4) 35%, rgba(34,211,238,0.25) 65%, transparent 95%)' }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Full-panel dashboard mockup */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 flex flex-col h-full"
                >
                    {/* Title bar with logo + branding */}
                    <div className="flex items-center gap-3.5 px-6 py-5 border-b border-white/[0.06] bg-white/[0.02]">
                        <img src={appIcon} alt="OMR Pro" className="w-10 h-10 rounded-xl shadow-lg shadow-brand-500/15" />
                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight leading-none">
                                OMR <span className="gradient-text">Pro</span>
                            </h1>
                            <p className="text-[11px] text-surface-500 tracking-wide uppercase mt-1">Professional Sheet Processing</p>
                        </div>
                        <span className="ml-auto text-[10px] text-surface-600">v1.0.0</span>
                    </div>

                    {/* Dashboard content */}
                    <div className="flex-1 flex flex-col justify-center p-6 space-y-4 overflow-hidden">
                        {/* Stats row */}
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { label: 'Total Batches', value: '248', icon: FileStack, change: '+12%', color: 'text-brand-400' },
                                { label: 'Sheets Processed', value: '50,432', icon: ScanLine, change: '+28%', color: 'text-accent-cyan' },
                                { label: 'Avg Score', value: '76.4%', icon: TrendingUp, change: '+3.2%', color: 'text-emerald-400' },
                                { label: 'Accuracy', value: '99.8%', icon: Shield, change: '±0%', color: 'text-amber-400' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                                    className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <stat.icon size={15} className={stat.color} />
                                        <span className="text-[10px] text-emerald-400 font-medium">{stat.change}</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white leading-none">{stat.value}</p>
                                    <p className="text-[11px] text-surface-500 mt-1.5">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Chart + Recent batches row */}
                        <div className="grid grid-cols-5 gap-3">
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.4 }}
                                className="col-span-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-semibold text-surface-300">Processing Overview</span>
                                    <span className="text-[11px] text-surface-500">Last 7 days</span>
                                </div>
                                <div className="flex items-end gap-2 h-[120px]">
                                    {[35, 55, 40, 70, 50, 85, 65].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-600/60 to-brand-400/30"
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ delay: 0.8 + i * 0.06, duration: 0.5, ease: 'easeOut' }}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between mt-2">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                                        <span key={i} className="flex-1 text-center text-[10px] text-surface-600">{d}</span>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.4 }}
                                className="col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
                            >
                                <span className="text-sm font-semibold text-surface-300">Recent Batches</span>
                                <div className="mt-3 space-y-3">
                                    {[
                                        { name: 'JEE Mock Test', score: '82%', status: 'bg-emerald-500' },
                                        { name: 'NEET Practice', score: '76%', status: 'bg-brand-500' },
                                        { name: 'Board Exam', score: '91%', status: 'bg-accent-cyan' },
                                        { name: 'SSC CGL Paper', score: '56%', status: 'bg-amber-500' },
                                    ].map((batch, i) => (
                                        <motion.div
                                            key={batch.name}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.9 + i * 0.08, duration: 0.3 }}
                                            className="flex items-center gap-2"
                                        >
                                            <div className={cn('w-1.5 h-1.5 rounded-full', batch.status)} />
                                            <span className="text-xs text-surface-300 flex-1 truncate">{batch.name}</span>
                                            <span className="text-xs font-semibold text-surface-200">{batch.score}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* OMR bubble detection preview */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.85, duration: 0.4 }}
                            className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-surface-300">OMR Detection Preview</span>
                                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Live
                                </span>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2.5">
                                    {[
                                        { q: 1, ans: 1 }, { q: 2, ans: 3 }, { q: 3, ans: 0 },
                                        { q: 4, ans: 2 }, { q: 5, ans: 1 },
                                    ].map((row, i) => (
                                        <motion.div
                                            key={row.q}
                                            className="flex items-center gap-2.5"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 1.0 + i * 0.06 }}
                                        >
                                            <span className="text-[10px] text-surface-500 w-4 text-right font-mono">{row.q}.</span>
                                            <div className="flex gap-2">
                                                {['A', 'B', 'C', 'D'].map((opt, j) => (
                                                    <div
                                                        key={opt}
                                                        className={cn(
                                                            'w-6 h-6 rounded-full text-[8px] flex items-center justify-center font-mono border transition-all',
                                                            j === row.ans
                                                                ? 'bg-brand-500/50 border-brand-400/70 text-white shadow-sm shadow-brand-500/20'
                                                                : 'border-surface-700/40 text-surface-600'
                                                        )}
                                                    >
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex-1 h-[3px] rounded bg-surface-700/20">
                                                <motion.div
                                                    className="h-full rounded bg-emerald-500/50"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '100%' }}
                                                    transition={{ delay: 1.1 + i * 0.08, duration: 0.4 }}
                                                />
                                            </div>
                                            <span className="text-[9px] text-emerald-400 font-mono">OK</span>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="flex flex-col items-center justify-center px-3">
                                    <div className="relative w-20 h-20">
                                        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="5" />
                                            <motion.circle
                                                cx="40" cy="40" r="32" fill="none"
                                                stroke="url(#ringGrad)"
                                                strokeWidth="5" strokeLinecap="round"
                                                strokeDasharray="201.1"
                                                initial={{ strokeDashoffset: 201.1 }}
                                                animate={{ strokeDashoffset: 4.0 }}
                                                transition={{ delay: 1.1, duration: 1.5, ease: 'easeOut' }}
                                            />
                                            <defs>
                                                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#22d3ee" />
                                                    <stop offset="100%" stopColor="#6366f1" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-base font-bold text-white">98%</span>
                                    </div>
                                    <span className="text-[9px] text-surface-500 mt-1.5">Match Rate</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Feature pills */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.4 }}
                            className="flex items-center gap-2.5"
                        >
                            {[
                                { icon: Zap, label: 'Fast' },
                                { icon: Shield, label: '99.8% Accurate' },
                                { icon: BarChart3, label: 'Analytics' },
                                { icon: ScanLine, label: 'Auto Detect' },
                            ].map(({ icon: Icon, label }) => (
                                <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] text-[11px] text-surface-400">
                                    <Icon size={11} className="text-brand-400" />
                                    {label}
                                </span>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* ========== RIGHT PANEL — Login Form ========== */}
            <div className="flex-1 flex items-center justify-center p-8 relative">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-brand-950/20 to-transparent pointer-events-none" />

                <div className="w-full max-w-sm relative z-10" onKeyDown={handleKeyDown}>
                    {/* Mobile logo */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:hidden flex items-center gap-3 mb-8 justify-center"
                    >
                        <img src={appIcon} alt="OMR Pro" className="w-12 h-12 rounded-xl" />
                        <h1 className="text-2xl font-bold text-white">
                            OMR <span className="gradient-text">Pro</span>
                        </h1>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="mb-8">
                        <h2 className="text-2xl font-bold text-surface-100 mb-1">Welcome back</h2>
                        <p className="text-sm text-surface-400">Sign in to your account</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-4">
                        <label className="block text-sm font-medium text-surface-400 mb-1.5">Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="input-field pl-10" disabled={isLoading} />
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="mb-4">
                        <label className="block text-sm font-medium text-surface-400 mb-1.5">Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="input-field pl-10 pr-10" disabled={isLoading} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors" tabIndex={-1}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex items-center mb-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-brand-500 focus:ring-brand-500/40 focus:ring-2 accent-brand-500" />
                            <span className="text-sm text-surface-400 group-hover:text-surface-300 transition-colors">Remember me</span>
                        </label>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
                        <motion.button
                            onClick={handleLogin}
                            disabled={isLoading}
                            whileHover={!isLoading ? { scale: 1.02 } : {}}
                            whileTap={!isLoading ? { scale: 0.98 } : {}}
                            className={cn('btn-glow w-full flex items-center justify-center gap-2 py-3', isLoading && 'opacity-80 cursor-not-allowed')}
                        >
                            {isLoading ? (<><Loader2 size={18} className="animate-spin" />Signing in...</>) : 'Sign In'}
                        </motion.button>
                    </motion.div>

                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="text-center mt-6 text-[11px] text-surface-600">
                        Made by{' '}
                        <button onClick={() => window.open('https://unitednexa.com/', '_blank')} className="text-surface-400 font-medium hover:text-brand-400 transition-colors cursor-pointer">
                            United Nexa Tech
                        </button>
                    </motion.p>
                </div>
            </div>
        </div>
    )
}
