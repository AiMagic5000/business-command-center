'use client'

import { useState, useEffect } from 'react'
import { Calendar, DollarSign, Mail, FileText, Shield, Clock } from 'lucide-react'
import { clearPinSession } from '@/lib/pinSession'
import type { BusinessOwner } from '@/lib/types'

interface TimelineEvent {
  id: string
  date: string
  type: 'payment' | 'communication' | 'compliance' | 'document' | 'formation'
  title: string
  description: string
  entityName?: string
  amount?: number
}

const EVENT_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  payment: { icon: DollarSign, color: '#10b981' },
  communication: { icon: Mail, color: '#3b82f6' },
  compliance: { icon: Shield, color: '#f59e0b' },
  document: { icon: FileText, color: '#8b5cf6' },
  formation: { icon: Calendar, color: '#d4a84b' },
}

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const ownersRes = await fetch('/api/owners')
        if (ownersRes.status === 403) { clearPinSession(); window.location.reload(); return }
        const ownersJson = await ownersRes.json()
        const owners: BusinessOwner[] = ownersJson.data || []
        const primaryOwner = owners.find(o => !o.is_admin) || owners[0]
        if (!primaryOwner) return

        const entitiesRes = await fetch(`/api/entities?owner_id=${primaryOwner.id}`)
        if (entitiesRes.status === 403) { clearPinSession(); window.location.reload(); return }
        const entitiesJson = await entitiesRes.json()
        const entities = entitiesJson.data || []

        const timeline: TimelineEvent[] = []

        // Add entity formations
        for (const entity of entities) {
          if (entity.formation_date) {
            timeline.push({
              id: `formation-${entity.id}`,
              date: entity.formation_date,
              type: 'formation',
              title: `${entity.name} Formed`,
              description: `${entity.type.toUpperCase()} formed in ${entity.jurisdiction || entity.state || 'N/A'}`,
              entityName: entity.name,
            })
          }

          // Add compliance events
          for (const c of (entity.compliance || [])) {
            timeline.push({
              id: `compliance-${c.id}`,
              date: c.due_date,
              type: 'compliance',
              title: c.event_type,
              description: c.notes || `${c.status} - ${c.frequency || 'one-time'}`,
              entityName: entity.name,
            })
          }
        }

        // Fetch payments
        const paymentsRes = await fetch(`/api/payments?owner_id=${primaryOwner.id}`)
        if (paymentsRes.ok) {
          const paymentsJson = await paymentsRes.json()
          for (const p of (paymentsJson.data || [])) {
            timeline.push({
              id: `payment-${p.id}`,
              date: p.payment_date,
              type: 'payment',
              title: p.description || 'Payment',
              description: `$${(parseFloat(String(p.amount)) || 0).toLocaleString()} - ${p.status}`,
              amount: parseFloat(String(p.amount)),
            })
          }
        }

        // Sort by date descending
        timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setEvents(timeline)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: '#94a3b8' }}>Loading timeline...</p>
        </div>
      </div>
    )
  }

  // Group events by month
  const grouped: Record<string, TimelineEvent[]> = {}
  for (const event of events) {
    const d = new Date(event.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(event)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6" style={{ color: '#3b82f6' }} />
        <h1 className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>Timeline</h1>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-12 h-12 mx-auto mb-4" style={{ color: '#1e3a5f' }} />
          <p className="text-sm" style={{ color: '#64748b' }}>No events to display yet.</p>
        </div>
      ) : (
        <div className="space-y-8 max-w-3xl">
          {Object.entries(grouped).map(([monthKey, monthEvents]) => {
            const d = new Date(monthKey + '-01')
            const monthLabel = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            return (
              <div key={monthKey}>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4"
                  style={{ color: '#64748b' }}>{monthLabel}</h2>
                <div className="space-y-3 relative">
                  {/* Vertical line */}
                  <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: '#1e3a5f' }} />

                  {monthEvents.map(event => {
                    const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.formation
                    const Icon = config.icon
                    return (
                      <div key={event.id} className="flex items-start gap-4 relative pl-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                          style={{
                            background: `${config.color}22`,
                            border: `2px solid ${config.color}55`,
                          }}
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold" style={{ color: '#f1f5f9' }}>
                              {event.title}
                            </p>
                            <span className="text-xs flex-shrink-0 ml-4" style={{ color: '#475569' }}>
                              {new Date(event.date).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric'
                              })}
                            </span>
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                            {event.description}
                          </p>
                          {event.entityName && (
                            <span className="inline-block text-[10px] mt-1 px-2 py-0.5 rounded-full"
                              style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #1e3a5f' }}>
                              {event.entityName}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
