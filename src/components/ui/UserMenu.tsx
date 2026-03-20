'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, Settings, Lock } from 'lucide-react'
import Link from 'next/link'
import { clearPinSession } from '@/lib/pinSession'

interface UserMenuProps {
  initials: string
}

export default function UserMenu({ initials }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = () => {
    clearPinSession()
    window.location.reload()
  }

  const handleLockVault = () => {
    clearPinSession()
    window.location.reload()
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-opacity hover:opacity-80"
        style={{ background: 'var(--accent-blue-bg)', color: 'var(--accent-gold)' }}
        aria-label="User menu"
        aria-expanded={open}
      >
        {initials}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 w-48 rounded-xl py-2 z-50 shadow-xl"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
        >
          <button
            onClick={handleLockVault}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: 'var(--text-primary)' }}
          >
            <Lock className="w-4 h-4" style={{ color: 'var(--accent-gold)' }} />
            Lock Vault
          </button>

          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: 'var(--text-primary)' }}
          >
            <Settings className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            Settings
          </Link>

          <div className="my-1" style={{ borderTop: '1px solid var(--border-primary)' }} />

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-sm transition-colors hover:bg-red-500/10"
            style={{ color: '#ef4444' }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
