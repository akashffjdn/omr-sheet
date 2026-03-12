// ============================================
// Type definitions for OMR Pro
// ============================================

export type BatchStatus = 'draft' | 'processing' | 'complete' | 'error'
export type MultiResponseRule = 'incorrect' | 'blank' | 'partial'
export type AnswerOption = 'A' | 'B' | 'C' | 'D' | 'E' | ''
export type SheetStatus = 'pending' | 'processing' | 'processed' | 'review' | 'error'

export interface Batch {
    id: string
    name: string
    date: string
    subject: string
    totalQuestions: number
    totalSheets: number
    status: BatchStatus
    createdAt: string
    averageScore?: number
    passPercentage?: number
}

export interface MarkingScheme {
    correctMarks: number
    incorrectMarks: number
    blankMarks: number
    multiResponseRule: MultiResponseRule
    sectionWise: boolean
    sections: Section[]
}

export interface Section {
    id: string
    name: string
    startQuestion: number
    endQuestion: number
    correctMarks: number
    incorrectMarks: number
}

export interface AnswerKey {
    questionNo: number
    correctAnswer: AnswerOption | AnswerOption[]
    isBonus: boolean
    sectionId?: string
}

export interface Sheet {
    id: string
    batchId: string
    filePath: string
    fileName: string
    rollNumber?: string
    studentName?: string
    status: SheetStatus
    thumbnail?: string
}

export interface QuestionResult {
    questionNo: number
    detectedAnswer: AnswerOption
    correctAnswer: AnswerOption
    isCorrect: boolean
    marksAwarded: number
    sectionId?: string
}

export interface StudentResult {
    sheetId: string
    studentName: string
    rollNumber: string
    totalCorrect: number
    totalIncorrect: number
    totalBlank: number
    positiveMarks: number
    negativeMarks: number
    totalMarks: number
    maxMarks: number
    percentage: number
    rank?: number
    questions: QuestionResult[]
    sectionResults?: SectionResult[]
}

export interface SectionResult {
    sectionName: string
    rightCount: number
    rightPercentage: number
    wrongCount: number
    wrongPercentage: number
    leftCount: number
    leftPercentage: number
    sectionMarks: number
    sectionMaxMarks: number
    sectionPercentage: number
}

export interface BatchAnalyticsRow {
    studentName: string
    rollNumber: string
    answers: Record<number, AnswerOption>
    rightCount: number
    rightPercentage: number
    wrongCount: number
    wrongPercentage: number
    leftCount: number
    leftPercentage: number
    negativeMarks: number
    totalMarks: number
    totalPercentage: number
    rank: number
}

export interface ItemAnalysis {
    questionNo: number
    optionAPercentage: number
    optionBPercentage: number
    optionCPercentage: number
    optionDPercentage: number
    correctPercentage: number
    difficultyIndex: number
    discriminationIndex: number
}

export interface DashboardStats {
    totalBatches: number
    totalSheetsProcessed: number
    averageScore: number
    thisMonthActivity: number
}

export interface ProcessingProgress {
    total: number
    completed: number
    current: string
    status: 'idle' | 'processing' | 'complete' | 'error'
    logs: string[]
}

// Master sheet answer key template
export interface MasterSheetTemplate {
    id: string
    name: string
    createdAt: string
    lastUsedAt?: string
    totalQuestions: number
    answerKeys: AnswerKey[]
    masterSheetImagePath?: string
    markingScheme?: MarkingScheme
    examName?: string
    subject?: string
}

// Navigation pages
export type PageId =
    | 'login'
    | 'dashboard'
    | 'batches'
    | 'batch-workspace'
    | 'templates'
    | 'new-template'
    | 'analytics'
    | 'settings'
