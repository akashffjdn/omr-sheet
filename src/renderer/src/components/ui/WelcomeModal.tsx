import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scan, Zap, BarChart3, Settings, ArrowRight, Check, Sparkles } from 'lucide-react'
import { create } from 'zustand'
import { cn } from '@/lib/utils'

// ─── Welcome Store ───────────────────────────
interface WelcomeStore {
    isOpen: boolean
    hasSeenWelcome: boolean
    open: () => void
    close: () => void
    markSeen: () => void
}

export const useWelcomeStore = create<WelcomeStore>((set) => ({
    isOpen: !localStorage.getItem('omr-welcome-seen'),
    hasSeenWelcome: !!localStorage.getItem('omr-welcome-seen'),
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    markSeen: () => {
        localStorage.setItem('omr-welcome-seen', 'true')
        set({ isOpen: false, hasSeenWelcome: true })
    }
}))

// ─── Step Data ───────────────────────────────
const welcomeSteps = [
    {
        icon: Scan,
        title: 'Welcome to OMR Pro',
        subtitle: 'Professional OMR Sheet Processing',
        description:
            'OMR Pro helps you scan, process, and analyze Optical Mark Recognition sheets with precision. Ideal for exams, quizzes, and assessments.',
        color: 'brand'
    },
    {
        icon: Zap,
        title: 'Create & Process Batches',
        subtitle: 'Step-by-step wizard',
        description:
            'Set up your exam, import scanned sheets, define answer keys, and process everything in a guided 4-step workflow. Results are generated instantly.',
        color: 'cyan'
    },
    {
        icon: BarChart3,
        title: 'Powerful Analytics',
        subtitle: 'Deep insights at a glance',
        description:
            'View scores, rankings, subject-wise breakdowns, item analysis, and performance trends. Export reports as CSV or PDF for record keeping.',
        color: 'emerald'
    },
    {
        icon: Settings,
        title: 'Fully Customizable',
        subtitle: 'Your workspace, your way',
        description:
            'Choose from 8 accent colors, dark/light theme, compact mode, and fine-tune OMR engine parameters like bubble threshold and deskew tolerance.',
        color: 'amber'
    }
]

const colorMap: Record<string, { bg: string; text: string; glow: string }> = {
    brand: { bg: 'bg-brand-500/15', text: 'text-brand-400', glow: 'shadow-brand-500/20' },
    cyan: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
    emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
    amber: { bg: 'bg-amber-500/15', text: 'text-amber-400', glow: 'shadow-amber-500/20' }
}

// ─── Welcome Modal Component ─────────────────
export function WelcomeModal() {
    const { isOpen, markSeen } = useWelcomeStore()
    const [step, setStep] = useState(0)
    const current = welcomeSteps[step]
    const Icon = current.icon
    const colors = colorMap[current.color]
    const isLast = step === welcomeSteps.length - 1

    const handleNext = () => {
        if (isLast) {
            markSeen()
        } else {
            setStep((s) => s + 1)
        }
    }

    const handleSkip = () => {
        markSeen()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[300]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
                        className="fixed inset-0 z-[301] flex items-center justify-center p-4"
                    >
                        <div className="w-full max-w-md bg-surface-900 border border-surface-700/60 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Illustration area */}
                            <div className="relative px-8 pt-10 pb-6 text-center">
                                {/* Background gradient */}
                                <div className="absolute inset-0 bg-gradient-to-b from-brand-950/50 to-transparent" />
                                <div className="absolute top-4 right-4">
                                    <Sparkles size={20} className="text-brand-500/30" />
                                </div>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={step}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        transition={{ duration: 0.2 }}
                                        className="relative"
                                    >
                                        <div className={cn('w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg', colors.bg, colors.glow)}>
                                            <Icon size={32} className={colors.text} />
                                        </div>
                                        <h2 className="text-xl font-bold text-surface-50 mb-1">{current.title}</h2>
                                        <p className="text-sm font-medium text-brand-400">{current.subtitle}</p>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Description */}
                            <div className="px-8 pb-4">
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={step}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.2, delay: 0.05 }}
                                        className="text-sm text-surface-400 text-center leading-relaxed"
                                    >
                                        {current.description}
                                    </motion.p>
                                </AnimatePresence>
                            </div>

                            {/* Step dots */}
                            <div className="flex items-center justify-center gap-2 py-3">
                                {welcomeSteps.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setStep(i)}
                                        className={cn(
                                            'h-1.5 rounded-full transition-all duration-300',
                                            i === step
                                                ? 'w-6 bg-brand-500'
                                                : 'w-1.5 bg-surface-700 hover:bg-surface-600'
                                        )}
                                    />
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between px-6 py-4 border-t border-surface-800/40">
                                <button
                                    onClick={handleSkip}
                                    className="text-sm text-surface-500 hover:text-surface-300 transition-colors"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="btn-glow flex items-center gap-2"
                                >
                                    {isLast ? (
                                        <>
                                            <Check size={16} />
                                            Get Started
                                        </>
                                    ) : (
                                        <>
                                            Next
                                            <ArrowRight size={16} />
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
