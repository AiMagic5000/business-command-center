# Security Audit Report -- Business Command Center

**Date**: 2026-03-19
**Auditor**: Security Engineer (Automated SOC 2 Compliance Audit)
**Scope**: Full application source code review -- `src/`, `database/`, `.env.local`, `Dockerfile`
**Framework**: SOC 2 Type II (CC6, CC7, CC8) + OWASP Top 10 2021

---

## Executive Summary

The Business Command Center stores highly sensitive data (SSNs, EINs, plaintext credentials for third-party services, PII, financial records) for business entity management. The application has a solid cryptographic foundation (AES-256-GCM, bcrypt-12, HMAC-SHA256 session tokens) but contains **3 Critical**, **5 High**, **5 Medium**, and **4 Low** severity findings that must be addressed before production use in a SOC 2 environment.

The most urgent finding is **plaintext client passwords committed to the SQL seed file in version control**. Even though the `.env.local` is gitignored, the seed data file is tracked and contains real passwords prefixed with `ENCRYPT:` that are visible in plaintext to anyone with repository access.

---

## Findings Summary

| # | Severity | Title | SOC 2 Control |
|---|----------|-------|---------------|
| 1 | CRITICAL | Plaintext passwords in version-controlled seed data | CC6.1 |
| 2 | CRITICAL | Timing attack on HMAC signature comparison | CC6.1 |
| 3 | CRITICAL | Missing `/api/pin/change` route -- dead code path | CC6.1 |
| 4 | HIGH | Static salt in scrypt key derivation | CC6.1 |
| 5 | HIGH | In-memory rate limiter resets on deploy/restart | CC6.1 |
| 6 | HIGH | Duplicate credential reveal endpoints with inconsistent auth | CC6.1 |
| 7 | HIGH | Supabase URL uses unencrypted HTTP over LAN | CC6.7 |
| 8 | HIGH | `NODE_ENV=development` in production Dockerfile | CC6.1 |
| 9 | MEDIUM | No CSRF protection on state-mutating POST endpoints | CC6.1 |
| 10 | MEDIUM | No Content-Security-Policy or security headers | CC6.6 |
| 11 | MEDIUM | `console.error` logs may leak sensitive data to stdout | CC7.2 |
| 12 | MEDIUM | No input validation/size limit on `graph-layout` POST body | CC7.1 |
| 13 | MEDIUM | RLS policies reference `auth.uid()` but app uses service role key | CC6.3 |
| 14 | LOW | Session secret falls back to encryption key | CC6.1 |
| 15 | LOW | Client-side PIN session in sessionStorage is advisory only | CC6.1 |
| 16 | LOW | Audit log INSERT policy is open (`WITH CHECK (TRUE)`) | CC6.3 |
| 17 | LOW | Predictable seed UUIDs | CC6.1 |

---

## Detailed Findings

### FINDING 1 -- CRITICAL: Plaintext Passwords in Version-Controlled Seed Data

**File**: `database/002-seed-data.sql`, lines 86-102
**SOC 2 Control**: CC6.1 (Logical Access Controls)

**Description**: The SQL seed file contains real client passwords in plaintext, prefixed with `ENCRYPT:`. These include passwords for Hostinger email, SSH access, DaVinci Virtual Office, NM Secretary of State, and Dun & Bradstreet accounts. This file is tracked in git and visible to anyone with repository access.

Affected values:
```sql
'ENCRYPT:Derrickpass$999'
'ENCRYPT:Derrickpass$1000'
'ENCRYPT:Thepassword#1'
'ENCRYPT:derrickpss'
```

The application code in `src/app/api/credentials/[id]/reveal/route.ts` (line 54) and `src/app/api/credentials/route.ts` (line 55) strips the `ENCRYPT:` prefix and returns the raw password:

```typescript
if (decryptedPassword.startsWith('ENCRYPT:')) {
  decryptedPassword = decryptedPassword.slice(8)
```

