'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, ShieldAlert } from 'lucide-react'
import { getSupabaseBrowser } from '@/lib/supabase-client'
import toast from 'react-hot-toast'
import { useEffect, Suspense } from 'react'

function LoginForm() {
  const searchParams = useSearchParams()
  const [role, setRole] = useState<'student' | 'trainer'>('student')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const errorMsg = searchParams.get('error')

  // Show error from query param (set by the API on failure)
  useEffect(() => {
    if (errorMsg) toast.error(decodeURIComponent(errorMsg))
  }, [errorMsg])

  async function handleGoogleLogin() {
    setLoading(true)
    const supabase = getSupabaseBrowser()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/api/auth/callback` 
      },
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-dcoe-green rounded-xl flex items-center justify-center">
              <span className="text-black font-black text-sm">D</span>
            </div>
            <div>
              <div className="font-black text-gray-900 text-base">D-CoE Platform</div>
              <div className="text-gray-400 text-xs">IISc Bengaluru</div>
            </div>
          </div>

          <h1 className="font-black text-2xl text-gray-900 mb-1">Sign In</h1>
          <p className="text-gray-500 text-sm mb-7">Welcome back — enter your credentials below.</p>

          {/* Role Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6 p-1 gap-1 bg-gray-50">
            {(['student', 'trainer'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm font-semibold capitalize rounded-lg transition-all ${
                  role === r ? 'bg-dcoe-green text-black shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {role === 'trainer' && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-amber-700 font-medium leading-relaxed">
              <strong>Trainer Login:</strong> Please use your official{' '}
              <code className="mx-1 bg-amber-100 px-1 rounded text-amber-900 font-bold">@fsid-iisc.in</code>
              email to sign in.
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <div className="text-red-500 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-800">Login Failed</h3>
                <p className="text-xs text-red-600 mt-1">{decodeURIComponent(errorMsg)}</p>
              </div>
            </div>
          )}

          {/* Native form POST — cookie is set server-side, then 303 redirect to dashboard */}
          <form
            method="POST"
            action="/api/auth/login"
            className="space-y-4"
            onSubmit={() => setLoading(true)}
          >
            {/* Hidden role field */}
            <input type="hidden" name="role" value={role} />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder=""
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-dcoe-green/30 focus:border-dcoe-green transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder=""
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-dcoe-green/30 focus:border-dcoe-green transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 mt-2 bg-dcoe-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Sign In'}
            </button>
          </form>

          {/* Google — hidden for trainers */}
          {role === 'student' && (
            <>
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <span className="relative bg-white px-3 text-xs font-semibold uppercase text-gray-400">
                  Or continue with
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
            </>
          )}

          {role === 'student' && (
            <p className="text-center text-gray-500 text-sm mt-6">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-dcoe-green font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
