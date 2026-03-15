'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const CLERK_ACCOUNT_PORTAL = 'https://thankful-owl-17.clerk.accounts.dev'

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn) {
      router.replace('/dashboard')
      return
    }
  }, [isLoaded, isSignedIn, router])

  const handleSignIn = () => {
    setRedirecting(true)
    const callbackUrl = encodeURIComponent(window.location.origin + '/dashboard')
    window.location.href = `${CLERK_ACCOUNT_PORTAL}/sign-in?redirect_url=${callbackUrl}`
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#0a0e1a' }}
    >
      {/* Brand header */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)' }}
        >
          <span className="text-lg font-bold" style={{ color: '#d4a84b' }}>
            BCC
          </span>
        </div>
        <h1 className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>
          Business Command Center
        </h1>
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Sign in to manage your entities
        </p>
      </div>

      <button
        onClick={handleSignIn}
        disabled={redirecting}
        className="px-8 py-3 rounded-xl text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)',
          color: '#f1f5f9',
          border: '1px solid #3b82f6',
          boxShadow: '0 0 20px rgba(59,130,246,0.3)',
        }}
      >
        {redirecting ? 'Redirecting...' : 'Sign In'}
      </button>
    </div>
  )
}
