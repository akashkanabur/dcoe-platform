import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import { User, Mail, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function ProfilePage() {
  const user = await getSessionUser()
  if (!user || user.role !== 'student') redirect('/auth/login')
  const supabase = getSupabaseAdmin()
  const [uRes, aRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.uid).single(),
    supabase.from('attempts').select('percentage, passed').eq('student_id', user.uid).eq('status', 'submitted'),
  ])
  const u = uRes.data
  const attempts = aRes.data || []
  const avg = attempts.length > 0 ? Math.round(attempts.reduce((s: number, a: any) => s + a.percentage, 0) / attempts.length) : 0
  const passed = attempts.filter((a: any) => a.passed).length

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-gray-900">My Profile</h1>
      <div className="card p-8">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 bg-dcoe-green/10 text-dcoe-green rounded-2xl flex items-center justify-center text-2xl font-bold font-display">{user.name.charAt(0).toUpperCase()}</div>
          <div><h2 className="font-display text-xl font-bold text-gray-900">{user.name}</h2><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mt-1">Student</span></div>
        </div>
        <div className="space-y-4">
          {[{ icon: User, label: 'Full Name', value: user.name },{ icon: Mail, label: 'Email', value: user.email },{ icon: Calendar, label: 'Joined', value: u?.created_at ? formatDate(u.created_at) : 'N/A' }].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm"><Icon className="w-4 h-4 text-gray-500" /></div>
              <div><div className="text-xs text-gray-400 font-medium">{label}</div><div className="text-sm font-semibold text-gray-900">{value}</div></div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[{ label: 'Tests Taken', value: attempts.length },{ label: 'Tests Passed', value: passed },{ label: 'Avg. Score', value: `${avg}%` }].map(s => (
          <div key={s.label} className="card p-5 text-center">
            <div className="font-display text-2xl font-bold text-dcoe-green">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
