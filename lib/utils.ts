import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function calculateScore(answers: Array<{ isCorrect?: boolean; marksObtained?: number }>): number {
  return answers.reduce((acc, a) => acc + (a.marksObtained || 0), 0)
}

export function getGrade(percentage: number): { label: string; color: string } {
  if (percentage >= 90) return { label: 'Excellent', color: 'text-green-600' }
  if (percentage >= 75) return { label: 'Good', color: 'text-blue-600' }
  if (percentage >= 60) return { label: 'Average', color: 'text-yellow-600' }
  if (percentage >= 40) return { label: 'Below Average', color: 'text-orange-600' }
  return { label: 'Poor', color: 'text-red-600' }
}
