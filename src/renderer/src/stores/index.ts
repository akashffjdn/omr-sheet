import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
    PageId,
    Batch,
    MarkingScheme,
    AnswerKey,
    Sheet,
    StudentResult,
    ProcessingProgress,
    DashboardStats,
    AnswerOption,
    MasterSheetTemplate
} from '@/types'

// ============================================
// App Navigation Store
// ============================================
interface AppStore {
    currentPage: PageId
    sidebarCollapsed: boolean
    theme: 'dark' | 'light'
    accentColor: string
    compactMode: boolean
    animations: boolean
    searchQuery: string
    settingsSection: string
    userEmail: string | null
    login: (email: string) => void
    logout: () => void
    setPage: (page: PageId) => void
    toggleSidebar: () => void
    toggleTheme: () => void
    setAccentColor: (color: string) => void
    setCompactMode: (v: boolean) => void
    setAnimations: (v: boolean) => void
    setSearchQuery: (q: string) => void
    setSettingsSection: (s: string) => void
}

// Accent color palettes (space-separated RGB values for Tailwind alpha support)
const accentPalettes: Record<string, Record<string, string>> = {
    '#6366f1': { '50': '238 242 255', '100': '224 231 255', '200': '199 210 254', '300': '165 180 252', '400': '129 140 248', '500': '99 102 241', '600': '79 70 229', '700': '67 56 202', '800': '55 48 163', '900': '49 46 129', '950': '30 27 75' },
    '#22d3ee': { '50': '236 254 255', '100': '207 250 254', '200': '165 243 252', '300': '103 232 249', '400': '34 211 238', '500': '6 182 212', '600': '8 145 178', '700': '14 116 144', '800': '21 94 117', '900': '22 78 99', '950': '8 51 68' },
    '#f59e0b': { '50': '255 251 235', '100': '254 243 199', '200': '253 230 138', '300': '252 211 77', '400': '251 191 36', '500': '245 158 11', '600': '217 119 6', '700': '180 83 9', '800': '146 64 14', '900': '120 53 15', '950': '69 26 3' },
    '#22c55e': { '50': '240 253 244', '100': '220 252 231', '200': '187 247 208', '300': '134 239 172', '400': '74 222 128', '500': '34 197 94', '600': '22 163 74', '700': '21 128 61', '800': '22 101 52', '900': '20 83 45', '950': '5 46 22' },
    '#f43f5e': { '50': '255 241 242', '100': '255 228 230', '200': '254 205 211', '300': '253 164 175', '400': '251 113 133', '500': '244 63 94', '600': '225 29 72', '700': '190 18 60', '800': '159 18 57', '900': '136 19 55', '950': '76 5 25' },
    '#a855f7': { '50': '250 245 255', '100': '243 232 255', '200': '233 213 255', '300': '216 180 254', '400': '192 132 252', '500': '168 85 247', '600': '147 51 234', '700': '126 34 206', '800': '107 33 168', '900': '88 28 135', '950': '59 7 100' },
    '#f97316': { '50': '255 247 237', '100': '255 237 213', '200': '254 215 170', '300': '253 186 116', '400': '251 146 60', '500': '249 115 22', '600': '234 88 12', '700': '194 65 12', '800': '154 52 18', '900': '124 45 18', '950': '67 20 7' },
    '#06b6d4': { '50': '236 254 255', '100': '207 250 254', '200': '165 243 252', '300': '103 232 249', '400': '34 211 238', '500': '6 182 212', '600': '8 145 178', '700': '14 116 144', '800': '21 94 117', '900': '22 78 99', '950': '8 51 68' }
}

function applyAccentColor(color: string): void {
    const palette = accentPalettes[color]
    if (!palette) return
    const root = document.documentElement
    Object.entries(palette).forEach(([shade, rgb]) => {
        root.style.setProperty(`--brand-${shade}`, rgb)
    })
}

