'use client'

import { RefreshCw, ClipboardCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import StatusBadge from '@/components/ui/StatusBadge'
import type { ComplianceEvent } from '@/types'
import { formatDate, formatDateRelative, formatCurrency } from '@/lib/utils'

interface ComplianceTabProps {
  events: ComplianceEvent[]
}

function urgencyColor(event: ComplianceEvent): string {
  if (event.status === 'overdue') return '#ef4444'
  const daysUntil = Math.round(
    (new Date(event.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  if (event.status === 'current') return '#10b981'
  if (daysUntil <= 14) return '#ef4444'
  if (daysUntil <= 30) return '#f59e0b'
  if (daysUntil <= 90) return '#3b82f6'
  return '#94a3b8'
}

const statusMap: Record<
  ComplianceEvent['status'],
  'active' | 'pending' | 'overdue' | 'current' | 'in_progress'
> = {
  current: 'current',
  overdue: 'overdue',
  pending: 'pending',
  in_progress: 'in_progress',
}

export default function ComplianceTab({ events }: ComplianceTabProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
        >
          <ClipboardCheck className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          No compliance events for this entity.
        </p>
      </div>
    )
  }

  // Sort by due date ascending (soonest first)
  const sorted = [...events].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )

  return (
    <div className="space-y-3 pb-6">
      {sorted.map((event, idx) => {
        const color = urgencyColor(event)
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="flex gap-4 p-4 rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
          >
            {/* Left accent bar */}
            <div
              className="w-1 rounded-full flex-shrink-0 self-stretch"
              style={{ background: color }}
              aria-hidden="true"
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {event.eventType}
                  </p>
                  {event.isRecurring && (
                    <span
                      className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}
                      title={`Repeats ${event.recurringPeriod}`}
                    >
                      <RefreshCw className="w-3 h-3" />
                      {event.recurringPeriod}
                    </span>
                  )}
                </div>
                <StatusBadge status={statusMap[event.status] ?? 'pending'} />
              </div>

              {/* Due date */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Due Date
                  </p>
                  <p className="text-sm font-medium" style={{ color }}>
                    {formatDate(event.dueDate)}
                    <span className="text-xs ml-2" style={{ color: 'var(--text-secondary)' }}>
                      ({formatDateRelative(event.dueDate)})
                    </span>
                  </p>
                </div>

                {event.estimatedCostCents !== undefined && (
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Est. Cost
                    </p>
                    <p className="text-sm font-medium" style={{ color: 'var(--accent-gold)' }}>
                      {formatCurrency(event.estimatedCostCents)}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {event.notes && (
                <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {event.notes}
                </p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
