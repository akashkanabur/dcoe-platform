'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Globe, Archive, Clock, Target, CheckSquare, Type, ToggleLeft, List, Save, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const qTypes = [
  { value: 'mcq', label: 'MCQ', icon: List },
  { value: 'multi-select', label: 'Multi-Select', icon: CheckSquare },
  { value: 'true-false', label: 'True/False', icon: ToggleLeft },
  { value: 'short-answer', label: 'Short Answer', icon: Type },
  { value: 'long-answer', label: 'Long Answer', icon: Type },
]

type NewQuestionDraft = {
  type: string
  text: string
  options: { id: string; text: string }[]
  correctAnswer: string | string[]
  marks: number
}

const emptyQ = () => ({
  type: 'mcq',
  text: '',
  options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }, { id: 'd', text: '' }],
  correctAnswer: 'a',
  marks: 1,
})

export default function TestManagePage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [test, setTest] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newQ, setNewQ] = useState<NewQuestionDraft>(emptyQ() as NewQuestionDraft)

  useEffect(() => {
    fetch(`/api/tests/${id}`).then(r => r.json()).then(d => {
      setTest(d.test)
      // Normalize Supabase snake_case → camelCase for display
      setQuestions((d.questions || []).map((q: any) => ({
        ...q,
        correctAnswer: q.correct_answer,
        options: q.options || [],
      })))
    }).finally(() => setLoading(false))
  }, [id])

  const handlePublish = async () => {
    if (questions.length === 0) { toast.error('Add at least one question first'); return }
    setSaving(true)
    await fetch(`/api/tests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'published' }) })
    setTest((t: any) => ({ ...t, status: 'published' }))
    toast.success('Test published!')
    setSaving(false)
  }

  const handleArchive = async () => {
    await fetch(`/api/tests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'archived' }) })
    setTest((t: any) => ({ ...t, status: 'archived' }))
    toast.success('Archived')
  }

  const handleDelete = async () => {
    if (!confirm('Delete this test and all its questions?')) return
    await fetch(`/api/tests/${id}`, { method: 'DELETE' })
    toast.success('Deleted')
    router.push('/dashboard/trainer/tests')
  }

  const handleAddQ = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQ.text.trim()) { toast.error('Question text required'); return }
    setSaving(true)
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testId: id, ...newQ, correctAnswer: newQ.correctAnswer, order: questions.length }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); setSaving(false); return }
    setQuestions(q => [...q, { ...data, correctAnswer: data.correct_answer, options: data.options || [] }])
    setNewQ(emptyQ())
    setShowForm(false)
    toast.success('Question added!')
    setSaving(false)
  }

  const handleDeleteQ = async (qId: string) => {
    await fetch(`/api/questions?id=${qId}`, { method: 'DELETE' })
    setQuestions(q => q.filter(x => x.id !== qId))
    toast.success('Removed')
  }

  const updateOpt = (i: number, val: string) => setNewQ(q => {
    const opts = [...(q.options || [])]
    opts[i] = { ...opts[i], text: val }
    return { ...q, options: opts }
  })

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-dcoe-green/30 border-t-dcoe-green rounded-full animate-spin" /></div>
  if (!test) return <div className="text-gray-500">Test not found.</div>

  const totalMarks = questions.reduce((s, q) => s + (q.marks || 0), 0)

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start gap-3">
        <Link href="/dashboard/trainer/tests" className="p-2 hover:bg-gray-100 rounded-lg mt-1"><ArrowLeft className="w-4 h-4 text-gray-500" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-xl font-bold text-gray-900">{test.title}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${test.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{test.status}</span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{test.duration} min</span>
            <span className="flex items-center gap-1"><Target className="w-3 h-3" />Pass: {test.passing_marks}%</span>
            <span>{questions.length} questions · {totalMarks} marks</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {test.status === 'draft' && <button onClick={handlePublish} disabled={saving} className="btn-primary text-xs px-4 py-2"><Globe className="w-3.5 h-3.5" /> Publish</button>}
          {test.status === 'published' && <button onClick={handleArchive} className="btn-ghost text-xs"><Archive className="w-3.5 h-3.5" /> Archive</button>}
          <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="space-y-3">
        {questions.length === 0 && !showForm && (
          <div className="card p-10 text-center border-2 border-dashed border-gray-200">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No questions yet. Add your first question below.</p>
          </div>
        )}
        <AnimatePresence>
          {questions.map((q, i) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 shrink-0 mt-0.5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">{q.type}</span>
                      <span className="text-xs text-gray-400">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-gray-900 text-sm font-medium">{q.text}</p>
                    {q.options && q.options.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {q.options.map((opt: any) => {
                          const correct = Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(opt.id) : q.correctAnswer === opt.id
                          return (
                            <div key={opt.id} className={`flex items-center gap-2 text-xs px-2 py-1 rounded-lg ${correct ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-500'}`}>
                              <span className="w-4 h-4 border rounded flex items-center justify-center text-xs shrink-0">{opt.id}</span>
                              {opt.text}
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {(q.type === 'short-answer' || q.type === 'long-answer') && <div className="mt-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-lg inline-block">Answer: {String(q.correctAnswer)}</div>}
                  </div>
                </div>
                <button onClick={() => handleDeleteQ(q.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-400 hover:border-dcoe-green/40 hover:text-dcoe-green transition-all flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Question
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-6 border-2 border-dcoe-green/20">
          <h3 className="font-semibold text-gray-900 mb-5">New Question</h3>
          <form onSubmit={handleAddQ} className="space-y-4">
            <div>
              <label className="label">Question Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {qTypes.map(qt => {
                  const Icon = qt.icon
                  return (
                    <button type="button" key={qt.value}
                      onClick={() => setNewQ(q => ({ ...q, type: qt.value, correctAnswer: qt.value === 'multi-select' ? [] : qt.value === 'true-false' ? 'true' : (qt.value === 'short-answer' || qt.value === 'long-answer') ? '' : 'a' }))}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all ${newQ.type === qt.value ? 'border-dcoe-green bg-dcoe-green/5 text-dcoe-green' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      <Icon className="w-4 h-4" />{qt.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="label">Question Text *</label>
              <textarea value={newQ.text} onChange={e => setNewQ(q => ({ ...q, text: e.target.value }))} rows={2} placeholder="Enter your question..." className="input resize-none" required />
            </div>
            {(newQ.type === 'mcq' || newQ.type === 'multi-select') && (
              <div>
                <label className="label">Options & Correct Answer</label>
                <div className="space-y-2">
                  {newQ.options?.map((opt: any, i: number) => {
                    const isC = Array.isArray(newQ.correctAnswer) ? newQ.correctAnswer.includes(opt.id) : newQ.correctAnswer === opt.id
                    return (
                      <div key={opt.id} className="flex items-center gap-2">
                        <input type={newQ.type === 'multi-select' ? 'checkbox' : 'radio'} name="correct" checked={isC}
                          onChange={() => {
                            if (newQ.type === 'multi-select') {
                              const arr = Array.isArray(newQ.correctAnswer) ? [...newQ.correctAnswer] : []
                              setNewQ(q => ({ ...q, correctAnswer: isC ? arr.filter(x => x !== opt.id) : [...arr, opt.id] }))
                            } else { setNewQ(q => ({ ...q, correctAnswer: opt.id })) }
                          }}
                          className="w-4 h-4 accent-dcoe-green shrink-0" />
                        <span className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-500">{opt.id}</span>
                        <input type="text" value={opt.text} onChange={e => updateOpt(i, e.target.value)} placeholder={`Option ${opt.id.toUpperCase()}`} className="input flex-1 py-2 text-sm" />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            {newQ.type === 'true-false' && (
              <div>
                <label className="label">Correct Answer</label>
                <div className="flex gap-3">
                  {['true', 'false'].map(v => (
                    <button type="button" key={v} onClick={() => setNewQ(q => ({ ...q, correctAnswer: v }))}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${newQ.correctAnswer === v ? 'border-dcoe-green bg-dcoe-green/5 text-dcoe-green' : 'border-gray-200 text-gray-500'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {(newQ.type === 'short-answer' || newQ.type === 'long-answer') && (
              <div>
                <label className="label">Expected Answer</label>
                <input type="text" value={newQ.correctAnswer as string} onChange={e => setNewQ(q => ({ ...q, correctAnswer: e.target.value }))} placeholder="Expected answer (case-insensitive)" className="input" />
              </div>
            )}
            <div className="w-32">
              <label className="label">Marks</label>
              <input type="number" min={1} max={100} value={newQ.marks} onChange={e => setNewQ(q => ({ ...q, marks: Number(e.target.value) }))} className="input" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary text-sm">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Save Question
              </button>
              <button type="button" onClick={() => { setShowForm(false); setNewQ(emptyQ()) }} className="btn-ghost text-sm">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  )
}
