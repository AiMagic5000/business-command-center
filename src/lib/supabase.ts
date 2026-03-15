// ============================================================================
// Business Command Center - Supabase Client Factory
// ============================================================================
//
// Two clients:
//   createClient()        -- anon key, safe for client components & SSR pages
//   createServiceClient() -- service role key, server-side API routes only
// ============================================================================

import { createClient as supabaseCreateClient, SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Environment validation helpers
// ---------------------------------------------------------------------------

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

// ---------------------------------------------------------------------------
// Client-side / SSR client (anon key)
// ---------------------------------------------------------------------------

let _anonClient: SupabaseClient | null = null

/**
 * Returns a Supabase client using the anon (public) key.
 * Safe for use in React Server Components, client components, and middleware.
 * The instance is cached per process to avoid re-creating on every call.
 */
export function createClient(): SupabaseClient {
  if (_anonClient) return _anonClient

  const url = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  _anonClient = supabaseCreateClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return _anonClient
}

// ---------------------------------------------------------------------------
// Server-side client (service role key)
// ---------------------------------------------------------------------------

let _serviceClient: SupabaseClient | null = null

/**
 * Returns a Supabase client using the service role key.
 * Bypasses Row Level Security -- only use in trusted server contexts
 * (API routes, server actions, cron jobs).
 *
 * NEVER import this in client components or expose the service key to the browser.
 */
export function createServiceClient(): SupabaseClient {
  if (_serviceClient) return _serviceClient

  const url = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')

  _serviceClient = supabaseCreateClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return _serviceClient
}

// ---------------------------------------------------------------------------
// Table name constants (avoid typos in queries)
// ---------------------------------------------------------------------------

export const TABLES = {
  OWNERS: 'business_owners',
  ENTITIES: 'entities',
  ADDRESSES: 'entity_addresses',
  CREDENTIALS: 'entity_credentials',
  DOCUMENTS: 'entity_documents',
  CONTACTS: 'entity_contacts',
  RELATIONSHIPS: 'relationships',
  COMMUNICATIONS: 'communications',
  PAYMENTS: 'payments',
  COMPLIANCE: 'compliance_events',
  GRAPH_LAYOUTS: 'graph_layouts',
  AUDIT_LOG: 'audit_log',
} as const

export type TableName = (typeof TABLES)[keyof typeof TABLES]
