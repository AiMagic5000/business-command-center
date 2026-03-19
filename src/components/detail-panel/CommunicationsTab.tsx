'use client'

import { ArrowDownLeft, ArrowUpRight, Paperclip, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Communication } from '@/types'
import { formatDate, truncate } from '@/lib/utils'

interface CommunicationsTabProps {
  communications: Communication[]
}

export default function CommunicationsTab({ communications }: CommunicationsTabProps) {
  if (communications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
        >
          <Mail className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          No emails linked to this entity yet.
        </p>
      </div>
    )
  }

  // Sort by date descending
  const sorted = [...communications].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="space-y-3 pb-6">
      {sorted.map((comm, idx) => {
        const isInbound = comm.direction === 'inbound'
        return (
          <motion.div
            key={comm.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="flex gap-4 p-4 rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
          >
            {/* Direction indicator */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: isInbound ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              }}
              aria-label={isInbound ? 'Inbound email' : 'Outbound email'}
            >
              {isInbound ? (
                <ArrowDownLeft className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
              ) : (
                <ArrowUpRight className="w-4 h-4" style={{ color: '#10b981' }} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {comm.subject}
                </p>
                <span
                  className="text-xs flex-shrink-0"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {formatDate(comm.date)}
                </span>
              </div>

              {/* From/To */}
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {isInbound ? `From: ${comm.fromAddress}` : `To: ${comm.toAddress}`}
              </p>

              {/* Preview */}
              <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {truncate(comm.body, 100)}
              </p>

              {/* Attachment badge */}
              {comm.attachmentCount > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <Paperclip className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {comm.attachmentCount}{' '}
                    {comm.attachmentCount === 1 ? 'attachment' : 'attachments'}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