This means any `ENCRYPT:`-prefixed value stored in the database is returned verbatim as plaintext without ever being encrypted.

**Impact**: Full compromise of all client third-party service accounts. Violates SOC 2 CC6.1 requirement for logical access controls over sensitive data.

**Remediation**:
1. Immediately remove all plaintext passwords from `002-seed-data.sql`.
2. Run `git filter-branch` or `git filter-repo` to purge the file from git history.
3. Force-rotate ALL affected passwords at every third-party service.
4. Create a one-time seed API route that accepts passwords via environment variables and encrypts them with the `encrypt()` function before database insertion.
5. Never store plaintext or `ENCRYPT:`-prefixed credentials in SQL files. The `ENCRYPT:` fallback logic in the reveal endpoints should be removed entirely.

---

### FINDING 2 -- CRITICAL: Timing Attack on HMAC Signature Comparison

**File**: `src/lib/pin.ts`, line 121
**SOC 2 Control**: CC6.1 (Logical Access Controls)

**Description**: The PIN session token verification uses a standard JavaScript string equality comparison (`!==`) to compare the provided HMAC signature against the expected signature:

```typescript
if (providedSignature !== expectedSignature) return null
```

String comparison in JavaScript short-circuits on the first differing byte. An attacker can measure response time differences to progressively reconstruct a valid HMAC signature one character at a time, eventually forging a valid PIN session token without knowing the PIN.

**Impact**: An attacker on the same network or with low-latency access could forge session tokens, bypassing PIN authentication entirely and gaining access to all encrypted credentials, SSNs, EINs, and financial data.

**Remediation**: Replace with Node.js `crypto.timingSafeEqual()`:

```typescript
import { timingSafeEqual } from 'crypto'

// In verifyPinSession():
const expectedSig = Buffer.from(sign(encodedPayload, secret), 'utf8')
const providedSig = Buffer.from(providedSignature, 'utf8')

if (expectedSig.length !== providedSig.length) return null
if (!timingSafeEqual(expectedSig, providedSig)) return null
```

---

### FINDING 3 -- CRITICAL: Missing `/api/pin/change` Route -- Dead Code Path

**File**: `src/app/(vault)/settings/page.tsx`, line 32
**SOC 2 Control**: CC6.1 (Logical Access Controls)

**Description**: The Settings page calls `fetch('/api/pin/change', ...)` to allow users to change their PIN. However, no corresponding API route exists at `src/app/api/pin/change/route.ts`. This means:

1. The "Change PIN" feature silently fails (caught by the generic catch block).
2. Users cannot rotate their PIN, violating SOC 2 credential management requirements.
3. If a PIN is compromised, there is no self-service recovery mechanism.

**Impact**: Users cannot change compromised PINs. The feature appears to work in the UI but never actually updates anything.

**Remediation**: Implement the `/api/pin/change` route with:
- Require valid PIN session cookie (already authenticated)
- Verify current PIN against stored hash before accepting new PIN
- Hash new PIN with bcrypt (12 rounds) and update `business_owners.pin_hash`
- Log the change in `audit_log`
- Invalidate the current session and require re-authentication with the new PIN

---

### FINDING 4 -- HIGH: Static Salt in scrypt Key Derivation

**File**: `src/lib/crypto.ts`, line 16
**SOC 2 Control**: CC6.1 (Logical Access Controls)

**Description**: The encryption key derivation uses a hardcoded static salt:

```typescript
const SALT = 'bcc-field-encryption-v1'
```

While the comment says "key uniqueness comes from the env secret," a static salt means that if two deployments use the same `BCC_ENCRYPTION_KEY`, they produce identical derived keys. More importantly, a static salt makes precomputation attacks feasible if the encryption key is weak or leaked.

**Impact**: Reduced resistance to precomputation attacks on the encryption key. If the key is ever exposed, the static salt provides no additional protection.

