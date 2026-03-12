import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
}

export function formatPercentage(value: number, decimals = 1): string {
    return value.toFixed(decimals) + '%'
}

export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

export function formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export function getStatusColor(status: string): string {
    switch (status) {
        case 'complete': return 'success'
        case 'processing': return 'info'
        case 'draft': return 'warning'
        case 'error': return 'danger'
        default: return 'info'
    }
}

export function truncate(str: string, length: number): string {
    return str.length > length ? str.substring(0, length) + '...' : str
}
