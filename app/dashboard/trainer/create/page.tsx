'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Save, ArrowLeft, Clock, Target, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CreateTestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [moduleOptions, setModuleOptions] = useState<string[]>([])
  const [form, setForm] = useState({
    title: '',
    module: '',
    description: '',
    duration: 30,
    passingMarks: 50,
    allowedAttempts: 1,
  })

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/modules')
        if (res.ok) {
          const data = await res.json()
          setModuleOptions(data.modules || [])
        }
      } catch {}
    })()
  }, [])

  const update = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.module.trim()) { toast.error('Module is required'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Test created!')
      router.push(`/dashboard/trainer/tests/${data.id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create test')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/trainer/tests" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Create New Test</h1>
          <p className="text-gray-500 text-sm">Fill in the details — you can add questions next.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Module *</label>
            <select
              value={form.module}
              onChange={e => {
                const mod = e.target.value
                setForm(f => ({ ...f, module: mod, title: mod }))
              }}
              className="input w-full p-3.5"
              required
            >
              <option value="">Select Module</option>
              {moduleOptions.map((m, i) => <option key={`${m}-${i}`} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={form.description}
              onChange={e => update('description', e.target.value)}
              placeholder="Brief description of the test scope and objectives..."
              rows={3}
              className="input resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Passing % 
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.passingMarks}
                onChange={e => update('passingMarks', Number(e.target.value))}
                className="input"
              />
            </div>

            <div>
              <label className="label flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Attempts Allowed
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.allowedAttempts}
                onChange={e => update('allowedAttempts', Number(e.target.value))}
                className="input"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Save className="w-4 h-4" />}
              Open Exam Manager
            </button>
            <Link href="/dashboard/trainer/tests" className="btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