export const useAppStore = create<AppStore>((set) => {
    // Apply initial accent color on store creation
    applyAccentColor('#6366f1')

    return {
        currentPage: 'login',
        sidebarCollapsed: false,
        theme: 'dark',
        accentColor: '#6366f1',
        compactMode: false,
        animations: true,
        searchQuery: '',
        settingsSection: 'general',
        userEmail: null,
        login: (email) => set({ userEmail: email, currentPage: 'dashboard' }),
        logout: () => set({ userEmail: null, currentPage: 'login' }),
        setPage: (page) => set({ currentPage: page }),
        toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
        toggleTheme: () =>
            set((s) => {
                const next = s.theme === 'dark' ? 'light' : 'dark'
                if (next === 'dark') {
                    document.documentElement.classList.add('dark')
                } else {
                    document.documentElement.classList.remove('dark')
                }
                return { theme: next }
            }),
        setAccentColor: (color) => {
            applyAccentColor(color)
            set({ accentColor: color })
        },
        setCompactMode: (v) => {
            if (v) {
                document.documentElement.classList.add('compact')
            } else {
                document.documentElement.classList.remove('compact')
            }
            set({ compactMode: v })
        },
        setAnimations: (v) => {
            if (!v) {
                document.documentElement.classList.add('no-animations')
            } else {
                document.documentElement.classList.remove('no-animations')
            }
            set({ animations: v })
        },
        setSearchQuery: (q) => set({ searchQuery: q }),
        setSettingsSection: (s) => set({ settingsSection: s })
    }
})

// ============================================
// Batch Workspace Store
// ============================================
interface BatchWorkspaceStore {
    // Current step in wizard
    currentStep: number
    setStep: (step: number) => void

    // Batch metadata
    activeBatch: Batch | null
    setActiveBatch: (batch: Batch | null) => void

    // Setup fields (synced across steps)
    examName: string
    setExamName: (name: string) => void
    subject: string
    setSubject: (subject: string) => void
    totalQuestions: number
    setTotalQuestions: (n: number) => void
    examDate: string
    setExamDate: (date: string) => void
    importedFiles: string[]
    importedFullPaths: string[]
    setImportedFiles: (files: string[], fullPaths?: string[]) => void
    folderPath: string | null
    setFolderPath: (path: string | null) => void

    // Marking scheme
    markingScheme: MarkingScheme
    setMarkingScheme: (scheme: Partial<MarkingScheme>) => void

    // Answer key
    answerKeys: AnswerKey[]
    setAnswerKeys: (keys: AnswerKey[]) => void
    updateAnswer: (questionNo: number, answer: AnswerOption | AnswerOption[]) => void
    toggleBonus: (questionNo: number) => void

    // Sheets
    sheets: Sheet[]
    setSheets: (sheets: Sheet[]) => void
    selectedSheetId: string | null
    selectSheet: (id: string | null) => void

    // Results
    results: StudentResult[]
    setResults: (results: StudentResult[]) => void

    // Processing progress
    progress: ProcessingProgress
    setProgress: (progress: Partial<ProcessingProgress>) => void

    // Reset workspace
    resetWorkspace: () => void
}

const defaultMarkingScheme: MarkingScheme = {
    correctMarks: 4,
    incorrectMarks: -1,
    blankMarks: 0,
    multiResponseRule: 'incorrect',
    sectionWise: true,
    sections: [
        { id: 'sec-phy', name: 'Physics', startQuestion: 1, endQuestion: 25, correctMarks: 4, incorrectMarks: -1 },
        { id: 'sec-chem', name: 'Chemistry', startQuestion: 26, endQuestion: 50, correctMarks: 4, incorrectMarks: -1 },
        { id: 'sec-math', name: 'Mathematics', startQuestion: 51, endQuestion: 75, correctMarks: 4, incorrectMarks: -1 }
    ]
}

