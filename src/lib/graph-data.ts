// ============================================================================
// Business Command Center - Graph Data Builder
// ============================================================================
//
// Transforms DB entities and relationships into React Flow compatible
// nodes and edges with radial layout positioning.
// ============================================================================

import type { Node, Edge, MarkerType } from '@xyflow/react'
import type {
  BusinessOwner,
  Entity,
  Relationship,
  GraphNodeData,
  NodeType,
  RelationshipType,
} from './types'
import {
  NODE_STYLES,
  ENTITY_NODE_MAP,
  RELATIONSHIP_LABELS,
  RELATIONSHIP_COLORS,
  GRAPH_DEFAULTS,
  ENTITY_TYPE_LABELS,
} from './constants'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GraphData {
  nodes: Node<GraphNodeData>[]
  edges: Edge[]
}

interface PositionedItem {
  id: string
  nodeType: NodeType
}

// ---------------------------------------------------------------------------
// Layout Helpers
// ---------------------------------------------------------------------------

/**
 * Distribute items evenly around a circle at a given radius.
 * Returns a map of id -> { x, y }.
 */
function radialPositions(
  items: ReadonlyArray<PositionedItem>,
  centerX: number,
  centerY: number,
  radius: number
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()
  const count = items.length

  if (count === 0) return positions

  // Single item goes directly above center
  if (count === 1) {
    positions.set(items[0].id, { x: centerX, y: centerY - radius })
    return positions
  }

  const angleStep = (2 * Math.PI) / count
  // Start at -90 degrees (top) so the first node is above center
  const startAngle = -Math.PI / 2

  for (let i = 0; i < count; i++) {
    const angle = startAngle + i * angleStep
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    positions.set(items[i].id, { x: Math.round(x), y: Math.round(y) })
  }

  return positions
}

/**
 * Determine the effective radius based on item count to prevent overlap.
 */
function effectiveRadius(baseRadius: number, itemCount: number): number {
  if (itemCount <= 6) return baseRadius
  // Increase radius so arc length between nodes stays above MIN_NODE_SPACING
  const circumferenceNeeded = itemCount * GRAPH_DEFAULTS.MIN_NODE_SPACING
  const radiusNeeded = circumferenceNeeded / (2 * Math.PI)
  return Math.max(baseRadius, radiusNeeded)
}

// ---------------------------------------------------------------------------
// Node Builders
// ---------------------------------------------------------------------------

function buildOwnerNode(
  owner: BusinessOwner,
  x: number,
  y: number
): Node<GraphNodeData> {
  return {
    id: `owner-${owner.id}`,
    type: 'person',
    position: { x, y },
    data: {
      id: owner.id,
      nodeType: 'person',
      label: owner.name,
      sublabel: 'Business Owner',
      ownerId: owner.id,
      icon: NODE_STYLES.person.icon,
      expandable: false,
      expanded: true,
      metadata: {
        email: owner.email,
        phone: owner.phone,
      },
    },
  }
}

function buildEntityNode(
  entity: Entity,
  x: number,
  y: number
): Node<GraphNodeData> {
  const nodeType = ENTITY_NODE_MAP[entity.type]
  const style = NODE_STYLES[nodeType]

  return {
    id: `entity-${entity.id}`,
    type: nodeType,
    position: { x, y },
    data: {
      id: entity.id,
      nodeType,
      label: entity.name,
      sublabel: ENTITY_TYPE_LABELS[entity.type],
      status: entity.status,
      entityId: entity.id,
      ownerId: entity.owner_id,
      icon: style.icon,
      expandable: true,
      expanded: false,
      metadata: {
        legalName: entity.legal_name,
        state: entity.state,
        jurisdiction: entity.jurisdiction,
        formationDate: entity.formation_date,
        industry: entity.industry,
      },
    },
  }
}

// ---------------------------------------------------------------------------
// Edge Builders
// ---------------------------------------------------------------------------

function buildOwnershipEdge(ownerId: string, entityId: string): Edge {
  return {
    id: `edge-owner-${ownerId}-entity-${entityId}`,
    source: `owner-${ownerId}`,
    target: `entity-${entityId}`,
    type: 'smoothstep',
    animated: true,
    label: 'Owns',
    style: {
      stroke: RELATIONSHIP_COLORS.owns,
      strokeWidth: 2,
    },
    markerEnd: {
      type: 'arrowclosed' as MarkerType,
      color: RELATIONSHIP_COLORS.owns,
      width: 16,
      height: 16,
    },
    labelStyle: {
      fill: '#94a3b8',
      fontSize: 11,
      fontWeight: 500,
    },
    labelBgStyle: {
      fill: '#111827',
      fillOpacity: 0.85,
    },
  }
}

function buildRelationshipEdge(rel: Relationship): Edge {
  const relType = rel.relationship_type as RelationshipType
  const color = RELATIONSHIP_COLORS[relType] || '#64748b'
  const label = rel.label || RELATIONSHIP_LABELS[relType] || rel.relationship_type

  const sourcePrefix = rel.source_type === 'owner' ? 'owner' : 'entity'
  const targetPrefix = rel.target_type === 'owner' ? 'owner' : 'entity'

  return {
    id: `edge-rel-${rel.id}`,
    source: `${sourcePrefix}-${rel.source_id}`,
    target: `${targetPrefix}-${rel.target_id}`,
    type: 'smoothstep',
    animated: relType === 'provides_service',
    label,
    style: {
      stroke: color,
      strokeWidth: 1.5,
      strokeDasharray: relType === 'dba_of' ? '6 3' : undefined,
    },
    markerEnd: {
      type: 'arrowclosed' as MarkerType,
      color,
      width: 14,
      height: 14,
    },
    labelStyle: {
      fill: '#94a3b8',
      fontSize: 10,
      fontWeight: 400,
    },
    labelBgStyle: {
      fill: '#111827',
      fillOpacity: 0.85,
    },
  }
}

