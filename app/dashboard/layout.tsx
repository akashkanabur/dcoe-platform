import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user = null
  try {
    user = await getSessionUser()
  } catch {}
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar role={user!.role as 'trainer' | 'student'} name={user!.name} email={user!.email} />
      <main className="flex-1 md:ml-64 min-h-screen">
        <div className="page-enter p-6 md:p-8">{children}</div>
      </main>
    </div>
  )
}
