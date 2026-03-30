import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { MODULES } from '@/lib/constants'

export async function GET(req: NextRequest) {
  return withAuth(async () => {
    return NextResponse.json({ modules: MODULES })
  })(req)
}
