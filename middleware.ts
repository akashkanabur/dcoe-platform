import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/admin/login',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/admin/login',
  '/dashboard', // handled by the server-side redirect page
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow public paths, static files, and auth API
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/api/admin/login'
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get('dcoe-token')?.value

  // No token → redirect based on where they were trying to go
  if (!token) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  const user = await verifyToken(token)

  // Invalid token
  if (!user) {
    const target = pathname.startsWith('/admin') ? '/admin/login' : '/auth/login'
    const res = NextResponse.redirect(new URL(target, req.url))
    res.cookies.set('dcoe-token', '', { maxAge: 0, path: '/' })
    return res
  }

  // ── Admin route protection ────────────────────────────────
  if (pathname.startsWith('/admin/dashboard') || pathname.startsWith('/api/admin/stats')) {
    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return NextResponse.next()
  }

  // ── Trainer route protection ─────────────────────────────
  if (pathname.startsWith('/dashboard/trainer') && user.role !== 'trainer') {
    return NextResponse.redirect(new URL('/dashboard/student', req.url))
  }

  // ── Student route protection ──────────────────────────────
  if (pathname.startsWith('/dashboard/student') && user.role !== 'student') {
    return NextResponse.redirect(new URL('/dashboard/trainer', req.url))
  }

  // ── Exam only for students ────────────────────────────────
  if (pathname.startsWith('/exam') && user.role === 'trainer') {
    return NextResponse.redirect(new URL('/dashboard/trainer', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard',
    '/admin/:path*',
    '/dashboard/:path*',
    '/exam/:path*',
    '/api/admin/:path*',
    '/api/tests/:path*',
    '/api/questions/:path*',
    '/api/results/:path*',
  ],
}
