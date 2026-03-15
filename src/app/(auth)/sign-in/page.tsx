'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const CLERK_ACCOUNT_PORTAL = 'https://thankful-owl-17.clerk.accounts.dev'

function BCCIcon({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <defs>
        <linearGradient id="shield-grad" x1="0" y1="0" x2="56" y2="56">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="gold-line" x1="0" y1="0" x2="56" y2="0">
          <stop offset="0%" stopColor="#d4a84b" stopOpacity="0" />
          <stop offset="50%" stopColor="#d4a84b" />
          <stop offset="100%" stopColor="#d4a84b" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Shield shape */}
      <path
        d="M28 4L6 14v14c0 12.4 9.4 24 22 28 12.6-4 22-15.6 22-28V14L28 4z"
        fill="url(#shield-grad)"
        opacity="0.9"
      />
      <path
        d="M28 4L6 14v14c0 12.4 9.4 24 22 28 12.6-4 22-15.6 22-28V14L28 4z"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="1"
        opacity="0.6"
      />
      {/* Gold accent line */}
      <line x1="14" y1="30" x2="42" y2="30" stroke="url(#gold-line)" strokeWidth="1.5" filter="url(#glow)" />
      {/* Node graph dots */}
      <circle cx="20" cy="22" r="2.5" fill="#60a5fa" filter="url(#glow)" />
      <circle cx="36" cy="22" r="2.5" fill="#60a5fa" filter="url(#glow)" />
      <circle cx="28" cy="18" r="2" fill="#d4a84b" filter="url(#glow)" />
      <circle cx="22" cy="38" r="2" fill="#60a5fa" opacity="0.7" />
      <circle cx="34" cy="38" r="2" fill="#60a5fa" opacity="0.7" />
      {/* Connection lines */}
      <line x1="20" y1="22" x2="28" y2="18" stroke="#60a5fa" strokeWidth="0.8" opacity="0.5" />
      <line x1="36" y1="22" x2="28" y2="18" stroke="#60a5fa" strokeWidth="0.8" opacity="0.5" />
      <line x1="20" y1="22" x2="22" y2="38" stroke="#60a5fa" strokeWidth="0.6" opacity="0.3" />
      <line x1="36" y1="22" x2="34" y2="38" stroke="#60a5fa" strokeWidth="0.6" opacity="0.3" />
    </svg>
  )
}

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.08 }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: 'gridMove 20s linear infinite',
        }}
      />
    </div>
  )
}

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large blue orb top right */}
      <div
        className="absolute rounded-full"
        style={{
          width: 400, height: 400,
          top: '-10%', right: '-5%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          animation: 'floatOrb 8s ease-in-out infinite',
        }}
      />
      {/* Gold orb bottom left */}
      <div
        className="absolute rounded-full"
        style={{
          width: 300, height: 300,
          bottom: '-5%', left: '-5%',
          background: 'radial-gradient(circle, rgba(212,168,75,0.1) 0%, transparent 70%)',
          animation: 'floatOrb 10s ease-in-out infinite reverse',
        }}
      />
      {/* Small accent orb */}
      <div
        className="absolute rounded-full"
        style={{
          width: 150, height: 150,
          top: '40%', left: '20%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          animation: 'floatOrb 12s ease-in-out infinite',
        }}
      />
    </div>
  )
}

function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = []
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.5 + 0.1,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = window.innerWidth
        if (p.x > window.innerWidth) p.x = 0
        if (p.y < 0) p.y = window.innerHeight
        if (p.y > window.innerHeight) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(96,165,250,${p.a})`
        ctx.fill()
      }

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(59,130,246,${0.08 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn) {
      router.replace('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  const handleSignIn = () => {
    setRedirecting(true)
    const callbackUrl = encodeURIComponent(window.location.origin + '/dashboard')
    window.location.href = `${CLERK_ACCOUNT_PORTAL}/sign-in?redirect_url=${callbackUrl}`
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: '#050a18' }}>
      {/* CSS keyframes */}
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.05); }
        }
        @keyframes scanline {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(59,130,246,0.2), 0 0 60px rgba(59,130,246,0.1); }
          50% { box-shadow: 0 0 30px rgba(59,130,246,0.3), 0 0 80px rgba(59,130,246,0.15); }
        }
      `}</style>

      {/* Background layers */}
      <AnimatedGrid />
      <FloatingOrbs />
      <Particles />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, #050a18 85%)',
        }}
      />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center w-full max-w-md px-8 py-12 mx-4"
        style={{
          background: 'rgba(17, 24, 39, 0.65)',
          backdropFilter: 'blur(24px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
          border: '1px solid rgba(59,130,246,0.15)',
          borderRadius: '1.5rem',
          animation: 'pulseGlow 4s ease-in-out infinite',
        }}
      >
        {/* Scanline effect on card */}
        <div
          className="absolute left-0 right-0 h-[2px] pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.15), transparent)',
            animation: 'scanline 4s linear infinite',
          }}
        />

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-6"
        >
          <BCCIcon size={64} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-2xl font-bold tracking-tight text-center mb-1"
          style={{ color: '#f1f5f9' }}
        >
          Business Command Center
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-sm text-center mb-1"
          style={{ color: '#64748b' }}
        >
          Powered by
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-sm font-semibold text-center mb-8"
          style={{ color: '#d4a84b' }}
        >
          Start My Business Inc.
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="w-full h-[1px] mb-8"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), rgba(212,168,75,0.3), transparent)',
          }}
        />

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-sm text-center mb-8 leading-relaxed"
          style={{ color: '#94a3b8' }}
        >
          Your encrypted business ecosystem. Entities, credentials, documents, and compliance -- all in one secure vault.
        </motion.p>

        {/* Sign In Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(59,130,246,0.4)' }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSignIn}
          disabled={redirecting}
          className="w-full py-3.5 rounded-xl text-base font-semibold transition-all disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #1e3a5f 100%)',
            backgroundSize: '200% 200%',
            color: '#f1f5f9',
            border: '1px solid rgba(59,130,246,0.3)',
          }}
        >
          {redirecting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Redirecting...
            </span>
          ) : (
            'Sign In to Your Vault'
          )}
        </motion.button>

        {/* Security badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.5 }}
          className="flex items-center gap-2 mt-6"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L2 3.5v3.5c0 3.1 2.1 6 5 7 2.9-1 5-3.9 5-7V3.5L7 1z" fill="none" stroke="#10b981" strokeWidth="1.2" />
            <path d="M5 7l1.5 1.5L9 5.5" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs" style={{ color: '#64748b' }}>
            AES-256 encrypted &middot; PIN-protected vault
          </span>
        </motion.div>
      </motion.div>

      {/* Bottom branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-6 text-center"
      >
        <p className="text-xs" style={{ color: '#334155' }}>
          &copy; 2026 Start My Business Inc. All rights reserved.
        </p>
      </motion.div>
    </div>
  )
}