// Per-batch marking schemes keyed by batch ID
const batchMarkingSchemes: Record<string, MarkingScheme> = {
    '1': { // JEE Main Mock Test — 75 Qs
        correctMarks: 4, incorrectMarks: -1, blankMarks: 0, multiResponseRule: 'incorrect',
        sectionWise: true,
        sections: [
            { id: 's1', name: 'Physics', startQuestion: 1, endQuestion: 25, correctMarks: 4, incorrectMarks: -1 },
            { id: 's2', name: 'Chemistry', startQuestion: 26, endQuestion: 50, correctMarks: 4, incorrectMarks: -1 },
            { id: 's3', name: 'Mathematics', startQuestion: 51, endQuestion: 75, correctMarks: 4, incorrectMarks: -1 }
        ]
    },
    '2': { // NEET Biology Practice — 100 Qs
        correctMarks: 4, incorrectMarks: -1, blankMarks: 0, multiResponseRule: 'incorrect',
        sectionWise: true,
        sections: [
            { id: 's1', name: 'Botany', startQuestion: 1, endQuestion: 50, correctMarks: 4, incorrectMarks: -1 },
            { id: 's2', name: 'Zoology', startQuestion: 51, endQuestion: 100, correctMarks: 4, incorrectMarks: -1 }
        ]
    },
    '3': { // Mid-Term Assessment Class 12 — 50 Qs Mathematics
        correctMarks: 1, incorrectMarks: 0, blankMarks: 0, multiResponseRule: 'blank',
        sectionWise: true,
        sections: [
            { id: 's1', name: 'Algebra', startQuestion: 1, endQuestion: 17, correctMarks: 1, incorrectMarks: 0 },
            { id: 's2', name: 'Calculus', startQuestion: 18, endQuestion: 34, correctMarks: 1, incorrectMarks: 0 },
            { id: 's3', name: 'Geometry', startQuestion: 35, endQuestion: 50, correctMarks: 1, incorrectMarks: 0 }
        ]
    },
    '4': { // Weekly Quiz #12 — 30 Qs General Science (draft)
        correctMarks: 1, incorrectMarks: 0, blankMarks: 0, multiResponseRule: 'blank',
        sectionWise: true,
        sections: [
            { id: 's1', name: 'Physics', startQuestion: 1, endQuestion: 10, correctMarks: 1, incorrectMarks: 0 },
            { id: 's2', name: 'Chemistry', startQuestion: 11, endQuestion: 20, correctMarks: 1, incorrectMarks: 0 },
            { id: 's3', name: 'Biology', startQuestion: 21, endQuestion: 30, correctMarks: 1, incorrectMarks: 0 }
        ]
    },
    '5': { // SSC CGL Practice Paper — 100 Qs
        correctMarks: 2, incorrectMarks: -0.5, blankMarks: 0, multiResponseRule: 'incorrect',
        sectionWise: true,
        sections: [
            { id: 's1', name: 'Reasoning', startQuestion: 1, endQuestion: 50, correctMarks: 2, incorrectMarks: -0.5 },
            { id: 's2', name: 'Quantitative', startQuestion: 51, endQuestion: 100, correctMarks: 2, incorrectMarks: -0.5 }
        ]
    },
    '6': { // UPSC Prelims GS Paper 1 — 100 Qs
        correctMarks: 2, incorrectMarks: -0.66, blankMarks: 0, multiResponseRule: 'incorrect',
        sectionWise: true,
        sections: [
            { id: 's1', name: 'History', startQuestion: 1, endQuestion: 25, correctMarks: 2, incorrectMarks: -0.66 },
            { id: 's2', name: 'Geography', startQuestion: 26, endQuestion: 50, correctMarks: 2, incorrectMarks: -0.66 },
            { id: 's3', name: 'Polity', startQuestion: 51, endQuestion: 75, correctMarks: 2, incorrectMarks: -0.66 },
            { id: 's4', name: 'Economy', startQuestion: 76, endQuestion: 100, correctMarks: 2, incorrectMarks: -0.66 }
        ]
    },
    '7': { // Chemistry Unit Test Organic — 40 Qs
        correctMarks: 1, incorrectMarks: 0, blankMarks: 0, multiResponseRule: 'blank',
        sectionWise: true,
        sections: [
            { id: 's1', name: 'Organic', startQuestion: 1, endQuestion: 20, correctMarks: 1, incorrectMarks: 0 },
            { id: 's2', name: 'Inorganic', startQuestion: 21, endQuestion: 40, correctMarks: 1, incorrectMarks: 0 }
        ]
    },
    '8': { // GATE ECE Mock Set 3 — 65 Qs
        correctMarks: 2, incorrectMarks: -0.66, blankMarks: 0, multiResponseRule: 'incorrect',
        sectionWise: true,
        sections: [
            { id: 's1', name: 'Electronics', startQuestion: 1, endQuestion: 35, correctMarks: 2, incorrectMarks: -0.66 },
            { id: 's2', name: 'Mathematics', startQuestion: 36, endQuestion: 65, correctMarks: 2, incorrectMarks: -0.66 }
        ]
    },
    '9': { // Class 10 Science Final — 80 Qs
        correctMarks: 1, incorrectMarks: 0, blankMarks: 0, multiResponseRule: 'blank',
        sectionWise: true,
        sections: [
            { id: 's1', name: 'Physics', startQuestion: 1, endQuestion: 27, correctMarks: 1, incorrectMarks: 0 },
            { id: 's2', name: 'Chemistry', startQuestion: 28, endQuestion: 54, correctMarks: 1, incorrectMarks: 0 },
            { id: 's3', name: 'Biology', startQuestion: 55, endQuestion: 80, correctMarks: 1, incorrectMarks: 0 }
        ]
    },
    '10': { // Olympiad Qualifier Round — 30 Qs Mathematics (draft)
        correctMarks: 4, incorrectMarks: -1, blankMarks: 0, multiResponseRule: 'incorrect',
        sectionWise: true,
        sections: [
            { id: 's1', name: 'Algebra', startQuestion: 1, endQuestion: 10, correctMarks: 4, incorrectMarks: -1 },
            { id: 's2', name: 'Number Theory', startQuestion: 11, endQuestion: 20, correctMarks: 4, incorrectMarks: -1 },
            { id: 's3', name: 'Geometry', startQuestion: 21, endQuestion: 30, correctMarks: 4, incorrectMarks: -1 }
        ]
    },
    '11': { // English Proficiency Test — 60 Qs
        correctMarks: 1, incorrectMarks: 0, blankMarks: 0, multiResponseRule: 'blank',
        sectionWise: true,
        sections: [
            { id: 's1', name: 'Reading', startQuestion: 1, endQuestion: 20, correctMarks: 1, incorrectMarks: 0 },
            { id: 's2', name: 'Grammar', startQuestion: 21, endQuestion: 40, correctMarks: 1, incorrectMarks: 0 },
            { id: 's3', name: 'Vocabulary', startQuestion: 41, endQuestion: 60, correctMarks: 1, incorrectMarks: 0 }
        ]
    },
    '12': { // History Semester Exam — 50 Qs
        correctMarks: 1, incorrectMarks: 0, blankMarks: 0, multiResponseRule: 'blank',
        sectionWise: true,
        sections: [
            { id: 's1', name: 'History', startQuestion: 1, endQuestion: 25, correctMarks: 1, incorrectMarks: 0 },
            { id: 's2', name: 'Civics', startQuestion: 26, endQuestion: 50, correctMarks: 1, incorrectMarks: 0 }
        ]
    },
    '13': { // NEET Physics Practice — 45 Qs
        correctMarks: 4, incorrectMarks: -1, blankMarks: 0, multiResponseRule: 'incorrect',
        sectionWise: true,
        sections: [
            { id: 's1', name: 'Mechanics', startQuestion: 1, endQuestion: 15, correctMarks: 4, incorrectMarks: -1 },
            { id: 's2', name: 'Electrodynamics', startQuestion: 16, endQuestion: 30, correctMarks: 4, incorrectMarks: -1 },
            { id: 's3', name: 'Optics', startQuestion: 31, endQuestion: 45, correctMarks: 4, incorrectMarks: -1 }
        ]
    }
}

