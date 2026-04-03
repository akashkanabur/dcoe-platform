'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

type Exam = {
  id: string
  title: string
  module: string
  course_name: string
  duration: number
  exam_code: string
  status: 'draft' | 'published' | 'archived'
  is_enabled: boolean
}

type QuestionForm = {
  testId: string
  type: 'mcq' | 'multi-select' | 'short-answer' | 'long-answer'
  text: string
  options: string[]
  correctAnswer: string
  marks: number
}

const questionTypes = ['mcq', 'multi-select', 'short-answer', 'long-answer'] as const

const randomCode = () => `EXAM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

export default function AdminExamManagerPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [moduleOptions, setModuleOptions] = useState<string[]>([])

  const [examForm, setExamForm] = useState({
    title: '',
    module: '',
    duration: 30,
    examCode: randomCode(),
  })

  const [questionForm, setQuestionForm] = useState<QuestionForm>({
    testId: '',
    type: 'mcq',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 'a',
    marks: 1,
  })

  const parseJson = async (res: Response) => {
    const text = await res.text()
    try { return JSON.parse(text) } catch { return null }
  }

  const fetchExams = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tests')
      const data = await parseJson(res)
      if (!res.ok) throw new Error(data?.error || 'Failed to load exams')
      setExams(data.tests || [])
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExams()
    ;(async () => {
      try {
        const res = await fetch('/api/modules')
        const data = await parseJson(res)
        if (!res.ok) throw new Error(data?.error || 'Failed to load modules')
        setModuleOptions(data?.modules || [])
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load modules')
      }
    })()
  }, [fetchExams])

  const selectedExam = useMemo(() => exams.find(e => e.id === questionForm.testId), [exams, questionForm.testId])

  const createExam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!examForm.title || !examForm.module) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    try {
      const createRes = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examForm),
      })
      const created = await parseJson(createRes)
      if (!createRes.ok) throw new Error(created?.error || 'Failed to create exam')
      await fetch(`/api/tests/${created.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      })
      toast.success('Exam created with access code')
      setExamForm({ title: '', module: '', duration: 30, examCode: randomCode() })
      fetchExams()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleEnabled = async (exam: Exam) => {
    const res = await fetch(`/api/tests/${exam.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isEnabled: !exam.is_enabled }),
    })
    const data = await parseJson(res)
    if (!res.ok || !data) {
      toast.error(data?.error || 'Update failed')
      return
    }
    toast.success(exam.is_enabled ? 'Exam disabled' : 'Exam enabled')
    fetchExams()
  }

  const deleteExam = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam and all its questions? This action cannot be undone.')) return
    try {
      const res = await fetch(`/api/tests/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await parseJson(res)
        throw new Error(d?.error || 'Delete failed')
      }
      toast.success('Exam deleted')
      fetchExams()
      if (questionForm.testId === id) setQuestionForm(f => ({ ...f, testId: '' }))
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const prepareAddQuestion = (exam: Exam) => {
    setQuestionForm(f => ({ ...f, testId: exam.id }))
    window.scrollTo({ top: 400, behavior: 'smooth' })
  }

  const addQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionForm.testId || !questionForm.text.trim()) {
      toast.error('Exam and question are required')
      return
    }
    let payload: any = {
      testId: questionForm.testId,
      type: questionForm.type,
      text: questionForm.text,
      marks: questionForm.marks,
      order: 999,
      correctAnswer: questionForm.correctAnswer,
      options: [],
    }
    if (questionForm.type === 'mcq' || questionForm.type === 'multi-select') {
      payload.options = questionForm.options.map((text, i) => ({ id: String.fromCharCode(97 + i), text }))
      payload.correctAnswer = questionForm.type === 'multi-select'
        ? String(questionForm.correctAnswer).split(',').map(x => x.trim()).filter(Boolean)
        : questionForm.correctAnswer
    }
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await parseJson(res)
    if (!res.ok || !data) {
      toast.error(data?.error || 'Failed to add question')
      return
    }
    toast.success('Question added')
    setQuestionForm({
      testId: questionForm.testId,
      type: 'mcq',
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 'a',
      marks: 1,
    })
  }

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedExam) return
    
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('testId', selectedExam.id)

    try {
      const res = await fetch('/api/questions/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await parseJson(res)
      if (!res.ok) throw new Error(data?.error || 'Failed to upload')
      
      toast.success(data.message || 'Questions uploaded successfully')
      fetchExams()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-6">
      <div>
        <h1 className="font-black text-2xl text-gray-900">Exam Manager</h1>
        <p className="text-gray-400 text-sm mt-1">Create exams, generate codes, add questions, and enable/disable exams.</p>
      </div>

      <form onSubmit={createExam} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-bold text-gray-900 text-sm">Create Exam</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select 
            className="input" 
            value={examForm.module} 
            onChange={e => setExamForm(f => ({ ...f, module: e.target.value, title: e.target.value }))}
          >
            <option value="">Select Module</option>
            {moduleOptions.map((m, i) => <option key={`${m}-${i}`} value={m}>{m}</option>)}
          </select>
          <input className="input" placeholder="Exam Code" value={examForm.examCode} onChange={e => setExamForm(f => ({ ...f, examCode: e.target.value.toUpperCase() }))} />
          <button type="button" className="btn-ghost" onClick={() => setExamForm(f => ({ ...f, examCode: randomCode() }))}>Generate Code</button>
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Exam'}</button>
      </form>

      <form onSubmit={addQuestion} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 relative overflow-hidden" id="add-question-form">
        {selectedExam && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-dcoe-green" />
        )}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-sm">Add Question</h2>
          {selectedExam && (
            <div className="flex items-center gap-2 bg-dcoe-green/10 px-3 py-1 rounded-full border border-dcoe-green/20">
              <span className="text-[10px] uppercase font-bold text-dcoe-green">Targeting Exam:</span>
              <span className="text-xs font-semibold text-gray-700">{selectedExam.title}</span>
              <button 
                type="button" 
                onClick={() => setQuestionForm(f => ({ ...f, testId: '' }))}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </div>
        {!selectedExam && (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
             <div className="text-amber-600 text-sm font-medium">Please click "Add Q" on an exam below to start adding questions.</div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Question Type</label>
            <select className="input" value={questionForm.type} onChange={e => setQuestionForm(f => ({ ...f, type: e.target.value as any }))}>
              {questionTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <textarea className="input" rows={3} placeholder="Question text" value={questionForm.text} onChange={e => setQuestionForm(f => ({ ...f, text: e.target.value }))} />
        {(questionForm.type === 'mcq' || questionForm.type === 'multi-select') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {questionForm.options.map((opt, idx) => (
              <input
                key={idx}
                className="input"
                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                value={opt}
                onChange={e => setQuestionForm(f => {
                  const options = [...f.options]
                  options[idx] = e.target.value
                  return { ...f, options }
                })}
              />
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Right Answer (Option ID like 'a', 'b' or 'a,c')</label>
            <input
              className="input"
              placeholder={questionForm.type === 'multi-select' ? 'e.g. a,c' : 'e.g. a'}
              value={String(questionForm.correctAnswer)}
              onChange={e => setQuestionForm(f => ({ ...f, correctAnswer: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Marks</label>
            <input className="input" type="number" min={1} max={100} value={questionForm.marks} onChange={e => setQuestionForm(f => ({ ...f, marks: Number(e.target.value) }))} />
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={!selectedExam}>Add Question</button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 relative overflow-hidden">
        {selectedExam && <div className="absolute top-0 left-0 right-0 h-1.5 bg-dcoe-green" />}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-sm">Bulk Upload Questions</h2>
          {selectedExam && (
            <div className="flex items-center gap-2 bg-dcoe-green/10 px-3 py-1 rounded-full border border-dcoe-green/20">
              <span className="text-[10px] uppercase font-bold text-dcoe-green">Targeting Exam:</span>
              <span className="text-xs font-semibold text-gray-700">{selectedExam.title}</span>
            </div>
          )}
        </div>
        {!selectedExam ? (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
             <div className="text-amber-600 text-sm font-medium">Please click "Add Q" on an exam below to unlock bulk uploading.</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              Upload an <strong>Excel (.xlsx)</strong>, <strong>Word (.docx)</strong>, or <strong>PDF (.pdf)</strong> file.<br />
              <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded">
                Note: Ensure PDFs & Docs use the Q: / A) B) C) D) / Ans: format. Excel files must use clear column headers.
              </span>
            </div>
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv,.pdf,.docx,.doc" 
              className="input w-full md:w-1/2" 
              disabled={uploading}
              onChange={handleBulkUpload}
            />
            {uploading && <div className="text-sm animate-pulse text-dcoe-green font-bold">📄 Parsing document & importing... This may take a moment.</div>}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-sm">Manage Exams</h2>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-gray-400">Loading...</div>
        ) : exams.length === 0 ? (
          <div className="p-6 text-sm text-gray-400">No exams created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Title', 'Module', 'Code', 'Duration', 'Enabled', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {exams.map(exam => (
                  <tr key={exam.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-gray-900">{exam.title}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-tight">{exam.status}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{exam.module || '-'}</td>
                    <td className="px-5 py-3 font-mono font-bold text-dcoe-green">{exam.exam_code || '-'}</td>
                    <td className="px-5 py-3 text-gray-500">{exam.duration}m</td>
                    <td className="px-5 py-3">
                      <button 
                        onClick={() => toggleEnabled(exam)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          exam.is_enabled 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {exam.is_enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => prepareAddQuestion(exam)}
                          className="px-2 py-1 bg-dcoe-black text-white text-[10px] font-bold rounded uppercase hover:bg-gray-800 transition-colors"
                        >
                          Add Q
                        </button>
                        <button 
                          onClick={() => deleteExam(exam.id)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                          title="Delete Exam"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
