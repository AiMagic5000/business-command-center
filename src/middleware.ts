import { clerkMiddleware } from '@clerk/nextjs/server'

// Dev keys don't support auth.protect() on custom domains (triggers
// handshake loop). All auth is handled client-side by PinGuard instead.
export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
