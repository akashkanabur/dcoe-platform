'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, ClipboardList, BarChart3, TrendingUp, LogOut,
  ShieldCheck, RefreshCw, CheckCircle, XCircle, BookOpen,
  Activity, Calendar, ChevronDown, ChevronUp, Eye
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Stats {
  totalUsers: number
  totalTests: number
  publishedTests: number
  totalAttempts: number
  avgScore: number
  passRate: number
}

interface AdminData {
  stats?: Stats
  recentUsers: any[]
  recentAttempts: any[]
  tests: any[]
  auditLogs: any[]
}

type Tab = 'overview' | 'users' | 'tests' | 'results' | 'logs'

export default function AdminDashboard() {
  const router = useRouter()
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')
  const [loggingOut, setLoggingOut] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats')
      if (res.status === 401 || res.status === 403) {
        router.replace('/admin/login')
        return
      }
      const text = await res.text()
      let json: any = null
      try { json = JSON.parse(text) } catch {}

      if (!res.ok) {
        toast.error(json?.error || 'Failed to load dashboard data')
        setData(null)
        return
      }

      if (!json?.stats) {
        toast.error(json?.error || 'Dashboard stats missing')
        setData(null)
        return
      }

      setData(json)
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out from admin panel')
    router.replace('/')
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This will not remove their past test attempts.')) return
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('User deleted')
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) return
    try {
      const res = await fetch('/api/admin/audit/clear', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to clear logs')
      toast.success('Audit logs cleared')
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const exportToCSV = () => {
    if (!data?.recentUsers) return
    const headers = ['Name', 'Email', 'Role', 'Joined']
    const rows = data.recentUsers.map(u => [u.name, u.email, u.role || 'student', formatDate(u.created_at)])
    const content = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    toast.success('Exported to CSV')
  }

  const filteredUsers = (data?.recentUsers || []).filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === '' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const exportResultsToCSV = () => {
    if (!data?.recentAttempts) return
    const headers = ['Student', 'Score', 'Percentage', 'Status', 'Date']
    const rows = data.recentAttempts.map(a => [
      a.student_name, 
      `${a.score}/${a.total_marks}`, 
      `${a.percentage}%`, 
      a.passed ? 'Pass' : 'Fail', 
      formatDate(a.submitted_at)
    ])
    const content = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `results_export_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    toast.success('Results exported to CSV')
  }

  const filteredAttempts = (data?.recentAttempts || []).filter(a => {
    return a.student_name?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-dcoe-green/20 border-t-dcoe-green rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading admin panel…</p>
        </div>
      </div>
    )
  }

  if (!data?.stats) return null

  const { stats } = data

  const statCards = [
    { label: 'Registered Students', value: stats.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600', change: 'Total accounts' },
    { label: 'Total Tests', value: stats.totalTests, icon: ClipboardList, color: 'bg-purple-50 text-purple-600', change: `${stats.publishedTests} published` },
    { label: 'Test Attempts', value: stats.totalAttempts, icon: BarChart3, color: 'bg-green-50 text-dcoe-green', change: 'Submissions' },
    { label: 'Avg Score', value: `${stats.avgScore}%`, icon: TrendingUp, color: 'bg-amber-50 text-amber-600', change: `${stats.passRate}% pass rate` },
  ]

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'users', label: 'Students', icon: Users },
    { key: 'tests', label: 'Tests', icon: ClipboardList },
    { key: 'results', label: 'Results', icon: BarChart3 },
    { key: 'logs', label: 'Audit Log', icon: ShieldCheck },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top green bar */}
      <div className="h-1 bg-dcoe-green w-full fixed top-0 left-0 right-0 z-50" />

      {/* Sidebar */}
      <aside className="fixed top-1 left-0 h-full w-60 bg-white border-r border-gray-100 z-40 flex flex-col pt-4">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-dcoe-green rounded-xl flex items-center justify-center">
              <span className="font-black text-black text-sm">D</span>
            </div>
            <div>
              <div className="font-black text-gray-900 text-sm leading-tight">D-CoE Admin</div>
              <div className="text-gray-400 text-xs">IISc Bengaluru</div>
            </div>
          </div>
        </div>

        {/* Admin badge */}
        <div className="px-5 py-3">
          <div className="flex items-center gap-2 bg-gray-950 rounded-xl px-3 py-2">
            <ShieldCheck className="w-3.5 h-3.5 text-dcoe-green shrink-0" />
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold truncate">Aaron Paul</div>
              <div className="text-gray-500 text-[10px] truncate">aaron.paul@fsid-iisc.in</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                tab === key
                  ? 'bg-dcoe-green text-black'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          <button
            onClick={fetchData}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {loggingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 pt-5 p-8 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h1 className="font-black text-2xl text-gray-900">Dashboard Overview</h1>
                  <p className="text-gray-400 text-sm mt-1">Platform statistics at a glance</p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                  {statCards.map((s, i) => {
                    const Icon = s.icon
                    return (
                      <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="bg-white rounded-2xl border border-gray-100 p-5"
                      >
                        <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="font-black text-2xl text-gray-900">{s.value}</div>
                        <div className="text-sm font-medium text-gray-700 mt-0.5">{s.label}</div>
                        <div className="text-xs text-gray-400 mt-1">{s.change}</div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Recent activity split */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent students */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-900 mb-4 text-sm">Recent Registrations</h2>
                    {data.recentUsers.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-6">No students yet</p>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {data.recentUsers.slice(0, 5).map((u: any) => (
                          <div key={u.id} className="flex items-center gap-3 py-2.5">
                            <div className="w-7 h-7 bg-dcoe-green/15 text-dcoe-green rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{u.name}</div>
                              <div className="text-xs text-gray-400 truncate">{u.email}</div>
                            </div>
                            <div className="text-xs text-gray-400 shrink-0 ml-auto">{formatDate(u.created_at)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent attempts */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-900 mb-4 text-sm">Recent Submissions</h2>
                    {data.recentAttempts.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-6">No submissions yet</p>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {data.recentAttempts.slice(0, 5).map((a: any) => (
                          <div key={a.id} className="flex items-center justify-between py-2.5 gap-2">
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{a.student_name}</div>
                              <div className="text-xs text-gray-400">{formatDate(a.submitted_at)}</div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`font-bold text-sm ${a.percentage >= 50 ? 'text-dcoe-green' : 'text-red-500'}`}>
                                {a.percentage}%
                              </span>
                              {a.passed
                                ? <CheckCircle className="w-4 h-4 text-dcoe-green" />
                                : <XCircle className="w-4 h-4 text-red-400" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── USERS ── */}
            {tab === 'users' && (
              <div className="space-y-5 max-w-5xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-black text-2xl text-gray-900">User Management</h1>
                    <p className="text-gray-400 text-sm mt-1">{filteredUsers.length} users found</p>
                  </div>
                </div>

                {/* Toolbar as per screenshot */}
                <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search name, email, username..." 
                      className="input py-2 pl-3 pr-8 text-sm w-64"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select 
                    className="input py-2 px-3 text-sm w-44"
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                  >
                    <option value="">All Types (e.g. student)</option>
                    <option value="student">Student</option>
                    <option value="trainer">Trainer</option>
                  </select>
                  <button onClick={() => toast('XLSX Exporting...', { icon: '📊' })} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Export XLSX</button>
                  <button onClick={exportToCSV} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Export CSV</button>
                  <button onClick={fetchData} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Refresh</button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                            <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredUsers.length === 0 ? (
                          <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No users found matching your filters.</td></tr>
                        ) : filteredUsers.map((u: any) => (
                          <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-dcoe-green/10 text-dcoe-green rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                  {u.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-gray-900">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                u.role === 'trainer' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {u.role || 'student'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(u.created_at)}</td>
                            <td className="px-5 py-3.5">
                               <button 
                                 onClick={() => handleDeleteUser(u.id)}
                                 className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                 title="Delete User"
                               >
                                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── TESTS ── */}
            {tab === 'tests' && (
              <div className="space-y-5 max-w-5xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                  <h1 className="font-black text-2xl text-gray-900">All Tests</h1>
                  <p className="text-gray-400 text-sm mt-1">{data.tests.length} total · {stats.publishedTests} published</p>
                  </div>
                  <Link href="/admin/dashboard/exams" className="inline-flex items-center px-3 py-2 rounded-xl text-sm font-semibold bg-dcoe-green text-black hover:opacity-90">
                    Open Exam Manager
                  </Link>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {['Title', 'Total Marks', 'Status', 'Created'].map(h => (
                            <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.tests.length === 0 ? (
                          <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">No tests created yet.</td></tr>
                        ) : data.tests.map((t: any) => (
                          <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-5 py-3.5 font-medium text-gray-900 max-w-[220px] truncate">{t.title}</td>
                            <td className="px-5 py-3.5 text-gray-500">{t.total_marks}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                t.status === 'published' ? 'bg-green-100 text-green-700' :
                                t.status === 'archived' ? 'bg-gray-100 text-gray-500' :
                                'bg-amber-100 text-amber-700'
                              }`}>{t.status}</span>
                            </td>
                            <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(t.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── RESULTS ── */}
            {tab === 'results' && (
              <div className="space-y-5 max-w-5xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-black text-2xl text-gray-900">All Results</h1>
                    <p className="text-gray-400 text-sm mt-1">{filteredAttempts.length} submissions found · {stats.passRate}% pass rate</p>
                  </div>
                </div>

                {/* Results Toolbar */}
                <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search student name..." 
                      className="input py-2 pl-3 pr-8 text-sm w-64"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button onClick={() => toast('XLSX Exporting...', { icon: '📊' })} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Export XLSX</button>
                  <button onClick={exportResultsToCSV} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Export CSV</button>
                  <button onClick={fetchData} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Refresh</button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {['Student', 'Score', 'Percentage', 'Status', 'Date'].map(h => (
                            <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredAttempts.length === 0 ? (
                          <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No submissions found matching your search.</td></tr>
                        ) : filteredAttempts.map((a: any) => (
                          <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-5 py-3.5 font-medium text-gray-900">{a.student_name}</td>
                            <td className="px-5 py-3.5 text-gray-600">{a.score}/{a.total_marks}</td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${a.percentage >= 50 ? 'bg-dcoe-green' : 'bg-red-400'}`}
                                    style={{ width: `${a.percentage}%` }}
                                  />
                                </div>
                                <span className={`font-bold text-sm ${a.percentage >= 50 ? 'text-dcoe-green' : 'text-red-500'}`}>
                                  {a.percentage}%
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${a.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {a.passed ? 'Pass' : 'Fail'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(a.submitted_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── AUDIT LOG ── */}
            {tab === 'logs' && (
              <div className="space-y-5 max-w-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-black text-2xl text-gray-900">Audit Log</h1>
                    <p className="text-gray-400 text-sm mt-1">Admin login history and actions</p>
                  </div>
                  <button 
                    onClick={handleClearLogs}
                    className="px-4 py-2 bg-white border border-red-100 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Clear Audit Logs
                  </button>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  {data.auditLogs.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm">No audit logs yet.</div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {data.auditLogs.map((log: any) => (
                        <div key={log.id} className="flex items-center gap-4 px-5 py-3.5">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">{log.action}</div>
                            <div className="text-xs text-gray-400">{log.admin_email}</div>
                          </div>
                          <div className="text-xs text-gray-400 shrink-0">{formatDate(log.created_at)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