const defaultProgress: ProcessingProgress = {
    total: 0,
    completed: 0,
    current: '',
    status: 'idle',
    logs: []
}

export const useBatchStore = create<BatchWorkspaceStore>((set) => ({
    currentStep: 0,
    setStep: (step) => set({ currentStep: step }),

    activeBatch: null,
    setActiveBatch: (batch) => set({
        activeBatch: batch,
        // Pre-populate setup fields from existing batch
        examName: batch?.name || '',
        subject: batch?.subject || '',
        totalQuestions: batch?.totalQuestions || 100,
        examDate: batch?.date || '',
        importedFiles: batch && batch.totalSheets > 0
            ? Array.from({ length: batch.totalSheets }, (_, i) => `sheet_${String(i + 1).padStart(3, '0')}.jpg`)
            : [],
        importedFullPaths: [],
        folderPath: null,
        markingScheme: batch ? (batchMarkingSchemes[batch.id] || defaultMarkingScheme) : defaultMarkingScheme
    }),

    examName: '',
    setExamName: (name) => set({ examName: name }),
    subject: '',
    setSubject: (subject) => set({ subject }),
    totalQuestions: 100,
    setTotalQuestions: (n) => set({ totalQuestions: n }),
    examDate: '',
    setExamDate: (date) => set({ examDate: date }),
    importedFiles: [],
    importedFullPaths: [],
    setImportedFiles: (files, fullPaths) => set({ importedFiles: files, importedFullPaths: fullPaths || [] }),
    folderPath: null,
    setFolderPath: (path) => set({ folderPath: path }),

    markingScheme: defaultMarkingScheme,
    setMarkingScheme: (scheme) =>
        set((s) => ({ markingScheme: { ...s.markingScheme, ...scheme } })),

    answerKeys: [],
    setAnswerKeys: (keys) => set({ answerKeys: keys }),
    updateAnswer: (questionNo, answer) =>
        set((s) => ({
            answerKeys: s.answerKeys.map((k) =>
                k.questionNo === questionNo ? { ...k, correctAnswer: answer } : k
            )
        })),
    toggleBonus: (questionNo) =>
        set((s) => ({
            answerKeys: s.answerKeys.map((k) =>
                k.questionNo === questionNo ? { ...k, isBonus: !k.isBonus } : k
            )
        })),

    sheets: [],
    setSheets: (sheets) => set({ sheets }),
    selectedSheetId: null,
    selectSheet: (id) => set({ selectedSheetId: id }),

    results: [],
    setResults: (results) => set({ results }),

    progress: defaultProgress,
    setProgress: (progress) =>
        set((s) => ({ progress: { ...s.progress, ...progress } })),

    resetWorkspace: () =>
        set({
            currentStep: 0,
            activeBatch: null,
            examName: '',
            subject: '',
            totalQuestions: 100,
            examDate: '',
            importedFiles: [],
            importedFullPaths: [],
            folderPath: null,
            markingScheme: defaultMarkingScheme,
            answerKeys: [],
            sheets: [],
            selectedSheetId: null,
            results: [],
            progress: defaultProgress
        })
}))

