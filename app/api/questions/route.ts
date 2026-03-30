import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import { v4 as uuid } from 'uuid'

export async function POST(req: NextRequest) {
  return withAuth(async (req, user) => {
    if (user.role !== 'trainer' && user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { testId, type, text, options, correctAnswer, marks, order } = await req.json()
    if (!testId || !type || !text) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    const supabase = getSupabaseAdmin()
    const id = uuid()
    const { data, error } = await supabase.from('questions').insert({
      id, test_id: testId, type, text, options: options||[], correct_answer: correctAnswer,
      marks: Number(marks)||1, order: Number(order)||0, created_at: new Date().toISOString(),
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const { data: qs } = await supabase.from('questions').select('marks').eq('test_id', testId)
    await supabase.from('tests').update({ total_marks: (qs||[]).reduce((s:number,q:any)=>s+(q.marks||0),0) }).eq('id', testId)
    return NextResponse.json(data, { status: 201 })
  })(req)
}

export async function DELETE(req: NextRequest) {
  return withAuth(async (req, user) => {
    if (user.role !== 'trainer' && user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    const supabase = getSupabaseAdmin()
    const { data: q } = await supabase.from('questions').select('test_id').eq('id', id).single()
    if (!q) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await supabase.from('questions').delete().eq('id', id)
    const { data: qs } = await supabase.from('questions').select('marks').eq('test_id', q.test_id)
    await supabase.from('tests').update({ total_marks: (qs||[]).reduce((s:number,q:any)=>s+(q.marks||0),0) }).eq('id', q.test_id)
    return NextResponse.json({ success: true })
  })(req)
}
