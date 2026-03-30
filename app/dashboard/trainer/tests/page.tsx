import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import Link from 'next/link'
import { PlusCircle, Eye, Clock, BookOpen } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function TrainerTestsPage() {
  const user = await getSessionUser()
  if (!user || user.role !== 'trainer') redirect('/auth/login')
  const supabase = getSupabaseAdmin()
  const { data: tests } = await supabase.from('tests').select('*').order('created_at', { ascending: false })
  const list = tests || []

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Manage Tests</h1>
          <p className="text-gray-500 text-sm">{list.length} test{list.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link href="/dashboard/trainer/create" className="btn-primary text-sm w-fit">
          <PlusCircle className="w-4 h-4" /> New Test
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="card p-16 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No tests yet.</p>
          <Link href="/dashboard/trainer/create" className="btn-primary text-sm">Create Test</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Module', 'Duration', 'Marks', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {list.map((test: any) => (
                  <tr key={test.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-900 max-w-[200px] truncate">{test.title}</div>
                      {test.description && <div className="text-xs text-gray-400 truncate max-w-[200px]">{test.description}</div>}
                    </td>
                    <td className="px-5 py-4"><span className="flex items-center gap-1 text-gray-600"><Clock className="w-3.5 h-3.5" />{test.duration}m</span></td>
                    <td className="px-5 py-4 text-gray-600">{test.total_marks}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${test.status === 'published' ? 'bg-green-100 text-green-700' : test.status === 'archived' ? 'bg-gray-100 text-gray-500' : 'bg-amber-100 text-amber-700'}`}>
                        {test.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(test.created_at)}</td>
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/trainer/tests/${test.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-dcoe-green hover:bg-dcoe-green/5 rounded-lg transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Manage
                      </Link>
                    </td>
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
