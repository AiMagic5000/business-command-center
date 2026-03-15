// ============================================================================
// Business Command Center - UI Constants, Colors & Config
// ============================================================================

import type { NodeType, RelationshipType, EntityStatus, ComplianceStatus, PaymentStatus, EntityType } from './types'

// ---------------------------------------------------------------------------
// Theme Palette
// ---------------------------------------------------------------------------

export const THEME = {
  bg: '#0a0e1a',
  surface: '#111827',
  surfaceHover: '#1a2332',
  border: '#1e3a5f',
  borderLight: '#2a4a6f',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  gold: '#d4a84b',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
} as const

// ---------------------------------------------------------------------------
// Graph Node Styling
// ---------------------------------------------------------------------------

export interface NodeStyleConfig {
  color: string
  bgColor: string
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'double'
  borderWidth: number
  icon: string // lucide-react icon name
  label: string
}

export const NODE_STYLES: Record<NodeType, NodeStyleConfig> = {
  person: {
    color: '#22c55e',
    bgColor: '#22c55e15',
    borderStyle: 'solid',
    borderWidth: 2,
    icon: 'User',
    label: 'Person',
  },
  entity: {
    color: '#f59e0b',
    bgColor: '#f59e0b15',
    borderStyle: 'dashed',
    borderWidth: 2,
    icon: 'Building2',
    label: 'Entity / LLC',
  },
  trust: {
    color: '#d4a84b',
    bgColor: '#d4a84b15',
    borderStyle: 'double',
    borderWidth: 3,
    icon: 'Shield',
    label: 'Trust',
  },
  service: {
    color: '#3b82f6',
    bgColor: '#3b82f615',
    borderStyle: 'solid',
    borderWidth: 2,
    icon: 'Wrench',
    label: 'Service',
  },
  financial: {
    color: '#10b981',
    bgColor: '#10b98115',
    borderStyle: 'solid',
    borderWidth: 2,
    icon: 'DollarSign',
    label: 'Financial',
  },
  website: {
    color: '#8b5cf6',
    bgColor: '#8b5cf615',
    borderStyle: 'solid',
    borderWidth: 2,
    icon: 'Globe',
    label: 'Website',
  },
  shelf_corp: {
    color: '#ec4899',
    bgColor: '#ec489915',
    borderStyle: 'dotted',
    borderWidth: 2,
    icon: 'Archive',
    label: 'Shelf Corp',
  },
} as const

// ---------------------------------------------------------------------------
// Entity Type -> Node Type mapping
// ---------------------------------------------------------------------------

export const ENTITY_NODE_MAP: Record<EntityType, NodeType> = {
  llc: 'entity',
  corp: 'entity',
  trust: 'trust',
  dba: 'entity',
  shelf_corp: 'shelf_corp',
  personal: 'person',
} as const

// ---------------------------------------------------------------------------
// Relationship Labels
// ---------------------------------------------------------------------------

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  owns: 'Owns',
  manages: 'Manages',
  trustee_of: 'Trustee Of',
  beneficiary_of: 'Beneficiary Of',
  provides_service: 'Provides Service',
  subsidiary_of: 'Subsidiary Of',
  dba_of: 'DBA Of',
  grantor_of: 'Grantor Of',
} as const

export const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  owns: '#22c55e',
  manages: '#3b82f6',
  trustee_of: '#d4a84b',
  beneficiary_of: '#f59e0b',
  provides_service: '#8b5cf6',
  subsidiary_of: '#06b6d4',
  dba_of: '#ec4899',
  grantor_of: '#d4a84b',
} as const

// ---------------------------------------------------------------------------
// Status Badges
// ---------------------------------------------------------------------------

export interface StatusBadgeConfig {
  color: string
  bgColor: string
  label: string
}

export const ENTITY_STATUS_BADGES: Record<EntityStatus, StatusBadgeConfig> = {
  active: { color: '#10b981', bgColor: '#10b98120', label: 'Active' },
  pending: { color: '#f59e0b', bgColor: '#f59e0b20', label: 'Pending' },
  dissolved: { color: '#ef4444', bgColor: '#ef444420', label: 'Dissolved' },
  in_progress: { color: '#3b82f6', bgColor: '#3b82f620', label: 'In Progress' },
} as const

