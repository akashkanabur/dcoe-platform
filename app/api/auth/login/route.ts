import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-client'

export async function POST(req: NextRequest) {
  // Helper to redirect back to login with an error message
  const loginError = (msg: string) =>
    NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(msg)}`, req.url), 303)

  try {
    let email: string, password: string, role: string
    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const body = await req.json()
      email = body.email; password = body.password; role = body.role || 'student'
    } else {
      // Native form POST (application/x-www-form-urlencoded)
      const formData = await req.formData()
      email = formData.get('email') as string
      password = formData.get('password') as string
      role = formData.get('role') as string || 'student'
    }

    if (!email || !password) return loginError('Email and password are required')

    // Admin hardcoded
    if (role === 'admin') {
      if (email !== (process.env.ADMIN_EMAIL || 'admin@dcoe-iisc.in') ||
          password !== (process.env.ADMIN_PASSWORD || 'dcoe@Admin2024')) {
        return loginError('Invalid admin credentials')
      }
      const token = await signToken({ uid: 'admin-001', email, name: 'D-CoE Admin', role: 'admin' })
      const res = NextResponse.redirect(new URL('/admin/dashboard', req.url), 303)
      res.cookies.set('dcoe-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60*60*24*7, path: '/' })
      return res
    }

    // Role-based auth via Supabase (Student & Trainer)
    const supabase = getSupabaseAdmin()
    const { data: users } = await supabase.from('users').select('*').eq('email', email).limit(1)

    if (!users || users.length === 0) return loginError('No account found with this email')

    const user = users[0]

    // Domain check for trainers
    const TRAINER_DOMAIN = '@fsid-iisc.in'
    if (role === 'trainer') {
      if (user.role !== 'trainer') return loginError('This account does not have trainer privileges')
      if (!user.email.toLowerCase().endsWith(TRAINER_DOMAIN)) return loginError(`Trainer login requires an @fsid-iisc.in email`)
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return loginError('Incorrect password')

    const token = await signToken({ uid: user.id, email: user.email, name: user.name, role: user.role as 'student' | 'trainer' })

    // 303 redirect → browser follows with GET (cookie already attached)
    const dashboardUrl = user.role === 'trainer' ? '/dashboard/trainer' : '/dashboard/student'
    const res = NextResponse.redirect(new URL(dashboardUrl, req.url), 303)
    res.cookies.set('dcoe-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60*60*24*7,
      path: '/'
    })
    return res
  } catch (err: any) {
    console.error('[Login] error:', err)
    const msg = err.message || 'Server error'
    return loginError(msg.includes('Supabase') ? msg : 'Server error')
  }
}
