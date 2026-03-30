import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import Link from 'next/link'
import { CheckCircle, Eye, BarChart3 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function StudentResultsPage() {
  const user = await getSessionUser()
  if (!user || user.role !== 'student') redirect('/auth/login')
  const supabase = getSupabaseAdmin()
  const [attRes, testsRes] = await Promise.all([
    supabase.from('attempts').select('*').eq('student_id', user.uid).eq('status', 'submitted').order('submitted_at', { ascending: false }),
    supabase.from('tests').select('id, title'),
  ])
  const attempts = attRes.data || []
  const testsMap = Object.fromEntries((testsRes.data || []).map((t: any) => [t.id, t]))
  const avg = attempts.length > 0 ? Math.round(attempts.reduce((s: number, a: any) => s + a.percentage, 0) / attempts.length) : 0

  return (
    <div className="max-w-4xl space-y-6">
      <div><h1 className="font-display text-2xl font-bold text-gray-900">My Results</h1><p className="text-gray-500 text-sm">{attempts.length} attempt{attempts.length !== 1 ? 's' : ''} · Avg: {avg}%</p></div>
      {attempts.length === 0 ? (
        <div className="card p-16 text-center"><BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-400 mb-4">No results yet.</p><Link href="/dashboard/student/tests" className="btn-primary text-sm">Browse Tests</Link></div>
      ) : (
        <div className="space-y-3">
          {attempts.map((a: any) => (
            <div key={a.id} className="card p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${a.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                <CheckCircle className={`w-6 h-6 ${a.passed ? 'text-dcoe-green' : 'text-red-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">{testsMap[a.test_id]?.title || 'Test'}</div>
                <div className="text-xs text-gray-400 mt-0.5">{formatDate(a.submitted_at)}</div>
              </div>
              <div className="text-right shrink-0">
                <div className={`font-display text-xl font-bold ${a.percentage >= 50 ? 'text-dcoe-green' : 'text-red-500'}`}>{a.percentage}%</div>
                <div className="text-xs text-gray-400">{a.score}/{a.total_marks} marks</div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${a.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{a.passed ? 'Pass' : 'Fail'}</span>
              <Link href={`/exam/result/${a.id}`} className="p-2 text-gray-400 hover:text-dcoe-green hover:bg-dcoe-green/5 rounded-lg transition-colors shrink-0"><Eye className="w-4 h-4" /></Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
