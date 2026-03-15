'use client'

import { DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
import StatusBadge from '@/components/ui/StatusBadge'
import type { Payment } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface PaymentsTabProps {
  payments: Payment[]
}

export default function PaymentsTab({ payments }: PaymentsTabProps) {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: '#1e293b', border: '1px solid #1e3a5f' }}
        >
          <DollarSign className="w-6 h-6" style={{ color: '#94a3b8' }} />
        </div>
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          No payments recorded for this entity yet.
        </p>
      </div>
    )
  }

  // Sort by date descending
  const sorted = [...payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const total = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)

  const statusMap: Record<Payment['status'], 'active' | 'pending' | 'overdue' | 'current'> = {
    paid: 'active',
    pending: 'pending',
    overdue: 'overdue',
    refunded: 'current',
  }

  return (
    <div className="pb-6">
      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid #1e3a5f' }}
      >
        {/* Header */}
        <div
          className="grid grid-cols-12 gap-2 px-4 py-2.5 text-xs font-medium uppercase tracking-wider"
          style={{ background: '#1e293b', color: '#94a3b8' }}
        >
          <span className="col-span-2">Date</span>
          <span className="col-span-4">Description</span>
          <span className="col-span-2">Invoice</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-2 text-right">Amount</span>
        </div>

        {/* Rows */}
        {sorted.map((payment, idx) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.03 }}
            className="grid grid-cols-12 gap-2 px-4 py-3 text-sm items-center"
            style={{
              borderTop: '1px solid #1e3a5f',
              background: idx % 2 === 0 ? '#111827' : 'transparent',
            }}
          >
            <span className="col-span-2 text-xs" style={{ color: '#94a3b8' }}>
              {formatDate(payment.date)}
            </span>
            <span className="col-span-4 truncate" style={{ color: '#f1f5f9' }}>
              {payment.description}
            </span>
            <span className="col-span-2 text-xs font-mono" style={{ color: '#94a3b8' }}>
              {payment.invoiceNumber ?? '--'}
            </span>
            <span className="col-span-2">
              <StatusBadge status={statusMap[payment.status] ?? 'pending'} />
            </span>
            <span
              className="col-span-2 text-right font-medium font-mono"
              style={{
                color:
                  payment.status === 'refunded'
                    ? '#f59e0b'
                    : payment.status === 'overdue'
                    ? '#ef4444'
                    : '#f1f5f9',
              }}
            >
              {payment.status === 'refunded' ? '-' : ''}
              {formatCurrency(payment.amount)}
            </span>
          </motion.div>
        ))}

        {/* Total row */}
        <div
          className="grid grid-cols-12 gap-2 px-4 py-3 text-sm items-center font-semibold"
          style={{ borderTop: '2px solid #1e3a5f', background: '#1e293b' }}
        >
          <span className="col-span-8" style={{ color: '#94a3b8' }}>
            Total Paid
          </span>
          <span className="col-span-2" />
          <span className="col-span-2 text-right font-mono" style={{ color: '#10b981' }}>
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  )
}
