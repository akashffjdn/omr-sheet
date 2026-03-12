import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
    TrendingUp,
    BarChart3,
    PieChart,
    Activity,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    ChevronLeft,
    ChevronRight,
    FolderOpen
} from 'lucide-react'
import { useDashboardStore } from '@/stores'

// ── Helpers ──────────────────────────────────

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getMonthKey(dateStr: string): string {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthLabel(key: string): string {
    const [year, month] = key.split('-')
    return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`
}

function getBarColor(avg: number): string {
    if (avg >= 80) return 'bg-emerald-500'
    if (avg >= 65) return 'bg-brand-500'
    if (avg >= 50) return 'bg-cyan-500'
    if (avg >= 40) return 'bg-amber-500'
    return 'bg-red-500'
}

export default function AnalyticsPage() {
    const { recentBatches } = useDashboardStore()

    // Generate last 12 months (newest first) so all months are navigable
    const availableMonths = useMemo(() => {
        const months: string[] = []
        const now = new Date()
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
        }
        return months
    }, [])

    const [selectedMonth, setSelectedMonth] = useState<string>('all')

    // Filter batches by selected month
    const filteredBatches = useMemo(() => {
        if (selectedMonth === 'all') return recentBatches
        return recentBatches.filter((b) => getMonthKey(b.date) === selectedMonth)
    }, [recentBatches, selectedMonth])

    // Compute subject stats from filtered batches
    const subjectStats = useMemo(() => {
        const map = new Map<string, { scores: number[]; count: number }>()
        filteredBatches.forEach((b) => {
            if (!map.has(b.subject)) map.set(b.subject, { scores: [], count: 0 })
            const entry = map.get(b.subject)!
            entry.count++
            if (b.averageScore !== undefined) entry.scores.push(b.averageScore)
        })
        return Array.from(map.entries())
            .map(([subject, data]) => ({
                subject,
                avg: data.scores.length
                    ? Math.round(data.scores.reduce((s, v) => s + v, 0) / data.scores.length)
                    : 0,
                count: data.count
            }))
            .sort((a, b) => b.avg - a.avg)
    }, [filteredBatches])

    // Summary card values from filtered batches
    const totalBatchCount = filteredBatches.length
    const totalSheets = filteredBatches.reduce((sum, b) => sum + b.totalSheets, 0)
    const overallAvgScore = useMemo(() => {
        const withScores = filteredBatches.filter((b) => b.averageScore !== undefined)
        if (withScores.length === 0) return 0
        return Math.round(withScores.reduce((s, b) => s + (b.averageScore ?? 0), 0) / withScores.length)
    }, [filteredBatches])
    const avgPassRate = useMemo(() => {
        const withPass = filteredBatches.filter((b) => b.passPercentage !== undefined)
        if (withPass.length === 0) return 0
        return Math.round(withPass.reduce((s, b) => s + (b.passPercentage ?? 0), 0) / withPass.length)
    }, [filteredBatches])

    // Compute performance trend data based on selection
    const trendData = useMemo(() => {
        if (selectedMonth === 'all') {
            // Group all batches by month — show monthly overview
            const map = new Map<string, { scores: number[]; count: number }>()
            recentBatches.forEach((b) => {
                const mk = getMonthKey(b.date)
                if (!map.has(mk)) map.set(mk, { scores: [], count: 0 })
                const entry = map.get(mk)!
                entry.count++
                if (b.averageScore !== undefined) entry.scores.push(b.averageScore)
            })
            return Array.from(map.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, data]) => ({
                    label: formatMonthLabel(key),
                    subLabel: `${data.count} ${data.count === 1 ? 'batch' : 'batches'}`,
                    avgScore: data.scores.length
                        ? Math.round(data.scores.reduce((s, v) => s + v, 0) / data.scores.length)
                        : 0
                }))
        } else {
            // Show individual batches for the selected month
            return filteredBatches
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((b) => ({
                    label: b.name.length > 12 ? b.name.slice(0, 12) + '…' : b.name,
                    subLabel: b.subject,
                    avgScore: b.averageScore ?? 0
                }))
        }
    }, [selectedMonth, recentBatches, filteredBatches])

    // Sliding window for month pills (show 5 at a time)
    const VISIBLE_COUNT = 5
    const [windowStart, setWindowStart] = useState(0)
    const visibleMonths = availableMonths.slice(windowStart, windowStart + VISIBLE_COUNT)
    const canScrollLeft = windowStart > 0
    const canScrollRight = windowStart + VISIBLE_COUNT < availableMonths.length

    const scrollLeft = () => setWindowStart((prev) => Math.max(0, prev - 1))
    const scrollRight = () => setWindowStart((prev) => Math.min(availableMonths.length - VISIBLE_COUNT, prev + 1))

    return (
        <div className="p-6 3xl:p-10 space-y-6 3xl:space-y-8 h-full overflow-y-auto">

            {/* Month Switcher — filters whole page */}
            <div className="flex items-center justify-end">
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={scrollLeft}
                        disabled={!canScrollLeft}
                        className="p-1.5 rounded-lg dark:text-surface-400 text-surface-500 hover:text-surface-200 dark:hover:bg-surface-800/50 hover:bg-surface-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center gap-0.5 dark:bg-surface-800/50 bg-surface-100 rounded-xl px-0.5 py-0.5">
                        <button
                            onClick={() => setSelectedMonth('all')}
                            className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all ${
                                selectedMonth === 'all'
                                    ? 'bg-brand-500 text-white shadow-sm'
                                    : 'dark:text-surface-400 text-surface-500 hover:text-surface-200'
                            }`}
                        >
                            All
                        </button>
                        {visibleMonths.map((mk) => (
                            <button
                                key={mk}
                                onClick={() => setSelectedMonth(mk)}
                                className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all ${
                                    selectedMonth === mk
                                        ? 'bg-brand-500 text-white shadow-sm'
                                        : 'dark:text-surface-400 text-surface-500 hover:text-surface-200'
                                }`}
                            >
                                {formatMonthLabel(mk)}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={scrollRight}
                        disabled={!canScrollRight}
                        className="p-1.5 rounded-lg dark:text-surface-400 text-surface-500 hover:text-surface-200 dark:hover:bg-surface-800/50 hover:bg-surface-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Empty state for selected month with no data */}
            {selectedMonth !== 'all' && filteredBatches.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-24 text-center"
                >
                    <div className="w-16 h-16 rounded-2xl bg-surface-800/40 flex items-center justify-center mb-4">
                        <Calendar size={32} className="text-surface-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-surface-300 mb-1">
                        No data for {formatMonthLabel(selectedMonth)}
                    </h3>
                    <p className="text-sm text-surface-500 mb-5 max-w-xs">
                        No batches were processed during this month. Try selecting a different period.
                    </p>
                    <button
                        onClick={() => setSelectedMonth('all')}
                        className="btn-ghost inline-flex items-center gap-2 text-sm"
                    >
                        <BarChart3 size={14} />
                        View All Time Data
                    </button>
                </motion.div>
            ) : (
            <>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 3xl:gap-6">
                {[
                    { label: 'Avg Pass Rate', value: avgPassRate > 0 ? `${avgPassRate}%` : '—', trend: `${totalSheets} sheets`, up: avgPassRate >= 50, icon: TrendingUp, color: 'emerald' },
                    { label: 'Total Sheets', value: totalSheets > 0 ? totalSheets.toLocaleString() : '—', trend: `${totalBatchCount} batches`, up: true, icon: Activity, color: 'brand' },
                    { label: 'Total Batches', value: totalBatchCount > 0 ? totalBatchCount.toString() : '—', trend: `${subjectStats.length} subjects`, up: true, icon: BarChart3, color: 'cyan' },
                    { label: 'Avg Score', value: overallAvgScore > 0 ? `${overallAvgScore}%` : '—', trend: totalBatchCount > 0 ? `across ${totalBatchCount} batches` : 'No data', up: overallAvgScore >= 50, icon: PieChart, color: overallAvgScore >= 50 ? 'emerald' : 'amber' }
                ].map((card, i) => {
                    const Icon = card.icon
                    const colors: Record<string, string> = {
                        emerald: 'text-emerald-400 bg-emerald-500/15',
                        brand: 'text-brand-400 bg-brand-500/15',
                        amber: 'text-amber-400 bg-amber-500/15',
                        cyan: 'text-cyan-400 bg-cyan-500/15'
                    }
                    return (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 + i * 0.05 }}
                            className="glass-card p-5"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 rounded-xl ${colors[card.color]}`}>
                                    <Icon size={18} />
                                </div>
                                <div className={`flex items-center gap-1 text-2xs font-semibold ${card.up ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {card.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {card.trend}
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-surface-100">{card.value}</p>
                            <p className="text-2xs text-surface-500 mt-1">{card.label}</p>
                        </motion.div>
                    )
                })}
            </div>

            {/* Performance Trends — dynamic */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="glass-card p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-sm font-semibold text-surface-200">Performance Trends</h3>
                        <p className="text-2xs text-surface-500 mt-0.5">
                            {selectedMonth === 'all'
                                ? 'Average scores and batch count over time'
                                : `Batch-wise scores for ${formatMonthLabel(selectedMonth)}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-surface-500" />
                        <span className="text-2xs text-surface-500">
                            {selectedMonth === 'all' ? 'All months' : formatMonthLabel(selectedMonth)}
                        </span>
                    </div>
                </div>

                {trendData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                        <FolderOpen size={28} className="text-surface-700 mb-2" />
                        <p className="text-sm text-surface-400">No batch data for this period</p>
                    </div>
                ) : (
                    <div className="flex items-end gap-4 h-48 3xl:h-64 px-4">
                        {trendData.map((d, i) => (
                            <div key={`${d.label}-${i}`} className="flex-1 flex flex-col items-center gap-2 h-full">
                                <span className="text-2xs font-mono text-brand-400 font-semibold flex-shrink-0">
                                    {d.avgScore > 0 ? `${d.avgScore}%` : '—'}
                                </span>
                                <div className="w-full flex-1 flex items-end">
                                    <motion.div
                                        key={`bar-${selectedMonth}-${i}`}
                                        initial={{ height: 0 }}
                                        animate={{ height: d.avgScore > 0 ? `${d.avgScore}%` : '2%' }}
                                        transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                                        className={`w-full rounded-t-lg relative ${
                                            d.avgScore > 0
                                                ? 'bg-gradient-to-t from-brand-600/60 to-brand-400/40'
                                                : 'bg-surface-800/40'
                                        }`}
                                    >
                                        <div className="absolute inset-0 rounded-t-lg bg-gradient-to-t from-transparent to-white/5" />
                                    </motion.div>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xs font-medium text-surface-400 truncate max-w-[80px]">{d.label}</p>
                                    <p className="text-2xs text-surface-600 truncate max-w-[80px]">{d.subLabel}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Subject breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 3xl:gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-4"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-surface-200">Subject-wise Performance</h3>
                        <span className="text-2xs text-surface-500">{subjectStats.length} subjects</span>
                    </div>

                    {/* Dynamic subject bars — compact, scrollable */}
                    {subjectStats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <FolderOpen size={24} className="text-surface-700 mb-2" />
                            <p className="text-sm text-surface-400">No batches in this period</p>
                        </div>
                    ) : (
                        <div className="max-h-[180px] overflow-y-auto overscroll-contain space-y-2.5 pr-1">
                            {subjectStats.map((s, i) => (
                                <motion.div
                                    key={s.subject}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.45 + i * 0.04 }}
                                    className="space-y-1"
                                >
                                    <div className="flex items-center justify-between text-2xs">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-surface-300 font-medium truncate">{s.subject}</span>
                                            <span className="flex-shrink-0 dark:bg-surface-800/60 bg-surface-200 px-1.5 py-0.5 rounded text-surface-500 text-[10px]">
                                                {s.count} {s.count === 1 ? 'batch' : 'batches'}
                                            </span>
                                        </div>
                                        <span className="text-surface-400 font-mono flex-shrink-0 ml-2">
                                            {s.avg > 0 ? `${s.avg}%` : '—'}
                                        </span>
                                    </div>
                                    <div className="h-2 dark:bg-surface-800 bg-surface-200 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: s.avg > 0 ? `${s.avg}%` : '0%' }}
                                            transition={{ delay: 0.5 + i * 0.04, duration: 0.8 }}
                                            className={`h-full rounded-full ${getBarColor(s.avg)}`}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="glass-card p-4"
                >
                    <h3 className="text-sm font-semibold text-surface-200 mb-3">Processing Summary</h3>
                    <div className="space-y-3">
                        {[
                            { label: selectedMonth === 'all' ? 'Total sheets' : `Sheets in ${formatMonthLabel(selectedMonth)}`, value: totalSheets.toLocaleString(), icon: '📄' },
                            { label: 'Batches processed', value: filteredBatches.filter((b) => b.status === 'complete').length.toString(), icon: '✅' },
                            { label: 'In progress', value: filteredBatches.filter((b) => b.status === 'processing').length.toString(), icon: '⚡' },
                            { label: 'Drafts', value: filteredBatches.filter((b) => b.status === 'draft').length.toString(), icon: '📝' },
                            { label: 'Errors', value: filteredBatches.filter((b) => b.status === 'error').length.toString(), icon: '⚠️' }
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-3">
                                <span className="text-lg">{item.icon}</span>
                                <div className="flex-1">
                                    <p className="text-2xs text-surface-500">{item.label}</p>
                                </div>
                                <span className="text-sm font-mono font-semibold text-surface-200">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
            </>
            )}
        </div>
    )
}
