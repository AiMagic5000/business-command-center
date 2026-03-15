'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Delete, Loader2, Shield } from 'lucide-react'
import { setPinSession } from '@/lib/pinSession'

interface PinEntryProps {
  onSuccess: () => void
}

const MAX_ATTEMPTS = 3
const LOCKOUT_SECONDS = 300 // 5 minutes
const PIN_LENGTH = 6

export default function PinEntry({ onSuccess }: PinEntryProps) {
  const [pin, setPin] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'locked'>('idle')
  const [shake, setShake] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockoutRemaining, setLockoutRemaining] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  // Lockout countdown ticker
  useEffect(() => {
    if (status !== 'locked') return
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setStatus('idle')
          setAttempts(0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [status])

  const formatLockout = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const triggerShake = useCallback(() => {
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }, [])

  const verifyPin = useCallback(
    async (enteredPin: string) => {
      setStatus('loading')
      try {
        const res = await fetch('/api/pin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: enteredPin }),
        })
        const data = await res.json()

        if (res.ok && data.success) {
          setPinSession()
          onSuccess()
        } else {
          const newAttempts = attempts + 1
          setAttempts(newAttempts)
          setPin('')

          if (newAttempts >= MAX_ATTEMPTS) {
            setStatus('locked')
            setLockoutRemaining(LOCKOUT_SECONDS)
            setErrorMessage('')
          } else {
            setStatus('error')
            setErrorMessage(
              `Wrong PIN. ${MAX_ATTEMPTS - newAttempts} ${
                MAX_ATTEMPTS - newAttempts === 1 ? 'try' : 'tries'
              } left.`
            )
            triggerShake()
            setTimeout(() => setStatus('idle'), 1500)
          }
        }
      } catch {
        setStatus('error')
        setErrorMessage('Something went wrong. Try again.')
        triggerShake()
        setTimeout(() => setStatus('idle'), 1500)
        setPin('')
      }
    },
    [attempts, onSuccess, triggerShake]
  )

  const handleDigit = useCallback(
    (digit: string) => {
      if (status === 'loading' || status === 'locked') return
      if (pin.length >= PIN_LENGTH) return

      const newPin = pin + digit
      setPin(newPin)

      if (newPin.length === PIN_LENGTH) {
        verifyPin(newPin)
      }
    },
    [pin, status, verifyPin]
  )

  const handleBackspace = useCallback(() => {
    if (status === 'loading' || status === 'locked') return
    setPin((prev) => prev.slice(0, -1))
  }, [status])

  // Keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key)
      if (e.key === 'Backspace') handleBackspace()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleDigit, handleBackspace])

  const dialPad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'back'],
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: '#0a0e1a' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col items-center gap-8 w-full max-w-sm px-6"
      >
        {/* Icon + title */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: '#1e293b', border: '1px solid #1e3a5f' }}
          >
            <Shield className="w-7 h-7" style={{ color: '#3b82f6' }} />
          </div>
          <h1 className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>
            Enter Your 6-Digit PIN
          </h1>
          <p className="text-sm text-center" style={{ color: '#94a3b8' }}>
            This PIN keeps your vault locked when you step away.
          </p>
        </div>

        {/* PIN dot indicators */}
        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex gap-4"
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => {
            const filled = i < pin.length
            const isError = status === 'error'
            return (
              <motion.div
                key={i}
                animate={{
                  scale: filled ? 1.1 : 1,
                  backgroundColor: isError
                    ? '#ef4444'
                    : filled
                    ? '#3b82f6'
                    : '#1e293b',
                }}
                transition={{ duration: 0.15 }}
                className="w-4 h-4 rounded-full"
                style={{
                  border: `2px solid ${isError ? '#ef4444' : filled ? '#3b82f6' : '#1e3a5f'}`,
                }}
              />
            )
          })}
        </motion.div>

        {/* Status messages */}
        <AnimatePresence mode="wait">
          {status === 'error' && (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-sm font-medium"
              style={{ color: '#ef4444' }}
            >
              {errorMessage}
            </motion.p>
          )}
          {status === 'locked' && (
            <motion.div
              key="locked"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center gap-1"
            >
              <p className="text-sm font-medium" style={{ color: '#ef4444' }}>
                Too many wrong tries. Locked out.
              </p>
              <p className="text-sm" style={{ color: '#94a3b8' }}>
                Try again in{' '}
                <span className="font-mono font-bold" style={{ color: '#f59e0b' }}>
                  {formatLockout(lockoutRemaining)}
                </span>
              </p>
            </motion.div>
          )}
          {status === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#3b82f6' }} />
              <span className="text-sm" style={{ color: '#94a3b8' }}>
                Checking...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {dialPad.map((row, rowIdx) =>
            row.map((key, colIdx) => {
              if (key === '') {
                return <div key={`${rowIdx}-${colIdx}`} />
              }

              if (key === 'back') {
                return (
                  <motion.button
                    key="back"
                    whileTap={{ scale: 0.92 }}
                    onClick={handleBackspace}
                    disabled={status === 'loading' || status === 'locked'}
                    className="h-16 rounded-2xl flex items-center justify-center transition-opacity disabled:opacity-40"
                    style={{ background: '#1e293b', border: '1px solid #1e3a5f' }}
                    aria-label="Backspace"
                  >
                    <Delete className="w-5 h-5" style={{ color: '#94a3b8' }} />
                  </motion.button>
                )
              }

              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleDigit(key)}
                  disabled={status === 'loading' || status === 'locked'}
                  className="h-16 rounded-2xl text-xl font-semibold transition-colors disabled:opacity-40"
                  style={{
                    background: '#111827',
                    border: '1px solid #1e3a5f',
                    color: '#f1f5f9',
                  }}
                  aria-label={`Digit ${key}`}
                >
                  {key}
                </motion.button>
              )
            })
          )}
        </div>
      </motion.div>
    </div>
  )
}
