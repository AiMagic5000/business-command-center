// ============================================================================
// Business Command Center - Core Type Definitions
// ============================================================================

// ---------------------------------------------------------------------------
// Enums / Union Types
// ---------------------------------------------------------------------------

export type EntityType =
  | 'llc'
  | 'corp'
  | 'trust'
  | 'dba'
  | 'shelf_corp'
  | 'personal'

export type EntityStatus = 'active' | 'pending' | 'dissolved' | 'in_progress'

export type AddressType = 'virtual' | 'ra' | 'mailing' | 'physical'

export type CredentialCategory =
  | 'email'
  | 'hosting'
  | 'government'
  | 'financial'
  | 'registrar'
  | 'other'

export type RelationshipType =
  | 'owns'
  | 'manages'
  | 'trustee_of'
  | 'beneficiary_of'
  | 'provides_service'
  | 'subsidiary_of'
  | 'dba_of'
  | 'grantor_of'

export type PaymentStatus = 'paid' | 'pending' | 'overdue'

export type ComplianceStatus = 'current' | 'upcoming' | 'overdue' | 'completed'

export type NodeType =
  | 'person'
  | 'entity'
  | 'trust'
  | 'service'
  | 'financial'
  | 'website'
  | 'shelf_corp'

export type CommunicationDirection = 'in' | 'out'

// ---------------------------------------------------------------------------
// Core Models
// ---------------------------------------------------------------------------

export interface BusinessOwner {
  id: string
  clerk_id: string
  name: string
  email: string
  phone: string
  home_address: string
  ssn_encrypted?: string
  dob_encrypted?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Entity {
  id: string
  owner_id: string
  type: EntityType
  name: string
  legal_name: string
  jurisdiction: string
  state: string
  county?: string
  ein_encrypted?: string
  formation_date: string
  status: EntityStatus
  industry?: string
  description?: string
  created_at: string
  // Joined / nested data (populated by queries)
  addresses?: EntityAddress[]
  credentials?: EntityCredential[]
  documents?: EntityDocument[]
  contacts?: EntityContact[]
  communications?: Communication[]
  payments?: Payment[]
  compliance?: ComplianceEvent[]
}

export interface EntityAddress {
  id: string
  entity_id: string
  type: AddressType
  provider_name?: string
  street: string
  suite?: string
  city: string
  state: string
  zip: string
  login_url?: string
  username?: string
  password_encrypted?: string
  notes?: string
}

export interface EntityCredential {
  id: string
  entity_id: string
  service_name: string
  service_url: string
  username: string
  password_encrypted: string
  notes?: string
  category: CredentialCategory
}

export interface EntityDocument {
  id: string
  entity_id: string
  name: string
  category: string
  file_path: string
  file_size?: number
  uploaded_at: string
}

export interface EntityContact {
  id: string
  entity_id: string
  name: string
  role: string
  phone?: string
  email?: string
  organization?: string
  notes?: string
}

// ---------------------------------------------------------------------------
// Relationships & Graph
// ---------------------------------------------------------------------------

export interface Relationship {
  id: string
  source_type: string
  source_id: string
  target_type: string
  target_id: string
  relationship_type: RelationshipType
  label?: string
  metadata?: Record<string, unknown>
}

export interface GraphLayout {
  id: string
  owner_id: string
  layout_json: Record<string, { x: number; y: number }>
  updated_at: string
}

/**
 * Data attached to each React Flow graph node.
 *
 * Core fields are always present. Node-type-specific rendering fields are
 * optional so that every node component can destructure only what it needs.
 */
export interface GraphNodeData {
  // Index signature required by @xyflow/react Node<T> generic
  [key: string]: unknown

  // Core (always present)
  id: string
  nodeType: NodeType
  label: string
  sublabel?: string
  status?: EntityStatus
  entityId?: string
  ownerId?: string
  icon?: string
  expandable?: boolean
  expanded?: boolean
  metadata?: Record<string, unknown>