**Remediation**: Generate a random 16+ byte salt on first deployment and store it alongside the encrypted data, or in a separate environment variable. Each deployment should have a unique salt:

```typescript
// Generate once and store in env:
// BCC_ENCRYPTION_SALT=<random 32 hex chars>
const SALT = process.env.BCC_ENCRYPTION_SALT || 'bcc-field-encryption-v1'
```

---

### FINDING 5 -- HIGH: In-Memory Rate Limiter Resets on Deploy/Restart

**File**: `src/app/api/pin/verify/route.ts`, line 8
**SOC 2 Control**: CC6.1 (Logical Access Controls)

**Description**: The PIN verification rate limiter uses an in-memory `Map`:

```typescript
const attemptTracker = new Map<string, { count: number; lockedUntil: number }>()
```

This tracker is lost on every server restart, deployment, or serverless cold start. An attacker can bypass the 3-attempt lockout by simply waiting for the next deployment, or by sending requests to different instances in a multi-replica setup.

Additionally, the lockout is IP-based using `x-forwarded-for`, which can be trivially spoofed by setting a custom header unless the reverse proxy strips and re-sets it.

**Impact**: PIN brute-force protection is ineffective. A 6-digit numeric PIN has only 1,000,000 combinations. Without persistent rate limiting, an attacker can enumerate all PINs in hours.

**Remediation**:
1. Move rate limiting to the database. Use `audit_log` entries with `action = 'pin_failed'` and query recent failures by IP and time window.
2. Alternatively, use Redis or Supabase to persist lockout state.
3. Add `x-forwarded-for` header validation in the reverse proxy (Cloudflare/nginx) and strip client-supplied values.
4. Consider adding exponential backoff (e.g., double lockout duration after each lockout period).

---

### FINDING 6 -- HIGH: Duplicate Credential Reveal Endpoints with Inconsistent Auth

**Files**:
- `src/app/api/credentials/route.ts` (GET)
- `src/app/api/credentials/[id]/reveal/route.ts` (POST)

**SOC 2 Control**: CC6.1 (Logical Access Controls)

**Description**: There are two endpoints that reveal decrypted credentials:

1. **GET `/api/credentials`** (lines 7-82): Requires BOTH Clerk auth (`auth()` + `userId`) AND PIN session cookie. Uses `clerk_id` to look up the owner.

2. **POST `/api/credentials/[id]/reveal`** (lines 6-73): Requires ONLY PIN session cookie. Uses `sessionUserId` from the PIN token to look up the owner. Does NOT check Clerk auth.

This creates an inconsistency where the `[id]/reveal` endpoint can be accessed without Clerk authentication -- only a valid PIN session cookie is needed. Since the PIN session is a simple HMAC token in a cookie, and the PIN is shared across all users (the verify endpoint iterates all owners to find a match), this is a weaker auth gate.

**Impact**: The credential reveal endpoint has a lower authentication bar than other data endpoints. If Clerk is removed (as indicated in the task description), the inconsistency becomes moot, but it signals that the auth model is not uniform.

**Remediation**:
1. Standardize all endpoints on the same authentication mechanism.
2. If migrating away from Clerk, ensure ALL endpoints require a valid PIN session cookie with consistent checks.
3. Add a shared middleware or helper function (`requirePinSession()`) that all API routes call, rather than duplicating the check inline.

---

### FINDING 7 -- HIGH: Supabase URL Uses Unencrypted HTTP Over LAN

**File**: `.env.local`, line 8
**SOC 2 Control**: CC6.7 (Encryption in Transit)

**Description**: The Supabase connection uses plain HTTP:

```
NEXT_PUBLIC_SUPABASE_URL=http://10.28.28.97:8100
```

All database traffic -- including queries containing encrypted credentials, SSNs, EINs, and session tokens -- travels unencrypted between the Next.js application and Supabase on the LAN. Any device on the same network can sniff this traffic.

