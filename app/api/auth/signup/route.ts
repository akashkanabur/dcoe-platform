import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import { v4 as uuid } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role = 'student' } = await req.json()
    if (!name || !email || !password) return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    
    // Domain check for trainers
    const TRAINER_DOMAIN = '@fsid-iisc.in'
    if (role === 'trainer' && !email.toLowerCase().endsWith(TRAINER_DOMAIN)) {
      return NextResponse.json({ error: `Trainers must use an email ending in ${TRAINER_DOMAIN}` }, { status: 403 })
    }

    const supabase = getSupabaseAdmin()
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).limit(1)
    if (existing && existing.length > 0) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    const passwordHash = await bcrypt.hash(password, 12)
    const id = uuid()
    const { error } = await supabase.from('users').insert({ 
      id, 
      name, 
      email, 
      role, 
      password_hash: passwordHash, 
      created_at: new Date().toISOString() 
    })
    
    if (error) {
      console.error('[Signup] Database error:', error)
      return NextResponse.json({ error: 'Database error. Please try again later.' }, { status: 500 })
    }

    const token = await signToken({ uid: id, email, name, role })
    const res = NextResponse.json({ role, name })
    res.cookies.set('dcoe-token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax', 
      maxAge: 60*60*24*7, 
      path: '/' 
    })
    return res
  } catch (err: any) {
    console.error('[Signup] error:', err)
    const msg = err.message || 'Server error'
    return NextResponse.json({ error: msg.includes('Supabase configuration') ? msg : 'Server error' }, { status: 500 })
  }
}
