import { ChevronRight, Home } from 'lucide-react'
import { useAppStore, useBatchStore } from '@/stores'

const settingsLabels: Record<string, string> = {
    general: 'General',
    omr: 'OMR Engine',
    appearance: 'Appearance',
    data: 'Data & Storage',
    about: 'About'
}

export default function Breadcrumb() {
    const { currentPage, setPage, settingsSection } = useAppStore()
    const { activeBatch } = useBatchStore()

    const crumbs: { label: string; onClick?: () => void }[] = []

    // Home always
    crumbs.push({
        label: 'Home',
        onClick: () => setPage('dashboard')
    })

    // Only show breadcrumbs for nested pages
    if (currentPage === 'batch-workspace') {
        crumbs.push({ label: 'All Batches', onClick: () => setPage('batches') })
        crumbs.push({ label: activeBatch?.name || 'New Batch' })
    } else if (currentPage === 'new-template') {
        crumbs.push({ label: 'Templates', onClick: () => setPage('templates') })
        crumbs.push({ label: 'New Template' })
    } else if (currentPage === 'settings') {
        crumbs.push({ label: settingsLabels[settingsSection] || settingsSection })
    } else {
        return null
    }

    return (
        <nav className="flex items-center gap-1 text-2xs">
            {crumbs.map((crumb, i) => {
                const isLast = i === crumbs.length - 1
                return (
                    <span key={i} className="flex items-center gap-1">
                        {i > 0 && <ChevronRight size={12} className="text-surface-600" />}
                        {i === 0 ? (
                            <button
                                onClick={crumb.onClick}
                                className="flex items-center gap-1 text-surface-500 hover:text-surface-300 transition-colors"
                            >
                                <Home size={12} />
                            </button>
                        ) : isLast ? (
                            <span className="text-surface-300 font-medium">{crumb.label}</span>
                        ) : (
                            <button
                                onClick={crumb.onClick}
                                className="text-surface-500 hover:text-surface-300 transition-colors"
                            >
                                {crumb.label}
                            </button>
                        )}
                    </span>
                )
            })}
        </nav>
    )
}
