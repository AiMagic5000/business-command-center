'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import { Landmark, CreditCard, TrendingUp, Hash } from 'lucide-react'
import type { GraphNodeData } from '@/lib/types'
import { NODE_COLORS } from '@/lib/types'

const ACCOUNT_ICONS: Record<string, React.ElementType> = {
  EIN: Hash,
  bank: Landmark,
  credit: CreditCard,
  investment: TrendingUp,
}

const ACCOUNT_LABELS: Record<string, string> = {
  EIN: 'EIN Number',
  bank: 'Bank Account',
  credit: 'Credit Account',
  investment: 'Investment',
}

function FinancialNode({ data, selected, id }: NodeProps) {
  const nodeData = data as unknown as GraphNodeData
  const colors = NODE_COLORS.financial
  const {
    label,
    maskedValue,
    accountType = 'bank',
    onNodeClick,
  } = nodeData

  const IconComponent = ACCOUNT_ICONS[accountType] ?? Landmark
  const accountLabel = ACCOUNT_LABELS[accountType] ?? 'Financial'

  // Format masked value display -- show dots + last 4
  const formattedValue = maskedValue
    ? maskedValue.length <= 4
      ? `**** ${maskedValue}`
      : maskedValue
    : null

  const handleClick = () => {
    if (onNodeClick && id) {
      onNodeClick(id, nodeData)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onClick={handleClick}
      className="relative cursor-pointer"
      style={{ width: 176 }}
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
          border: `1.5px solid ${selected ? colors.primary : 'rgba(16, 185, 129, 0.4)'}`,
          borderRadius: 12,
          padding: '12px 14px',
          boxShadow: selected
            ? `0 0 0 2px ${colors.primary}, 0 0 24px ${colors.glow}`
            : '0 4px 16px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Subtle background grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 14px, rgba(16,185,129,0.03) 14px, rgba(16,185,129,0.03) 15px)`,
          }}
        />

        {/* Icon + type label */}
        <div className="flex items-center gap-2.5 mb-2.5 relative">
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
            <IconComponent size={16} style={{ color: colors.primary }} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <Landmark size={8} style={{ color: colors.text }} />
              <span
                className="text-[9px] uppercase tracking-widest font-semibold"
                style={{ color: colors.text }}
              >
                {accountLabel}
              </span>
            </div>
            <p
              className="text-[12px] font-semibold leading-tight truncate"
              style={{ color: '#f1f5f9' }}
            >
              {label}
            </p>
          </div>
        </div>

        {/* Masked value display */}
        {formattedValue && (
          <div
            className="flex items-center justify-between rounded-lg px-3 py-2 relative"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: `1px solid ${colors.primary}22`,
              fontFamily: "'Courier New', monospace",
            }}
          >
            <span
              className="text-[11px] font-medium tracking-widest"
              style={{ color: '#475569' }}
            >
              {accountType === 'EIN' ? 'EIN:' : 'Acct:'}
            </span>
            <span
              className="text-[12px] font-bold tracking-wider"
              style={{ color: colors.text }}
            >
              {formattedValue}
            </span>
          </div>
        )}

        {/* Bottom accent */}
        <div
          className="mt-2.5 h-px w-full relative"
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

export default memo(FinancialNode)
