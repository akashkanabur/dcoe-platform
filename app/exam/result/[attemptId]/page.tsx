'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Award, ArrowRight, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'
import { getGrade } from '@/lib/utils'
import type { TestAttempt, Question } from '@/types'

export default function ResultPage() {
  const { attemptId } = useParams() as { attemptId: string }
  const router = useRouter()
  const [attempt, setAttempt] = useState<TestAttempt | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetch(`/api/results?attemptId=${attemptId}`)
      .then(r => r.json())
      .then(async d => {
        if (d.error) { router.push('/dashboard/student'); return }
        setAttempt(d.attempt)
        // Fetch questions for review
        const qRes = await fetch(`/api/tests/${d.attempt.testId}`)
        const qData = await qRes.json()
        setQuestions(qData.questions || [])
      })
      .finally(() => setLoading(false))
  }, [attemptId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-dcoe-green/20 border-t-dcoe-green rounded-full animate-spin" />
      </div>
    )
  }

  if (!attempt) return null

  const grade = getGrade(attempt.percentage || 0)
  const correct = attempt.answers.filter(a => a.isCorrect).length
  const incorrect = attempt.answers.filter(a => !a.isCorrect).length
  const unanswered = questions.length - attempt.answers.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-dcoe-green rounded-lg flex items-center justify-center">
              <span className="text-black font-display font-bold text-xs">D</span>
            </div>
            <span className="font-display font-bold text-gray-900 text-sm">D-CoE Platform</span>
          </div>
          <Link href="/dashboard/student" className="btn-ghost text-sm">
            <Home className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        {/* Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 md:p-12 text-center"
        >
          {/* Score circle */}
          <div className={`relative w-36 h-36 mx-auto mb-6`}>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke={attempt.passed ? '#2ECC40' : '#dc2626'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - (attempt.percentage || 0) / 100)}`}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-bold text-gray-900">{attempt.percentage}%</span>
              <span className={`text-xs font-semibold ${grade.color}`}>{grade.label}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            {attempt.passed ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
            <h1 className="font-display text-2xl font-bold text-gray-900">
              {attempt.passed ? 'Congratulations!' : 'Better luck next time!'}
            </h1>
          </div>
          <p className="text-gray-500">
            You scored <span className="font-bold text-gray-900">{attempt.score}</span> out of{' '}
            <span className="font-bold text-gray-900">{attempt.totalMarks}</span> marks
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="p-4 bg-green-50 rounded-2xl">
              <div className="font-display text-2xl font-bold text-green-700">{correct}</div>
              <div className="text-green-600 text-xs font-medium mt-0.5">Correct</div>
            </div>
            <div className="p-4 bg-red-50 rounded-2xl">
              <div className="font-display text-2xl font-bold text-red-600">{incorrect}</div>
              <div className="text-red-500 text-xs font-medium mt-0.5">Incorrect</div>
            </div>
            <div className="p-4 bg-gray-100 rounded-2xl">
              <div className="font-display text-2xl font-bold text-gray-600">{unanswered}</div>
              <div className="text-gray-500 text-xs font-medium mt-0.5">Skipped</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1 btn-outline justify-center"
            >
              {showDetails ? 'Hide' : 'View'} Answer Review
            </button>
            <Link href="/dashboard/student/tests" className="flex-1 btn-primary justify-center">
              Take Another Test <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Answer Review */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="font-display text-xl font-bold text-gray-900">Answer Review</h2>
            {questions.map((q, i) => {
              const studentAnswer = attempt.answers.find(a => a.questionId === q.id)
              const isCorrect = studentAnswer?.isCorrect

              return (
                <div key={q.id} className={`card p-5 border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-400'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-gray-400 font-medium">Q{i + 1}</span>
                        <span className="badge bg-blue-50 text-blue-600 text-xs">{q.type}</span>
                        <span className="text-xs text-gray-400">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                      </div>
                      <p className="text-gray-900 text-sm font-medium mb-3">{q.text}</p>

                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs w-24 shrink-0">Your answer:</span>
                          <span className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-600'}`}>
                            {studentAnswer?.answer
                              ? (Array.isArray(studentAnswer.answer)
                                  ? studentAnswer.answer.join(', ')
                                  : String(studentAnswer.answer))
                              : 'Not answered'}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-xs w-24 shrink-0">Correct:</span>
                            <span className="font-medium text-green-700">
                              {Array.isArray(q.correctAnswer)
                                ? q.correctAnswer.join(', ')
                                : String(q.correctAnswer)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}
