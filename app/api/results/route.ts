import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import { v4 as uuid } from 'uuid'

export async function POST(req: NextRequest) {
  return withAuth(async (req, user) => {
    if (user.role !== 'student') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { testId, answers, startedAt } = await req.json()
    if (!testId || !answers) return NextResponse.json({ error: 'testId and answers required' }, { status: 400 })
    const supabase = getSupabaseAdmin()

    // Enforce exam-code access: only enrolled students can submit.
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('exam_enrollments')
      .select('id')
      .eq('test_id', testId)
      .eq('student_id', user.uid)
      .limit(1)

    if (enrollmentError) return NextResponse.json({ error: enrollmentError.message }, { status: 500 })
    if (!enrollment || enrollment.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired exam access code' }, { status: 403 })
    }

    const { data: existing } = await supabase.from('attempts').select('id').eq('test_id', testId).eq('student_id', user.uid).eq('status', 'submitted').limit(1)
    if (existing && existing.length > 0) return NextResponse.json({ error: 'Test already submitted' }, { status: 409 })
    const [testRes, qRes] = await Promise.all([
      supabase.from('tests').select('*').eq('id', testId).single(),
      supabase.from('questions').select('*').eq('test_id', testId),
    ])
    const test = testRes.data
    if (test && (test.status !== 'published' || test.is_enabled === false)) {
      return NextResponse.json({ error: 'This exam is currently unavailable' }, { status: 403 })
    }
    const questions = qRes.data || []
    const graded = answers.map((ans: any) => {
      const q = questions.find((x: any) => x.id === ans.questionId)
      if (!q) return { ...ans, isCorrect: false, marksObtained: 0 }
      const ca = q.correct_answer
      let isCorrect = false
      if (q.type === 'multi-select') {
        const sa = Array.isArray(ans.answer) ? [...ans.answer].sort() : []
        const ca2 = Array.isArray(ca) ? [...ca].sort() : []
        isCorrect = JSON.stringify(sa) === JSON.stringify(ca2)
      } else if (q.type === 'short-answer' || q.type === 'long-answer') {
        isCorrect = String(ans.answer).trim().toLowerCase() === String(ca).trim().toLowerCase()
      } else { isCorrect = String(ans.answer) === String(ca) }
      return { ...ans, isCorrect, marksObtained: isCorrect ? q.marks : 0 }
    })
    const score = graded.reduce((s: number, a: any) => s + (a.marksObtained||0), 0)
    const totalMarks = test?.total_marks || 0
    const percentage = totalMarks > 0 ? Math.round(score/totalMarks*100) : 0
    const passed = percentage >= (test?.passing_marks || 50)
    const attemptId = uuid()
    const { error } = await supabase.from('attempts').insert({
      id: attemptId, test_id: testId, student_id: user.uid, student_name: user.name,
      started_at: startedAt||new Date().toISOString(), submitted_at: new Date().toISOString(),
      answers: graded, score, total_marks: totalMarks, percentage, passed, status: 'submitted',
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ attemptId, score, totalMarks, percentage, passed, answers: graded })
  })(req)
}

export async function GET(req: NextRequest) {
  return withAuth(async (req, user) => {
    const sp = new URL(req.url).searchParams
    const attemptId = sp.get('attemptId')
    const testId = sp.get('testId')
    const supabase = getSupabaseAdmin()
    if (attemptId) {
      const { data } = await supabase.from('attempts').select('*').eq('id', attemptId).single()
      if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      if (user.role !== 'trainer' && user.role !== 'admin' && data.student_id !== user.uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      return NextResponse.json({ attempt: data })
    }
    let q = supabase.from('attempts').select('*').eq('status', 'submitted').order('submitted_at', { ascending: false }) as any
    if (testId) q = q.eq('test_id', testId)
    if (user.role !== 'trainer' && user.role !== 'admin') q = q.eq('student_id', user.uid)
    const { data } = await q
    return NextResponse.json({ attempts: data || [] })
  })(req)
}