export const COMPLIANCE_STATUS_BADGES: Record<ComplianceStatus, StatusBadgeConfig> = {
  current: { color: '#10b981', bgColor: '#10b98120', label: 'Current' },
  upcoming: { color: '#3b82f6', bgColor: '#3b82f620', label: 'Upcoming' },
  overdue: { color: '#ef4444', bgColor: '#ef444420', label: 'Overdue' },
  completed: { color: '#64748b', bgColor: '#64748b20', label: 'Completed' },
} as const

export const PAYMENT_STATUS_BADGES: Record<PaymentStatus, StatusBadgeConfig> = {
  paid: { color: '#10b981', bgColor: '#10b98120', label: 'Paid' },
  pending: { color: '#f59e0b', bgColor: '#f59e0b20', label: 'Pending' },
  overdue: { color: '#ef4444', bgColor: '#ef444420', label: 'Overdue' },
} as const

// ---------------------------------------------------------------------------
// Detail Panel Tabs
// ---------------------------------------------------------------------------

export interface DetailTab {
  id: string
  label: string
  icon: string // lucide-react icon name
}

export const ENTITY_DETAIL_TABS: ReadonlyArray<DetailTab> = [
  { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
  { id: 'addresses', label: 'Addresses', icon: 'MapPin' },
  { id: 'credentials', label: 'Credentials', icon: 'KeyRound' },
  { id: 'documents', label: 'Documents', icon: 'FileText' },
  { id: 'contacts', label: 'Contacts', icon: 'Users' },
  { id: 'communications', label: 'Communications', icon: 'Mail' },
  { id: 'payments', label: 'Payments', icon: 'CreditCard' },
  { id: 'compliance', label: 'Compliance', icon: 'ClipboardCheck' },
  { id: 'relationships', label: 'Relationships', icon: 'GitBranch' },
] as const

export const OWNER_DETAIL_TABS: ReadonlyArray<DetailTab> = [
  { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
  { id: 'entities', label: 'Entities', icon: 'Building2' },
  { id: 'communications', label: 'Communications', icon: 'Mail' },
  { id: 'payments', label: 'Payments', icon: 'CreditCard' },
  { id: 'audit', label: 'Audit Log', icon: 'ScrollText' },
] as const

// ---------------------------------------------------------------------------
// Entity Type Display Config
// ---------------------------------------------------------------------------

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  llc: 'LLC',
  corp: 'Corporation',
  trust: 'Trust',
  dba: 'DBA',
  shelf_corp: 'Shelf Corp',
  personal: 'Personal',
} as const

export const ENTITY_TYPE_ICONS: Record<EntityType, string> = {
  llc: 'Building2',
  corp: 'Landmark',
  trust: 'Shield',
  dba: 'Tag',
  shelf_corp: 'Archive',
  personal: 'User',
} as const

// ---------------------------------------------------------------------------
// Graph Layout Defaults
// ---------------------------------------------------------------------------

export const GRAPH_DEFAULTS = {
  /** Distance from center for first ring of entity nodes */
  INNER_RADIUS: 220,
  /** Distance from center for second ring (services, websites, etc.) */
  OUTER_RADIUS: 400,
  /** Minimum spacing between nodes on the same ring */
  MIN_NODE_SPACING: 120,
  /** Default node width for layout calculations */
  NODE_WIDTH: 180,
  /** Default node height for layout calculations */
  NODE_HEIGHT: 80,
  /** Animation duration for edge flow (ms) */
  EDGE_ANIMATION_DURATION: 2000,
  /** Viewport padding for fitView */
  FIT_VIEW_PADDING: 0.15,
} as const

// ---------------------------------------------------------------------------
// Credential Category Display
// ---------------------------------------------------------------------------

export const CREDENTIAL_CATEGORY_LABELS: Record<string, string> = {
  email: 'Email',
  hosting: 'Hosting',
  government: 'Government',
  financial: 'Financial',
  registrar: 'Registrar',
  other: 'Other',
} as const

export const CREDENTIAL_CATEGORY_ICONS: Record<string, string> = {
  email: 'Mail',
  hosting: 'Server',
  government: 'Landmark',
  financial: 'Wallet',
  registrar: 'Globe',
  other: 'Key',
} as const

// ---------------------------------------------------------------------------
// Address Type Display
// ---------------------------------------------------------------------------

export const ADDRESS_TYPE_LABELS: Record<string, string> = {
  virtual: 'Virtual Office',
  ra: 'Registered Agent',
  mailing: 'Mailing Address',
  physical: 'Physical Address',
} as const
