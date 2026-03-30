'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ClipboardList, PlusCircle, Users, BarChart3,
  BookOpen, CheckCircle, User, LogOut, Menu, X, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const trainerLinks = [
  { label: 'Overview', href: '/dashboard/trainer', icon: LayoutDashboard },
  { label: 'Create Test', href: '/dashboard/trainer/create', icon: PlusCircle },
  { label: 'Manage Tests', href: '/dashboard/trainer/tests', icon: ClipboardList },
  { label: 'Published Tests', href: '/dashboard/trainer/published', icon: BookOpen },
  { label: 'Student Results', href: '/dashboard/trainer/results', icon: BarChart3 },
  { label: 'Students', href: '/dashboard/trainer/students', icon: Users },
]

const studentLinks = [
  { label: 'My Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
  { label: 'My Results', href: '/dashboard/student/results', icon: CheckCircle },
  { label: 'Profile', href: '/dashboard/student/profile', icon: User },
]

interface Props {
  role: 'trainer' | 'student'
  name: string
  email: string
}

export default function Sidebar({ role, name, email }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = role === 'trainer' ? trainerLinks : studentLinks

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out')
    router.push('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-dcoe-green rounded-xl flex items-center justify-center">
            <span className="text-black font-display font-bold text-sm">D</span>
          </div>
          <div>
            <div className="font-display font-bold text-gray-900 text-sm">D-CoE</div>
            <div className="text-xs text-gray-400">IISc Bengaluru</div>
          </div>
        </Link>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3">
        <span className={cn(
          'badge text-xs font-semibold capitalize',
          role === 'trainer'
            ? 'bg-dcoe-green/10 text-dcoe-green'
            : 'bg-blue-100 text-blue-700'
        )}>
          {role}
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 pb-4 space-y-0.5">
        {links.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                active
                  ? 'bg-dcoe-green text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-gray-100 p-4 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-dcoe-green/10 text-dcoe-green flex items-center justify-center text-xs font-bold shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">{name}</div>
            <div className="text-xs text-gray-400 truncate">{email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed top-0 left-0 h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-dcoe-green rounded-lg flex items-center justify-center">
            <span className="text-black font-display font-bold text-xs">D</span>
          </div>
          <span className="font-display font-bold text-sm text-gray-900">D-CoE</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-600">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 pt-14">
          <div className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full bg-white shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Mobile content offset */}
      <div className="md:hidden h-14" />
    </>
  )
}
