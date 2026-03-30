'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '#about' },
  { label: 'Courses', href: '#courses' },
  { label: 'Contact Us', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState('Home')

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300',
      scrolled ? 'shadow-md' : 'shadow-sm border-b border-gray-100'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex flex-col items-center">
              <span className="font-black text-xl leading-none tracking-tighter text-black">D·CoE</span>
              <span className="text-[8px] font-bold text-gray-500 tracking-widest leading-none mt-0.5">DM IISc</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} onClick={() => setActive(link.label)}
                className={cn('px-4 py-2 text-sm font-medium transition-colors duration-150 rounded-md',
                  active === link.label ? 'text-dcoe-green font-semibold border-b-2 border-dcoe-green rounded-none' : 'text-gray-700 hover:text-dcoe-green')}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Link href="/admin/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 hover:text-gray-900 transition-all duration-150">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </Link>
            <Link href="/auth/login" className="text-sm font-semibold text-gray-800 hover:text-dcoe-green transition-colors px-3 py-2">Login</Link>
            <Link href="/auth/signup" className="text-sm font-bold bg-dcoe-green text-black px-5 py-2 rounded-lg hover:bg-dcoe-green-dark transition-colors">Sign up</Link>
          </div>

          <button className="lg:hidden p-2 text-gray-700" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-0.5">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} onClick={() => { setActive(link.label); setMobileOpen(false) }}
                className={cn('block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  active === link.label ? 'text-dcoe-green bg-green-50 font-semibold' : 'text-gray-700 hover:bg-gray-50')}>
                {link.label}
              </a>
            ))}
            <div className="pt-3 mt-2 border-t border-gray-100 space-y-2">
              <Link href="/admin/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg">
                <ShieldCheck className="w-4 h-4" /> Admin Panel
              </Link>
              <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block text-center py-2.5 text-sm font-semibold text-gray-800">Login</Link>
              <Link href="/auth/signup" onClick={() => setMobileOpen(false)} className="block text-center py-2.5 text-sm font-bold bg-dcoe-green text-black rounded-lg">Sign up</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
