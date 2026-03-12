import type { Config } from 'tailwindcss'

function surfaceColor(name: string): string {
    return `rgb(var(--surface-${name}) / <alpha-value>)`
}

function brandColor(name: string): string {
    return `rgb(var(--brand-${name}) / <alpha-value>)`
}

const config: Config = {
    darkMode: 'class',
    content: ['./src/renderer/src/**/*.{ts,tsx}', './src/renderer/index.html'],
    theme: {
        extend: {
            colors: {
                // Core brand palette (uses CSS variables for dynamic accent switching)
                brand: {
                    50: brandColor('50'),
                    100: brandColor('100'),
                    200: brandColor('200'),
                    300: brandColor('300'),
                    400: brandColor('400'),
                    500: brandColor('500'),
                    600: brandColor('600'),
                    700: brandColor('700'),
                    800: brandColor('800'),
                    900: brandColor('900'),
                    950: brandColor('950')
                },
                // Surface colors driven by CSS variables for theme switching
                surface: {
                    50: surfaceColor('50'),
                    100: surfaceColor('100'),
                    200: surfaceColor('200'),
                    300: surfaceColor('300'),
                    400: surfaceColor('400'),
                    500: surfaceColor('500'),
                    600: surfaceColor('600'),
                    700: surfaceColor('700'),
                    800: surfaceColor('800'),
                    850: surfaceColor('850'),
                    900: surfaceColor('900'),
                    950: surfaceColor('950')
                },
                // Semantic colors
                success: {
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a'
                },
                warning: {
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706'
                },
                danger: {
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626'
                },
                accent: {
                    cyan: '#22d3ee',
                    amber: '#fbbf24',
                    emerald: '#34d399',
                    rose: '#fb7185'
                }
            },
            screens: {
                '3xl': '1920px',
                '4xl': '2560px',
                '5xl': '3200px'
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace']
            },
            fontSize: {
                '2xs': ['0.65rem', { lineHeight: '0.85rem' }]
            },
            borderRadius: {
                '4xl': '2rem'
            },
            backdropBlur: {
                xs: '2px'
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'slide-in-right': 'slideInRight 0.3s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 6s ease-in-out infinite'
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' }
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' }
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' }
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' }
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.2), 0 0 20px rgba(99, 102, 241, 0.1)' },
                    '100%': { boxShadow: '0 0 10px rgba(99, 102, 241, 0.4), 0 0 40px rgba(99, 102, 241, 0.2)' }
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' }
                }
            },
            boxShadow: {
                'glass': '0 8px 32px rgba(0, 0, 0, 0.12)',
                'glass-lg': '0 25px 50px rgba(0, 0, 0, 0.15)',
                'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                'neon': '0 0 5px rgba(129, 140, 248, 0.5), 0 0 20px rgba(79, 70, 229, 0.3)'
            }
        }
    },
    plugins: []
}

export default config
