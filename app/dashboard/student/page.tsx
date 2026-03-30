'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MODULES } from '@/lib/constants'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Cpu, 
  Lightbulb, 
  Palette, 
  UserCheck, 
  Layers, 
  Settings, 
  Zap, 
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldAlert,
  Search
} from 'lucide-react'
import toast from 'react-hot-toast'

// Icon mapping for modules
const iconMap: Record<string, any> = {
  'Industry 4.0 Technologies': Cpu,
  'Design Thinking and Methodology': Lightbulb,
  'Aesthetics and Semiotics': Palette,
  'Ergonomics and Human Factors': UserCheck,
  'Design Prototyping': Layers,
  'Mechanical Prototyping': Settings,
  'Electronic Prototyping': Zap,
  'Business Development & Entrepreneurship': TrendingUp,
}

export default function StudentDashboard() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [examCode, setExamCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // 1. Check localStorage first for immediate display
    const userJson = localStorage.getItem('dcoe_user')
    if (userJson) {
      try {
        const u = JSON.parse(userJson)
        setUserName(u.name || '')
      } catch {}
    }

    // 2. Fallback/Sync with session from API
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user?.name) {
          setUserName(data.user.name)
          localStorage.setItem('dcoe_user', JSON.stringify({ name: data.user.name, role: data.user.role }))
        }
      })
      .catch(() => {})
  }, [])

  const handleStartExam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedModule || !examCode.trim()) return

    setIsVerifying(true)
    try {
      const res = await fetch('/api/exams/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module: selectedModule, code: examCode.trim() }),
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Invalid code or module')

      toast.success(`Enrolled in ${data.title}`)
      router.push(`/exam/${data.testId}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsVerifying(false)
    }
  }

  const filteredModules = MODULES.filter(m => m.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-10">
      {/* Header Section */}
      <header className="bg-white border-b border-gray-100 py-12 px-6 sm:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-dcoe-green/5 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-dcoe-green/10 text-dcoe-green rounded-full text-[10px] font-black uppercase tracking-wider mb-4 border border-dcoe-green/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dcoe-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-dcoe-green"></span>
              </span>
              Learning Platform
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-none mb-2">
              Welcome back {userName || 'Scholar'}
            </h1>
            <p className="text-gray-400 text-lg font-medium max-w-xl">
              Select a module card below and enter your access code to start an assessment.
            </p>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-dcoe-green transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Filter modules..." 
              className="bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 w-full md:w-80 font-medium focus:ring-2 focus:ring-dcoe-green/50 outline-none transition-all shadow-sm focus:shadow-md"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredModules.map((moduleName, idx) => {
            const Icon = iconMap[moduleName] || BookOpen
            return (
              <motion.div
                key={moduleName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className="group relative bg-white border border-gray-100 rounded-3xl p-8 cursor-pointer shadow-sm hover:shadow-xl hover:border-dcoe-green/30 transition-all duration-300 overflow-hidden"
                onClick={() => {
                  setSelectedModule(moduleName)
                  setExamCode('')
                }}
              >
                {/* Decorative background number */}
                <div className="absolute top-4 right-6 text-9xl font-black text-gray-50 group-hover:text-dcoe-green/5 transition-colors select-none">
                  {idx + 1}
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-12 group-hover:bg-dcoe-green/10 transition-colors duration-500">
                    <Icon className="text-gray-400 group-hover:text-dcoe-green transition-colors duration-500" size={32} />
                  </div>

                  <div className="mt-auto">
                    <h3 className="min-h-[3rem] text-xl font-black text-gray-900 mb-2 leading-tight">
                      {moduleName}
                    </h3>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold uppercase text-gray-500 rounded flex items-center gap-1 group-hover:bg-dcoe-green/10 group-hover:text-dcoe-green transition-all">
                        Module {idx + 1}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
                        <Clock size={10} /> 30-60 mins
                      </span>
                    </div>
                    
                    <button className="inline-flex items-center gap-2 text-sm font-black text-gray-800 group-hover:text-dcoe-green transition-all">
                      START ASSESSMENT <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </main>

      {/* Code Prompt Modal */}
      <AnimatePresence>
        {selectedModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedModule(null)}
            />
            
            <motion.div
              layoutId={`modal-${selectedModule}`}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden p-10 border border-gray-100 text-center"
            >
              <button 
                onClick={() => setSelectedModule(null)}
                className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-all"
              >
                <ArrowRight className="rotate-180" size={20} />
              </button>

              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-dcoe-green/10 text-dcoe-green rounded-3xl flex items-center justify-center mb-8 rotate-3">
                   {/* Dynamically render icon */}
                   {(() => {
                     const Icon = iconMap[selectedModule] || ShieldAlert
                     return <Icon size={40} />
                   })()}
                </div>

                <h2 className="text-2xl font-black text-gray-900 mb-2 leading-none">Access Code Required</h2>
                <p className="text-gray-400 font-medium text-sm mb-10 max-w-[280px]">
                  Enter the unique access code provided for <span className="text-gray-900 font-bold">"{selectedModule}"</span>
                </p>

                <form onSubmit={handleStartExam} className="w-full space-y-4">
                  <div className="relative group">
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="e.g. EXAM-4829" 
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-dcoe-green focus:bg-white rounded-2xl py-5 px-6 text-center text-2xl font-black tracking-widest placeholder:text-gray-300 outline-none transition-all"
                      value={examCode}
                      onChange={e => setExamCode(e.target.value.toUpperCase())}
                      disabled={isVerifying}
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className={`w-full py-5 rounded-2xl text-white font-black text-lg transition-all shadow-lg hover:shadow-xl active:scale-[0.98] ${
                      isVerifying 
                        ? 'bg-gray-200 cursor-not-allowed' 
                        : 'bg-dcoe-black hover:bg-gray-800'
                    }`}
                    disabled={isVerifying || !examCode.trim()}
                  >
                    {isVerifying ? 'Verifying Access...' : 'UNLOCK & START'}
                  </button>
                  
                  <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest pt-4 leading-tight">
                    Each code can only be used once. Please ensure you have a stable connection.
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
