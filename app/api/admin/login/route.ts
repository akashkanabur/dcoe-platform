import { NextRequest, NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-client'

const ADMIN_EMAIL = 'aaron.paul@fsid-iisc.in'
const ADMIN_PASSWORD = 'iisc1234'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      console.warn(`[Admin] Blocked login attempt: ${email}`)
      return NextResponse.json({ error: 'Access denied. Invalid admin credentials.' }, { status: 401 })
    }

    const token = await signToken({ uid: 'admin-001', email: ADMIN_EMAIL, name: 'Aaron Paul', role: 'admin' })

    // Log to audit table (non-blocking)
    try {
      const supabase = getSupabaseAdmin()
      await supabase.from('admin_logs').insert({ admin_email: ADMIN_EMAIL, action: 'LOGIN', details: {} })
    } catch {}

    const res = NextResponse.json({ role: 'admin', name: 'Aaron Paul', email: ADMIN_EMAIL })
    res.cookies.set('dcoe-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60*60*24*7, path: '/' })
    return res
  } catch (err) {
    console.error('[Admin Login]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