The `NEXT_PUBLIC_` prefix also exposes this URL to the client-side bundle, revealing the internal network topology.

**Impact**: SOC 2 CC6.7 requires encryption of data in transit. An attacker on the LAN can intercept all database queries, including those carrying service role keys and encrypted PII fields (which are decrypted in the response).

**Remediation**:
1. Configure TLS on the Supabase Kong gateway (port 8100) or put it behind an HTTPS reverse proxy.
2. Use a Cloudflare Tunnel or similar to encrypt the LAN traffic.
3. Remove the `NEXT_PUBLIC_` prefix from `SUPABASE_URL` since API routes run server-side and the client should never connect to Supabase directly.

---

### FINDING 8 -- HIGH: `NODE_ENV=development` in Production Dockerfile

**File**: `Dockerfile`, line 18
**SOC 2 Control**: CC6.1 (Logical Access Controls)

**Description**: The Dockerfile sets `NODE_ENV=development` in the runner stage:

```dockerfile
ENV NODE_ENV=development
```

This causes Next.js to:
- Show detailed error stack traces to users (information disclosure)
- Disable security optimizations
- The PIN session cookie uses `secure: process.env.NODE_ENV === 'production'` (line 87 in `pin/verify/route.ts`), which means the cookie will NOT have the `secure` flag in this configuration, allowing it to be transmitted over HTTP.

**Impact**: Session cookies transmitted without the `secure` flag can be intercepted over HTTP. Detailed error messages may reveal file paths, stack traces, and internal state.

**Remediation**: Change line 18 to:

```dockerfile
ENV NODE_ENV=production
```

---

### FINDING 9 -- MEDIUM: No CSRF Protection on State-Mutating POST Endpoints

**Files**:
- `src/app/api/pin/verify/route.ts` (POST)
- `src/app/api/graph-layout/route.ts` (POST)
- `src/app/api/credentials/[id]/reveal/route.ts` (POST)

**SOC 2 Control**: CC6.1 (Logical Access Controls)

**Description**: State-mutating POST endpoints do not verify a CSRF token. While the PIN session cookie uses `sameSite: 'lax'`, this only blocks cross-site POST requests from forms. An attacker could still trick a user's browser into making a fetch() request from a malicious page if the browser has relaxed same-site policies, or if the request uses a simple content type.

The PIN verify endpoint is especially sensitive since a successful CSRF attack could establish a PIN session in the victim's browser.

**Impact**: Moderate risk of cross-site request forgery on sensitive operations.

**Remediation**:
1. Add a CSRF token to all POST endpoints. Next.js Server Actions include CSRF protection by default -- consider migrating to Server Actions.
2. Alternatively, add a custom `X-CSRF-Token` header check and verify it matches a token stored in the session.
3. Ensure `sameSite: 'strict'` on the PIN session cookie (currently `'lax'`).

---

### FINDING 10 -- MEDIUM: No Content-Security-Policy or Security Headers

**Files**: `next.config.mjs`, `src/middleware.ts`
**SOC 2 Control**: CC6.6 (Security Configuration)

**Description**: The application sets no HTTP security headers:
- No `Content-Security-Policy` (CSP)
- No `X-Frame-Options` (clickjacking protection)
- No `X-Content-Type-Options` (MIME sniffing)
- No `Strict-Transport-Security` (HSTS)
- No `Referrer-Policy`
- No `Permissions-Policy`

A vault application storing sensitive credentials is a high-value target for XSS and clickjacking attacks.

**Impact**: Increased attack surface for XSS, clickjacking, and MIME confusion attacks.

**Remediation**: Add security headers in `next.config.mjs`:

```javascript
const nextConfig = {
  output: 'standalone',
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';" },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      ],
    }]
  },
}
```

---

### FINDING 11 -- MEDIUM: `console.error` Logs May Leak Sensitive Data

**Files**: All API route files (8 occurrences)
**SOC 2 Control**: CC7.2 (System Monitoring)

