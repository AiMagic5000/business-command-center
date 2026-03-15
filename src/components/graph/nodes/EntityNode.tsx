'use client'

import { memo, useCallback } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import { Building2, ChevronRight, Circle } from 'lucide-react'
import type { GraphNodeData } from '@/lib/types'
import { NODE_COLORS } from '@/lib/types'

/*
  EntityNode -- amber dashed-border node for LLCs, Corps, and other business entities.

  Usage example:
    data: {
      id: 'entity-1',
      nodeType: 'entity',
      label: 'Apex Holdings LLC',
      entityType: 'LLC',
      jurisdiction: 'Wyoming',
      status: 'active',
      expandable: true,
      onNodeClick: (id, data) => openDetailPanel(id, data),
    }
*/

const STATUS_CONFIG = {
  active:      { dot: '#22c55e', label: 'Active' },
  pending:     { dot: '#f59e0b', label: 'Pending' },
  dissolved:   { dot: '#ef4444', label: 'Dissolved' },
  in_progress: { dot: '#f59e0b', label: 'In Progress' },
} as const
type StatusKey = keyof typeof STATUS_CONFIG

function EntityNode({ data, selected, id }: NodeProps) {
  const d = data as unknown as GraphNodeData
  const colors = NODE_COLORS.entity

  const statusKey: StatusKey =
    d.status && d.status in STATUS_CONFIG ? (d.status as StatusKey) : 'active'
  const statusInfo = STATUS_CONFIG[statusKey]

  const handleClick = useCallback(() => {
    d.onNodeClick?.(id!, d)
  }, [d, id])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onClick={handleClick}
      className="relative cursor-pointer"
      style={{ width: 190 }}
    >
      {selected && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: `0 0 0 2px ${colors.primary}, 0 0 24px ${colors.glow}`, borderRadius: 12 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      <motion.div
        whileHover={{
          boxShadow: `0 0 0 1px ${colors.primary}, 0 0 18px ${colors.glow}`,
          y: -2,
        }}
        transition={{ duration: 0.15 }}
        style={{
          background: `linear-gradient(135deg, #111827 0%, ${colors.bg} 100%)`,
          border: `1.5px dashed ${selected ? colors.primary : 'rgba(245,158,11,0.5)'}`,
          borderRadius: 12,
          padding: '12px 14px',
          boxShadow: selected
            ? `0 0 0 2px ${colors.primary}, 0 0 24px ${colors.glow}`
            : '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center rounded-lg flex-shrink-0"
              style={{
                width: 32,
                height: 32,
                background: `linear-gradient(135deg, ${colors.primary}22, ${colors.primary}44)`,
                border: `1px solid ${colors.primary}55`,
                boxShadow: `0 0 8px ${colors.glow}`,
              }}
            >
              <Building2 size={15} style={{ color: colors.primary }} />
            </div>

            <div>
              <div className="flex items-center gap-1">
                <Building2 size={8} style={{ color: colors.text }} />
                <span
                  className="text-[10px] uppercase tracking-wider font-semibold"
                  style={{ color: colors.text }}
                >
                  Entity
                </span>
              </div>
              {d.entityType && (
                <span
                  className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5"
                  style={{
                    background: `${colors.primary}22`,
                    color: colors.primary,
                    border: `1px solid ${colors.primary}44`,
                    letterSpacing: '0.05em',
                  }}
                >
                  {d.entityType}
                </span>
              )}
            </div>
          </div>

          {d.expandable && (
            <ChevronRight size={14} style={{ color: '#475569', marginTop: 2, flexShrink: 0 }} />
          )}
        </div>

        {/* Entity name */}
        <p className="text-sm font-bold leading-snug mb-2" style={{ color: '#f1f5f9' }}>
          {d.label}
        </p>

        {/* Jurisdiction + status row */}
        <div className="flex items-center justify-between">
          {d.jurisdiction && (
            <span className="text-[10px] font-medium" style={{ color: '#64748b' }}>
              {d.jurisdiction}
            </span>
          )}
          <div className="flex items-center gap-1.5 ml-auto">
            <Circle
              size={7}
              fill={statusInfo.dot}
              style={{ color: statusInfo.dot, filter: `drop-shadow(0 0 3px ${statusInfo.dot})` }}
            />
            <span className="text-[10px] font-medium" style={{ color: statusInfo.dot }}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        <div
          className="mt-2.5 h-px w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${colors.primary}44, transparent)` }}
        />
      </motion.div>

      <Handle type="target" position={Position.Top}
        style={{ background: colors.primary, border: '2px solid #111827', width: 8, height: 8, top: -4 }} />
      <Handle type="source" position={Position.Bottom}
        style={{ background: colors.primary, border: '2px solid #111827', width: 8, height: 8, bottom: -4 }} />
      <Handle type="target" position={Position.Left}
        style={{ background: colors.primary, border: '2px solid #111827', width: 8, height: 8, left: -4 }} />
      <Handle type="source" position={Position.Right}
        style={{ background: colors.primary, border: '2px solid #111827', width: 8, height: 8, right: -4 }} />
    </motion.div>
  )
}

export default memo(EntityNode)
