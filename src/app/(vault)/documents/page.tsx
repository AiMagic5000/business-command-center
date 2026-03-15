'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Search, Folder, File } from 'lucide-react'
import { clearPinSession } from '@/lib/pinSession'
import type { BusinessOwner } from '@/lib/types'

interface DocItem {
  id: string
  name: string
  category: string
  entityName: string
  filePath: string
  fileSize: number
  uploadedAt: string
}

const CATEGORY_COLORS: Record<string, string> = {
  articles: '#3b82f6',
  ein: '#10b981',
  ra: '#f59e0b',
  operating_agreement: '#8b5cf6',
  press_release: '#ec4899',
  other: '#64748b',
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

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

        const docs: DocItem[] = []
        for (const entity of entities) {
          for (const doc of (entity.documents || [])) {
            docs.push({
              id: doc.id,
              name: doc.name,
              category: doc.category,
              entityName: entity.name,
              filePath: doc.file_path,
              fileSize: doc.file_size || 0,
              uploadedAt: doc.uploaded_at,
            })
          }
        }
        docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
        setDocuments(docs)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const categories = ['all', ...Array.from(new Set(documents.map(d => d.category)))]
  const filtered = documents.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.entityName.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || d.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: '#94a3b8' }}>Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Folder className="w-6 h-6" style={{ color: '#3b82f6' }} />
          <h1 className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>Documents</h1>
          <span className="text-sm px-2.5 py-0.5 rounded-full"
            style={{ background: '#1e293b', color: '#64748b', border: '1px solid #1e3a5f' }}>
            {documents.length}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg text-sm outline-none w-64"
            style={{ background: '#1e293b', border: '1px solid #1e3a5f', color: '#f1f5f9' }}
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className="text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
            style={{
              background: categoryFilter === cat ? '#3b82f6' : '#1e293b',
              color: categoryFilter === cat ? '#fff' : '#94a3b8',
              border: `1px solid ${categoryFilter === cat ? '#3b82f6' : '#1e3a5f'}`,
            }}
          >
            {cat === 'all' ? 'All' : cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Document grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: '#1e3a5f' }} />
          <p className="text-sm" style={{ color: '#64748b' }}>
            {search || categoryFilter !== 'all' ? 'No documents match your filters.' : 'No documents uploaded yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => {
            const catColor = CATEGORY_COLORS[doc.category] || '#64748b'
            return (
              <div
                key={doc.id}
                className="rounded-xl p-4 transition-all hover:scale-[1.01] cursor-pointer group"
                style={{ background: '#111827', border: '1px solid #1e3a5f' }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${catColor}15`, border: `1px solid ${catColor}33` }}
                  >
                    <File className="w-5 h-5" style={{ color: catColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#f1f5f9' }}>
                      {doc.name}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#64748b' }}>
                      {doc.entityName}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full capitalize"
                        style={{ background: `${catColor}15`, color: catColor, border: `1px solid ${catColor}33` }}
                      >
                        {doc.category.replace(/_/g, ' ')}
                      </span>
                      {doc.fileSize > 0 && (
                        <span className="text-[10px]" style={{ color: '#475569' }}>
                          {Math.round(doc.fileSize / 1024)} KB
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/5"
                    title="Download"
                  >
                    <Download className="w-4 h-4" style={{ color: '#94a3b8' }} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
