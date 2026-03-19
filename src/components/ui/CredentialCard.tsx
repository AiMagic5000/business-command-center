'use client'

import { useState, useEffect, useCallback } from 'react'
import { Eye, EyeOff, Copy, Check, ExternalLink, Key } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { EntityCredential } from '@/types'
import { copyToClipboard } from '@/lib/utils'

interface CredentialCardProps {
  credential: EntityCredential
  onReveal: (id: string) => Promise<string> // returns plaintext password
}

const HIDE_DELAY_MS = 30_000 // 30 seconds

export default function CredentialCard({ credential, onReveal }: CredentialCardProps) {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [plainPassword, setPlainPassword] = useState('')
  const [revealLoading, setRevealLoading] = useState(false)
  const [copiedField, setCopiedField] = useState<'username' | 'password' | null>(null)
  const [hideTimer, setHideTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const hidePassword = useCallback(() => {
    setPasswordVisible(false)
    setPlainPassword('')
  }, [])

  // Auto-hide after 30 seconds
  useEffect(() => {
    if (passwordVisible) {
      const timer = setTimeout(hidePassword, HIDE_DELAY_MS)
      setHideTimer(timer)
      return () => clearTimeout(timer)
    }
  }, [passwordVisible, hidePassword])

  const handleReveal = async () => {
    if (passwordVisible) {
      if (hideTimer) clearTimeout(hideTimer)
      hidePassword()
      return
    }
    setRevealLoading(true)
    try {
      const plain = await onReveal(credential.id)
      setPlainPassword(plain)
      setPasswordVisible(true)
    } catch {
      // Silently fail - security measure
    } finally {
      setRevealLoading(false)
    }
  }

  const handleCopy = async (field: 'username' | 'password') => {
    const text = field === 'username' ? credential.username : plainPassword || '••••••••'
    await copyToClipboard(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const categoryColors: Record<EntityCredential['category'], string> = {
    banking: '#10b981',
    government: '#3b82f6',
    registered_agent: '#d4a84b',
    legal: '#a78bfa',
    other: '#94a3b8',
  }

  const categoryColor = categoryColors[credential.category] ?? categoryColors.other

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--credential-bg)', border: '1px solid var(--border-primary)' }}
    >
      {/* Card header */}
      <div
        className="flex items-start gap-3 px-4 py-3"
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${categoryColor}1a` }}
        >
          <Key className="w-4 h-4" style={{ color: categoryColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {credential.service}
          </p>
          <span
            className="inline-block text-xs px-1.5 py-0.5 rounded mt-0.5 capitalize"
            style={{ background: `${categoryColor}1a`, color: categoryColor }}
          >
            {credential.category.replace('_', ' ')}
          </span>
        </div>
        {credential.url && (
          <a
            href={credential.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 p-1 rounded transition-colors hover:bg-white/5"
            aria-label={`Open ${credential.service} website`}
          >
            <ExternalLink className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </a>
        )}
      </div>

      {/* Fields */}
      <div className="px-4 py-3 flex flex-col gap-3">
        {/* Username */}
        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Username
          </label>
          <div className="flex items-center gap-2">
            <p className="flex-1 text-sm font-mono break-all" style={{ color: 'var(--text-primary)' }}>
              {credential.username}
            </p>
            <button
              onClick={() => handleCopy('username')}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
              aria-label="Copy username"
            >
              <AnimatePresence mode="wait">
                {copiedField === 'username' ? (
                  <motion.span key="check" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                    <Check className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
                  </motion.span>
                ) : (
                  <motion.span key="copy" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                    <Copy className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Password
          </label>
          <div className="flex items-center gap-2">
            <p
              className="flex-1 text-sm font-mono break-all"
              style={{ color: passwordVisible ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              {passwordVisible ? plainPassword : '••••••••'}
            </p>
            <div className="flex items-center gap-1">
              {/* Copy password - only when visible */}
              {passwordVisible && (
                <button
                  onClick={() => handleCopy('password')}
                  className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                  aria-label="Copy password"
                >
                  <AnimatePresence mode="wait">
                    {copiedField === 'password' ? (
                      <motion.span key="check" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                        <Check className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
                      </motion.span>
                    ) : (
                      <motion.span key="copy" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                        <Copy className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              )}

              {/* Reveal toggle */}
              <button
                onClick={handleReveal}
                disabled={revealLoading}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10 disabled:opacity-50"
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
              >
                {revealLoading ? (
                  <div
                    className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--accent-blue)', borderTopColor: 'transparent' }}
                  />
                ) : passwordVisible ? (
                  <EyeOff className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
                ) : (
                  <Eye className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                )}
              </button>
            </div>
          </div>

          {/* Auto-hide countdown */}
          {passwordVisible && (
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Hides automatically in 30 seconds
            </p>
          )}
        </div>

        {/* Notes */}
        {credential.notes && (
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {credential.notes}
          </p>
        )}
      </div>
    </motion.div>
  )
}
