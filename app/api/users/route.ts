import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-client'

export async function GET(req: NextRequest) {
  return withAuth(async (req, user) => {
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''
    const role = searchParams.get('role') || ''

    const supabase = getSupabaseAdmin()
    let dbQuery = supabase.from('users').select('id, name, email, role, created_at').order('created_at', { ascending: false })

    if (role) {
      dbQuery = dbQuery.eq('role', role)
    }

    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    }

    const { data, error } = await dbQuery

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // If "trainer" is requested or no role is requested, we should also include the hardcoded trainer?
    // Actually, trainers are usually in the DB too, but in this specific project, the trainer is hardcoded in login.
    // However, let's keep it simple and just show DB users for now.
    
    return NextResponse.json(data || [])
  })(req)
}

export async function DELETE(req: NextRequest) {
  return withAuth(async (req, user) => {
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const { error } = await getSupabaseAdmin().from('users').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  })(req)
}
