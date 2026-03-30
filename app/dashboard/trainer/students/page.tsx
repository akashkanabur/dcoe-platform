import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import { Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function TrainerStudentsPage() {
  const user = await getSessionUser()
  if (!user || user.role !== 'trainer') redirect('/auth/login')
  const supabase = getSupabaseAdmin()
  const [usersRes, attRes] = await Promise.all([
    supabase.from('users').select('*').eq('role', 'student').order('created_at', { ascending: false }),
    supabase.from('attempts').select('student_id, percentage, passed').eq('status', 'submitted'),
  ])
  const students = usersRes.data || []
  const attempts = attRes.data || []

  return (
    <div className="max-w-5xl space-y-6">
      <div><h1 className="font-display text-2xl font-bold text-gray-900">Students</h1><p className="text-gray-500 text-sm">{students.length} registered</p></div>
      {students.length === 0 ? (
        <div className="card p-16 text-center"><Users className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-400">No students registered yet.</p></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Name', 'Email', 'Attempts', 'Avg Score', 'Joined'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((s: any) => {
                  const sa = attempts.filter((a: any) => a.student_id === s.id)
                  const avg = sa.length > 0 ? Math.round(sa.reduce((sum: number, a: any) => sum + a.percentage, 0) / sa.length) : null
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-dcoe-green/10 text-dcoe-green rounded-full flex items-center justify-center text-xs font-bold">{s.name?.charAt(0).toUpperCase()}</div>
                          <span className="font-medium text-gray-900">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{s.email}</td>
                      <td className="px-5 py-4 text-gray-600">{sa.length}</td>
                      <td className="px-5 py-4">{avg !== null ? <span className={`font-semibold ${avg >= 50 ? 'text-dcoe-green' : 'text-red-500'}`}>{avg}%</span> : <span className="text-gray-300">—</span>}</td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{formatDate(s.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
