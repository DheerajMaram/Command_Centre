import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { checkEmailAccess, signOut } from '@/lib/auth'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUser(session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        handleUser(session.user)
      } else {
        setUser(null)
        setLoading(false)
        setAccessDenied(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function handleUser(user: User) {
    const hasAccess = await checkEmailAccess(user.email)
    
    if (!hasAccess) {
      setAccessDenied(true)
      setUser(null)
      await signOut()
      setLoading(false)
      return
    }

    setUser(user)
    setAccessDenied(false)
    setLoading(false)
  }

  return { user, loading, accessDenied }
}
