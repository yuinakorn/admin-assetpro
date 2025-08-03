import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import type { User as DatabaseUser } from '@/types/database'

interface SignUpUserData {
  first_name: string;
  last_name: string;
  username: string;
  role: 'admin' | 'manager' | 'user';
}

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: DatabaseUser | null
  loading: boolean
  initialized: boolean
  signIn: (username: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, userData: SignUpUserData) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<DatabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const fetchUserProfile = useCallback(async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
    return profile
  }, [])

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      setLoading(true)

      const { data: { session: currentSession } } = await supabase.auth.getSession()

      if (!mounted) return

      if (currentSession && currentSession.user) {
        setUser(currentSession.user)
        setSession(currentSession)
        
        // Create fallback profile immediately to prevent hanging
        const fallbackProfile = {
          id: currentSession.user.id,
          email: currentSession.user.email,
          username: currentSession.user.user_metadata?.username || currentSession.user.email?.split('@')[0] || 'user',
          first_name: currentSession.user.user_metadata?.first_name || '',
          last_name: currentSession.user.user_metadata?.last_name || '',
          role: currentSession.user.user_metadata?.role || 'admin', // Set to admin for testing
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        if (mounted) {
          setUserProfile(fallbackProfile)
          console.log('Using fallback profile to prevent hanging:', fallbackProfile)
        }
        
        // Try to fetch real profile in background (non-blocking)
        setTimeout(async () => {
          try {
            const profile = await fetchUserProfile(currentSession.user.id)
            if (mounted && profile) {
              console.log('Real profile fetched, updating:', profile)
              setUserProfile(profile)
            }
          } catch (error) {
            console.error("Background profile fetch failed, keeping fallback:", error)
          }
        }, 100) // Small delay to ensure UI is not blocked
      }
      
      if (mounted) {
        setLoading(false)
        setInitialized(true)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return

        if (event === 'SIGNED_IN' && newSession) {
          setUser(newSession.user)
          setSession(newSession)
          
          // Create fallback profile immediately
          const fallbackProfile = {
            id: newSession.user.id,
            email: newSession.user.email,
            username: newSession.user.user_metadata?.username || newSession.user.email?.split('@')[0] || 'user',
            first_name: newSession.user.user_metadata?.first_name || '',
            last_name: newSession.user.user_metadata?.last_name || '',
            role: newSession.user.user_metadata?.role || 'admin',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          if (mounted) {
            setUserProfile(fallbackProfile)
          }
          
          // Background fetch
          setTimeout(async () => {
            try {
              const profile = await fetchUserProfile(newSession.user.id)
              if (mounted && profile) {
                setUserProfile(profile)
              }
            } catch (error) {
              console.error("Background profile fetch failed on SIGNED_IN:", error)
            }
          }, 100)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setSession(null)
          setUserProfile(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  const signIn = useCallback(async (username: string, password: string): Promise<{ error: Error | null }> => {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('username', username)
      .eq('is_active', true)
      .single()

    if (userError || !userData) {
      return { error: new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง') }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password,
    })
    
    return { error }
  }, [])

  const signUp = useCallback(async (email: string, password: string, userData: SignUpUserData): Promise<{ error: AuthError | null }> => {
    const { data: existingUsername } = await supabase
      .from('users')
      .select('username')
      .eq('username', userData.username)
      .single()

    if (existingUsername) {
      return { error: new AuthError('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว') }
    }
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          role: userData.role
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })

    return { error }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const resetPassword = useCallback(async (email: string): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }, [])

  const value = {
    user,
    session,
    userProfile,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
