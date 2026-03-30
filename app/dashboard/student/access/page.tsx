'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type ModuleEntry = string

export default function StudentExamAccessPage() {
  const router = useRouter()
  const [modules, setModules] = useState<ModuleEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [moduleIdx, setModuleIdx] = useState(0)
  const [code, setCode] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/modules')
        const text = await res.text()
        let data: any = null
        try { data = JSON.parse(text) } catch {}
        if (!res.ok) throw new Error(data?.error || 'Failed to load modules')
        setModules(data?.modules || [])
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load modules')
      }
    })()
  }, [])

  const selected = useMemo(() => modules[moduleIdx], [modules, moduleIdx])

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) {
      toast.error('No active modules available')
      return
    }
    if (!code.trim()) {
      toast.error('Exam code is required')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/exams/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: selected,
          code: code.trim().toUpperCase(),
        }),
      })
      const text = await res.text()
      let data: any = null
      try { data = JSON.parse(text) } catch {}
      if (!res.ok) throw new Error(data?.error || 'Enrollment failed')
      toast.success('Exam unlocked successfully')
      router.push(`/exam/${data.testId}`)
    } catch (err: any) {
      toast.error(err.message || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Enter Exam Code</h1>
        <p className="text-gray-500 text-sm">Select module/course and enter the access code shared by admin.</p>
      </div>

      <form onSubmit={handleEnroll} className="card p-6 space-y-4">
        <div>
          <label className="label">Module & Course</label>
          <select
            className="input"
            value={moduleIdx}
            onChange={e => setModuleIdx(Number(e.target.value))}
            disabled={modules.length === 0}
          >
            {modules.length === 0 ? (
              <option>No modules available</option>
            ) : (
              modules.map((m, i) => (
                <option key={`${m}-${i}`} value={i}>
                  {m}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="label">Exam Access Code</label>
          <input
            className="input"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="EXAM-XXXXXX"
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading || modules.length === 0}>
          {loading ? 'Verifying...' : 'Unlock Exam'}
        </button>
      </form>
    </div>
  )
}
