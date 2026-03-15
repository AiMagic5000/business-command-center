'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import { Globe, ExternalLink, Wifi, WifiOff, Hammer } from 'lucide-react'
import type { GraphNodeData } from '@/lib/types'
import { NODE_COLORS } from '@/lib/types'

const SITE_STATUS_CONFIG = {
  live: {
    icon: Wifi,
    label: 'Live',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.35)',
  },
  down: {
    icon: WifiOff,
    label: 'Down',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.35)',
  },
  building: {
    icon: Hammer,
    label: 'Building',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.35)',
  },
}

function WebsiteNode({ data, selected, id }: NodeProps) {
  const nodeData = data as unknown as GraphNodeData
  const colors = NODE_COLORS.website
  const {
    label,
    domain,
    siteStatus = 'live',
    url,
    onNodeClick,
  } = nodeData

  const statusConfig = SITE_STATUS_CONFIG[siteStatus]
  const StatusIcon = statusConfig.icon

  const handleClick = () => {
    if (onNodeClick && id) {
      onNodeClick(id, nodeData)
    }
  }

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onClick={handleClick}
      className="relative cursor-pointer"
      style={{ width: 185 }}
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
          border: `1.5px solid ${selected ? colors.primary : 'rgba(139, 92, 246, 0.4)'}`,
          borderRadius: 12,
          padding: '12px 14px',
          boxShadow: selected
            ? `0 0 0 2px ${colors.primary}, 0 0 24px ${colors.glow}`
            : '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-2.5">
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
              <Globe size={15} style={{ color: colors.primary }} />
            </div>

            <div>
              <div className="flex items-center gap-1">
                <Globe size={8} style={{ color: colors.text }} />
                <span
                  className="text-[9px] uppercase tracking-widest font-semibold"
                  style={{ color: colors.text }}
                >
                  Website
                </span>
              </div>
            </div>
          </div>

          {/* External link icon */}
          {url && (
            <motion.button
              onClick={handleLinkClick}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center justify-center rounded-md"
              style={{
                width: 26,
                height: 26,
                background: `${colors.primary}15`,
                border: `1px solid ${colors.primary}33`,
              }}
            >
              <ExternalLink size={11} style={{ color: colors.primary }} />
            </motion.button>
          )}
        </div>

        {/* Domain / label */}
        <p
          className="text-[13px] font-semibold leading-tight mb-1"
          style={{ color: '#f1f5f9' }}
        >
          {label}
        </p>

        {domain && domain !== label && (
          <p
            className="text-[11px] mb-2"
            style={{ color: '#64748b', fontFamily: 'monospace' }}
          >
            {domain}
          </p>
        )}

        {/* Status badge */}
        <div
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md"
          style={{
            background: statusConfig.bg,
            border: `1px solid ${statusConfig.border}`,
          }}
        >
          <StatusIcon size={10} style={{ color: statusConfig.color }} />
          <span
            className="text-[10px] font-semibold"
            style={{ color: statusConfig.color }}
          >
            {statusConfig.label}
          </span>

          {/* Pulsing dot for live */}
          {siteStatus === 'live' && (
            <motion.div
              className="rounded-full"
              style={{ width: 5, height: 5, background: '#22c55e' }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>

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

export default memo(WebsiteNode)
