'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { LogOut, Shield, Key, Bell, User } from 'lucide-react'
import { useState } from 'react'
import { clearPinSession } from '@/lib/pinSession'

export default function SettingsPage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [changingPin, setChangingPin] = useState(false)
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [pinMessage, setPinMessage] = useState('')

  const handleSignOut = async () => {
    clearPinSession()
    await signOut({ redirectUrl: '/sign-in' })
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
      <h1 className="text-2xl font-bold mb-8" style={{ color: '#f1f5f9' }}>
        Settings
      </h1>

      <div className="max-w-2xl space-y-6">
        {/* Account Info */}
        <div
          className="rounded-xl p-6"
          style={{ background: '#111827', border: '1px solid #1e3a5f' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5" style={{ color: '#3b82f6' }} />
            <h2 className="text-lg font-semibold" style={{ color: '#f1f5f9' }}>
              Account
            </h2>
          </div>
          <div className="space-y-2 text-sm" style={{ color: '#94a3b8' }}>
            <p>
              <span style={{ color: '#64748b' }}>Name:</span>{' '}
              {user?.fullName || 'Loading...'}
            </p>
            <p>
              <span style={{ color: '#64748b' }}>Email:</span>{' '}
              {user?.primaryEmailAddress?.emailAddress || 'Loading...'}
            </p>
          </div>
        </div>

        {/* Security */}
        <div
          className="rounded-xl p-6"
          style={{ background: '#111827', border: '1px solid #1e3a5f' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5" style={{ color: '#d4a84b' }} />
            <h2 className="text-lg font-semibold" style={{ color: '#f1f5f9' }}>
              Security
            </h2>
          </div>

          <div className="space-y-4">
            {/* Lock Vault */}
            <button
              onClick={handleLockVault}
              className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-colors hover:bg-white/5"
              style={{ color: '#f1f5f9' }}
            >
              <Key className="w-4 h-4" style={{ color: '#d4a84b' }} />
              <div>
                <p className="text-sm font-medium">Lock Vault</p>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  Requires PIN re-entry to access data
                </p>
              </div>
            </button>

            {/* Change PIN */}
            {!changingPin ? (
              <button
                onClick={() => setChangingPin(true)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-colors hover:bg-white/5"
                style={{ color: '#f1f5f9' }}
              >
                <Shield className="w-4 h-4" style={{ color: '#3b82f6' }} />
                <div>
                  <p className="text-sm font-medium">Change PIN</p>
                  <p className="text-xs" style={{ color: '#64748b' }}>
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
                    background: '#1e293b',
                    border: '1px solid #1e3a5f',
                    color: '#f1f5f9',
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
                    background: '#1e293b',
                    border: '1px solid #1e3a5f',
                    color: '#f1f5f9',
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
                    style={{ background: '#3b82f6', color: '#fff' }}
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
                    style={{ color: '#94a3b8' }}
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
          style={{ background: '#111827', border: '1px solid #1e3a5f' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5" style={{ color: '#10b981' }} />
            <h2 className="text-lg font-semibold" style={{ color: '#f1f5f9' }}>
              Notifications
            </h2>
          </div>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Email alerts for compliance deadlines and payment reminders coming soon.
          </p>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-6 py-4 rounded-xl w-full text-left transition-colors hover:bg-red-500/10"
          style={{ background: '#111827', border: '1px solid #ef4444', color: '#ef4444' }}
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
