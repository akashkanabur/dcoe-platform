'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, ChevronLeft, ChevronRight, Send, AlertTriangle,
  CheckCircle, Circle, Flag
} from 'lucide-react'
import { formatTime } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Test, Question } from '@/types'

type AnswerMap = Record<string, string | string[]>

export default function ExamPage() {
  const { testId } = useParams() as { testId: string }
  const router = useRouter()

  const [test, setTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [started, setStarted] = useState(false)
  const startedAt = useRef<string>('')
  const timerRef = useRef<NodeJS.Timeout>()

  // Fetch test data
  useEffect(() => {
    fetch(`/api/tests/${testId}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { toast.error(d.error); router.push('/dashboard/student/tests'); return }
        setTest(d.test)
        setQuestions(d.questions || [])
        setTimeLeft((d.test.duration || 30) * 60)
      })
      .finally(() => setLoading(false))
  }, [testId, router])

  // Anti-refresh
  useEffect(() => {
    if (!started) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = 'Your test is in progress. Are you sure you want to leave?'
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [started])

  // Timer
  useEffect(() => {
    if (!started || timeLeft <= 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          handleSubmit(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [started])

  const handleStart = () => {
    startedAt.current = new Date().toISOString()
    setStarted(true)
  }

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting) return
    setSubmitting(true)
    clearInterval(timerRef.current)

    const answersArray = questions.map(q => ({
      questionId: q.id,
      answer: answers[q.id] ?? '',
    }))

    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          answers: answersArray,
          startedAt: startedAt.current,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (auto) toast('Time\'s up! Test auto-submitted.', { icon: '⏰' })
      else toast.success('Test submitted!')
      router.push(`/exam/result/${data.attemptId}`)
    } catch (err: any) {
      toast.error(err.message || 'Submission failed')
      setSubmitting(false)
    }
  }, [answers, questions, testId, router, submitting])

  const setAnswer = (qId: string, val: string | string[]) => {
    setAnswers(a => ({ ...a, [qId]: val }))
  }

  const toggleMulti = (qId: string, optId: string) => {
    setAnswers(a => {
      const current = Array.isArray(a[qId]) ? a[qId] as string[] : []
      return {
        ...a,
        [qId]: current.includes(optId) ? current.filter(x => x !== optId) : [...current, optId],
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-dcoe-green/20 border-t-dcoe-green rounded-full animate-spin" />
      </div>
    )
  }

  if (!test || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Test not available or has no questions.</p>
        <button onClick={() => router.back()} className="btn-primary text-sm">Go Back</button>
      </div>
    )
  }

  // Start Screen
  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        {/* Green top accent bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-dcoe-green z-50" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 max-w-lg w-full text-center"
        >
          {/* Icon */}
          <div className="w-16 h-16 bg-dcoe-green/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-dcoe-green" />
          </div>

          {/* D-CoE branding */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-dcoe-green rounded-md flex items-center justify-center">
              <span className="text-black font-black text-xs">D</span>
            </div>
            <span className="text-gray-400 text-xs font-medium">D-CoE · IISc Bengaluru</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">{test.title}</h1>
          {test.description && <p className="text-gray-500 text-sm mb-6 leading-relaxed">{test.description}</p>}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Duration', value: `${test.duration} min` },
              { label: 'Questions', value: questions.length },
              { label: 'Total Marks', value: test.totalMarks },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="font-display text-xl font-bold text-gray-900">{s.value}</div>
                <div className="text-gray-400 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="text-left p-4 bg-amber-50 border border-amber-100 rounded-xl mb-8 space-y-2.5">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3">Before you begin</p>
            {[
              'Do not refresh or navigate away during the test.',
              'The test will auto-submit when time runs out.',
              `Passing score required: ${test.passingMarks}%`,
            ].map((line, i) => (
              <p key={i} className="flex items-start gap-2 text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                {line}
              </p>
            ))}
          </div>

          <button
            onClick={handleStart}
            className="w-full flex items-center justify-center gap-2 py-4 bg-dcoe-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors text-base"
          >
            Start Test
          </button>
        </motion.div>
      </div>
    )
  }

  const currentQ = questions[currentIdx]
  const answeredCount = Object.keys(answers).filter(k => {
    const v = answers[k]
    return Array.isArray(v) ? v.length > 0 : v !== ''
  }).length
  const isWarning = timeLeft <= 300 // 5 min warning

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className={`fixed top-0 left-0 right-0 z-40 border-b ${isWarning ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'} shadow-sm`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-dcoe-green rounded-lg flex items-center justify-center">
              <span className="text-black font-display font-bold text-xs">D</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-gray-900 max-w-[200px] truncate">{test.title}</div>
              <div className="text-xs text-gray-400">{answeredCount}/{questions.length} answered</div>
            </div>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${isWarning ? 'text-red-600 timer-warning' : 'text-gray-900'}`}>
            <Clock className={`w-5 h-5 ${isWarning ? 'text-red-500' : 'text-gray-400'}`} />
            {formatTime(timeLeft)}
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            className="btn-primary text-sm py-2"
          >
            <Send className="w-4 h-4" /> Submit
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-dcoe-green transition-all duration-300"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-20 pb-10">
        <div className="flex gap-6">
          {/* Question Panel */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="card p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-8 bg-dcoe-green/10 text-dcoe-green rounded-xl flex items-center justify-center text-sm font-bold">
                    {currentIdx + 1}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="badge bg-blue-50 text-blue-600">{currentQ.type}</span>
                    <span>{currentQ.marks} mark{currentQ.marks !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <p className="text-gray-900 text-base font-medium leading-relaxed mb-6">
                  {currentQ.text}
                </p>

                {/* MCQ */}
                {currentQ.type === 'mcq' && (
                  <div className="space-y-2.5">
                    {currentQ.options?.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setAnswer(currentQ.id, opt.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                          answers[currentQ.id] === opt.id
                            ? 'border-dcoe-green bg-dcoe-green/5 text-gray-900'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          answers[currentQ.id] === opt.id ? 'border-dcoe-green bg-dcoe-green' : 'border-gray-300'
                        }`}>
                          {answers[currentQ.id] === opt.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className="text-sm font-medium uppercase text-gray-400 w-4 shrink-0">{opt.id}</span>
                        <span className="text-sm">{opt.text}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Multi-select */}
                {currentQ.type === 'multi-select' && (
                  <div className="space-y-2.5">
                    <p className="text-xs text-gray-400 mb-3">Select all that apply</p>
                    {currentQ.options?.map(opt => {
                      const selected = (answers[currentQ.id] as string[] || []).includes(opt.id)
                      return (
                        <button
                          key={opt.id}
                          onClick={() => toggleMulti(currentQ.id, opt.id)}
                          className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                            selected ? 'border-dcoe-green bg-dcoe-green/5' : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                            selected ? 'border-dcoe-green bg-dcoe-green' : 'border-gray-300'
                          }`}>
                            {selected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span className="text-sm font-medium uppercase text-gray-400 w-4">{opt.id}</span>
                          <span className="text-sm">{opt.text}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* True/False */}
                {currentQ.type === 'true-false' && (
                  <div className="grid grid-cols-2 gap-4">
                    {['true', 'false'].map(v => (
                      <button
                        key={v}
                        onClick={() => setAnswer(currentQ.id, v)}
                        className={`py-5 rounded-2xl border-2 font-semibold capitalize text-base transition-all ${
                          answers[currentQ.id] === v
                            ? 'border-dcoe-green bg-dcoe-green text-white shadow-md'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                )}

                {/* Short/long answer */}
                {(currentQ.type === 'short-answer' || currentQ.type === 'long-answer') && (
                  <textarea
                    value={(answers[currentQ.id] as string) || ''}
                    onChange={e => setAnswer(currentQ.id, e.target.value)}
                    placeholder="Type your answer here..."
                    rows={currentQ.type === 'long-answer' ? 8 : 4}
                    className="input resize-none text-base"
                  />
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                    disabled={currentIdx === 0}
                    className="btn-ghost disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <span className="text-sm text-gray-400">{currentIdx + 1} / {questions.length}</span>
                  {currentIdx < questions.length - 1 ? (
                    <button onClick={() => setCurrentIdx(i => i + 1)} className="btn-primary text-sm py-2">
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => setShowConfirm(true)} className="btn-primary text-sm py-2">
                      <Flag className="w-4 h-4" /> Finish
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Question Navigator (desktop) */}
          <div className="hidden lg:block w-52 shrink-0">
            <div className="card p-4 sticky top-24">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Questions</p>
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((q, i) => {
                  const ans = answers[q.id]
                  const answered = Array.isArray(ans) ? ans.length > 0 : !!ans
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(i)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        i === currentIdx
                          ? 'bg-dcoe-green text-white'
                          : answered
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>
              <div className="mt-4 space-y-1.5 text-xs text-gray-400">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-dcoe-green" /> Current</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-100" /> Answered</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-100" /> Unanswered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-14 h-14 bg-dcoe-green/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Send className="w-7 h-7 text-dcoe-green" />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 text-center mb-2">Submit Test?</h3>
              <p className="text-gray-500 text-sm text-center mb-6">
                You've answered <span className="font-bold text-gray-900">{answeredCount}</span> of{' '}
                <span className="font-bold text-gray-900">{questions.length}</span> questions.
                {answeredCount < questions.length && (
                  <span className="text-amber-600 block mt-1">
                    {questions.length - answeredCount} question{questions.length - answeredCount !== 1 ? 's' : ''} unanswered.
                  </span>
                )}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)} className="flex-1 btn-ghost border border-gray-200">
                  Review
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="flex-1 btn-primary justify-center"
                >
                  {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
