// ============================================
// D-CoE Platform – Shared Types
// ============================================

export type UserRole = 'trainer' | 'student'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
  avatar?: string
}

export type QuestionType = 'mcq' | 'multi-select' | 'true-false' | 'short-answer' | 'long-answer'

export interface Option {
  id: string
  text: string
}

export interface Question {
  id: string
  testId: string
  type: QuestionType
  text: string
  options?: Option[]       // for mcq / multi-select / true-false
  correctAnswer: string | string[]  // string for mcq/tf/short, string[] for multi-select
  marks: number
  order: number
}

export type TestStatus = 'draft' | 'published' | 'archived'

export interface Test {
  id: string
  title: string
  description: string
  duration: number         // minutes
  totalMarks: number
  passingMarks: number
  status: TestStatus
  createdBy: string        // trainer uid
  createdAt: string
  publishedAt?: string
  questions?: Question[]
  allowedAttempts: number
}

export interface Answer {
  questionId: string
  answer: string | string[]
  isCorrect?: boolean
  marksObtained?: number
}

export interface TestAttempt {
  id: string
  testId: string
  studentId: string
  studentName: string
  startedAt: string
  submittedAt?: string
  answers: Answer[]
  score?: number
  totalMarks?: number
  percentage?: number
  passed?: boolean
  status: 'in-progress' | 'submitted' | 'timed-out'
}

export interface TestResult {
  attempt: TestAttempt
  test: Test
  questions: Question[]
}

export interface DashboardStats {
  totalTests: number
  publishedTests: number
  totalStudents: number
  totalAttempts: number
  averageScore: number
}
