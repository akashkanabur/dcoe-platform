'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lightbulb, Zap, Search, Layers } from 'lucide-react'

const processTags = [
  { label: 'Ideate',      icon: Lightbulb, pos: 'top-[12%] left-[18%]',    dot: 'text-yellow-400', delay: 0.5 },
  { label: 'Select',      icon: Zap,       pos: 'top-[30%] right-[4%]',    dot: 'text-blue-400',   delay: 0.65 },
  { label: 'Identify',    icon: Search,    pos: 'bottom-[28%] left-[8%]',  dot: 'text-blue-500',   delay: 0.8 },
  { label: 'Consolidate', icon: Layers,    pos: 'bottom-[10%] right-[8%]', dot: 'text-yellow-500', delay: 0.95 },
]

export default function Hero() {
  return (
    <section className="relative bg-white min-h-screen pt-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[calc(100vh-4rem)] items-center py-12 lg:py-0">

          {/* LEFT */}
          <div className="flex flex-col justify-center lg:pr-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-1.5 rounded-full mb-6 w-fit">
              <div className="w-2 h-2 bg-dcoe-green rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-green-800">Government of Karnataka Initiative</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="font-black text-5xl sm:text-6xl lg:text-[64px] leading-[1.04] text-black mb-6"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Enhancing<br />
              <span className="relative inline-block">
                <span className="relative z-10">Skills in Product</span>
                <span className="absolute inset-x-0 bottom-1 h-4 bg-dcoe-green/25 -z-0 rounded" />
              </span><br />
              <span className="relative inline-block">
                <span className="relative z-10">Development and</span>
                <span className="absolute inset-x-0 bottom-1 h-4 bg-dcoe-green/25 -z-0 rounded" />
              </span><br />
              Innovation
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-600 text-base leading-relaxed mb-8 max-w-md">
              A premier initiative by IISc dedicated to equipping students and professionals
              with the skills and knowledge to thrive in a rapidly evolving design industry.
            </motion.p>

            {/* Partner logos */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="flex items-center gap-5 mb-10 flex-wrap">
              {[
                { text: 'DM IISc', cls: 'text-green-700 font-black text-sm border border-green-200 px-2 py-0.5 rounded' },
                { text: '⚡', cls: 'text-yellow-500 text-xl' },
                { text: 'IISc', cls: 'text-blue-800 font-bold text-sm border border-blue-200 px-2 py-0.5 rounded' },
                { text: 'K-tech', cls: 'text-green-600 font-bold text-sm' },
                { text: '🏛', cls: 'text-orange-600 text-xl' },
              ].map((p, i) => <span key={i} className={p.cls}>{p.text}</span>)}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-3">
              <a href="#courses" className="inline-flex items-center justify-center gap-2 bg-black text-white font-bold px-8 py-4 rounded-xl text-base hover:bg-gray-800 transition-colors shadow-lg">
                Browse Courses
              </a>
              <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-800 font-bold px-8 py-4 rounded-xl text-base hover:border-dcoe-green hover:text-dcoe-green transition-colors">
                Take Assessment
              </Link>
            </motion.div>
          </div>

          {/* RIGHT — Innovation Cycle SVG */}
          <div className="relative flex items-center justify-center h-[480px] lg:h-[580px]">
            {/* Large green circle background */}
            <div className="absolute w-[340px] h-[340px] lg:w-[420px] lg:h-[420px] bg-dcoe-green/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

            {/* Dot grid */}
            <div className="absolute bottom-6 right-2 w-28 h-28 opacity-15"
              style={{ backgroundImage: 'radial-gradient(circle, #888 1.5px, transparent 1.5px)', backgroundSize: '10px 10px' }} />

            {/* Innovation Cycle SVG */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.3 }} className="relative z-10">
              <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="lg:w-[340px] lg:h-[340px]">
                {/* Outer rotating ring */}
                <motion.circle cx="150" cy="150" r="120" stroke="#2ECC40" strokeWidth="2" strokeDasharray="8 6" fill="none"
                  animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  style={{ transformOrigin: '150px 150px' }} />

                {/* Middle ring */}
                <circle cx="150" cy="150" r="88" stroke="#2ECC40" strokeWidth="1" strokeOpacity="0.3" fill="none" />

                {/* Center hub */}
                <circle cx="150" cy="150" r="52" fill="white" stroke="#2ECC40" strokeWidth="2.5" />
                <circle cx="150" cy="150" r="42" fill="#2ECC40" fillOpacity="0.08" />

                {/* Center D-CoE text */}
                <text x="150" y="145" textAnchor="middle" fontFamily="system-ui" fontWeight="900" fontSize="16" fill="#111">D-CoE</text>
                <text x="150" y="163" textAnchor="middle" fontFamily="system-ui" fontWeight="500" fontSize="9" fill="#666">INNOVATION</text>
                <text x="150" y="174" textAnchor="middle" fontFamily="system-ui" fontWeight="500" fontSize="9" fill="#666">CYCLE</text>

                {/* 4 spokes */}
                {[0, 90, 180, 270].map((angle, i) => {
                  const rad = (angle - 90) * Math.PI / 180
                  const x1 = 150 + 52 * Math.cos(rad), y1 = 150 + 52 * Math.sin(rad)
                  const x2 = 150 + 88 * Math.cos(rad), y2 = 150 + 88 * Math.sin(rad)
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2ECC40" strokeWidth="1.5" strokeOpacity="0.5" />
                })}

                {/* 4 outer nodes */}
                {[
                  { angle: 0,   label: 'Ideate',      icon: '💡', color: '#FCD34D' },
                  { angle: 90,  label: 'Select',       icon: '⚡', color: '#60A5FA' },
                  { angle: 180, label: 'Identify',     icon: '🔍', color: '#34D399' },
                  { angle: 270, label: 'Consolidate',  icon: '📦', color: '#F97316' },
                ].map(({ angle, label, icon, color }) => {
                  const rad = (angle - 90) * Math.PI / 180
                  const cx = 150 + 115 * Math.cos(rad)
                  const cy = 150 + 115 * Math.sin(rad)
                  return (
                    <g key={label}>
                      <circle cx={cx} cy={cy} r="22" fill="white" stroke={color} strokeWidth="2" filter="url(#shadow)" />
                      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="14">{icon}</text>
                      <text x={cx} y={cy + 36} textAnchor="middle" fontFamily="system-ui" fontWeight="700" fontSize="10" fill="#374151">{label}</text>
                    </g>
                  )
                })}

                {/* Animated dots on ring */}
                {[0, 90, 180, 270].map((startAngle, i) => (
                  <motion.circle key={i} r="5" fill="#2ECC40" fillOpacity="0.8"
                    animate={{
                      cx: [
                        150 + 104 * Math.cos((startAngle - 90) * Math.PI / 180),
                        150 + 104 * Math.cos((startAngle + 90 - 90) * Math.PI / 180),
                        150 + 104 * Math.cos((startAngle + 180 - 90) * Math.PI / 180),
                        150 + 104 * Math.cos((startAngle + 270 - 90) * Math.PI / 180),
                        150 + 104 * Math.cos((startAngle + 360 - 90) * Math.PI / 180),
                      ],
                      cy: [
                        150 + 104 * Math.sin((startAngle - 90) * Math.PI / 180),
                        150 + 104 * Math.sin((startAngle + 90 - 90) * Math.PI / 180),
                        150 + 104 * Math.sin((startAngle + 180 - 90) * Math.PI / 180),
                        150 + 104 * Math.sin((startAngle + 270 - 90) * Math.PI / 180),
                        150 + 104 * Math.sin((startAngle + 360 - 90) * Math.PI / 180),
                      ]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear', delay: i * 2 }} />
                ))}

                {/* Arrow arc between nodes */}
                <motion.path
                  d="M 150 35 A 115 115 0 0 1 265 150"
                  stroke="#2ECC40" strokeWidth="2" fill="none" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.8, ease: 'easeInOut' }} />
                <motion.path
                  d="M 265 150 A 115 115 0 0 1 150 265"
                  stroke="#2ECC40" strokeWidth="2" fill="none" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 1.2, ease: 'easeInOut' }} />

                <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
                  </filter>
                </defs>
              </svg>
            </motion.div>

            {/* Floating process tag cards — matching the screenshot style */}
            {processTags.map((tag) => {
              const Icon = tag.icon
              return (
                <motion.div key={tag.label} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: tag.delay, type: 'spring', stiffness: 220, damping: 16 }}
                  className={`absolute ${tag.pos} flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl shadow-lg border border-gray-100 z-20`}>
                  <Icon className={`w-4 h-4 ${tag.dot}`} />
                  <span className="text-sm font-semibold text-gray-800">{tag.label}</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
