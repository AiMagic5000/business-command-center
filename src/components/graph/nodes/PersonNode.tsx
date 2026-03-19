'use client'

import { memo, useCallback } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import type { GraphNodeData } from '@/lib/types'
import { NODE_COLORS } from '@/lib/types'

/*
  PersonNode -- green solid-border node for business owner / individual.

  Usage example:
    <ReactFlow
      nodes={[{
        id: 'owner-1',
        type: 'person',
        position: { x: 300, y: 200 },
        data: {
          id: 'owner-1',
          nodeType: 'person',
          label: 'John Smith',
          sublabel: 'Founder & CEO',
          initials: 'JS',
          onNodeClick: (id, data) => openDetailPanel(id, data),
        },
      }]}
    />
*/

function PersonNode({ data, selected, id }: NodeProps) {
  const d = data as unknown as GraphNodeData
  const colors = NODE_COLORS.person

  const displayInitials =
    d.initials ??
    d.label
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase()

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
      style={{ width: 180 }}
    >
      {/* Selected glow ring */}
      {selected && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: `0 0 0 2px ${colors.primary}, 0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`,
            borderRadius: 12,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      <motion.div
        whileHover={{
          boxShadow: `0 0 0 1px ${colors.primary}, 0 0 16px ${colors.glow}`,
          y: -2,
        }}
        transition={{ duration: 0.15 }}
        style={{
          background: `linear-gradient(135deg, var(--node-bg) 0%, ${colors.bg} 100%)`,
          border: `1.5px solid ${selected ? colors.primary : 'rgba(34,197,94,0.4)'}`,
          borderRadius: 12,
          padding: '14px 16px 12px',
          boxShadow: selected
            ? `0 0 0 2px ${colors.primary}, 0 0 24px ${colors.glow}`
            : '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          {/* Avatar */}
          <div
            className="relative flex-shrink-0 flex items-center justify-center rounded-full"
            style={{
              width: 38,
              height: 38,
              background: d.avatarUrl
                ? 'transparent'
                : `linear-gradient(135deg, ${colors.primary}33, ${colors.primary}66)`,
              border: `1.5px solid ${colors.primary}66`,
              boxShadow: `0 0 8px ${colors.glow}`,
            }}
          >
            {d.avatarUrl ? (
              <img
                src={d.avatarUrl}
                alt={d.label}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span
                className="text-xs font-bold tracking-wide select-none"
                style={{ color: colors.primary }}
              >
                {displayInitials}
              </span>
            )}
            {/* Active dot */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: '#22c55e', borderColor: 'var(--node-bg)', boxShadow: '0 0 6px #22c55e' }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <User size={9} style={{ color: colors.text }} />
              <span
                className="text-[10px] uppercase tracking-wider font-semibold"
                style={{ color: colors.text }}
              >
                Owner
              </span>
            </div>
            <p
              className="text-sm font-bold leading-tight truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {d.label}
            </p>
          </div>
        </div>

        {(d.sublabel ?? d.subtitle) && (
          <p
            className="text-[11px] leading-snug truncate px-0.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            {d.sublabel ?? d.subtitle}
          </p>
        )}

        <div
          className="mt-3 h-px w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${colors.primary}44, transparent)` }}
        />
      </motion.div>

      <Handle type="target" position={Position.Top}
        style={{ background: colors.primary, border: '2px solid var(--node-bg)', width: 8, height: 8, top: -4 }} />
      <Handle type="source" position={Position.Bottom}
        style={{ background: colors.primary, border: '2px solid var(--node-bg)', width: 8, height: 8, bottom: -4 }} />
      <Handle type="target" position={Position.Left}
        style={{ background: colors.primary, border: '2px solid var(--node-bg)', width: 8, height: 8, left: -4 }} />
      <Handle type="source" position={Position.Right}
        style={{ background: colors.primary, border: '2px solid var(--node-bg)', width: 8, height: 8, right: -4 }} />
    </motion.div>
  )
}

export default memo(PersonNode)
