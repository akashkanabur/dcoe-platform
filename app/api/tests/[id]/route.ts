import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-client'

type Params = { params: { id: string } }

export async function GET(req: NextRequest, { params }: Params) {
  return withAuth(async (_req, user) => {
    const supabase = getSupabaseAdmin()
    const [testRes, qRes, enrollRes] = await Promise.all([
      supabase.from('tests').select('*').eq('id', params.id).single(),
      supabase.from('questions').select('*').eq('test_id', params.id).order('order'),
      user.role === 'student'
        ? supabase.from('exam_enrollments').select('id').eq('test_id', params.id).eq('student_id', user.uid).limit(1)
        : Promise.resolve({ data: [{ id: 'bypass' }] } as any),
    ])
    if (testRes.error || !testRes.data) return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    if (user.role === 'student') {
      if (testRes.data.status !== 'published' || testRes.data.is_enabled === false) {
        return NextResponse.json({ error: 'This exam is currently unavailable' }, { status: 403 })
      }
      if (!enrollRes.data || enrollRes.data.length === 0) {
        return NextResponse.json({ error: 'Enter a valid exam code to access this exam' }, { status: 403 })
      }
    }
    const t: any = testRes.data
    // Existing exam UI expects camelCase fields (totalMarks/passingMarks).
    const mappedTest = {
      ...t,
      totalMarks: t.total_marks ?? t.totalMarks ?? 0,
      passingMarks: t.passing_marks ?? t.passingMarks ?? 50,
      allowedAttempts: t.allowed_attempts ?? t.allowedAttempts,
      publishedAt: t.published_at ?? t.publishedAt,
    }
    return NextResponse.json({ test: mappedTest, questions: qRes.data || [] })
  })(req)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  return withAuth(async (req, user) => {
    if (user.role !== 'trainer' && user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const body = await req.json()
    const supabase = getSupabaseAdmin()
    const mapped: Record<string, any> = {}
    if (body.status) mapped.status = body.status
    if (body.title) mapped.title = body.title
    if (body.description !== undefined) mapped.description = body.description
    if (body.duration) mapped.duration = body.duration
    if (body.passingMarks) mapped.passing_marks = body.passingMarks
    if (body.allowedAttempts) mapped.allowed_attempts = body.allowedAttempts
    if (body.module !== undefined) mapped.module = body.module
    if (body.courseName !== undefined) mapped.course_name = body.courseName
    if (body.examCode !== undefined) mapped.exam_code = body.examCode
    if (body.isEnabled !== undefined) mapped.is_enabled = Boolean(body.isEnabled)
    if (body.status === 'published') {
      const { data: qs } = await supabase.from('questions').select('marks').eq('test_id', params.id)
      mapped.total_marks = (qs||[]).reduce((s: number, q: any) => s + (q.marks||0), 0)
      mapped.published_at = new Date().toISOString()
    }
    const { error } = await supabase.from('tests').update(mapped).eq('id', params.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  })(req)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  return withAuth(async (_req, user) => {
    if (user.role !== 'trainer' && user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { error } = await getSupabaseAdmin().from('tests').delete().eq('id', params.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  })(req)
}
