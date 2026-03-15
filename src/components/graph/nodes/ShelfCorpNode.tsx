'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import { Archive, Clock, MapPin } from 'lucide-react'
import type { GraphNodeData } from '@/lib/types'
import { NODE_COLORS } from '@/lib/types'

function formatAge(years: number): string {
  if (years < 1) {
    const months = Math.round(years * 12)
    return `${months} mo`
  }
  return `${years.toFixed(1)} yr`
}

function ShelfCorpNode({ data, selected, id }: NodeProps) {
  const nodeData = data as unknown as GraphNodeData
  const colors = NODE_COLORS.shelf_corp
  const {
    label,
    corpAge,
    domesticationStatus,
    incorporationState,
    jurisdiction,
    onNodeClick,
  } = nodeData

  const displayState = incorporationState ?? jurisdiction ?? null

  const handleClick = () => {
    if (onNodeClick && id) {
      onNodeClick(id, nodeData)
    }
  }

  // Age tier coloring
  const ageColor = corpAge
    ? corpAge >= 5
      ? '#22c55e'
      : corpAge >= 2
      ? '#f59e0b'
      : '#94a3b8'
    : '#94a3b8'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onClick={handleClick}
      className="relative cursor-pointer"
      style={{ width: 182 }}
    >
      {selected && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `0 0 0 2px ${colors.primary}, 0 0 24px ${colors.glow}`,
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
          background: `linear-gradient(135deg, #111827 0%, ${colors.bg} 100%)`,
          // Dotted border
          border: `1.5px dotted ${selected ? colors.primary : 'rgba(236, 72, 153, 0.5)'}`,
          borderRadius: 12,
          padding: '12px 14px',
          boxShadow: selected
            ? `0 0 0 2px ${colors.primary}, 0 0 24px ${colors.glow}`
            : '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div
            className="flex items-center justify-center rounded-lg flex-shrink-0"
            style={{
              width: 34,
              height: 34,
              background: `linear-gradient(135deg, ${colors.primary}22, ${colors.primary}44)`,
              border: `1px solid ${colors.primary}55`,
              boxShadow: `0 0 10px ${colors.glow}`,
            }}
          >
            <Archive size={15} style={{ color: colors.primary }} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 mb-0.5">
              <Archive size={8} style={{ color: colors.text }} />
              <span
                className="text-[10px] uppercase tracking-wider font-semibold"
                style={{ color: colors.text }}
              >
                Shelf Corp
              </span>
            </div>
            <p
              className="text-[13px] font-bold leading-tight truncate"
              style={{ color: '#f1f5f9' }}
            >
              {label}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-stretch gap-2 mb-1.5">
          {/* Age block */}
          {corpAge !== undefined && (
            <div
              className="flex-1 flex flex-col items-center justify-center rounded-lg py-1.5"
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: `1px solid ${ageColor}22`,
              }}
            >
              <Clock size={10} style={{ color: ageColor, marginBottom: 2 }} />
              <span
                className="text-[12px] font-bold"
                style={{ color: ageColor }}
              >
                {formatAge(corpAge)}
              </span>
              <span
                className="text-[9px]"
                style={{ color: '#475569' }}
              >
                Age
              </span>
            </div>
          )}

          {/* State block */}
          {displayState && (
            <div
              className="flex-1 flex flex-col items-center justify-center rounded-lg py-1.5"
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: `1px solid rgba(236,72,153,0.15)`,
              }}
            >
              <MapPin size={10} style={{ color: colors.text, marginBottom: 2 }} />
              <span
                className="text-[12px] font-bold"
                style={{ color: '#f1f5f9' }}
              >
                {displayState}
              </span>
              <span
                className="text-[9px]"
                style={{ color: '#475569' }}
              >
                State
              </span>
            </div>
          )}
        </div>

        {/* Domestication status */}
        {domesticationStatus && (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-md mt-1"
            style={{
              background: `${colors.primary}12`,
              border: `1px solid ${colors.primary}25`,
            }}
          >
            <span
              className="text-[10px] font-medium"
              style={{ color: '#64748b' }}
            >
              Domestication:
            </span>
            <span
              className="text-[10px] font-semibold ml-auto"
              style={{ color: colors.text }}
            >
              {domesticationStatus}
            </span>
          </div>
        )}

        {/* Bottom accent */}
        <div
          className="mt-2.5 h-px w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.primary}44, transparent)`,
          }}
        />
      </motion.div>

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: colors.primary, border: `2px solid #111827`, width: 8, height: 8, top: -4 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: colors.primary, border: `2px solid #111827`, width: 8, height: 8, bottom: -4 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: colors.primary, border: `2px solid #111827`, width: 8, height: 8, left: -4 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: colors.primary, border: `2px solid #111827`, width: 8, height: 8, right: -4 }}
      />
    </motion.div>
  )
}

export default memo(ShelfCorpNode)
