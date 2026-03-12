import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import StatusBar from './components/ui/StatusBar'
import DashboardPage from './pages/DashboardPage'
import BatchesPage from './pages/BatchesPage'
import BatchWorkspacePage from './pages/BatchWorkspacePage'
import TemplatesPage from './pages/TemplatesPage'
import NewTemplatePage from './pages/NewTemplatePage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import { useAppStore } from './stores'
import { useResponsiveLayout } from './hooks/useResponsive'
import { ToastContainer } from './components/ui/Toast'
import { ConfirmDialog } from './components/ui/ConfirmDialog'
import { KeyboardShortcutsModal, useKeyboardShortcuts } from './components/ui/KeyboardShortcuts'
import { WelcomeModal } from './components/ui/WelcomeModal'
import { BatchDetailModal } from './components/ui/BatchDetailModal'
import { ExportModal } from './components/ui/ExportModal'
import { NotificationPanel } from './components/ui/NotificationPanel'

const pages: Record<string, React.ComponentType> = {
    dashboard: DashboardPage,
    batches: BatchesPage,
    'batch-workspace': BatchWorkspacePage,
    templates: TemplatesPage,
    'new-template': NewTemplatePage,
    analytics: AnalyticsPage,
    settings: SettingsPage
}

export default function App() {
    const { currentPage } = useAppStore()
    const PageComponent = pages[currentPage] || DashboardPage

    // Register global keyboard shortcuts
    useKeyboardShortcuts()
    useResponsiveLayout()

    // Login page — full-screen, no layout chrome
    if (currentPage === 'login') {
        return (
            <>
                <LoginPage />
                <ToastContainer />
            </>
        )
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-surface-950">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top bar */}
                <TopBar />

                {/* Page content */}
                <main className="flex-1 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="h-full"
                        >
                            <PageComponent />
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Status bar — hidden on batch workspace */}
                {currentPage !== 'batch-workspace' && <StatusBar />}
            </div>

            {/* Global overlays */}
            <ToastContainer />
            <ConfirmDialog />
            <KeyboardShortcutsModal />
            <WelcomeModal />
            <BatchDetailModal />
            <ExportModal />
            <NotificationPanel />
        </div>
    )
}
