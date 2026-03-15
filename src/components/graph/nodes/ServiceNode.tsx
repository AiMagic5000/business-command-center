'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import {
  Briefcase,
  MapPin,
  UserCheck,
  BarChart2,
  Mail,
  Phone,
  FileText,
  Settings,
} from 'lucide-react'
import type { GraphNodeData } from '@/lib/types'
import { NODE_COLORS } from '@/lib/types'

// Map service icon string to Lucide icon
const SERVICE_ICONS: Record<string, React.ElementType> = {
  virtual_office: MapPin,
  registered_agent: UserCheck,
  dun_bradstreet: BarChart2,
  mail: Mail,
  phone: Phone,
  filing: FileText,
  settings: Settings,
  default: Briefcase,
}

function ServiceNode({ data, selected, id }: NodeProps) {
  const nodeData = data as unknown as GraphNodeData
  const colors = NODE_COLORS.service
  const {
    label,
    subtitle,
    provider,
    serviceIcon = 'default',
    onNodeClick,
  } = nodeData

  const IconComponent = SERVICE_ICONS[serviceIcon] ?? SERVICE_ICONS.default

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
      style={{ width: 175 }}
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
          border: `1.5px solid ${selected ? colors.primary : 'rgba(59, 130, 246, 0.4)'}`,
          borderRadius: 12,
          padding: '12px 14px',
          boxShadow: selected
            ? `0 0 0 2px ${colors.primary}, 0 0 24px ${colors.glow}`
            : '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        {/* Icon + label row */}
        <div className="flex items-center gap-2.5 mb-2">
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

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 mb-0.5">
              <Briefcase size={8} style={{ color: colors.text }} />
              <span
                className="text-[10px] uppercase tracking-wider font-semibold"
                style={{ color: colors.text }}
              >
                Service
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

        {/* Subtitle */}
        {subtitle && (
          <p
            className="text-[11px] mb-1.5 truncate"
            style={{ color: '#64748b' }}
          >
            {subtitle}
          </p>
        )}

        {/* Provider tag */}
        {provider && (
          <div className="flex items-center gap-1.5 mt-1">
            <div
              className="h-px flex-1"
              style={{ background: 'rgba(59,130,246,0.2)' }}
            />
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{
                background: `${colors.primary}15`,
                color: colors.text,
                border: `1px solid ${colors.primary}33`,
              }}
            >
              {provider}
            </span>
            <div
              className="h-px flex-1"
              style={{ background: 'rgba(59,130,246,0.2)' }}
            />
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

export default memo(ServiceNode)
