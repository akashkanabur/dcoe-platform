import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import { BarChart3 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function TrainerResultsPage() {
  const user = await getSessionUser()
  if (!user || user.role !== 'trainer') redirect('/auth/login')
  const supabase = getSupabaseAdmin()
  const [attRes, testsRes] = await Promise.all([
    supabase.from('attempts').select('*').eq('status', 'submitted').order('submitted_at', { ascending: false }),
    supabase.from('tests').select('id, title'),
  ])
  const attempts = attRes.data || []
  const testsMap = Object.fromEntries((testsRes.data || []).map((t: any) => [t.id, t]))

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Student Results</h1>
        <p className="text-gray-500 text-sm">{attempts.length} submission{attempts.length !== 1 ? 's' : ''}</p>
      </div>
      {attempts.length === 0 ? (
        <div className="card p-16 text-center"><BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-400">No submissions yet.</p></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Student', 'Module', 'Score', 'Percentage', 'Result', 'Date'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {attempts.map((a: any) => (
                  <tr key={a.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-4 font-medium text-gray-900">{a.student_name}</td>
                    <td className="px-5 py-4 text-gray-600 max-w-[180px] truncate">{testsMap[a.test_id]?.title || '—'}</td>
                    <td className="px-5 py-4 text-gray-600">{a.score}/{a.total_marks}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${a.percentage >= 50 ? 'bg-dcoe-green' : 'bg-red-400'}`} style={{ width: `${a.percentage}%` }} />
                        </div>
                        <span className={`font-semibold text-sm ${a.percentage >= 50 ? 'text-dcoe-green' : 'text-red-500'}`}>{a.percentage}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${a.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {a.passed ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{formatDate(a.submitted_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
