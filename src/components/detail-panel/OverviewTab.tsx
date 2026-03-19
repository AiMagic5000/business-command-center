'use client'

import { useState } from 'react'
import { Eye, EyeOff, MapPin, User, Calendar, Briefcase } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import type { Entity } from '@/types'
import { entityTypeLabel, formatDate, maskEIN } from '@/lib/utils'

interface OverviewTabProps {
  entity: Entity
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
        {value}
      </span>
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-xs font-semibold uppercase tracking-wider mb-3"
      style={{ color: 'var(--text-secondary)' }}
    >
      {children}
    </h3>
  )
}

export default function OverviewTab({ entity }: OverviewTabProps) {
  const [einVisible, setEinVisible] = useState(false)

  return (
    <div className="space-y-8 pb-6">
      {/* Basic info grid */}
      <section>
        <SectionHeader>Basic Information</SectionHeader>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <InfoRow label="Display Name" value={entity.name} />
          <InfoRow label="Legal Name" value={entity.legalName} />
          <InfoRow label="Entity Type" value={entityTypeLabel(entity.type)} />
          <InfoRow label="Status" value={<StatusBadge status={entity.status} />} />
          <InfoRow label="Jurisdiction" value={entity.jurisdiction} />
          <InfoRow label="State of Operation" value={entity.state} />
          {entity.formationDate && (
            <InfoRow
              label="Formation Date"
              value={
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                  {formatDate(entity.formationDate)}
                </span>
              }
            />
          )}
          {entity.industry && (
            <InfoRow
              label="Industry"
              value={
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                  {entity.industry}
                </span>
              }
            />
          )}
        </div>
      </section>

      {/* EIN */}
      {entity.ein && (
        <section>
          <SectionHeader>Tax Information</SectionHeader>
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                EIN (Employer ID Number)
              </span>
              <span className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
                {einVisible ? entity.ein : maskEIN(entity.ein)}
              </span>
            </div>
            <button
              onClick={() => setEinVisible((v) => !v)}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
              aria-label={einVisible ? 'Hide EIN' : 'Show full EIN'}
            >
              {einVisible ? (
                <EyeOff className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
              ) : (
                <Eye className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              )}
            </button>
          </div>
        </section>
      )}

      {/* Description */}
      {entity.description && (
        <section>
          <SectionHeader>Description</SectionHeader>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {entity.description}
          </p>
        </section>
      )}

      {/* Addresses */}
      {entity.addresses.length > 0 && (
        <section>
          <SectionHeader>Addresses</SectionHeader>
          <div className="flex flex-col gap-3">
            {entity.addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex gap-3 p-3 rounded-lg"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
              >
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-blue)' }} />
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--accent-gold)' }}>
                    {addr.label}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {addr.street1}
                    {addr.street2 ? `, ${addr.street2}` : ''}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {addr.city}, {addr.state} {addr.zip}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {addr.country}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contacts */}
      {entity.contacts.length > 0 && (
        <section>
          <SectionHeader>Contacts</SectionHeader>
          <div className="flex flex-col gap-3">
            {entity.contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex gap-3 p-3 rounded-lg"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--accent-blue-bg)' }}
                >
                  <User className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {contact.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--accent-gold)' }}>
                    {contact.role}
                  </p>
                  {contact.email && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {contact.email}
                    </p>
                  )}
                  {contact.phone && (
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {contact.phone}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