// ============================================
// Dashboard Store (with demo data)
// ============================================
function computeStats(batches: Batch[]): DashboardStats {
    const withScores = batches.filter((b) => b.averageScore !== undefined)
    const now = new Date()
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const thisMonthSheets = batches
        .filter((b) => {
            const d = new Date(b.date)
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === currentMonthKey
        })
        .reduce((sum, b) => sum + b.totalSheets, 0)

    return {
        totalBatches: batches.length,
        totalSheetsProcessed: batches.reduce((sum, b) => sum + b.totalSheets, 0),
        averageScore: withScores.length > 0
            ? Math.round((withScores.reduce((s, b) => s + (b.averageScore ?? 0), 0) / withScores.length) * 10) / 10
            : 0,
        thisMonthActivity: thisMonthSheets
    }
}

interface DashboardStore {
    stats: DashboardStats
    recentBatches: Batch[]
    removeBatch: (id: string) => void
    duplicateBatch: (id: string) => void
    updateBatchStatus: (id: string, status: Batch['status']) => void
    archiveBatch: (id: string) => void
}

const demoBatches: Batch[] = [
    {
        id: '1',
        name: 'JEE Main Mock Test — Set A',
        date: '2026-03-04',
        subject: 'Physics + Chemistry + Maths',
        totalQuestions: 75,
        totalSheets: 120,
        status: 'complete',
        createdAt: '2026-03-04T09:30:00',
        averageScore: 68.5,
        passPercentage: 74
    },
    {
        id: '2',
        name: 'NEET Biology Practice',
        date: '2026-03-02',
        subject: 'Biology',
        totalQuestions: 100,
        totalSheets: 85,
        status: 'complete',
        createdAt: '2026-03-02T14:00:00',
        averageScore: 76.2,
        passPercentage: 82
    },
    {
        id: '3',
        name: 'Mid-Term Assessment — Class 12',
        date: '2026-02-28',
        subject: 'Mathematics',
        totalQuestions: 50,
        totalSheets: 45,
        status: 'complete',
        createdAt: '2026-02-28T10:00:00',
        averageScore: 62.1,
        passPercentage: 58
    },
    {
        id: '4',
        name: 'Weekly Quiz #12',
        date: '2026-03-06',
        subject: 'General Science',
        totalQuestions: 30,
        totalSheets: 0,
        status: 'draft',
        createdAt: '2026-03-06T08:00:00'
    },
    {
        id: '5',
        name: 'SSC CGL Practice Paper',
        date: '2026-03-01',
        subject: 'Reasoning + Quantitative',
        totalQuestions: 100,
        totalSheets: 200,
        status: 'processing',
        createdAt: '2026-03-01T11:00:00',
        averageScore: 55.8
    },
    {
        id: '6',
        name: 'UPSC Prelims — GS Paper 1',
        date: '2026-02-25',
        subject: 'General Studies',
        totalQuestions: 100,
        totalSheets: 310,
        status: 'complete',
        createdAt: '2026-02-25T09:00:00',
        averageScore: 48.3,
        passPercentage: 42
    },
    {
        id: '7',
        name: 'Chemistry Unit Test — Organic',
        date: '2026-03-05',
        subject: 'Chemistry',
        totalQuestions: 40,
        totalSheets: 62,
        status: 'error',
        createdAt: '2026-03-05T13:00:00'
    },
    {
        id: '8',
        name: 'GATE ECE Mock — Set 3',
        date: '2026-03-03',
        subject: 'Electronics + Maths',
        totalQuestions: 65,
        totalSheets: 180,
        status: 'processing',
        createdAt: '2026-03-03T07:45:00',
        averageScore: 39.7
    },
    {
        id: '9',
        name: 'Class 10 Science Final',
        date: '2026-02-20',
        subject: 'Physics + Chemistry + Biology',
        totalQuestions: 80,
        totalSheets: 95,
        status: 'complete',
        createdAt: '2026-02-20T10:30:00',
        averageScore: 71.4,
        passPercentage: 78
    },
    {
        id: '10',
        name: 'Olympiad Qualifier Round',
        date: '2026-03-06',
        subject: 'Mathematics',
        totalQuestions: 30,
        totalSheets: 0,
        status: 'draft',
        createdAt: '2026-03-06T15:00:00'
    },
    {
        id: '11',
        name: 'English Proficiency Test',
        date: '2026-02-18',
        subject: 'English',
        totalQuestions: 60,
        totalSheets: 150,
        status: 'complete',
        createdAt: '2026-02-18T08:30:00',
        averageScore: 82.6,
        passPercentage: 91
    },
    {
        id: '12',
        name: 'History Semester Exam',
        date: '2026-03-05',
        subject: 'History + Civics',
        totalQuestions: 50,
        totalSheets: 48,
        status: 'error',
        createdAt: '2026-03-05T11:00:00'
    },
    {
        id: '13',
        name: 'NEET Physics Practice',
        date: '2026-03-06',
        subject: 'Physics',
        totalQuestions: 45,
        totalSheets: 72,
        status: 'processing',
        createdAt: '2026-03-06T06:00:00',
        averageScore: 44.1
    }
]

