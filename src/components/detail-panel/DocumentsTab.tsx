'use client'

import { Download, ExternalLink, FileText, FileSpreadsheet, FileImage, File } from 'lucide-react'
import { motion } from 'framer-motion'
import type { EntityDocument, DocumentCategory } from '@/types'
import { formatDate } from '@/lib/utils'

interface DocumentsTabProps {
  documents: EntityDocument[]
}

function FileIcon({ fileType }: { fileType: EntityDocument['fileType'] }) {
  const props = { className: 'w-5 h-5' }
  if (fileType === 'pdf') return <FileText {...props} style={{ color: '#ef4444' }} />
  if (fileType === 'docx') return <FileText {...props} style={{ color: 'var(--accent-blue)' }} />
  if (fileType === 'xlsx') return <FileSpreadsheet {...props} style={{ color: '#10b981' }} />
  if (fileType === 'jpg' || fileType === 'png') return <FileImage {...props} style={{ color: '#d4a84b' }} />
  return <File {...props} style={{ color: 'var(--text-secondary)' }} />
}

const categoryConfig: Record<DocumentCategory, { label: string; color: string }> = {
  formation: { label: 'Formation', color: '#3b82f6' },
  tax: { label: 'Tax', color: '#f59e0b' },
  compliance: { label: 'Compliance', color: '#10b981' },
  contract: { label: 'Contract', color: '#a78bfa' },
  banking: { label: 'Banking', color: '#10b981' },
  insurance: { label: 'Insurance', color: '#d4a84b' },
  other: { label: 'Other', color: '#94a3b8' },
}

export default function DocumentsTab({ documents }: DocumentsTabProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
        >
          <FileText className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          No documents uploaded for this entity yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 pb-6">
      {documents.map((doc, idx) => {
        const catConfig = categoryConfig[doc.category] ?? categoryConfig.other
        return (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
          >
            {/* File icon */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <FileIcon fileType={doc.fileType} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {doc.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: `${catConfig.color}1a`,
                    color: catConfig.color,
                  }}
                >
                  {catConfig.label}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {formatDate(doc.uploadedAt)}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {doc.fileSizeKb < 1024
                    ? `${doc.fileSizeKb} KB`
                    : `${(doc.fileSizeKb / 1024).toFixed(1)} MB`}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg transition-colors hover:bg-white/5"
                aria-label={`View ${doc.name}`}
              >
                <ExternalLink className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              </a>
              <a
                href={doc.fileUrl}
                download={doc.name}
                className="p-2 rounded-lg transition-colors hover:bg-white/5"
                aria-label={`Download ${doc.name}`}
              >
                <Download className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
              </a>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
