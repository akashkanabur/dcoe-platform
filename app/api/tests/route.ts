import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import { v4 as uuid } from 'uuid'

export async function GET(req: NextRequest) {
  return withAuth(async (req, user) => {
    const supabase = getSupabaseAdmin()
    let query = supabase.from('tests').select('*').order('created_at', { ascending: false }) as any
    if (user.role !== 'trainer' && user.role !== 'admin') query = query.eq('status', 'published')
    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ tests: data || [] })
  })(req)
}

export async function POST(req: NextRequest) {
  return withAuth(async (req, user) => {
    const body = await req.json()
    const { title, description, duration, passingMarks, allowedAttempts, module, courseName, examCode } = body
    if (!title || !duration) return NextResponse.json({ error: 'Title and duration required' }, { status: 400 })
    const supabase = getSupabaseAdmin()
    const id = uuid()
    const generatedExamCode = String(examCode || `EXAM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`)
    const { data, error } = await supabase.from('tests').insert({
      id, title, description: description || '', duration: Number(duration), total_marks: 0,
      passing_marks: Number(passingMarks) || 50, allowed_attempts: Number(allowedAttempts) || 1,
      module: module || null, course_name: courseName || null, exam_code: generatedExamCode, is_enabled: true,
      status: 'draft', created_by: user.uid, created_at: new Date().toISOString(),
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  })(req)
}
