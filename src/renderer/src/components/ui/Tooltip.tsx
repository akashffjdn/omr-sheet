import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TooltipProps {
    content: string
    children: React.ReactNode
    side?: 'top' | 'bottom' | 'left' | 'right'
    delay?: number
    className?: string
    disabled?: boolean
}

export default function Tooltip({ content, children, side = 'top', delay = 300, className, disabled }: TooltipProps) {
    const [visible, setVisible] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

    const show = () => {
        timeoutRef.current = setTimeout(() => setVisible(true), delay)
    }

    const hide = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setVisible(false)
    }

    const positionClasses: Record<string, string> = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    }

    const originMap: Record<string, string> = {
        top: 'origin-bottom',
        bottom: 'origin-top',
        left: 'origin-right',
        right: 'origin-left'
    }

    return (
        <div className={cn('relative inline-flex', className)} onMouseEnter={show} onMouseLeave={hide}>
            {children}
            <AnimatePresence>
                {visible && !disabled && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        transition={{ duration: 0.12 }}
                        className={cn(
                            'absolute z-[100] pointer-events-none',
                            'px-2.5 py-1.5 rounded-lg',
                            'bg-surface-800 border border-surface-700/60 shadow-xl',
                            'text-2xs font-medium text-surface-200 whitespace-nowrap',
                            positionClasses[side],
                            originMap[side]
                        )}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
