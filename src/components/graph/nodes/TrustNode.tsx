'use client'

import { memo, useCallback } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import { Shield, Crown } from 'lucide-react'
import type { GraphNodeData } from '@/lib/types'
import { NODE_COLORS } from '@/lib/types'

/*
  TrustNode -- gold double-border central hub node with perpetual breathing glow.
  Largest node at 220px wide.

  Usage example:
    data: {
      id: 'trust-1',
      nodeType: 'trust',
      label: 'Smith Family Trust',
      trustType: 'Revocable Living Trust',
      grantorName: 'John Smith',
      sublabel: 'Est. 2023',
      onNodeClick: (id, data) => openDetailPanel(id, data),
    }
*/

function TrustNode({ data, selected, id }: NodeProps) {
  const d = data as unknown as GraphNodeData
  const colors = NODE_COLORS.trust
  const trustType = d.trustType ?? 'Revocable Living Trust'

  const handleClick = useCallback(() => {
    d.onNodeClick?.(id!, d)
  }, [d, id])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      onClick={handleClick}
      className="relative cursor-pointer"
      style={{ width: 220 }}
    >
      {/* Perpetual breathing glow -- signature look for trust nodes */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ borderRadius: 14 }}
        animate={{
          boxShadow: [
            `0 0 12px ${colors.glow}, 0 0 0 2px ${colors.primary}44`,
            `0 0 30px ${colors.glow}, 0 0 0 2px ${colors.primary}99`,
            `0 0 12px ${colors.glow}, 0 0 0 2px ${colors.primary}44`,
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {selected && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `0 0 0 3px ${colors.primary}, 0 0 44px ${colors.glow}`,
            borderRadius: 14,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.18 }}
        style={{
          background: `linear-gradient(135deg, #111827 0%, ${colors.bg} 60%, rgba(212,168,75,0.12) 100%)`,
          border: `3px double ${selected ? colors.primary : 'rgba(212,168,75,0.65)'}`,
          borderRadius: 14,
          padding: '16px 18px 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,168,75,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Watermark */}
        <div
          className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none select-none"
          style={{ opacity: 0.04 }}
        >
          <Shield size={72} style={{ color: colors.primary }} />
        </div>

        {/* Crown icon + badges row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              className="flex items-center justify-center rounded-lg"
              style={{
                width: 36,
                height: 36,
                background: `linear-gradient(135deg, ${colors.primary}33, ${colors.primary}55)`,
                border: `1.5px solid ${colors.primary}66`,
              }}
              animate={{
                boxShadow: [
                  `0 0 8px ${colors.glow}`,
                  `0 0 18px ${colors.glow}`,
                  `0 0 8px ${colors.glow}`,
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Crown size={17} style={{ color: colors.primary }} />
            </motion.div>

            <div>
              <div className="flex items-center gap-1">
                <Shield size={8} style={{ color: colors.text }} />
                <span
                  className="text-[9px] uppercase tracking-widest font-semibold"
                  style={{ color: colors.text }}
                >
                  Trust
                </span>
              </div>
              <span
                className="inline-block text-[9px] font-medium px-1.5 py-0.5 rounded mt-0.5"
                style={{
                  background: `${colors.primary}22`,
                  color: colors.text,
                  border: `1px solid ${colors.primary}33`,
                }}
              >
                Central Hub
              </span>
            </div>
          </div>

          {/* Pulsing status dots */}
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="rounded-full"
                style={{ width: 5, height: 5, background: colors.primary, opacity: 0.6 }}
                animate={{ opacity: [0.3, 0.9, 0.3] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
              />
            ))}
          </div>
        </div>

        {/* Trust name */}
        <p
          className="text-[14px] font-bold leading-snug mb-1.5"
          style={{ color: '#f1f5f9', textShadow: `0 0 12px ${colors.glow}` }}
        >
          {d.label}
        </p>

        {/* Trust type */}
        <p className="text-[11px] font-medium mb-2.5" style={{ color: colors.text }}>
          {trustType}
        </p>

        {/* Grantor */}
        {d.grantorName && (
          <div
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
            style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${colors.primary}22` }}
          >
            <span className="text-[10px]" style={{ color: '#475569' }}>Grantor</span>
            <span className="text-[11px] font-semibold ml-auto" style={{ color: colors.text }}>
              {d.grantorName}
            </span>
          </div>
        )}

        {d.sublabel && (
          <p className="text-[10px] mt-1.5" style={{ color: '#64748b' }}>{d.sublabel}</p>
        )}

        {/* Animated shimmer bar */}
        <motion.div
          className="mt-3 h-px w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${colors.primary}88, transparent)` }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <Handle type="target" position={Position.Top}
        style={{ background: colors.primary, border: '2px solid #111827', width: 10, height: 10, top: -5 }} />
      <Handle type="source" position={Position.Bottom}
        style={{ background: colors.primary, border: '2px solid #111827', width: 10, height: 10, bottom: -5 }} />
      <Handle type="target" position={Position.Left}
        style={{ background: colors.primary, border: '2px solid #111827', width: 10, height: 10, left: -5 }} />
      <Handle type="source" position={Position.Right}
        style={{ background: colors.primary, border: '2px solid #111827', width: 10, height: 10, right: -5 }} />
    </motion.div>
  )
}

export default memo(TrustNode)
