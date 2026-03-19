import PinGuard from '@/components/auth/PinGuard'
import Sidebar from '@/components/ui/Sidebar'
import SearchBar from '@/components/ui/SearchBar'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { Bell } from 'lucide-react'
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

              {/* Notification bell */}
              <button
                className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                {/* Unread dot */}
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ background: 'var(--accent-blue)' }}
                  aria-hidden="true"
                />
              </button>

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