  // Person node rendering fields
  subtitle?: string
  initials?: string
  avatarUrl?: string

  // Entity node rendering fields
  entityType?: 'LLC' | 'Corp' | 'Inc' | 'LP' | 'LLP' | 'PC'
  jurisdiction?: string

  // Trust node rendering fields
  trustType?: string
  grantorName?: string

  // Service node rendering fields
  provider?: string
  serviceIcon?: string

  // Financial node rendering fields
  maskedValue?: string
  accountType?: 'EIN' | 'bank' | 'credit' | 'investment'

  // Website node rendering fields
  domain?: string
  siteStatus?: 'live' | 'down' | 'building'
  url?: string

  // Shelf Corp node rendering fields
  corpAge?: number
  domesticationStatus?: string
  incorporationState?: string

  // Interaction callback (injected by parent graph component)
  onNodeClick?: (id: string, data: GraphNodeData) => void
  selected?: boolean
}

// ---------------------------------------------------------------------------
// Communication, Finance & Compliance
// ---------------------------------------------------------------------------

export interface Communication {
  id: string
  owner_id: string
  entity_id?: string
  direction: CommunicationDirection
  from_addr: string
  to_addr: string
  subject: string
  body_preview: string
  date: string
  folder: string
  source_account: string
  attachments: string[]
}

export interface Payment {
  id: string
  owner_id: string
  entity_id?: string
  invoice_number?: string
  amount: number
  description: string
  service_category: string
  payment_date: string
  payment_method?: string
  status: PaymentStatus
  notes?: string
}

export interface ComplianceEvent {
  id: string
  entity_id: string
  event_type: string
  due_date: string
  status: ComplianceStatus
  recurring: boolean
  frequency?: string
  notes?: string
  cost_estimate?: number
}

// ---------------------------------------------------------------------------
// Audit Trail
// ---------------------------------------------------------------------------

export interface AuditEntry {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id?: string
  details?: Record<string, unknown>
  ip_address?: string
  created_at: string
}

// ---------------------------------------------------------------------------
// API / Form helpers
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

export interface CreateEntityPayload {
  type: EntityType
  name: string
  legal_name: string
  jurisdiction: string
  state: string
  county?: string
  ein?: string
  formation_date: string
  status: EntityStatus
  industry?: string
  description?: string
}

export interface UpdateEntityPayload extends Partial<CreateEntityPayload> {
  id: string
}

// ---------------------------------------------------------------------------
// Graph Visualization - Color Palette
// ---------------------------------------------------------------------------

export const NODE_COLORS: Record<
  NodeType,
  { primary: string; bg: string; border: string; glow: string; text: string }
> = {
  person: {
    primary: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.08)',
    border: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.35)',
    text: '#86efac',
  },
  entity: {
    primary: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.35)',
    text: '#fcd34d',
  },
  trust: {
    primary: '#d4a84b',
    bg: 'rgba(212, 168, 75, 0.08)',
    border: '#d4a84b',
    glow: 'rgba(212, 168, 75, 0.45)',
    text: '#e8c96a',
  },
  service: {
    primary: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.08)',
    border: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.35)',
    text: '#93c5fd',
  },
  financial: {
    primary: '#10b981',
    bg: 'rgba(16, 185, 129, 0.08)',
    border: '#10b981',
    glow: 'rgba(16, 185, 129, 0.35)',
    text: '#6ee7b7',
  },
  website: {
    primary: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.08)',
    border: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.35)',
    text: '#c4b5fd',
  },
  shelf_corp: {
    primary: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.08)',
    border: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.35)',
    text: '#f9a8d4',
  },
}

// ---------------------------------------------------------------------------
// Graph Edge Types
// ---------------------------------------------------------------------------

export type EdgeRelationship = RelationshipType

export interface GraphEdgeData {
  relationship: EdgeRelationship
  label?: string
  animated?: boolean
  strength?: 'strong' | 'medium' | 'weak'
}
