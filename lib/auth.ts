import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production'
)

export interface JWTPayload {
  uid: string
  email: string
  name: string
  role: 'trainer' | 'student' | 'admin'
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function getSessionUser(): Promise<JWTPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('dcoe-token')?.value
  if (!token) return null
  return verifyToken(token)
}

export function withAuth(
  handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>,
  requiredRole?: 'trainer' | 'student' | 'admin'
) {
  return async (req: NextRequest) => {
    const token = req.cookies.get('dcoe-token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await verifyToken(token)
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    if (requiredRole && user.role !== requiredRole) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    try {
      return await handler(req, user)
    } catch (err: any) {
      console.error('[withAuth] Handler error', err)
      const msg = err.message || 'Server error'
      if (msg.includes('Supabase configuration is missing')) {
        return NextResponse.json({ error: msg }, { status: 500 })
      }
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
  }
}
