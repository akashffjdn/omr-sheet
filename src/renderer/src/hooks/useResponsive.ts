import { useEffect } from 'react'
import { useAppStore } from '@/stores'

const SIDEBAR_AUTO_COLLAPSE = 1200

export function useResponsiveLayout() {
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth
            const { sidebarCollapsed, toggleSidebar } = useAppStore.getState()
            if (width < SIDEBAR_AUTO_COLLAPSE && !sidebarCollapsed) {
                toggleSidebar()
            }
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        return () => window.removeEventListener('resize', handleResize)
    }, [])
}
