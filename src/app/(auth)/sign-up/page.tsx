import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#0a0e1a' }}
    >
      {/* Brand header */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)' }}
        >
          <span className="text-lg font-bold" style={{ color: '#d4a84b' }}>
            BCC
          </span>
        </div>
        <h1 className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>
          Business Command Center
        </h1>
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Create your account to get started
        </p>
      </div>

      <SignUp
        appearance={{
          variables: {
            colorBackground: '#111827',
            colorText: '#f1f5f9',
            colorTextSecondary: '#94a3b8',
            colorInputBackground: '#1e293b',
            colorInputText: '#f1f5f9',
            colorPrimary: '#3b82f6',
            borderRadius: '0.75rem',
          },
          elements: {
            card: {
              boxShadow: 'none',
              border: '1px solid #1e3a5f',
            },
          },
        }}
        forceRedirectUrl="/vault/dashboard"
      />
    </div>
  )
}
