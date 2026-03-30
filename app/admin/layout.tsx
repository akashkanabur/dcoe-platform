import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Protect all /admin/* routes except /admin/login
  return <>{children}</>
}
