'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Building2, FileText, Key, ArrowRight } from 'lucide-react'

interface SearchResult {
  id: string
  type: 'entity' | 'document' | 'credential'
  title: string
  subtitle: string
}

// Placeholder results - replace with real API call
const MOCK_RESULTS: SearchResult[] = [
  { id: '1', type: 'entity', title: 'Derrick Holdings LLC', subtitle: 'Wyoming LLC - Active' },
  { id: '2', type: 'entity', title: 'Williams Family Trust', subtitle: 'Revocable Trust - Active' },
  { id: '3', type: 'document', title: 'Operating Agreement 2024', subtitle: 'Formation Document' },
  { id: '4', type: 'credential', title: 'Bank of America - Business', subtitle: 'Banking Credential' },
]

const typeIcon = (type: SearchResult['type']) => {
  if (type === 'entity') return <Building2 className="w-4 h-4" style={{ color: '#3b82f6' }} />
  if (type === 'document') return <FileText className="w-4 h-4" style={{ color: '#d4a84b' }} />
  return <Key className="w-4 h-4" style={{ color: '#10b981' }} />
}

const typeLabel = (type: SearchResult['type']) => {
  if (type === 'entity') return 'Entity'
  if (type === 'document') return 'Document'
  return 'Credential'
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Click outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Filter results
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setActiveIndex(-1)
      return
    }
    const lower = query.toLowerCase()
    const filtered = MOCK_RESULTS.filter(
      (r) =>
        r.title.toLowerCase().includes(lower) ||
        r.subtitle.toLowerCase().includes(lower)
    )
    setResults(filtered)
    setActiveIndex(-1)
  }, [query])

  const handleKeyNav = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, -1))
      }
      if (e.key === 'Enter' && activeIndex >= 0) {
        // Navigate to result - placeholder
        setOpen(false)
        setQuery('')
      }
    },
    [results.length, activeIndex]
  )

  const handleClear = () => {
    setQuery('')
    setResults([])
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div
        className="flex items-center gap-2 px-3 rounded-lg h-9 transition-all"
        style={{
          background: '#1e293b',
          border: `1px solid ${open ? '#3b82f6' : '#1e3a5f'}`,
        }}
      >
        <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#94a3b8' }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyNav}
          placeholder="Search entities, credentials, documents..."
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-sm"
          style={{ color: '#f1f5f9' }}
          aria-label="Search"
          aria-expanded={open && results.length > 0}
          aria-haspopup="listbox"
          role="combobox"
          aria-autocomplete="list"
        />
        <div className="flex items-center gap-2">
          {query && (
            <button onClick={handleClear} aria-label="Clear search">
              <X className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
            </button>
          )}
          <kbd
            className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs"
            style={{
              background: '#0a0e1a',
              color: '#94a3b8',
              border: '1px solid #1e3a5f',
              fontFamily: 'monospace',
            }}
          >
            <span>⌘K</span>
          </kbd>
        </div>
      </div>

      {/* Dropdown results */}
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 rounded-xl overflow-hidden z-50 shadow-2xl"
            style={{
              background: '#1e293b',
              border: '1px solid #1e3a5f',
            }}
            role="listbox"
          >
            {results.map((result, idx) => (
              <button
                key={result.id}
                onClick={() => {
                  setOpen(false)
                  setQuery('')
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{
                  background: idx === activeIndex ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  borderBottom: idx < results.length - 1 ? '1px solid #1e3a5f' : 'none',
                }}
                role="option"
                aria-selected={idx === activeIndex}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: '#0a0e1a' }}
                >
                  {typeIcon(result.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#f1f5f9' }}>
                    {result.title}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#94a3b8' }}>
                    {typeLabel(result.type)} &middot; {result.subtitle}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: '#94a3b8' }} />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
