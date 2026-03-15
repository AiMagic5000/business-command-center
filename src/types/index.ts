// Core domain types for Business Command Center

export type EntityType =
  | 'llc'
  | 'trust'
  | 'shelf_corp'
  | 'corporation'
  | 'sole_proprietorship'
  | 'partnership'

export type EntityStatus =
  | 'active'
  | 'pending'
  | 'dissolved'
  | 'in_progress'

export type DocumentCategory =
  | 'formation'
  | 'tax'
  | 'compliance'
  | 'contract'
  | 'banking'
  | 'insurance'
  | 'other'

export type ComplianceStatus =
  | 'current'
  | 'overdue'
  | 'pending'
  | 'in_progress'

export type PaymentStatus =
  | 'paid'
  | 'pending'
  | 'overdue'
  | 'refunded'

export type CommunicationDirection = 'inbound' | 'outbound'

export interface Address {
  id: string
  label: string // "Registered Agent", "Principal Office", etc.
  street1: string
  street2?: string
  city: string
  state: string
  zip: string
  country: string
}

export interface Contact {
  id: string
  name: string
  role: string // "Registered Agent", "Manager", "Member", etc.
  email?: string
  phone?: string
}

export interface EntityCredential {
  id: string
  entityId: string
  service: string // "Bank of America", "IRS", "State of Delaware", etc.
  category: 'banking' | 'government' | 'registered_agent' | 'legal' | 'other'
  url?: string
  username: string
  passwordEncrypted: string // bcrypt hash stored in DB; plaintext shown only after PIN verify
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface EntityDocument {
  id: string
  entityId: string
  name: string
  category: DocumentCategory
  fileType: 'pdf' | 'docx' | 'xlsx' | 'jpg' | 'png' | 'other'
  fileUrl: string
  fileSizeKb: number
  uploadedAt: string
}

export interface Communication {
  id: string
  entityId: string
  direction: CommunicationDirection
  date: string
  subject: string
  body: string
  fromAddress: string
  toAddress: string
  attachmentCount: number
}

export interface Payment {
  id: string
  entityId: string
  date: string
  amount: number // in cents
  description: string
  status: PaymentStatus
  invoiceNumber?: string
}

export interface ComplianceEvent {
  id: string
  entityId: string
  eventType: string // "Annual Report", "BOI Filing", "Tax Return", etc.
  dueDate: string
  status: ComplianceStatus
  isRecurring: boolean
  recurringPeriod?: 'monthly' | 'quarterly' | 'annually'
  estimatedCostCents?: number
  notes?: string
}

export interface Entity {
  id: string
  ownerId: string
  name: string
  legalName: string
  type: EntityType
  jurisdiction: string // "Delaware", "Wyoming", etc.
  state: string // state of operation
  formationDate: string
  ein?: string // masked in UI
  industry?: string
  description?: string
  status: EntityStatus
  addresses: Address[]
  contacts: Contact[]
  createdAt: string
  updatedAt: string
}

export interface EntityRelationship {
  id: string
  sourceEntityId: string
  targetEntityId: string
  relationshipType: string // "owns", "manages", "holds_account_at", etc.
  label?: string
}

export interface Owner {
  id: string
  clerkUserId: string
  name: string
  email: string
  avatarUrl?: string
}

export interface GraphNode {
  id: string
  type: 'entity' | 'owner'
  data: Entity | Owner
  position: { x: number; y: number }
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label?: string
}

// Detail panel tab types
export type DetailTab =
  | 'overview'
  | 'credentials'
  | 'documents'
  | 'communications'
  | 'payments'
  | 'compliance'
  | 'help'

// PIN session
export interface PinSession {
  verified: boolean
  expiresAt: number // Unix ms timestamp
}
