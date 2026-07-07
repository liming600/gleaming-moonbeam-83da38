import { supabase } from '@/supabase/supabaseClient'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar_url: string | null
  bio: string | null
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
              bio: userData.bio
            },
            error: null
          }
        }

        return {
          user: {
            id: data.user.id,
            email: data.user.email || email,
            name,
            avatar_url: null,
            bio: null
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

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
              bio: userData.bio
            },
            error: null
          }
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
            bio: userData.bio
          },
          error: null
        }
      }

      return { user: null, error: new Error('用户不存在') }
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