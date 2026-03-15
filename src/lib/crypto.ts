// ============================================================================
// Business Command Center - AES-256-GCM Field Encryption
// ============================================================================
//
// Format: iv_hex:authTag_hex:ciphertext_hex
// Key derivation: scryptSync from BCC_ENCRYPTION_KEY env var
// Server-side only -- never import this in client components.
// ============================================================================

import { randomBytes, scryptSync, createCipheriv, createDecipheriv } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const KEY_LENGTH = 32
const SALT = 'bcc-field-encryption-v1' // static salt -- key uniqueness comes from the env secret

// ---------------------------------------------------------------------------
// Key derivation (cached per process lifetime)
// ---------------------------------------------------------------------------

let _derivedKey: Buffer | null = null

function getDerivedKey(): Buffer {
  if (_derivedKey) return _derivedKey

  const secret = process.env.BCC_ENCRYPTION_KEY
  if (!secret || secret.length < 16) {
    throw new Error(
      'BCC_ENCRYPTION_KEY environment variable is missing or too short (minimum 16 characters)'
    )
  }

  _derivedKey = scryptSync(secret, SALT, KEY_LENGTH)
  return _derivedKey
}

// ---------------------------------------------------------------------------
// Low-level encrypt / decrypt
// ---------------------------------------------------------------------------

export function encrypt(plaintext: string): string {
  const key = getDerivedKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decrypt(token: string): string {
  const key = getDerivedKey()
  const parts = token.split(':')

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format -- expected iv:authTag:ciphertext')
  }

  const [ivHex, authTagHex, ciphertextHex] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const ciphertext = Buffer.from(ciphertextHex, 'hex')

  if (iv.length !== IV_LENGTH) {
    throw new Error(`Invalid IV length: expected ${IV_LENGTH}, got ${iv.length}`)
  }
  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error(`Invalid auth tag length: expected ${AUTH_TAG_LENGTH}, got ${authTag.length}`)
  }

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return decrypted.toString('utf8')
}

// ---------------------------------------------------------------------------
// Record-level helpers
// ---------------------------------------------------------------------------

/** Fields that should be encrypted when storing and decrypted when reading. */
const SENSITIVE_FIELDS: readonly string[] = [
  'ssn_encrypted',
  'dob_encrypted',
  'ein_encrypted',
  'password_encrypted',
] as const

/**
 * Encrypt all sensitive fields on a record before writing to the database.
 * Returns a new object -- never mutates the original.
 *
 * Pass the raw (plaintext) values under the `_encrypted` key names.
 * Fields that are undefined or already encrypted (contain `:` separators) are skipped.
 */
export function encryptRecord<T extends Record<string, unknown>>(record: T): T {
  const result = { ...record }

  for (const field of SENSITIVE_FIELDS) {
    const value = result[field]
    if (typeof value !== 'string' || value.length === 0) continue
    // Skip if it looks like it is already encrypted (iv:tag:cipher)
    if (value.split(':').length === 3 && /^[0-9a-f]+$/.test(value.split(':')[0])) continue
    ;(result as Record<string, unknown>)[field] = encrypt(value)
  }

  return result
}

/**
 * Decrypt all sensitive fields on a record after reading from the database.
 * Returns a new object -- never mutates the original.
 *
 * Fields that are undefined or do not look encrypted are left untouched.
 */
export function decryptRecord<T extends Record<string, unknown>>(record: T): T {
  const result = { ...record }

  for (const field of SENSITIVE_FIELDS) {
    const value = result[field]
    if (typeof value !== 'string' || value.length === 0) continue
    // Only attempt decryption on values that match iv:tag:cipher format
    const segments = value.split(':')
    if (segments.length !== 3) continue

    try {
      ;(result as Record<string, unknown>)[field] = decrypt(value)
    } catch {
      // If decryption fails (corrupted data, wrong key), leave the field as-is
      // so the caller can handle the error gracefully.
    }
  }

  return result
}

/**
 * Encrypt a single value if it is non-empty, or return undefined.
 * Useful for form handlers that need to encrypt one field at a time.
 */
export function encryptField(value: string | undefined | null): string | undefined {
  if (!value || value.length === 0) return undefined
  return encrypt(value)
}

/**
 * Decrypt a single value if it looks encrypted, or return as-is.
 */
export function decryptField(value: string | undefined | null): string | undefined {
  if (!value || value.length === 0) return undefined
  const segments = value.split(':')
  if (segments.length !== 3) return value
  try {
    return decrypt(value)
  } catch {
    return value
  }
}
