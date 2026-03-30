import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import { ClipboardList, Users, BarChart3, TrendingUp, PlusCircle, Eye } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

async function getData() {
  try {
    const supabase = getSupabaseAdmin()
    const [testsRes, attemptsRes, usersRes] = await Promise.all([
      supabase.from('tests').select('*').order('created_at', { ascending: false }),
      supabase.from('attempts').select('*').eq('status', 'submitted').order('submitted_at', { ascending: false }),
      supabase.from('users').select('id').eq('role', 'student'),
    ])
    const tests = testsRes.data || []
    const attempts = attemptsRes.data || []
    const avgPct = attempts.length > 0
      ? Math.round(attempts.reduce((s: number, a: any) => s + (a.percentage || 0), 0) / attempts.length) : 0
    return {
      totalTests: tests.length, publishedTests: tests.filter((t: any) => t.status === 'published').length,
      totalStudents: (usersRes.data || []).length, totalAttempts: attempts.length, avgScore: avgPct,
      recentTests: tests.slice(0, 5), recentAttempts: attempts.slice(0, 5),
    }
  } catch {
    return { totalTests: 0, publishedTests: 0, totalStudents: 0, totalAttempts: 0, avgScore: 0, recentTests: [], recentAttempts: [] }
  }
}

export default async function TrainerDashboard() {
  const user = await getSessionUser()
  if (!user || user.role !== 'trainer') redirect('/auth/login')
  const data = await getData()
  const stats = [
    { label: 'Total Tests', value: data.totalTests, icon: ClipboardList, color: 'bg-blue-50 text-blue-600', sub: `${data.publishedTests} published` },
    { label: 'Students', value: data.totalStudents, icon: Users, color: 'bg-green-50 text-green-600', sub: 'Registered' },
    { label: 'Attempts', value: data.totalAttempts, icon: BarChart3, color: 'bg-purple-50 text-purple-600', sub: 'Submissions' },
    { label: 'Avg. Score', value: `${data.avgScore}%`, icon: TrendingUp, color: 'bg-dcoe-green/10 text-dcoe-green', sub: 'Across all tests' },
  ]
  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="font-display text-2xl font-bold text-gray-900">Trainer Dashboard</h1><p className="text-gray-500 text-sm mt-1">Welcome back, {user.name}</p></div>
        <Link href="/dashboard/trainer/create" className="btn-primary text-sm w-fit"><PlusCircle className="w-4 h-4" /> New Test</Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => { const Icon = s.icon; return (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
            <div className="font-display text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm font-medium text-gray-700 mt-0.5">{s.label}</div>
            <div className="text-xs text-gray-400 mt-1">{s.sub}</div>
          </div>
        )})}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5"><h2 className="font-semibold text-gray-900">Recent Tests</h2><Link href="/dashboard/trainer/tests" className="text-xs text-dcoe-green hover:underline">View all</Link></div>
          {data.recentTests.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No tests yet. <Link href="/dashboard/trainer/create" className="text-dcoe-green hover:underline">Create one!</Link></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.recentTests.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0 mr-3"><div className="text-sm font-medium text-gray-900 truncate">{t.title}</div><div className="text-xs text-gray-400">{formatDate(t.created_at)} · {t.duration}min</div></div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${t.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{t.status}</span>
                    <Link href={`/dashboard/trainer/tests/${t.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-3.5 h-3.5 text-gray-400" /></Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5"><h2 className="font-semibold text-gray-900">Recent Submissions</h2><Link href="/dashboard/trainer/results" className="text-xs text-dcoe-green hover:underline">View all</Link></div>
          {data.recentAttempts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No submissions yet.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.recentAttempts.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between py-3">
                  <div><div className="text-sm font-medium text-gray-900">{a.student_name}</div><div className="text-xs text-gray-400">{formatDate(a.submitted_at)}</div></div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${a.percentage >= 50 ? 'text-dcoe-green' : 'text-red-500'}`}>{a.percentage}%</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${a.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{a.passed ? 'Pass' : 'Fail'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