export const useDashboardStore = create<DashboardStore>((set) => ({
    stats: computeStats(demoBatches),
    recentBatches: demoBatches,
    removeBatch: (id) =>
        set((s) => {
            const updated = s.recentBatches.filter((b) => b.id !== id)
            return { recentBatches: updated, stats: computeStats(updated) }
        }),
    duplicateBatch: (id) =>
        set((s) => {
            const original = s.recentBatches.find((b) => b.id === id)
            if (!original) return s
            const copy: Batch = {
                ...original,
                id: crypto.randomUUID(),
                name: `${original.name} (Copy)`,
                status: 'draft',
                date: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                totalSheets: 0,
                averageScore: undefined,
                passPercentage: undefined
            }
            const updated = [copy, ...s.recentBatches]
            return { recentBatches: updated, stats: computeStats(updated) }
        }),
    updateBatchStatus: (id, status) =>
        set((s) => {
            const updated = s.recentBatches.map((b) =>
                b.id === id ? { ...b, status } : b
            )
            return { recentBatches: updated, stats: computeStats(updated) }
        }),
    archiveBatch: (id) =>
        set((s) => {
            const updated = s.recentBatches.filter((b) => b.id !== id)
            return { recentBatches: updated, stats: computeStats(updated) }
        })
}))

// ============================================
// Master Sheet Template Store (persisted)
// ============================================

// Helper: generate deterministic answer keys for demo templates
function generateDemoAnswers(count: number, seed: number): AnswerKey[] {
    const opts: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D']
    return Array.from({ length: count }, (_, i) => ({
        questionNo: i + 1,
        correctAnswer: opts[Math.floor(Math.abs(Math.sin((i + 1) * 7 + seed)) * 4)] as AnswerOption,
        isBonus: false
    }))
}

