'use client'

import { memo, useState } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GraphEdgeData } from '@/lib/types'

/*
  RelationshipEdge -- custom animated edge with per-relationship styling.

  Relationship -> visual style mapping:
    owns              -> solid thick,  slate color
    manages           -> solid thin,   slate color
    trustee_of        -> dashed,       gold
    grantor_of        -> dashed,       gold
    beneficiary_of    -> dashed,       gold
    provides_service  -> dotted,       blue
    subsidiary_of     -> solid thin,   slate
    dba_of            -> dotted,       amber
    holds             -> solid thin,   emerald
    operates          -> solid thin,   slate
*/

// ---- Style configs per relationship type ----------------------------------------

interface EdgeStyle {
  color: string
  strokeWidth: number
  dashArray?: string
  labelBg: string
  labelColor: string
  glowColor: string
}

const EDGE_STYLES: Record<string, EdgeStyle> = {
  owns: {
    color: '#94a3b8',
    strokeWidth: 2.5,
    labelBg: 'rgba(30,41,59,0.95)',
    labelColor: '#cbd5e1',
    glowColor: 'rgba(148,163,184,0.3)',
  },
  manages: {
    color: '#64748b',
    strokeWidth: 1.5,
    labelBg: 'rgba(30,41,59,0.95)',
    labelColor: '#94a3b8',
    glowColor: 'rgba(100,116,139,0.25)',
  },
  trustee_of: {
    color: '#d4a84b',
    strokeWidth: 2,
    dashArray: '6 4',
    labelBg: 'rgba(30,25,10,0.95)',
    labelColor: '#e8c96a',
    glowColor: 'rgba(212,168,75,0.4)',
  },
  grantor_of: {
    color: '#d4a84b',
    strokeWidth: 2,
    dashArray: '6 4',
    labelBg: 'rgba(30,25,10,0.95)',
    labelColor: '#e8c96a',
    glowColor: 'rgba(212,168,75,0.4)',
  },
  beneficiary_of: {
    color: '#d4a84b',
    strokeWidth: 1.5,
    dashArray: '4 4',
    labelBg: 'rgba(30,25,10,0.95)',
    labelColor: '#e8c96a',
    glowColor: 'rgba(212,168,75,0.35)',
  },
  provides_service: {
    color: '#3b82f6',
    strokeWidth: 1.5,
    dashArray: '2 4',
    labelBg: 'rgba(10,20,40,0.95)',
    labelColor: '#93c5fd',
    glowColor: 'rgba(59,130,246,0.3)',
  },
  subsidiary_of: {
    color: '#64748b',
    strokeWidth: 1.5,
    labelBg: 'rgba(30,41,59,0.95)',
    labelColor: '#94a3b8',
    glowColor: 'rgba(100,116,139,0.2)',
  },
  dba_of: {
    color: '#f59e0b',
    strokeWidth: 1.5,
    dashArray: '2 4',
    labelBg: 'rgba(30,20,10,0.95)',
    labelColor: '#fcd34d',
    glowColor: 'rgba(245,158,11,0.3)',
  },
  holds: {
    color: '#10b981',
    strokeWidth: 1.5,
    labelBg: 'rgba(10,30,20,0.95)',
    labelColor: '#6ee7b7',
    glowColor: 'rgba(16,185,129,0.3)',
  },
  operates: {
    color: '#64748b',
    strokeWidth: 1.5,
    labelBg: 'rgba(30,41,59,0.95)',
    labelColor: '#94a3b8',
    glowColor: 'rgba(100,116,139,0.2)',
  },
}

const DEFAULT_STYLE: EdgeStyle = {
  color: '#475569',
  strokeWidth: 1.5,
  labelBg: 'rgba(30,41,59,0.95)',
  labelColor: '#94a3b8',
  glowColor: 'rgba(71,85,105,0.2)',
}

// ---- Animated flowing dot along the path --------------------------------------

function FlowDot({
  d,
  color,
  duration,
  delay,
}: {
  d: string
  color: string
  duration: number
  delay: number
}) {
  return (
    <motion.circle r={3} fill={color} opacity={0.85}>
      <animateMotion
        dur={`${duration}s`}
        begin={`${delay}s`}
        repeatCount="indefinite"
        path={d}
      />
    </motion.circle>
  )
}

// ---- Main edge component -------------------------------------------------------

function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  label: propLabel,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false)
  const edgeData = (data ?? {}) as unknown as GraphEdgeData
  const relationship = edgeData.relationship ?? 'manages'
  const labelText = edgeData.label ?? propLabel as string | undefined

  const style = EDGE_STYLES[relationship] ?? DEFAULT_STYLE

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // Thicken stroke and add glow on hover/select
  const isActive = hovered || selected
  const activeStrokeWidth = isActive ? style.strokeWidth + 1 : style.strokeWidth
  const activeFilter = isActive
    ? `drop-shadow(0 0 4px ${style.glowColor})`
    : undefined

  return (
    <>
      {/* Invisible wider hit area for hover detection */}
      <path
        d={edgePath}
        stroke="transparent"
        strokeWidth={20}
        fill="none"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer' }}
      />

      {/* The actual visible edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: style.color,
          strokeWidth: activeStrokeWidth,
          strokeDasharray: style.dashArray,
          filter: activeFilter,
          transition: 'stroke-width 0.15s, filter 0.15s',
        }}
      />

      {/* Flowing animated dots */}
      <svg style={{ overflow: 'visible', position: 'absolute', top: 0, left: 0 }}>
        <FlowDot
          d={edgePath}
          color={style.color}
          duration={2.2}
          delay={0}
        />
        {(relationship === 'owns' || relationship.endsWith('_of')) && (
          <FlowDot
            d={edgePath}
            color={style.color}
            duration={2.2}
            delay={1.1}
          />
        )}
      </svg>

      {/* Label -- shown on hover or if always-visible */}
      <EdgeLabelRenderer>
        <AnimatePresence>
          {(isActive || edgeData.animated) && labelText && (
            <motion.div
              key={`label-${id}`}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <div
                style={{
                  background: style.labelBg,
                  color: style.labelColor,
                  border: `1px solid ${style.color}44`,
                  borderRadius: 6,
                  padding: '2px 8px',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  backdropFilter: 'blur(8px)',
                  boxShadow: `0 2px 8px rgba(0,0,0,0.4), 0 0 6px ${style.glowColor}`,
                }}
              >
                {labelText}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </EdgeLabelRenderer>
    </>
  )
}

export default memo(RelationshipEdge)
