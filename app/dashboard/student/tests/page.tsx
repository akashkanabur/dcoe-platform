import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import Link from 'next/link'
import { Clock, Target, BookOpen, CheckCircle, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function StudentTestsPage() {
  const user = await getSessionUser()
  if (!user || user.role !== 'student') redirect('/auth/login')
  const supabase = getSupabaseAdmin()
  const [testsRes, attRes, modulesRes, enrollmentsRes] = await Promise.all([
    supabase.from('tests').select('*').eq('status', 'published').eq('is_enabled', true).order('published_at', { ascending: false }),
    supabase.from('attempts').select('*').eq('student_id', user.uid),
    supabase.from('tests').select('module, course_name').eq('status', 'published').eq('is_enabled', true),
    supabase.from('exam_enrollments').select('test_id').eq('student_id', user.uid),
  ])
  const tests = testsRes.data || []
  const attemptMap = Object.fromEntries((attRes.data || []).map((a: any) => [a.test_id, a]))
  const enrolledIds = new Set((enrollmentsRes.data || []).map((e: any) => e.test_id))
  const enrolledTests = tests.filter((t: any) => enrolledIds.has(t.id))
  const modules = Array.from(
    new Map(
      (modulesRes.data || [])
        .filter((m: any) => m.module && m.course_name)
        .map((m: any) => [`${m.module}::${m.course_name}`, { module: m.module, courseName: m.course_name }])
    ).values()
  )

  return (
    <div className="max-w-4xl space-y-6">
      <div><h1 className="font-display text-2xl font-bold text-gray-900">Exam Access</h1><p className="text-gray-500 text-sm">Use your exam code to unlock tests</p></div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Available Modules</h2>
        {modules.length === 0 ? (
          <p className="text-sm text-gray-400">No active module/course combinations yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {modules.map((m: any) => (
              <div key={`${m.module}-${m.courseName}`} className="rounded-xl border border-gray-100 p-3">
                <p className="text-xs text-gray-400">Module</p>
                <p className="text-sm font-semibold text-gray-900">{m.module}</p>
                <p className="text-xs text-gray-400 mt-1">Course</p>
                <p className="text-sm text-gray-700">{m.courseName}</p>
              </div>
            ))}
          </div>
        )}
        <Link href="/dashboard/student/access" className="btn-primary text-sm w-fit">
          Enter Exam Code
        </Link>
      </div>

      {enrolledTests.length === 0 ? (
        <div className="card p-16 text-center"><BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-400">No tests available yet.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrolledTests.map((test: any) => {
            const attempt = attemptMap[test.id]
            const done = attempt?.status === 'submitted'
            return (
              <div key={test.id} className={`card p-6 flex flex-col gap-4 ${done ? 'opacity-80' : 'hover:shadow-md transition-shadow'}`}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-bold text-gray-900 text-base leading-snug flex-1">{test.title}</h3>
                  {done && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 shrink-0"><CheckCircle className="w-3 h-3" />Done</span>}
                </div>
                {test.description && <p className="text-gray-500 text-sm leading-relaxed">{test.description}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{test.duration} min</span>
                  <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" />Pass: {test.passing_marks}%</span>
                  <span>{test.total_marks} marks</span>
                </div>
                <div className="text-xs text-gray-400">{test.module} · {test.course_name}</div>
                {done ? (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className={`font-bold text-sm ${attempt.percentage >= 50 ? 'text-dcoe-green' : 'text-red-500'}`}>{attempt.percentage}% · {formatDate(attempt.submitted_at)}</span>
                    <Link href={`/exam/result/${attempt.id}`} className="text-xs text-dcoe-green font-semibold hover:underline">View Result</Link>
                  </div>
                ) : (
                  <Link href={`/exam/${test.id}`} className="btn-primary text-sm w-full justify-center mt-auto">Start Test <ArrowRight className="w-4 h-4" /></Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
