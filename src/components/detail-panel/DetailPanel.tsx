'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, GripHorizontal } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import OverviewTab from './OverviewTab'
import CredentialsTab from './CredentialsTab'
import DocumentsTab from './DocumentsTab'
import CommunicationsTab from './CommunicationsTab'
import PaymentsTab from './PaymentsTab'
import ComplianceTab from './ComplianceTab'
import HelpTab from './HelpTab'
import type {
  Entity,
  DetailTab,
  EntityCredential,
  EntityDocument,
  Communication,
  Payment,
  ComplianceEvent,
} from '@/types'
import { entityTypeLabel } from '@/lib/utils'

interface DetailPanelProps {
  selectedEntity: Entity | null
  credentials: EntityCredential[]
  documents: EntityDocument[]
  communications: Communication[]
  payments: Payment[]
  complianceEvents: ComplianceEvent[]
  onClose: () => void
}

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'credentials', label: 'Credentials' },
  { id: 'documents', label: 'Documents' },
  { id: 'communications', label: 'Communications' },
  { id: 'payments', label: 'Payments' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'help', label: 'Help' },
]

const DEFAULT_HEIGHT_VH = 40
const MIN_HEIGHT_PX = 200
const MAX_HEIGHT_VH = 80

export default function DetailPanel({
  selectedEntity,
  credentials,
  documents,
  communications,
  payments,
  complianceEvents,
  onClose,
}: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview')
  const [panelHeightPx, setPanelHeightPx] = useState<number | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef<number | null>(null)
  const dragStartHeight = useRef<number>(0)

  // Reset tab when entity changes
  useEffect(() => {
    setActiveTab('overview')
    setPanelHeightPx(null)
  }, [selectedEntity?.id])

  const resolvedHeight = panelHeightPx ?? `${DEFAULT_HEIGHT_VH}vh`

  // Drag to resize
  const handleDragStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    dragStartY.current = e.clientY
    dragStartHeight.current = panelRef.current?.offsetHeight ?? 0
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (dragStartY.current === null) return
      const delta = dragStartY.current - e.clientY
      const newHeight = Math.min(
        Math.max(dragStartHeight.current + delta, MIN_HEIGHT_PX),
        (window.innerHeight * MAX_HEIGHT_VH) / 100
      )
      setPanelHeightPx(newHeight)
    }

    const handlePointerUp = () => {
      dragStartY.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  const renderTabContent = () => {
    if (!selectedEntity) return null
    switch (activeTab) {
      case 'overview':
        return <OverviewTab entity={selectedEntity} />
      case 'credentials':
        return <CredentialsTab credentials={credentials} />
      case 'documents':
        return <DocumentsTab documents={documents} />
      case 'communications':
        return <CommunicationsTab communications={communications} />
      case 'payments':
        return <PaymentsTab payments={payments} />
      case 'compliance':
        return <ComplianceTab events={complianceEvents} />
      case 'help':
        return <HelpTab entityType={selectedEntity.type} />
    }
  }

  return (
    <AnimatePresence>
      {selectedEntity && (
        <motion.div
          ref={panelRef}
          key={selectedEntity.id}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="flex flex-col flex-shrink-0"
          style={{
            height: resolvedHeight,
            background: '#111827',
            borderTop: '1px solid #1e3a5f',
          }}
          role="complementary"
          aria-label={`Details for ${selectedEntity.name}`}
        >
          {/* Drag handle */}
          <div
            onPointerDown={handleDragStart}
            className="flex items-center justify-center h-5 cursor-row-resize flex-shrink-0 hover:bg-white/5 transition-colors"
            aria-label="Drag to resize panel"
            role="separator"
          >
            <GripHorizontal className="w-5 h-5" style={{ color: '#1e3a5f' }} />
          </div>

          {/* Panel header */}
          <div
            className="flex items-center gap-4 px-6 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid #1e3a5f' }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h2 className="text-base font-semibold truncate" style={{ color: '#f1f5f9' }}>
                {selectedEntity.name}
              </h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #1e3a5f' }}
              >
                {entityTypeLabel(selectedEntity.type)}
              </span>
              <StatusBadge status={selectedEntity.status} />
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-white/5 flex-shrink-0"
              aria-label="Close detail panel"
            >
              <X className="w-4 h-4" style={{ color: '#94a3b8' }} />
            </button>
          </div>

          {/* Tab bar */}
          <div
            className="flex items-center gap-1 px-6 flex-shrink-0 overflow-x-auto"
            style={{ borderBottom: '1px solid #1e3a5f' }}
            role="tablist"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tab-panel-${tab.id}`}
                className="relative px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0"
                style={{
                  color: activeTab === tab.id ? '#f1f5f9' : '#94a3b8',
                }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: '#3b82f6' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div
            id={`tab-panel-${activeTab}`}
            role="tabpanel"
            className="flex-1 overflow-y-auto px-6 pt-5"
            style={{ minHeight: 0 }}
          >
            {renderTabContent()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
