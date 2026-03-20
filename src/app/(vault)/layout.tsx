import PinGuard from '@/components/auth/PinGuard'
import Sidebar from '@/components/ui/Sidebar'
import SearchBar from '@/components/ui/SearchBar'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { Bell, Mail } from 'lucide-react'
import UserMenu from '@/components/ui/UserMenu'

export default function VaultLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initials = 'U'

  return (
    <PinGuard>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        {/* Left sidebar */}
        <Sidebar />

        {/* Main area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Top bar */}
          <header
            className="flex items-center justify-between px-6 h-16 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-header)' }}
          >
            <div className="flex-1 max-w-lg">
              <SearchBar />
            </div>

            <div className="flex items-center gap-3 ml-4">
              {/* Theme toggle */}
              <ThemeToggle />

              {/* Support contact */}
              <a
                href="mailto:support@startmybusiness.us"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs"
                style={{ color: 'var(--text-tertiary)', border: '1px solid var(--border-primary)' }}
                title="Contact support"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">support@startmybusiness.us</span>
              </a>

              {/* User menu with sign-out */}
              <UserMenu initials={initials} />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-hidden flex flex-col min-h-0">
            {children}
          </main>
        </div>
      </div>
    </PinGuard>
  )
}
