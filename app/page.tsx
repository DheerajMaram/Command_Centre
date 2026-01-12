'use client'

import { useAuth } from '@/hooks/useAuth'
import { signInWithGoogle } from '@/lib/auth'
import Dashboard from '@/components/Dashboard'
import AccessDenied from '@/components/AccessDenied'

export default function Home() {
  const { user, loading, accessDenied } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-[var(--text-muted)] text-sm">Loading...</div>
      </div>
    )
  }

  if (accessDenied) {
    return <AccessDenied />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-light text-[var(--text)] mb-6">Command Center</h1>
          <button
            onClick={signInWithGoogle}
            className="px-4 py-2 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--border-hover)] transition-colors text-sm"
            style={{ borderRadius: '4px' }}
          >
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  return <Dashboard />
}
