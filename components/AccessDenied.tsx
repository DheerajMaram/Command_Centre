'use client'

import { signOut } from '@/lib/auth'
import GhostButton from './ui/GhostButton'

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-xl font-light text-[#cc6666] mb-3">Access Denied</h1>
        <p className="text-[var(--text-muted)] text-sm mb-6">
          Your email address is not authorized to access this application.
        </p>
        <GhostButton onClick={signOut}>Sign Out</GhostButton>
      </div>
    </div>
  )
}
