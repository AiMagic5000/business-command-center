import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function middleware(req: NextRequest) {
  const response = NextResponse.next()

  // Clear any leftover Clerk cookies that cause cached redirects
  const clerkCookies = ['__clerk_db_jwt', '__session', '__client_uat', '__client']
  for (const name of clerkCookies) {
    if (req.cookies.has(name)) {
      response.cookies.delete(name)
    }
  }

  // Prevent browsers from caching redirects (fixes Clerk 301 cache issue)
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')

  return response
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