**Description**: All API route catch blocks log the full error object to stdout:

```typescript
console.error('PIN verify error:', err)
console.error('Credential reveal error:', err)
console.error('Entities fetch error:', err)
// ... etc.
```

If `err` contains query results, decrypted data, or stack traces with environment variables, this information ends up in container logs accessible to anyone with Docker or Coolify access.

**Impact**: Sensitive data (decrypted credentials, PII, stack traces) may be written to logs.

**Remediation**:
1. Replace `console.error` with a structured logger (e.g., pino) that sanitizes sensitive fields.
2. Log only error messages and codes, never full error objects:
   ```typescript
   console.error('PIN verify error:', err instanceof Error ? err.message : 'Unknown error')
   ```
3. Ensure container log access is restricted and logs are rotated.

---

### FINDING 12 -- MEDIUM: No Input Validation/Size Limit on Graph Layout POST

**File**: `src/app/api/graph-layout/route.ts`, line 55
**SOC 2 Control**: CC7.1 (Input Validation)

**Description**: The graph layout save endpoint accepts arbitrary JSON and writes it directly to the database:

```typescript
const { layout_json } = await req.json()
// ... directly upserted into graph_layouts table
```

There is no validation of:
- The size of `layout_json` (could be megabytes of data)
- The structure of the JSON (could contain arbitrary nested objects)
- The data types within the JSON

This also applies to the `req.json()` call on the PIN verify endpoint (though that validates the PIN format afterward).

**Impact**: Denial of service via oversized payloads. Potential for storing malicious JSON that triggers errors on read.

**Remediation**:
1. Add a size limit to the incoming request body.
2. Validate `layout_json` has the expected structure (object with string keys and `{x: number, y: number}` values).
3. Add a maximum payload size in middleware or at the reverse proxy level.

---

### FINDING 13 -- MEDIUM: RLS Policies Reference `auth.uid()` but App Uses Service Role Key

**File**: `database/001-schema.sql`, lines 269-302
**SOC 2 Control**: CC6.3 (Role-Based Access)

**Description**: Row Level Security policies are defined using `auth.uid()` (Supabase Auth context), but the application exclusively uses the service role key via `createServiceClient()`. The service role key bypasses ALL RLS policies entirely.

This means:
1. The RLS policies are never enforced in practice.
2. All data isolation is implemented purely in application code (API route logic).
3. A single bug in any API route could expose all data across all owners.

The policies also have a design flaw: they check `is_admin = TRUE` in the USING clause, which means ANY admin row in the database causes the policy to pass for all requests -- not just requests from that admin.

**Impact**: RLS provides zero actual protection since all queries use the service role key. Data isolation depends entirely on application-level query filters, which are harder to audit and more prone to bugs.

**Remediation**:
1. For the PIN-only auth model (without Supabase Auth), RLS via `auth.uid()` cannot work as designed. Accept that RLS is defense-in-depth only with the service role key.
2. Implement a custom Supabase function `app.current_owner_id()` that reads from a session variable set by the API routes, and rewrite RLS policies to use it.
3. Alternatively, use the anon key with custom JWT claims to enable proper RLS.
4. Fix the admin policy flaw: `is_admin = TRUE` should be scoped to the current user's admin status, not a global check.

---

### FINDING 14 -- LOW: Session Secret Falls Back to Encryption Key

**File**: `src/lib/pin.ts`, lines 44-52
**SOC 2 Control**: CC6.1 (Logical Access Controls)

**Description**: The session signing secret falls back to the encryption key if `BCC_PIN_SESSION_SECRET` is not set:

```typescript
const secret = process.env.BCC_PIN_SESSION_SECRET || process.env.BCC_ENCRYPTION_KEY
```

Using the same key for encryption and signing violates the principle of key separation. If either key is compromised, both the encryption and session signing are compromised simultaneously.