const sampleTemplates: MasterSheetTemplate[] = [
    {
        id: 'sample-jee-main-set-a',
        name: 'JEE Main Mock Test — Set A',
        createdAt: '2026-03-04T09:30:00',
        lastUsedAt: '2026-03-07T14:00:00',
        totalQuestions: 75,
        answerKeys: generateDemoAnswers(75, 100),
        examName: 'JEE Main Mock Test — Set A',
        subject: 'Physics + Chemistry + Maths',
        markingScheme: { correctMarks: 4, incorrectMarks: -1, blankMarks: 0, multiResponseRule: 'incorrect' as const, sectionWise: true, sections: [
            { id: 's1', name: 'Physics', startQuestion: 1, endQuestion: 25, correctMarks: 4, incorrectMarks: -1 },
            { id: 's2', name: 'Chemistry', startQuestion: 26, endQuestion: 50, correctMarks: 4, incorrectMarks: -1 },
            { id: 's3', name: 'Mathematics', startQuestion: 51, endQuestion: 75, correctMarks: 4, incorrectMarks: -1 }
        ] }
    },
    {
        id: 'sample-neet-bio',
        name: 'NEET Biology Practice',
        createdAt: '2026-03-02T14:00:00',
        lastUsedAt: '2026-03-06T10:00:00',
        totalQuestions: 100,
        answerKeys: generateDemoAnswers(100, 200),
        examName: 'NEET Biology Practice',
        subject: 'Biology',
        markingScheme: { correctMarks: 4, incorrectMarks: -1, blankMarks: 0, multiResponseRule: 'incorrect' as const, sectionWise: false, sections: [] }
    },
    {
        id: 'sample-midterm-12',
        name: 'Mid-Term Assessment — Class 12',
        createdAt: '2026-02-28T10:00:00',
        totalQuestions: 50,
        answerKeys: generateDemoAnswers(50, 300),
        examName: 'Mid-Term Assessment',
        subject: 'Mathematics',
        markingScheme: { correctMarks: 1, incorrectMarks: 0, blankMarks: 0, multiResponseRule: 'blank' as const, sectionWise: false, sections: [] }
    },
    {
        id: 'sample-ssc-cgl',
        name: 'SSC CGL Practice Paper',
        createdAt: '2026-03-01T11:00:00',
        lastUsedAt: '2026-03-05T16:00:00',
        totalQuestions: 100,
        answerKeys: generateDemoAnswers(100, 400),
        examName: 'SSC CGL Practice Paper',
        subject: 'Reasoning + Quantitative',
        markingScheme: { correctMarks: 2, incorrectMarks: -0.5, blankMarks: 0, multiResponseRule: 'incorrect' as const, sectionWise: true, sections: [
            { id: 's1', name: 'Reasoning', startQuestion: 1, endQuestion: 50, correctMarks: 2, incorrectMarks: -0.5 },
            { id: 's2', name: 'Quantitative', startQuestion: 51, endQuestion: 100, correctMarks: 2, incorrectMarks: -0.5 }
        ] }
    },
    {
        id: 'sample-class10-science',
        name: 'Class 10 Science Final',
        createdAt: '2026-02-20T10:30:00',
        totalQuestions: 80,
        answerKeys: generateDemoAnswers(80, 500),
        examName: 'Class 10 Science Final',
        subject: 'Physics + Chemistry + Biology',
        markingScheme: { correctMarks: 1, incorrectMarks: 0, blankMarks: 0, multiResponseRule: 'blank' as const, sectionWise: true, sections: [
            { id: 's1', name: 'Physics', startQuestion: 1, endQuestion: 27, correctMarks: 1, incorrectMarks: 0 },
            { id: 's2', name: 'Chemistry', startQuestion: 28, endQuestion: 54, correctMarks: 1, incorrectMarks: 0 },
            { id: 's3', name: 'Biology', startQuestion: 55, endQuestion: 80, correctMarks: 1, incorrectMarks: 0 }
        ] }
    }
]

interface TemplateStore {
    templates: MasterSheetTemplate[]

    // CRUD
    addTemplate: (template: MasterSheetTemplate) => void
    updateTemplate: (id: string, updates: Partial<MasterSheetTemplate>) => void
    deleteTemplate: (id: string) => void

    // Apply a saved template's answer keys to the current batch
    applyTemplate: (id: string, setAnswerKeys: (keys: AnswerKey[]) => void, setTotalQuestions: (n: number) => void) => void
}

export const useTemplateStore = create<TemplateStore>()(
    persist(
        (set, get) => ({
            templates: [...sampleTemplates],

            addTemplate: (template) =>
                set((s) => ({ templates: [template, ...s.templates] })),

            updateTemplate: (id, updates) =>
                set((s) => ({
                    templates: s.templates.map((t) =>
                        t.id === id ? { ...t, ...updates } : t
                    )
                })),

            deleteTemplate: (id) =>
                set((s) => ({
                    templates: s.templates.filter((t) => t.id !== id)
                })),

            applyTemplate: (id, setAnswerKeys, setTotalQuestions) => {
                const template = get().templates.find((t) => t.id === id)
                if (!template) return
                setTotalQuestions(template.totalQuestions)
                setAnswerKeys([...template.answerKeys])
                set((s) => ({
                    templates: s.templates.map((t) =>
                        t.id === id ? { ...t, lastUsedAt: new Date().toISOString() } : t
                    )
                }))
            }
        }),
        {
            name: 'omr-pro-master-templates',
            merge: (persisted: any, current) => {
                const savedTemplates = (persisted as any)?.templates || []
                // Merge: keep sample templates that haven't been deleted, plus any user-saved templates
                const savedIds = new Set(savedTemplates.map((t: any) => t.id))
                // Include samples not already in saved data, plus all saved templates
                const mergedTemplates = [
                    ...sampleTemplates.filter((s) => !savedIds.has(s.id)),
                    ...savedTemplates
                ]
                return { ...current, templates: mergedTemplates }
            }
        }
    )
)

