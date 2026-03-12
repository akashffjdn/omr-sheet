import { cn } from '@/lib/utils'

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={cn(
                'relative w-10 h-[22px] rounded-full transition-colors duration-200',
                checked ? 'bg-brand-500' : 'bg-surface-700'
            )}
        >
            <span
                className={cn(
                    'absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                    checked && 'translate-x-[18px]'
                )}
            />
        </button>
    )
}
