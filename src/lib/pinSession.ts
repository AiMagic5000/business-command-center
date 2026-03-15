// PIN session management utilities (client-side)

const SESSION_KEY = 'bcc_pin_session'
const SESSION_DURATION_MS = 60 * 60 * 1000 // 1 hour

export interface StoredPinSession {
  verified: boolean
  expiresAt: number
}

export function getPinSession(): StoredPinSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as StoredPinSession
    if (session.expiresAt < Date.now()) {
      clearPinSession()
      return null
    }
    return session
  } catch {
    return null
  }
}

export function setPinSession(): void {
  if (typeof window === 'undefined') return
  const session: StoredPinSession = {
    verified: true,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearPinSession(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(SESSION_KEY)
}

export function isPinSessionValid(): boolean {
  const session = getPinSession()
  return session !== null && session.verified && session.expiresAt > Date.now()
}