The `.env.local` file does not define `BCC_PIN_SESSION_SECRET`, confirming the fallback is active.

**Impact**: Compromise of the encryption key also compromises session token signing.

**Remediation**: Generate a separate `BCC_PIN_SESSION_SECRET` and add it to `.env.local`:

```
BCC_PIN_SESSION_SECRET=<separate random 64-char hex string>
```

---

### FINDING 15 -- LOW: Client-Side PIN Session in sessionStorage Is Advisory Only

**File**: `src/lib/pinSession.ts`
**SOC 2 Control**: CC6.1 (Logical Access Controls)

**Description**: The client-side `pinSession.ts` stores a simple `{verified: true, expiresAt: timestamp}` object in `sessionStorage`. This is purely advisory -- it controls whether the PinGuard component shows the PIN entry screen. The actual security enforcement happens server-side via the `bcc-pin-session` cookie.

However, an attacker with browser DevTools access can trivially bypass the client-side check:

```javascript
sessionStorage.setItem('bcc_pin_session', JSON.stringify({verified: true, expiresAt: Date.now() + 99999999}))
```

This would skip the PIN entry screen, though API calls would still fail without a valid server-side cookie.

**Impact**: Low -- the server-side check is the real gate. But if any client-side code trusts `isPinSessionValid()` to make authorization decisions without checking the server, it would be bypassable.

**Remediation**: This is acceptable as long as ALL sensitive data fetching goes through API routes that verify the server-side cookie. Document this explicitly so future developers do not accidentally rely on the client-side check for security decisions.

---

### FINDING 16 -- LOW: Audit Log INSERT Policy Is Fully Open

**File**: `database/001-schema.sql`, line 302
**SOC 2 Control**: CC6.3 (Role-Based Access)

**Description**: The audit log INSERT policy allows anyone to insert:

```sql
CREATE POLICY "audit_insert" ON audit_log FOR INSERT WITH CHECK (TRUE);
```

While this is necessary for the service role key pattern (and is bypassed anyway), if the anon key is ever used directly, any unauthenticated client could spam the audit log with fake entries, polluting the audit trail.

**Impact**: Low risk given service role key usage, but the audit trail integrity could be compromised if the access model changes.

**Remediation**: Restrict the INSERT policy or add a rate limit. Consider making the audit log append-only with no UPDATE/DELETE policies.

---

### FINDING 17 -- LOW: Predictable Seed UUIDs

**File**: `database/002-seed-data.sql`
**SOC 2 Control**: CC6.1 (Logical Access Controls)

**Description**: Seed data uses predictable UUID patterns:

```sql
'00000000-0000-0000-0000-000000000001'  -- Admin
'00000000-0000-0000-0000-000000000002'  -- Client
'10000000-0000-0000-0000-000000000001'  -- Entity 1
```

These are easily guessable and could be used in IDOR attacks if authorization checks are bypassed.

**Impact**: Low, since API routes enforce ownership checks. But defense-in-depth recommends random UUIDs.

**Remediation**: Use `uuid_generate_v4()` in seed data instead of hardcoded UUIDs. Reference related records using subqueries or variables.

---

## SOC 2 Control Compliance Summary

### CC6: Logical and Physical Access Controls

| Requirement | Status | Notes |
|-------------|--------|-------|
| API routes authenticated | PARTIAL | Most routes check Clerk + PIN; `credentials/[id]/reveal` only checks PIN |
| Rate limiting on auth | FAIL | In-memory only, resets on restart |
| Session tokens secured | PARTIAL | httpOnly=yes, secure=conditional on NODE_ENV, sameSite=lax |
| Audit log for sensitive actions | PASS | Credential reveals, PIN attempts, and entity access are logged |
| Credentials encrypted at rest | PARTIAL | AES-256-GCM implemented, but seed data has plaintext passwords |

### CC7: System Operations

