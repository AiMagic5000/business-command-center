'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Network,
  List,
  Clock,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  viewMode: string
}

const navItems: NavItem[] = [
  {
    label: 'Graph View',
    href: '/dashboard',
    icon: <Network className="w-5 h-5" />,
    viewMode: 'dashboard',
  },
  {
    label: 'List View',
    href: '/list',
    icon: <List className="w-5 h-5" />,
    viewMode: 'list',
  },
  {
    label: 'Timeline',
    href: '/timeline',
    icon: <Clock className="w-5 h-5" />,
    viewMode: 'timeline',
  },
  {
    label: 'Documents',
    href: '/documents',
    icon: <FileText className="w-5 h-5" />,
    viewMode: 'documents',
  },
]

const owners = [{ id: '1', name: 'Derrick Williams', initials: 'DW' }]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [ownerDropdownOpen, setOwnerDropdownOpen] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState(owners[0])
  const pathname = usePathname()

  const sidebarWidth = collapsed ? 64 : 260

  return (
    <motion.aside
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col h-full flex-shrink-0 overflow-hidden"
      style={{
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-primary)',
        minHeight: '100vh',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 h-16 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)' }}
        >
          <Building2 className="w-4 h-4" style={{ color: '#d4a84b' }} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <span className="font-bold text-base tracking-tight whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                BCC
              </span>
              <span className="text-xs block whitespace-nowrap" style={{ color: 'var(--accent-gold)' }}>
                Command Center
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Owner selector */}
      <div className="px-3 py-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <button
          onClick={() => !collapsed && setOwnerDropdownOpen((v) => !v)}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          aria-label="Select owner"
          aria-expanded={ownerDropdownOpen}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{ background: 'var(--accent-blue-bg)', color: 'var(--accent-gold)' }}
          >
            {selectedOwner.initials}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0 flex items-center justify-between"
              >
                <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {selectedOwner.name}
                </span>
                <ChevronDown
                  className={`w-4 h-4 flex-shrink-0 transition-transform ${ownerDropdownOpen ? 'rotate-180' : ''}`}
                  style={{ color: 'var(--text-tertiary)' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence>
          {ownerDropdownOpen && !collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-1"
            >
              {owners.map((owner) => (
                <button
                  key={owner.id}
                  onClick={() => {
                    setSelectedOwner(owner)
                    setOwnerDropdownOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5 text-left"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'var(--accent-blue-bg)', color: 'var(--accent-gold)' }}
                  >
                    {owner.initials}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {owner.name}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.viewMode === 'dashboard' && pathname === '/')
          return (
            <Link
              key={item.viewMode}
              href={item.href}
              className="flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors relative group"
              style={{
                background: isActive ? 'var(--accent-blue-bg)' : 'transparent',
                color: isActive ? 'var(--accent-blue)' : 'var(--text-tertiary)',
              }}
              title={collapsed ? item.label : undefined}
            >
              {/* Active left border */}
              {isActive && (
                <div
                  className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full"
                  style={{ background: 'var(--accent-blue)' }}
                />
              )}
              <span className="flex-shrink-0 pl-1">{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      {/* Bottom: Settings + collapse */}
      <div className="px-3 pb-4 flex flex-col gap-1" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <div className="pt-3">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0 pl-0" style={{ marginLeft: '4px' }} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex items-center justify-center w-full py-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: 'var(--text-tertiary)' }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  )
}
