import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-client'

export async function GET(req: NextRequest) {
  return withAuth(async () => {
    let supabase: ReturnType<typeof getSupabaseAdmin> | null = null
    try {
      supabase = getSupabaseAdmin()
    } catch (err: any) {
      // Avoid crashing the dashboard UI when Supabase env vars are not configured yet.
      const msg = String(err?.message || err)
      if (msg.includes('Missing Supabase environment variables')) {
        return NextResponse.json({
          stats: {
            totalUsers: 0,
            totalTests: 0,
            publishedTests: 0,
            totalAttempts: 0,
            avgScore: 0,
            passRate: 0,
          },
          recentUsers: [],
          recentAttempts: [],
          tests: [],
          auditLogs: [],
          error: msg,
        })
      }
      throw err
    }

    const [usersRes, testsRes, attRes, logsRes] = await Promise.all([
      supabase!.from('users').select('id, name, email, created_at').order('created_at', { ascending: false }),
      supabase!.from('tests').select('id, title, status, created_at, total_marks'),
      supabase!.from('attempts').select('id, student_name, score, total_marks, percentage, passed, submitted_at, test_id').eq('status', 'submitted').order('submitted_at', { ascending: false }),
      supabase!.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(20),
    ])

    const users = usersRes.data || []
    const tests = testsRes.data || []
    const attempts = attRes.data || []
    const avgScore = attempts.length > 0 ? Math.round(attempts.reduce((s: number, a: any) => s + (a.percentage || 0), 0) / attempts.length) : 0

    return NextResponse.json({
      stats: {
        totalUsers: users.length,
        totalTests: tests.length,
        publishedTests: tests.filter((t: any) => t.status === 'published').length,
        totalAttempts: attempts.length,
        avgScore,
        passRate: attempts.length > 0 ? Math.round((attempts.filter((a: any) => a.passed).length / attempts.length) * 100) : 0,
      },
      recentUsers: users.slice(0, 10),
      recentAttempts: attempts.slice(0, 10),
      tests,
      auditLogs: logsRes.data || [],
    })
  }, 'admin')(req)
}
