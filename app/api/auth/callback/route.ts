import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase-client'
import { signToken } from '@/lib/auth'
import { v4 as uuid } from 'uuid'

/**
 * Handle OAuth callback from Supabase.
 * Exchanges code for session, then maps to local users table.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=No+authentication+code+found`)
  }

  try {
    const cookieStore = cookies()
    const supabase = getSupabaseServer(cookieStore)

    // 1. Exchange code for session
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error || !user) {
      console.error('[Auth Callback] Exchange error:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=Authentication+exchange+failed`)
    }

  const admin = getSupabaseAdmin()
  const email = user.email!
  const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0]

  // 2. Sync with local `users` table
  let { data: users, error: selectError } = await admin
    .from('users')
    .select('*')
    .eq('email', email)
    .limit(1)

  if (selectError) {
    console.error('[Auth Callback] Select error:', selectError)
    return NextResponse.redirect(`${origin}/auth/login?error=Database+lookup+failed`)
  }

  let dbUser = users && users.length > 0 ? users[0] : null

  // 3. Create user if doesn't exist (Auto-signup)
  if (!dbUser) {
    const newUserId = uuid()
    const { data: newUser, error: insertError } = await admin
      .from('users')
      .insert({
        id: newUserId,
        email,
        name,
        role: 'student', // Default role for Google Auth
        password_hash: 'oauth-linked', // Marker for OAuth accounts
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Auth Callback] Insert error:', insertError)
      return NextResponse.redirect(`${origin}/auth/login?error=Account+creation+failed`)
    }
    dbUser = newUser
  }

  // 4. Issue custom JWT
  const token = await signToken({
    uid: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role || 'student',
  })

    // 5. Set cookie and redirect
    const response = NextResponse.redirect(`${origin}/${dbUser.role === 'trainer' ? 'dashboard/trainer' : 'dashboard/student'}`)
    response.cookies.set('dcoe-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (err: any) {
    console.error('[Auth Callback] Unexpected server error:', err)
    const errMessage = err.message || 'Unknown server error'
    return NextResponse.redirect(`${origin}/auth/login?error=Server+Configuration+Error:+${encodeURIComponent(errMessage)}`)
  }
}
