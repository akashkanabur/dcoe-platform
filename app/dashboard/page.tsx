import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

/**
 * Server-side redirect page.
 * After login, the browser navigates here.
 * The cookie is already set in the response, so getSessionUser() can read it.
 * This page then redirects to the appropriate dashboard.
 */
export default async function DashboardRedirectPage() {
  let user = null
  try {
    user = await getSessionUser()
  } catch {}

  if (!user) {
    redirect('/auth/login')
  }

  if (user.role === 'trainer') {
    redirect('/dashboard/trainer')
  }

  if (user.role === 'admin') {
    redirect('/admin/dashboard')
  }

  redirect('/dashboard/student')
}
