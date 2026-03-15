'use client'

import { useState, useEffect } from 'react'
import { Building2, Shield, Archive, Briefcase, User, Search, ChevronRight } from 'lucide-react'
import { clearPinSession } from '@/lib/pinSession'
import type { Entity as DbEntity, BusinessOwner } from '@/lib/types'

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  llc: { icon: Building2, color: '#f59e0b', label: 'LLC' },
  corp: { icon: Building2, color: '#f59e0b', label: 'Corporation' },
  trust: { icon: Shield, color: '#d4a84b', label: 'Trust' },
  dba: { icon: Briefcase, color: '#f59e0b', label: 'DBA' },
  shelf_corp: { icon: Archive, color: '#ec4899', label: 'Shelf Corp' },
  personal: { icon: User, color: '#22c55e', label: 'Personal' },
}

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'rgba(34,197,94,0.1)', text: '#22c55e', dot: '#22c55e' },
  pending: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', dot: '#f59e0b' },
  dissolved: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', dot: '#ef4444' },
  in_progress: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', dot: '#f59e0b' },
}

export default function ListPage() {
  const [entities, setEntities] = useState<DbEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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
        setEntities(entitiesJson.data || [])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = entities.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.legal_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.type.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: '#94a3b8' }}>Loading entities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>All Entities</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search entities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg text-sm outline-none w-64"
            style={{ background: '#1e293b', border: '1px solid #1e3a5f', color: '#f1f5f9' }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(entity => {
          const config = TYPE_CONFIG[entity.type] || TYPE_CONFIG.llc
          const status = STATUS_STYLE[entity.status] || STATUS_STYLE.active
          const Icon = config.icon
          return (
            <div
              key={entity.id}
              className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.005] cursor-pointer group"
              style={{
                background: '#111827',
                border: '1px solid #1e3a5f',
              }}
              onClick={() => window.location.href = '/dashboard'}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${config.color}22, ${config.color}44)`,
                  border: `1px solid ${config.color}55`,
                }}
              >
                <Icon className="w-5 h-5" style={{ color: config.color }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#f1f5f9' }}>
                  {entity.name}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs" style={{ color: '#64748b' }}>{config.label}</span>
                  {entity.jurisdiction && (
                    <span className="text-xs" style={{ color: '#475569' }}>{entity.jurisdiction}</span>
                  )}
                  {entity.formation_date && (
                    <span className="text-xs" style={{ color: '#475569' }}>
                      Est. {new Date(entity.formation_date).getFullYear()}
                    </span>
                  )}
                </div>
              </div>

              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: status.bg }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
                <span className="text-xs font-medium capitalize" style={{ color: status.text }}>
                  {entity.status}
                </span>
              </div>

              <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: '#475569' }} />
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: '#64748b' }}>
              {search ? 'No entities match your search.' : 'No entities found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
