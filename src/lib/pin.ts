// ============================================================================
// Business Command Center - PIN Hash, Verify & Session Tokens
// ============================================================================
//
// PINs are hashed with bcryptjs (12 rounds).
// PIN sessions are HMAC-SHA256 signed tokens with a 15-minute TTL.
// Server-side only -- never import in client components.
// ============================================================================

import bcrypt from 'bcryptjs'
import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

const BCRYPT_ROUNDS = 12
const SESSION_TTL_MS = 60 * 60 * 1000 // 1 hour (matches client-side sessionStorage)

// ---------------------------------------------------------------------------
// PIN hashing
// ---------------------------------------------------------------------------

/**
 * Hash a plaintext PIN for storage.
 * Returns a bcrypt hash string.
 */
export async function hashPin(pin: string): Promise<string> {
  if (!pin || pin.length < 4) {
    throw new Error('PIN must be at least 4 characters')
  }
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS)
  return bcrypt.hash(pin, salt)
}

/**
 * Verify a plaintext PIN against a stored bcrypt hash.
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  if (!pin || !hash) return false
  return bcrypt.compare(pin, hash)
}

// ---------------------------------------------------------------------------
// PIN session tokens (HMAC-SHA256)
// ---------------------------------------------------------------------------

function getSessionSecret(): string {
  const secret = process.env.BCC_PIN_SESSION_SECRET || process.env.BCC_ENCRYPTION_KEY
  if (!secret || secret.length < 16) {
    throw new Error(
      'BCC_PIN_SESSION_SECRET (or BCC_ENCRYPTION_KEY) environment variable is missing or too short'
    )
  }
  return secret
}

interface PinSessionPayload {
  /** User ID the session belongs to */
  sub: string
  /** Issued-at timestamp (ms since epoch) */
  iat: number
  /** Expiry timestamp (ms since epoch) */
  exp: number
  /** Random nonce to prevent token reuse across sessions */
  nonce: string
}

function encodePayload(payload: PinSessionPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

function decodePayload(encoded: string): PinSessionPayload {
  const json = Buffer.from(encoded, 'base64url').toString('utf8')
  return JSON.parse(json) as PinSessionPayload
}

function sign(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url')
}

/**
 * Create a signed PIN session token for a given user.
 * The token is valid for 15 minutes.
 *
 * Format: base64url(payload).hmac_signature
 */
export function createPinSession(userId: string): string {
  if (!userId) {
    throw new Error('userId is required to create a PIN session')
  }

  const secret = getSessionSecret()
  const now = Date.now()

  const payload: PinSessionPayload = {
    sub: userId,
    iat: now,
    exp: now + SESSION_TTL_MS,
    nonce: randomBytes(16).toString('hex'),
  }

  const encodedPayload = encodePayload(payload)
  const signature = sign(encodedPayload, secret)

  return `${encodedPayload}.${signature}`
}

/**
 * Verify a PIN session token.
 *
 * Returns the user ID if the token is valid and not expired.
 * Returns null if the token is invalid, expired, or tampered with.
 */
export function verifyPinSession(token: string): string | null {
  if (!token || !token.includes('.')) return null

  const secret = getSessionSecret()
  const dotIndex = token.indexOf('.')
  const encodedPayload = token.slice(0, dotIndex)
  const providedSignature = token.slice(dotIndex + 1)

  // Verify signature (timing-safe comparison to prevent timing attacks)
  const expectedSignature = sign(encodedPayload, secret)
  const a = Buffer.from(providedSignature, 'utf8')
  const b = Buffer.from(expectedSignature, 'utf8')
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  // Decode and validate payload
  let payload: PinSessionPayload
  try {
    payload = decodePayload(encodedPayload)
  } catch {
    return null
  }

  // Check required fields
  if (!payload.sub || !payload.exp || !payload.iat || !payload.nonce) return null

  // Check expiry
  if (Date.now() > payload.exp) return null

  // Check that iat is not in the future (clock skew tolerance: 30 seconds)
  if (payload.iat > Date.now() + 30_000) return null

  return payload.sub
}

/**
 * Extract the expiry time from a PIN session token without verifying the signature.
 * Useful for UI display ("session expires in X minutes").
 * Returns null if the token is malformed.
 */
export function getPinSessionExpiry(token: string): Date | null {
  if (!token || !token.includes('.')) return null

  const dotIndex = token.indexOf('.')
  const encodedPayload = token.slice(0, dotIndex)

  try {
    const payload = decodePayload(encodedPayload)
    return new Date(payload.exp)
  } catch {
    return null
  }
}
