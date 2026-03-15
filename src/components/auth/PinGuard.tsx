'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import PinEntry from './PinEntry'
import { isPinSessionValid, clearPinSession } from '@/lib/pinSession'

interface PinGuardProps {
  children: React.ReactNode
}

export default function PinGuard({ children }: PinGuardProps) {
  const [pinVerified, setPinVerified] = useState<boolean | null>(null) // null = checking
  const router = useRouter()

  const checkSession = useCallback(() => {
    const valid = isPinSessionValid()
    if (!valid) {
      clearPinSession()
      setPinVerified(false)
    } else {
      setPinVerified(true)
    }
  }, [])

  // Initial check on mount
  useEffect(() => {
    checkSession()
  }, [checkSession])

  // Re-check every 60 seconds for session expiry
  useEffect(() => {
    if (!pinVerified) return
    const interval = setInterval(() => {
      const valid = isPinSessionValid()
      if (!valid) {
        clearPinSession()
        setPinVerified(false)
      }
    }, 60_000)
    return () => clearInterval(interval)
  }, [pinVerified])

  // Page visibility check: re-verify when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [checkSession])

  const handlePinSuccess = useCallback(() => {
    setPinVerified(true)
    router.replace('/vault/dashboard')
  }, [router])

  // Still doing initial check - show nothing to avoid flash
  if (pinVerified === null) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: '#0a0e1a' }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  if (!pinVerified) {
    return <PinEntry onSuccess={handlePinSuccess} />
  }

  return <>{children}</>
}
