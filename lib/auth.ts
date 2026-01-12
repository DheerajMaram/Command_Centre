import { supabase } from './supabase'

// Set this to your allowed email address
export const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ALLOWED_EMAIL || ''

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) {
    console.error('Error signing in:', error.message)
    throw error
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error.message)
    throw error
  }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error.message)
    return null
  }
  return user
}

export async function checkEmailAccess(email: string | undefined): Promise<boolean> {
  if (!ALLOWED_EMAIL) {
    console.warn('ALLOWED_EMAIL not set - allowing all authenticated users')
    return true
  }
  return email === ALLOWED_EMAIL
}
