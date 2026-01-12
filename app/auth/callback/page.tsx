'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Supabase automatically handles the code exchange via getSession()
      // Wait a moment for the session to be established
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
      } else {
        // If no session after a delay, redirect anyway (will show sign-in)
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="text-[var(--text-muted)] text-sm">Completing sign in...</div>
    </div>
  )
}
