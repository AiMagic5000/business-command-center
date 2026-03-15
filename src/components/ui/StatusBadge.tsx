'use client'

type StatusType =
  | 'active'
  | 'pending'
  | 'dissolved'
  | 'in_progress'
  | 'overdue'
  | 'current'

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

const statusConfig: Record<
  StatusType,
  { label: string; bg: string; text: string; dot: string }
> = {
  active: {
    label: 'Active',
    bg: 'rgba(16, 185, 129, 0.1)',
    text: '#10b981',
    dot: '#10b981',
  },
  current: {
    label: 'Current',
    bg: 'rgba(16, 185, 129, 0.1)',
    text: '#10b981',
    dot: '#10b981',
  },
  pending: {
    label: 'Pending',
    bg: 'rgba(245, 158, 11, 0.1)',
    text: '#f59e0b',
    dot: '#f59e0b',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'rgba(59, 130, 246, 0.1)',
    text: '#3b82f6',
    dot: '#3b82f6',
  },
  dissolved: {
    label: 'Dissolved',
    bg: 'rgba(239, 68, 68, 0.1)',
    text: '#ef4444',
    dot: '#ef4444',
  },
  overdue: {
    label: 'Overdue',
    bg: 'rgba(239, 68, 68, 0.1)',
    text: '#ef4444',
    dot: '#ef4444',
  },
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.pending

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ background: config.bg, color: config.text }}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: config.dot }}
        aria-hidden="true"
      />
      {config.label}
    </span>
  )
}
