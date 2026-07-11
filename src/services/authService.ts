import { supabase, supabaseUrl } from '@/supabase/supabaseClient'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar_url: string | null
  bio: string | null
  gender: string | null
  age: string | null
}

export const authService = {
  async signUp(email: string, password: string, name: string): Promise<{ user: AuthUser | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      })

      if (error) {
        return { user: null, error }
      }

      if (data.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (userData) {
          return {
            user: {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              avatar_url: userData.avatar_url,
              bio: userData.bio,
              gender: userData.gender,
              age: userData.age
            },
            error: null
          }
        }

        // Fallback: auth trigger may not have fired — create users row
        const { error: upsertError } = await supabase.from('users').upsert({
          id: data.user.id,
          email: data.user.email || email,
          name,
          avatar_url: null
        }, { onConflict: 'id' })
        if (upsertError) console.warn('signUp upsert failed:', upsertError.message)

        return {
          user: {
            id: data.user.id,
            email: data.user.email || email,
            name,
            avatar_url: null,
            bio: null,
            gender: null,
            age: null
          },
          error: null
        }
      }

      return { user: null, error: new Error('注册失败') }
    } catch (error) {
      return { user: null, error: error as Error }
    }
  },

  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> {
    try {
      console.log('[Auth SignIn] Attempting login with email:', email)
      console.log('[Auth SignIn] Supabase URL:', supabaseUrl)
      console.log('[Auth SignIn] Supabase Anon Key:', supabaseAnonKey ? 'SET (length: ' + supabaseAnonKey.length + ')' : 'NOT SET')

      try {
        const healthCheck = await fetch(`${supabaseUrl}/health`, { headers: { apikey: supabaseAnonKey } })
        const healthText = await healthCheck.text()
        console.log('[Auth SignIn] Health Check Status:', healthCheck.status, healthCheck.statusText)
        console.log('[Auth SignIn] Health Check Response:', healthText)
      } catch (e) {
        console.error('[Auth SignIn] Health Check Failed:', e)
        console.error('[Auth SignIn] Health Check Error Message:', (e as Error).message)
      }

      try {
        const tokenCheck = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey
          },
          body: JSON.stringify({ email, password })
        })
        const tokenText = await tokenCheck.text()
        console.log('[Auth SignIn] Token Check Status:', tokenCheck.status, tokenCheck.statusText)
        console.log('[Auth SignIn] Token Check Response:', tokenText)
      } catch (e) {
        console.error('[Auth SignIn] Token Check Failed:', e)
        console.error('[Auth SignIn] Token Check Error Message:', (e as Error).message)
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        console.error('[Auth SignIn] Error:', error)
        console.error('[Auth SignIn] Error Code:', (error as any)?.code)
        console.error('[Auth SignIn] Error Details:', (error as any)?.details)
        console.error('[Auth SignIn] Error Cause:', (error as any)?.cause)
        console.error('[Auth SignIn] Error Stack:', (error as any)?.stack)
        return { user: null, error }
      }

      console.log('[Auth SignIn] Success, user data:', data)

      if (data.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (userData) {
          return {
            user: {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              avatar_url: userData.avatar_url,
              bio: userData.bio,
              gender: userData.gender,
              age: userData.age
            },
            error: null
          }
        }

        // Fallback: user row missing from public.users — create it now
        const name = data.user.user_metadata?.name || '用户_' + data.user.id.substring(0, 8)
        const { error: upsertError } = await supabase.from('users').upsert({
          id: data.user.id,
          email: data.user.email,
          name,
          avatar_url: null
        }, { onConflict: 'id' })
        if (upsertError) console.warn('signIn upsert failed:', upsertError.message)

        return {
          user: {
            id: data.user.id,
            email: data.user.email || email,
            name,
            avatar_url: null,
            bio: null,
            gender: null,
            age: null
          },
          error: null
        }
      }

      return { user: null, error: new Error('登录失败') }
    } catch (error) {
      return { user: null, error: error as Error }
    }
  },

  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  },

  async getCurrentUser(): Promise<{ user: AuthUser | null; error: Error | null }> {
    try {
      const { data: authData } = await supabase.auth.getUser()

      if (!authData.user) {
        return { user: null, error: null }
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (error) {
        return { user: null, error }
      }

      if (userData) {
        return {
          user: {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            avatar_url: userData.avatar_url,
            bio: userData.bio,
            gender: userData.gender,
            age: userData.age
          },
          error: null
        }
      }

      // Fallback: user row missing from public.users — create it now
      const name = authData.user.user_metadata?.name || '用户_' + authData.user.id.substring(0, 8)
      const { error: upsertError } = await supabase.from('users').upsert({
        id: authData.user.id,
        email: authData.user.email,
        name,
        avatar_url: null
      }, { onConflict: 'id' })
      if (upsertError) console.warn('getCurrentUser upsert failed:', upsertError.message)

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email || '',
          name,
          avatar_url: null,
          bio: null,
          gender: null,
          age: null
        },
        error: null
      }
    } catch (error) {
      return { user: null, error: error as Error }
    }
  },

  async updateUserProfile(user: Partial<AuthUser>): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.from('users').update(user).eq('id', user.id)
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  },

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }
}