// ---------------------------------------------------------------------------
// Main Builder
// ---------------------------------------------------------------------------

/**
 * Transform database records into React Flow graph data.
 *
 * Layout strategy:
 *   - Owner node at the center (0, 0)
 *   - Direct entities in a radial ring (INNER_RADIUS)
 *   - Entities connected via relationships (not direct ownership) on OUTER_RADIUS
 *
 * @param owner       The authenticated business owner
 * @param entities    All entities belonging to the owner
 * @param relationships  All cross-entity relationships
 * @returns Nodes and edges for React Flow
 */
export function buildGraphData(
  owner: BusinessOwner,
  entities: ReadonlyArray<Entity>,
  relationships: ReadonlyArray<Relationship>
): GraphData {
  const nodes: Node<GraphNodeData>[] = []
  const edges: Edge[] = []

  const centerX = 0
  const centerY = 0

  // -----------------------------------------------------------------------
  // 1. Owner node at center
  // -----------------------------------------------------------------------
  nodes.push(buildOwnerNode(owner, centerX, centerY))

  // -----------------------------------------------------------------------
  // 2. Partition entities into rings
  // -----------------------------------------------------------------------
  // Entities that are directly owned by the owner go on the inner ring.
  // Entities that are only connected via relationships (subsidiary, DBA, etc.)
  // go on the outer ring.
  // Find entities that are targets of subsidiary/dba relationships from other entities
  const indirectEntityIds = new Set<string>()
  for (const rel of relationships) {
    if (
      rel.source_type === 'entity' &&
      rel.target_type === 'entity' &&
      (rel.relationship_type === 'subsidiary_of' || rel.relationship_type === 'dba_of')
    ) {
      indirectEntityIds.add(rel.target_id)
    }
  }

  const innerEntities: PositionedItem[] = []
  const outerEntities: PositionedItem[] = []

  for (const entity of entities) {
    const nodeType = ENTITY_NODE_MAP[entity.type]
    const item: PositionedItem = { id: entity.id, nodeType }

    if (indirectEntityIds.has(entity.id)) {
      outerEntities.push(item)
    } else {
      innerEntities.push(item)
    }
  }

  // -----------------------------------------------------------------------
  // 3. Position inner ring
  // -----------------------------------------------------------------------
  const innerRadius = effectiveRadius(GRAPH_DEFAULTS.INNER_RADIUS, innerEntities.length)
  const innerPositions = radialPositions(innerEntities, centerX, centerY, innerRadius)

  for (const entity of entities) {
    const pos = innerPositions.get(entity.id)
    if (pos) {
      nodes.push(buildEntityNode(entity, pos.x, pos.y))
      // Direct ownership edge from owner
      edges.push(buildOwnershipEdge(owner.id, entity.id))
    }
  }

  // -----------------------------------------------------------------------
  // 4. Position outer ring
  // -----------------------------------------------------------------------
  const outerRadius = effectiveRadius(GRAPH_DEFAULTS.OUTER_RADIUS, outerEntities.length)
  const outerPositions = radialPositions(outerEntities, centerX, centerY, outerRadius)

  for (const entity of entities) {
    const pos = outerPositions.get(entity.id)
    if (pos) {
      nodes.push(buildEntityNode(entity, pos.x, pos.y))
      // Outer entities still belong to the owner, add ownership edge
      edges.push(buildOwnershipEdge(owner.id, entity.id))
    }
  }

  // -----------------------------------------------------------------------
  // 5. Relationship edges
  // -----------------------------------------------------------------------
  // Build a set of all node IDs present in the graph for validation
  const nodeIdSet = new Set(nodes.map((n) => n.id))

  for (const rel of relationships) {
    const edge = buildRelationshipEdge(rel)
    // Only add edges where both source and target exist in the graph
    if (nodeIdSet.has(edge.source) && nodeIdSet.has(edge.target)) {
      edges.push(edge)
    }
  }

  return { nodes, edges }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Merge a saved layout (from graph_layouts table) onto existing nodes.
 * Returns a new array -- does not mutate.
 */
export function applyLayout(
  nodes: ReadonlyArray<Node<GraphNodeData>>,
  layout: Record<string, { x: number; y: number }>
): Node<GraphNodeData>[] {
  return nodes.map((node) => {
    const savedPosition = layout[node.id]
    if (!savedPosition) return { ...node }
    return {
      ...node,
      position: { x: savedPosition.x, y: savedPosition.y },
    }
  })
}

/**
 * Extract the current layout from nodes for saving to the database.
 */
export function extractLayout(
  nodes: ReadonlyArray<Node<GraphNodeData>>
): Record<string, { x: number; y: number }> {
  const layout: Record<string, { x: number; y: number }> = {}
  for (const node of nodes) {
    layout[node.id] = { x: node.position.x, y: node.position.y }
  }
  return layout
}

/**
 * Find all nodes connected to a given node ID (1 degree).
 * Useful for highlight-on-hover behavior.
 */
export function getConnectedNodeIds(
  nodeId: string,
  edges: ReadonlyArray<Edge>
): Set<string> {
  const connected = new Set<string>()
  for (const edge of edges) {
    if (edge.source === nodeId) connected.add(edge.target)
    if (edge.target === nodeId) connected.add(edge.source)
  }
  return connected
}
