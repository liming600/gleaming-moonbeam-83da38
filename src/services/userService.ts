import { supabase } from '@/supabase/supabaseClient'
import { executeSingleQuery } from '@/utils/supabaseQuery'

export interface User {
  id: string
  email: string
  name: string
  avatar_url: string | null
  bio: string | null
  posts_count: number
  followers_count: number
  following_count: number
  pets_count: number
  created_at: string
}

export const userService = {
  async getUserById(userId: string): Promise<{ user: User | null; error: Error | null }> {
    const { data, error } = await executeSingleQuery<User>(
      supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
    )

    if (error) {
      return { user: null, error }
    }

    return { user: data, error: null }
  },

  async getUserStats(userId: string): Promise<{ 
    following: number 
    followers: number 
    pets: number 
    error: Error | null 
  }> {
    try {
      const [petsRes, followersCountRes, followingCountRes] = await Promise.all([
        supabase.from('pets').select('id', { count: 'exact' }).eq('owner_id', userId),
        supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', userId),
        supabase.from('follows').select('id', { count: 'exact' }).eq('follower_id', userId)
      ])

      return {
        following: followingCountRes.count || 0,
        followers: followersCountRes.count || 0,
        pets: petsRes.count || 0,
        error: null
      }
    } catch (error) {
      return { following: 0, followers: 0, pets: 0, error: error as Error }
    }
  }
}