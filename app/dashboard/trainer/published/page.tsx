import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import Link from 'next/link'
import { Clock, Target, BookOpen, Key, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function TrainerPublishedTestsPage() {
  const user = await getSessionUser()
  if (!user || user.role !== 'trainer') redirect('/auth/login')
  
  const supabase = getSupabaseAdmin()
  const { data: tests, error } = await supabase
    .from('tests')
    .select('*')
    .eq('status', 'published')
    .eq('is_enabled', true)
    .order('published_at', { ascending: false })

  const list = tests || []

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Published Tests</h1>
          <p className="text-gray-500 text-sm">
            These tests are currently visible and accessible to students via their exam codes.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-100 text-xs font-bold uppercase tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live to Students
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card p-16 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No published tests at the moment.</p>
          <Link href="/dashboard/trainer/tests" className="btn-primary text-sm">Manage All Tests</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((test: any) => (
            <div key={test.id} className="card p-6 flex flex-col gap-4 hover:shadow-md transition-all group border-t-4 border-t-dcoe-green">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                   <h3 className="font-display font-bold text-gray-900 text-base leading-snug truncate max-w-[200px]" title={test.title}>
                    {test.title}
                  </h3>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                    {test.module}
                  </div>
                </div>
                <Link 
                  href={`/dashboard/trainer/tests/${test.id}`}
                  className="p-2 text-gray-400 hover:text-dcoe-green hover:bg-dcoe-green/5 rounded-full transition-all"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center space-y-1 group-hover:bg-dcoe-green/5 transition-colors">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Exam Access Code</div>
                <div className="text-xl font-black text-gray-900 tracking-widest flex items-center justify-center gap-2">
                  <Key className="w-4 h-4 text-dcoe-green" />
                  {test.exam_code}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 mt-auto pt-4 border-t border-gray-50">
                <div className="flex flex-col gap-1">
                   <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{test.duration} mins</span>
                   <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" />Pass: {test.passing_marks}%</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{test.total_marks} Marks</div>
                  <div className="text-[10px] text-gray-400">Published {formatDate(test.published_at || test.created_at)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
