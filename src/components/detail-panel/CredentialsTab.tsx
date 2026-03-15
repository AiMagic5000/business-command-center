'use client'

import { Key } from 'lucide-react'
import CredentialCard from '@/components/ui/CredentialCard'
import type { EntityCredential } from '@/types'

interface CredentialsTabProps {
  credentials: EntityCredential[]
}

async function handleReveal(id: string): Promise<string> {
  const res = await fetch(`/api/credentials/${id}/reveal`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Could not reveal credential')
  const data = await res.json()
  return data.password as string
}

export default function CredentialsTab({ credentials }: CredentialsTabProps) {
  if (credentials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: '#1e293b', border: '1px solid #1e3a5f' }}
        >
          <Key className="w-6 h-6" style={{ color: '#94a3b8' }} />
        </div>
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          No credentials saved for this entity yet.
        </p>
      </div>
    )
  }

  // Group by category
  const grouped = credentials.reduce<Record<string, EntityCredential[]>>((acc, cred) => {
    const key = cred.category
    if (!acc[key]) acc[key] = []
    acc[key].push(cred)
    return acc
  }, {})

  const categoryLabels: Record<string, string> = {
    banking: 'Banking',
    government: 'Government Portals',
    registered_agent: 'Registered Agent',
    legal: 'Legal Services',
    other: 'Other',
  }

  return (
    <div className="space-y-8 pb-6">
      {Object.entries(grouped).map(([category, creds]) => (
        <section key={category}>
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: '#94a3b8' }}
          >
            {categoryLabels[category] ?? category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {creds.map((cred) => (
              <CredentialCard key={cred.id} credential={cred} onReveal={handleReveal} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
