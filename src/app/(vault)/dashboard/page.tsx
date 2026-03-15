'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useNodesState, useEdgesState, type Node, type Edge } from '@xyflow/react'
import BusinessGraph from '@/components/graph/BusinessGraph'
import DetailPanel from '@/components/detail-panel/DetailPanel'
import { buildGraphData } from '@/lib/graph-data'
import type { GraphNodeData } from '@/lib/types'
import type {
  Entity as DbEntity,
  BusinessOwner,
  Relationship,
} from '@/lib/types'
import type {
  Entity,
  EntityCredential,
  EntityDocument,
  Communication,
  Payment,
  ComplianceEvent,
} from '@/types'

// ---------------------------------------------------------------------------
// DB -> UI type mappers
// ---------------------------------------------------------------------------

function mapEntity(e: DbEntity): Entity {
  return {
    id: e.id,
    ownerId: e.owner_id,
    name: e.name,
    legalName: e.legal_name,
    type: e.type === 'corp' ? 'corporation' : e.type === 'dba' ? 'llc' : e.type === 'personal' ? 'sole_proprietorship' : e.type,
    jurisdiction: e.jurisdiction,
    state: e.state,
    formationDate: e.formation_date,
    ein: e.ein_encrypted,
    industry: e.industry,
    description: e.description,
    status: e.status,
    addresses: (e.addresses || []).map((a) => ({
      id: a.id,
      label: a.type === 'ra' ? 'Registered Agent' : a.type === 'virtual' ? 'Virtual Office' : a.type === 'mailing' ? 'Mailing' : 'Physical',
      street1: a.street,
      street2: a.suite,
      city: a.city,
      state: a.state,
      zip: a.zip,
      country: 'United States',
    })),
    contacts: (e.contacts || []).map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      email: c.email,
      phone: c.phone,
    })),
    createdAt: e.created_at,
    updatedAt: e.created_at,
  }
}

function mapCredentials(creds: DbEntity['credentials']): EntityCredential[] {
  return (creds || []).map((c) => ({
    id: c.id,
    entityId: c.entity_id,
    service: c.service_name,
    category: c.category === 'email' ? 'other' : c.category === 'hosting' ? 'other' : c.category === 'registrar' ? 'other' : c.category as EntityCredential['category'],
    url: c.service_url,
    username: c.username,
    passwordEncrypted: c.password_encrypted,
    notes: c.notes,
    createdAt: '',
    updatedAt: '',
  }))
}

function mapDocuments(docs: DbEntity['documents']): EntityDocument[] {
  return (docs || []).map((d) => ({
    id: d.id,
    entityId: d.entity_id,
    name: d.name,
    category: d.category as EntityDocument['category'],
    fileType: d.file_path?.endsWith('.pdf') ? 'pdf' as const : 'other' as const,
    fileUrl: d.file_path,
    fileSizeKb: d.file_size ? Math.round(d.file_size / 1024) : 0,
    uploadedAt: d.uploaded_at,
  }))
}

function mapCommunications(comms: DbEntity['communications']): Communication[] {
  return (comms || []).map((c) => ({
    id: c.id,
    entityId: c.entity_id || '',
    direction: c.direction === 'in' ? 'inbound' as const : 'outbound' as const,
    date: c.date,
    subject: c.subject,
    body: c.body_preview || '',
    fromAddress: c.from_addr,
    toAddress: c.to_addr,
    attachmentCount: 0,
  }))
}

function mapPayments(payments: DbEntity['payments']): Payment[] {
  return (payments || []).map((p) => ({
    id: p.id,
    entityId: p.entity_id || '',
    date: p.payment_date,
    amount: Math.round(parseFloat(String(p.amount)) * 100),
    description: p.description,
    status: p.status,
    invoiceNumber: p.invoice_number,
  }))
}

// ---------------------------------------------------------------------------
// Dashboard page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([] as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([] as Edge[])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null)
  const [credentials, setCredentials] = useState<EntityCredential[]>([])
  const [documents, setDocuments] = useState<EntityDocument[]>([])
  const [communications, setCommunications] = useState<Communication[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [complianceEvents, setComplianceEvents] = useState<ComplianceEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const entitiesRef = useRef<DbEntity[]>([])

  // Fetch all data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const [ownersRes, entitiesRes] = await Promise.all([
          fetch('/api/owners'),
          fetch('/api/entities'),
        ])

        if (!ownersRes.ok || !entitiesRes.ok) {
          throw new Error('Failed to load data')
        }

        const ownersJson = await ownersRes.json()
        const entitiesJson = await entitiesRes.json()

        const owners: BusinessOwner[] = ownersJson.data || []
        const entities: DbEntity[] = entitiesJson.data || []
        const relationships: Relationship[] = entitiesJson.relationships || []

        entitiesRef.current = entities

        if (owners.length === 0) {
          setError('No owner profile found')
          return
        }

        const graphData = buildGraphData(owners[0], entities, relationships)
        setNodes(graphData.nodes)
        setEdges(graphData.edges)
      } catch (err) {
        console.error('Dashboard load error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [setNodes, setEdges])

  // Handle node click - populate detail panel
  const handleNodeClick = useCallback(
    (nodeId: string, data: GraphNodeData) => {
      setSelectedNodeId(nodeId)

      // Find the DB entity for this node
      const dbEntity = entitiesRef.current.find((e) => e.id === data.entityId)
      if (!dbEntity) {
        // Clicked on owner node or non-entity node
        setSelectedEntity(null)
        return
      }

      setSelectedEntity(mapEntity(dbEntity))
      setCredentials(mapCredentials(dbEntity.credentials))
      setDocuments(mapDocuments(dbEntity.documents))

      // Fetch communications and payments for this entity
      Promise.all([
        fetch(`/api/communications?entity_id=${dbEntity.id}`).then((r) => r.json()),
        fetch(`/api/payments?entity_id=${dbEntity.id}`).then((r) => r.json()),
      ]).then(([commsJson, paymentsJson]) => {
        setCommunications(mapCommunications(commsJson.data))
        setPayments(mapPayments(paymentsJson.data))
      }).catch(() => {
        setCommunications([])
        setPayments([])
      })

      // Map compliance events
      setComplianceEvents(
        (dbEntity.compliance || []).map((c) => ({
          id: c.id,
          entityId: c.entity_id,
          eventType: c.event_type,
          dueDate: c.due_date,
          status: c.status as ComplianceEvent['status'],
          isRecurring: c.recurring,
          recurringPeriod: c.frequency as ComplianceEvent['recurringPeriod'],
          notes: c.notes,
        }))
      )
    },
    []
  )

  const handleClosePanel = useCallback(() => {
    setSelectedEntity(null)
    setSelectedNodeId(null)
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Loading your business ecosystem...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm mb-2" style={{ color: '#ef4444' }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm px-4 py-2 rounded-lg"
            style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #1e3a5f' }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      <BusinessGraph
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        selectedNodeId={selectedNodeId}
        className="flex-1"
      />

      <DetailPanel
        selectedEntity={selectedEntity}
        credentials={credentials}
        documents={documents}
        communications={communications}
        payments={payments}
        complianceEvents={complianceEvents}
        onClose={handleClosePanel}
      />
    </div>
  )
}
