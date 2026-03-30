import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import { v4 as uuid } from 'uuid'

export async function POST(req: NextRequest) {
  return withAuth(async (request, user) => {
    if (user.role !== 'student') return NextResponse.json({ error: 'Only students can enroll' }, { status: 403 })

    const { module, code } = await request.json()
    if (!module || !code) {
      return NextResponse.json({ error: 'Module and exam code are required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data: tests, error: testError } = await supabase
      .from('tests')
      .select('id, title, module, exam_code, status, is_enabled')
      .eq('module', module)
      .eq('exam_code', String(code).trim().toUpperCase())
      .eq('status', 'published')
      .eq('is_enabled', true)
      .limit(1)

    if (testError) return NextResponse.json({ error: testError.message }, { status: 500 })
    if (!tests || tests.length === 0) return NextResponse.json({ error: 'Invalid exam code for the selected module' }, { status: 404 })

    const test = tests[0]
    const enrollment = {
      id: uuid(),
      test_id: test.id,
      student_id: user.uid,
      via_code: String(code).trim().toUpperCase(),
      enrolled_at: new Date().toISOString(),
    }

    const { error: enrollError } = await supabase
      .from('exam_enrollments')
      .upsert(enrollment, { onConflict: 'test_id,student_id' })

    if (enrollError) return NextResponse.json({ error: enrollError.message }, { status: 500 })

    return NextResponse.json({ success: true, testId: test.id, title: test.title })
  }, 'student')(req)
}
