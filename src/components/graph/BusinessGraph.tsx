'use client'

import { useCallback, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type NodeMouseHandler,
  type OnNodesChange,
  type OnEdgesChange,
  ReactFlowProvider,
  useReactFlow,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import PersonNode    from './nodes/PersonNode'
import EntityNode    from './nodes/EntityNode'
import TrustNode     from './nodes/TrustNode'
import ServiceNode   from './nodes/ServiceNode'
import FinancialNode from './nodes/FinancialNode'
import WebsiteNode   from './nodes/WebsiteNode'
import ShelfCorpNode from './nodes/ShelfCorpNode'
import RelationshipEdge from './edges/RelationshipEdge'

import type { GraphNodeData, NodeType } from '@/lib/types'
import { NODE_COLORS } from '@/lib/types'

// ---- Type registrations -------------------------------------------------------

const NODE_TYPES: NodeTypes = {
  person:     PersonNode,
  entity:     EntityNode,
  trust:      TrustNode,
  service:    ServiceNode,
  financial:  FinancialNode,
  website:    WebsiteNode,
  shelf_corp: ShelfCorpNode,
}

const EDGE_TYPES: EdgeTypes = {
  relationship: RelationshipEdge,
}

// ---- Legend -------------------------------------------------------------------

const LEGEND_ITEMS: { type: NodeType; label: string; borderStyle: string }[] = [
  { type: 'person',     label: 'Person',      borderStyle: 'solid' },
  { type: 'entity',     label: 'Entity / LLC', borderStyle: 'dashed' },
  { type: 'trust',      label: 'Trust',        borderStyle: 'double' },
  { type: 'service',    label: 'Service',      borderStyle: 'solid' },
  { type: 'financial',  label: 'Financial',    borderStyle: 'solid' },
  { type: 'website',    label: 'Website',      borderStyle: 'solid' },
  { type: 'shelf_corp', label: 'Shelf Corp',   borderStyle: 'dotted' },
]

function LegendPanel() {
  return (
    <div
      style={{
        background: 'rgba(17,24,39,0.92)',
        border: '1px solid #1e3a5f',
        borderRadius: 10,
        padding: '12px 14px',
        backdropFilter: 'blur(12px)',
        minWidth: 160,
      }}
    >
      <p
        className="text-[9px] uppercase tracking-widest font-bold mb-2.5"
        style={{ color: '#475569' }}
      >
        Node Types
      </p>
      <div className="flex flex-col gap-1.5">
        {LEGEND_ITEMS.map(({ type, label, borderStyle }) => {
          const c = NODE_COLORS[type]
          return (
            <div key={type} className="flex items-center gap-2">
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: type === 'trust' ? 3 : 3,
                  background: c.bg,
                  border: `1.5px ${borderStyle} ${c.primary}`,
                  flexShrink: 0,
                }}
              />
              <span className="text-[11px]" style={{ color: '#94a3b8' }}>
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Edge legend */}
      <p
        className="text-[9px] uppercase tracking-widest font-bold mt-3 mb-2"
        style={{ color: '#475569' }}
      >
        Relationships
      </p>
      <div className="flex flex-col gap-1.5">
        {[
          { label: 'Owns',        color: '#94a3b8', dash: 'none' },
          { label: 'Trust rel.',  color: '#d4a84b', dash: '6 4' },
          { label: 'Service',     color: '#3b82f6', dash: '2 4' },
          { label: 'DBA',         color: '#f59e0b', dash: '2 4' },
        ].map(({ label, color, dash }) => (
          <div key={label} className="flex items-center gap-2">
            <svg width={24} height={8}>
              <line
                x1={0} y1={4} x2={24} y2={4}
                stroke={color}
                strokeWidth={1.5}
                strokeDasharray={dash === 'none' ? undefined : dash}
              />
            </svg>
            <span className="text-[11px]" style={{ color: '#94a3b8' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- MiniMap node color helper ------------------------------------------------

function miniMapNodeColor(node: Node): string {
  const d = node.data as unknown as GraphNodeData
  return NODE_COLORS[d?.nodeType as NodeType]?.primary ?? '#475569'
}

// ---- Inner graph (needs ReactFlowProvider context) ----------------------------

interface BusinessGraphInnerProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onNodeClick: (nodeId: string, data: GraphNodeData) => void
  selectedNodeId?: string | null
}

function BusinessGraphInner({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  selectedNodeId,
}: BusinessGraphInnerProps) {
  const { fitView } = useReactFlow()
  const didFit = useRef(false)

  // Inject onNodeClick and selected state into each node's data
  const enrichedNodes = useMemo<Node[]>(
    () =>
      nodes.map((n) => ({
        ...n,
        selected: n.id === selectedNodeId,
        data: {
          ...(n.data as object),
          onNodeClick,
          selected: n.id === selectedNodeId,
        },
      })),
    [nodes, selectedNodeId, onNodeClick]
  )

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      const d = node.data as unknown as GraphNodeData
      onNodeClick(node.id, d)
    },
    [onNodeClick]
  )

  // Fit view once on first meaningful render
  const handleInit = useCallback(() => {
    if (!didFit.current) {
      setTimeout(() => fitView({ padding: 0.15, duration: 600 }), 80)
      didFit.current = true
    }
  }, [fitView])

  return (
    <ReactFlow<Node, Edge>
      nodes={enrichedNodes}
      edges={edges}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      onInit={handleInit}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.2}
      maxZoom={2.5}
      defaultEdgeOptions={{
        type: 'relationship',
        animated: false,
      }}
      style={{
        background: '#0a0e1a',
      }}
      proOptions={{ hideAttribution: true }}
    >
      {/* Dot-grid background */}
      <Background
        variant={BackgroundVariant.Dots}
        gap={24}
        size={1}
        color="#1e3a5f"
        style={{ opacity: 0.5 }}
      />

      {/* Controls -- bottom left */}
      <Controls
        showInteractive={false}
        style={{
          background: 'rgba(17,24,39,0.9)',
          border: '1px solid #1e3a5f',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      />

      {/* MiniMap -- bottom right */}
      <MiniMap
        nodeColor={miniMapNodeColor}
        nodeStrokeWidth={2}
        zoomable
        pannable
        style={{
          background: 'rgba(10,14,26,0.92)',
          border: '1px solid #1e3a5f',
          borderRadius: 8,
        }}
        maskColor="rgba(10,14,26,0.7)"
      />

      {/* Legend -- top right */}
      <Panel position="top-right">
        <LegendPanel />
      </Panel>
    </ReactFlow>
  )
}

// ---- Public API ---------------------------------------------------------------

export interface BusinessGraphProps {
  /** React Flow nodes array */
  nodes: Node[]
  /** React Flow edges array */
  edges: Edge[]
  /** Called when user clicks any node */
  onNodeClick: (nodeId: string, data: GraphNodeData) => void
  /** ID of currently-selected node -- drives glow highlight */
  selectedNodeId?: string | null
  /** onChange handlers forwarded from useNodesState / useEdgesState */
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  /** Optional class applied to the outer wrapper */
  className?: string
}

/*
  BusinessGraph -- main React Flow canvas for the Business Command Center.

  Usage example:
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    <BusinessGraph
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={(id, data) => setSelectedId(id)}
      selectedNodeId={selectedId}
      className="h-[600px] rounded-xl overflow-hidden"
    />
*/
export default function BusinessGraph({
  nodes,
  edges,
  onNodeClick,
  selectedNodeId,
  onNodesChange,
  onEdgesChange,
  className = '',
}: BusinessGraphProps) {
  return (
    <div
      className={`relative w-full ${className}`}
      style={{ minHeight: 400 }}
    >
      <ReactFlowProvider>
        <BusinessGraphInner
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          selectedNodeId={selectedNodeId}
        />
      </ReactFlowProvider>
    </div>
  )
}
