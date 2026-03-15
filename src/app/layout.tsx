import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Business Command Center',
  description: 'Your complete business entity management system.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body
          className="antialiased"
          style={{
            background: '#0a0e1a',
            color: '#f1f5f9',
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
          }}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
