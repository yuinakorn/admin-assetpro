import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

// Import User type from database types
import type { User as DatabaseUser } from '@/types/database'

// Define a more specific type for the user data passed during sign up
interface SignUpUserData {
  first_name: string;
  last_name: string;
  username: string;
  role: 'admin' | 'manager' | 'user';
}

// Define the shape of the Auth context
interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: DatabaseUser | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, userData: SignUpUserData) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

// Create the context with an undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Custom hook to use the Auth context, ensures it's used within a provider
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// The provider component that wraps the app and provides auth functionality
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<DatabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Function to fetch user profile from users table
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId)
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }
      
      console.log('User profile fetched:', profile)
      return profile
    } catch (err) {
      console.error('Error fetching user profile:', err)
      return null
    }
  }, [])

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...')
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Session:', session)
        setSession(session)
        setUser(session?.user ?? null)
        
        // Fetch user profile if user exists
        if (session?.user) {
          console.log('User exists, fetching profile...')
          const profile = await fetchUserProfile(session.user.id)
          setUserProfile(profile)
        } else {
          setUserProfile(null)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setLoading(false)
      }
    }
    
    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session)
      setSession(session)
      setUser(session?.user ?? null)
      
      // Fetch user profile when auth state changes
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUserProfile])

  const signIn = useCallback(async (username: string, password: string): Promise<{ error: Error | null }> => {
    try {
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
    } catch (err) {
      const error = err as AuthError
      console.error('Sign in error:', error)
      return { error: new Error(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ') }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, userData: SignUpUserData): Promise<{ error: AuthError | null }> => {
    try {
      const { data: existingUsername } = await supabase
        .from('users')
        .select('username')
        .eq('username', userData.username)
        .single()

      if (existingUsername) {
        return { error: new AuthError('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว') }
      }
      
      const { data, error } = await supabase.auth.signUp({
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

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (err) {
       const error = err as AuthError
      console.error('Sign up error:', error)
      return { error: new AuthError(error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก') }
    }
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
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
