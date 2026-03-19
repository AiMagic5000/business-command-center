'use client'

import { LogOut, Shield, Key, Bell, User } from 'lucide-react'
import { useState } from 'react'
import { clearPinSession } from '@/lib/pinSession'

export default function SettingsPage() {
  const [changingPin, setChangingPin] = useState(false)
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [pinMessage, setPinMessage] = useState('')

  const handleSignOut = () => {
    clearPinSession()
    window.location.href = '/'
  }

  const handleLockVault = () => {
    clearPinSession()
    window.location.reload()
  }

  const handleChangePin = async () => {
    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setPinMessage('PIN must be exactly 6 digits')
      return
    }
    try {
      const res = await fetch('/api/pin/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin, newPin }),
      })
      const data = await res.json()
      if (data.success) {
        setPinMessage('PIN updated successfully')
        setChangingPin(false)
        setCurrentPin('')
        setNewPin('')
      } else {
        setPinMessage(data.error || 'Failed to update PIN')
      }
    } catch {
      setPinMessage('Failed to update PIN')
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
        Settings
      </h1>

      <div className="max-w-2xl space-y-6">
        {/* Account Info */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Account
            </h2>
          </div>
          <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>
              <span style={{ color: 'var(--text-tertiary)' }}>Access:</span>{' '}
              PIN-protected vault
            </p>
          </div>
        </div>

        {/* Security */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5" style={{ color: 'var(--accent-gold)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Security
            </h2>
          </div>

          <div className="space-y-4">
            {/* Lock Vault */}
            <button
              onClick={handleLockVault}
              className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-primary)' }}
            >
              <Key className="w-4 h-4" style={{ color: 'var(--accent-gold)' }} />
              <div>
                <p className="text-sm font-medium">Lock Vault</p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Requires PIN re-entry to access data
                </p>
              </div>
            </button>

            {/* Change PIN */}
            {!changingPin ? (
              <button
                onClick={() => setChangingPin(true)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-colors hover:bg-white/5"
                style={{ color: 'var(--text-primary)' }}
              >
                <Shield className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
                <div>
                  <p className="text-sm font-medium">Change PIN</p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Update your 6-digit vault access code
                  </p>
                </div>
              </button>
            ) : (
              <div className="px-4 py-3 space-y-3">
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Current PIN"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                />
                <input
                  type="password"
                  maxLength={6}
                  placeholder="New PIN (6 digits)"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                />
                {pinMessage && (
                  <p
                    className="text-xs"
                    style={{
                      color: pinMessage.includes('success') ? '#10b981' : '#ef4444',
                    }}
                  >
                    {pinMessage}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleChangePin}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ background: 'var(--accent-blue)', color: '#fff' }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setChangingPin(false)
                      setCurrentPin('')
                      setNewPin('')
                      setPinMessage('')
                    }}
                    className="px-4 py-2 rounded-lg text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications placeholder */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5" style={{ color: '#10b981' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Notifications
            </h2>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Email alerts for compliance deadlines and payment reminders coming soon.
          </p>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-6 py-4 rounded-xl w-full text-left transition-colors hover:bg-red-500/10"
          style={{ background: 'var(--bg-card)', border: '1px solid #ef4444', color: '#ef4444' }}
        >
          <LogOut className="w-5 h-5" />
          <div>
            <p className="text-sm font-semibold">Sign Out</p>
            <p className="text-xs opacity-70">
              End your session and return to sign-in
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}