| Requirement | Status | Notes |
|-------------|--------|-------|
| Error boundaries | PARTIAL | Generic error responses to clients, but `console.error` may leak to logs |
| Error messages safe | PASS | API responses use generic messages, no stack traces to client |
| Input validation | PARTIAL | PIN format validated; other endpoints lack body size/schema validation |

### CC8: Change Management

| Requirement | Status | Notes |
|-------------|--------|-------|
| Environment variables managed | PARTIAL | `.env.local` is gitignored, but seed SQL exposes secrets |
| Encryption key strength | PASS | 64-char hex key (256-bit entropy) |

---

## Priority Remediation Roadmap

### Immediate (Do Today)

1. **Remove plaintext passwords from `002-seed-data.sql`** and purge from git history (Finding 1)
2. **Force-rotate all affected client passwords** at Hostinger, DaVinci, NM SOS, D&B (Finding 1)
3. **Fix `NODE_ENV=development` in Dockerfile** to `NODE_ENV=production` (Finding 8)

### This Week

4. **Fix timing attack** in HMAC comparison with `timingSafeEqual` (Finding 2)
5. **Implement `/api/pin/change` route** (Finding 3)
6. **Move rate limiter to database** (Finding 5)
7. **Add separate `BCC_PIN_SESSION_SECRET`** (Finding 14)

### Next Sprint

8. **Add security headers** (CSP, HSTS, X-Frame-Options) (Finding 10)
9. **Standardize auth checks** across all endpoints (Finding 6)
10. **Enable HTTPS for Supabase** connection (Finding 7)
11. **Add CSRF protection** to POST endpoints (Finding 9)
12. **Add input validation** on graph-layout POST (Finding 12)
13. **Replace `console.error`** with structured logger (Finding 11)

### Backlog

14. Use random salt for scrypt (Finding 4)
15. Fix RLS policies or document the limitation (Finding 13)
16. Use random UUIDs in seed data (Finding 17)
17. Restrict audit log INSERT policy (Finding 16)

---

## Files Reviewed

| File | Purpose | Findings |
|------|---------|----------|
| `.env.local` | Environment config | #7, #14 |
| `Dockerfile` | Container config | #8 |
| `database/001-schema.sql` | DB schema + RLS | #13, #16 |
| `database/002-seed-data.sql` | Seed data | #1, #17 |
| `src/lib/crypto.ts` | AES-256-GCM encryption | #4 |
| `src/lib/pin.ts` | PIN hashing + session tokens | #2, #14 |
| `src/lib/pinSession.ts` | Client-side session | #15 |
| `src/lib/supabase.ts` | Supabase clients | #7, #13 |
| `src/middleware.ts` | Clerk middleware | #10 |
| `src/app/api/pin/verify/route.ts` | PIN authentication | #5, #9 |
| `src/app/api/pin/check/route.ts` | Session validation | -- |
| `src/app/api/credentials/route.ts` | Credential listing | #1, #6, #11 |
| `src/app/api/credentials/[id]/reveal/route.ts` | Credential decryption | #1, #6, #9, #11 |
| `src/app/api/entities/route.ts` | Entity listing | #11 |
| `src/app/api/owners/route.ts` | Owner listing | #11 |
| `src/app/api/communications/route.ts` | Communication listing | #11 |
| `src/app/api/payments/route.ts` | Payment listing | #11 |
| `src/app/api/graph-layout/route.ts` | Graph layout CRUD | #9, #11, #12 |
| `src/app/(vault)/settings/page.tsx` | Settings UI | #3 |
| `src/components/auth/PinEntry.tsx` | PIN entry UI | -- |
| `src/components/auth/PinGuard.tsx` | Auth gate component | #15 |
| `src/components/ui/CredentialCard.tsx` | Credential display | -- |
| `next.config.mjs` | Next.js config | #10 |

---

*End of audit. All findings require remediation tracking in the project issue tracker with assigned owners and target dates to satisfy SOC 2 CC8.1 (Change Management).*
