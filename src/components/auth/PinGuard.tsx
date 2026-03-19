'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import PinEntry from './PinEntry'
import { isPinSessionValid, clearPinSession } from '@/lib/pinSession'

interface PinGuardProps {
  children: React.ReactNode
}

export default function PinGuard({ children }: PinGuardProps) {
  const [pinVerified, setPinVerified] = useState<boolean | null>(null)
  const router = useRouter()

  const checkSession = useCallback(async () => {
    const clientValid = isPinSessionValid()
    if (!clientValid) {
      clearPinSession()
      setPinVerified(false)
      return
    }

    try {
      const res = await fetch('/api/pin/check')
      if (res.ok) {
        setPinVerified(true)
      } else {
        clearPinSession()
        setPinVerified(false)
      }
    } catch {
      clearPinSession()
      setPinVerified(false)
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

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
    router.replace('/dashboard')
  }, [router])

  if (pinVerified === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--bg-pin-screen)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent-blue)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!pinVerified) {
    return <PinEntry onSuccess={handlePinSuccess} />
  }

  return <>{children}</>
}