// ============================================
// Template Creation Wizard Store (not persisted)
// ============================================
type OptionType = 'A-D' | 'A-E' | 'TF'

interface TemplateCreationStore {
    step: number
    setStep: (s: number) => void

    // Editing existing template (null = creating new)
    editingTemplateId: string | null

    // Step 1
    masterSheetImagePath: string | null
    setMasterSheetImage: (path: string | null) => void

    // Step 2
    templateName: string
    examName: string
    subject: string
    totalQuestions: number
    optionType: OptionType
    setTemplateName: (v: string) => void
    setExamName: (v: string) => void
    setSubject: (v: string) => void
    setTotalQuestions: (n: number) => void
    setOptionType: (t: OptionType) => void

    // Step 3
    answerKeys: AnswerKey[]
    updateAnswer: (qNo: number, answer: AnswerOption) => void
    toggleBonus: (qNo: number) => void
    clearAllAnswers: () => void

    // Step 4
    markingScheme: MarkingScheme
    setMarkingScheme: (scheme: Partial<MarkingScheme>) => void

    // Load an existing template for editing
    loadTemplate: (template: MasterSheetTemplate) => void
    reset: () => void
}

const templateDefaultMarking: MarkingScheme = {
    correctMarks: 4,
    incorrectMarks: -1,
    blankMarks: 0,
    multiResponseRule: 'incorrect',
    sectionWise: false,
    sections: []
}

export const useTemplateCreationStore = create<TemplateCreationStore>((set) => ({
    step: 0,
    setStep: (s) => set({ step: s }),

    editingTemplateId: null,

    masterSheetImagePath: null,
    setMasterSheetImage: (path) => set({ masterSheetImagePath: path }),

    templateName: '',
    examName: '',
    subject: '',
    totalQuestions: 50,
    optionType: 'A-D',
    setTemplateName: (v) => set({ templateName: v }),
    setExamName: (v) => set({ examName: v }),
    setSubject: (v) => set({ subject: v }),
    setTotalQuestions: (n) => set((s) => {
        const existing = new Map(s.answerKeys.map(k => [k.questionNo, k]))
        const keys: AnswerKey[] = Array.from({ length: n }, (_, i) => {
            const qNo = i + 1
            return existing.get(qNo) || { questionNo: qNo, correctAnswer: '' as AnswerOption, isBonus: false }
        })
        return { totalQuestions: n, answerKeys: keys }
    }),
    setOptionType: (t) => set({ optionType: t }),

    answerKeys: Array.from({ length: 50 }, (_, i) => ({
        questionNo: i + 1,
        correctAnswer: '' as AnswerOption,
        isBonus: false
    })),
    updateAnswer: (qNo, answer) => set((s) => ({
        answerKeys: s.answerKeys.map((k) =>
            k.questionNo === qNo
                ? { ...k, correctAnswer: k.correctAnswer === answer ? '' as AnswerOption : answer }
                : k
        )
    })),
    toggleBonus: (qNo) => set((s) => ({
        answerKeys: s.answerKeys.map((k) =>
            k.questionNo === qNo ? { ...k, isBonus: !k.isBonus } : k
        )
    })),
    clearAllAnswers: () => set((s) => ({
        answerKeys: s.answerKeys.map((k) => ({ ...k, correctAnswer: '' as AnswerOption, isBonus: false }))
    })),

    markingScheme: { ...templateDefaultMarking },
    setMarkingScheme: (scheme) => set((s) => ({
        markingScheme: { ...s.markingScheme, ...scheme }
    })),

    loadTemplate: (template) => set({
        step: 0,
        editingTemplateId: template.id,
        masterSheetImagePath: template.masterSheetImagePath || null,
        templateName: template.name,
        examName: template.examName || '',
        subject: template.subject || '',
        totalQuestions: template.totalQuestions,
        optionType: 'A-D',
        answerKeys: template.answerKeys.map(k => ({ ...k })),
        markingScheme: template.markingScheme ? { ...template.markingScheme } : { ...defaultMarkingScheme }
    }),

    reset: () => set({
        step: 0,
        editingTemplateId: null,
        masterSheetImagePath: null,
        templateName: '',
        examName: '',
        subject: '',
        totalQuestions: 50,
        optionType: 'A-D',
        answerKeys: Array.from({ length: 50 }, (_, i) => ({
            questionNo: i + 1,
            correctAnswer: '' as AnswerOption,
            isBonus: false
        })),
        markingScheme: { ...defaultMarkingScheme }
    })
}))
