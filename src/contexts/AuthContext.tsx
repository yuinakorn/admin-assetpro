import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<{ error: any }>
  signUp: (username: string, email: string, password: string, userData: any) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (username: string, password: string) => {
    try {
      // First, get the email from username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('username', username)
        .eq('is_active', true)
        .single()

      if (userError || !userData) {
        return { error: { message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' } }
      }

      // Then sign in with email
      const { error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password,
      })
      return { error }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: { message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' } }
    }
  }

  const signUp = async (username: string, email: string, password: string, userData: any) => {
    try {
      console.log('Starting signup process...', { username, email })
      
      // Check if username already exists
      const { data: existingUsername, error: checkUsernameError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single()

      if (existingUsername) {
        console.log('Username already exists:', username)
        return { error: { message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' } }
      }

      // Check if email already exists
      const { data: existingEmail, error: checkEmailError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single()

      if (existingEmail) {
        console.log('Email already exists:', email)
        return { error: { message: 'อีเมลนี้มีอยู่ในระบบแล้ว' } }
      }

      console.log('Username and email are available, proceeding with auth signup...')

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
            username,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })

      if (error) {
        console.error('Auth signup error:', error)
        return { error }
      }

      console.log('Auth signup successful, user data:', data.user)

      // If signup successful, create user record in users table
      if (data.user) {
        const userRecord = {
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: username,
          email: email,
          password_hash: '', // Empty since we use Supabase Auth
          role: userData.role || 'user',
          department_id: null, // Set to null for new users
          phone: null, // Set to null for new users
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        console.log('Attempting to create user record:', userRecord)

        const { data: insertData, error: insertError } = await supabase
          .from('users')
          .insert(userRecord)
          .select()

        if (insertError) {
          console.error('Error creating user record:', insertError)
          console.error('User record that failed to insert:', userRecord)
          
          // Return error so user knows something went wrong
          return { 
            error: { 
              message: `สมัครสมาชิกสำเร็จ แต่ไม่สามารถสร้างข้อมูลผู้ใช้ได้: ${insertError.message}` 
            } 
          }
        }

        console.log('User record created successfully:', insertData)
      }

      return { error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: { message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' } }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}