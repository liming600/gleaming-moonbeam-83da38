import { supabase } from '@/supabase/supabaseClient'

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export const followService = {
  async follow(userId: string, targetUserId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: userId,
          following_id: targetUserId
        })

      if (error) {
        return { success: false, error }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  },

  async unfollow(userId: string, targetUserId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', userId)
        .eq('following_id', targetUserId)

      if (error) {
        return { success: false, error }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  },

  async isFollowing(userId: string, targetUserId: string): Promise<{ following: boolean; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', userId)
        .eq('following_id', targetUserId)
        .limit(1)

      if (error) {
        return { following: false, error }
      }

      return { following: (data?.length || 0) > 0, error: null }
    } catch (error) {
      return { following: false, error: error as Error }
    }
  },

  async getFollowers(userId: string): Promise<{ followers: any[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('follower_id, users!inner(*)')
        .eq('following_id', userId)

      if (error) {
        return { followers: [], error }
      }

      return { followers: data || [], error: null }
    } catch (error) {
      return { followers: [], error: error as Error }
    }
  },

  async getFollowing(userId: string): Promise<{ following: any[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id, users!inner(*)')
        .eq('follower_id', userId)

      if (error) {
        return { following: [], error }
      }

      return { following: data || [], error: null }
    } catch (error) {
      return { following: [], error: error as Error }
    }
  },

  async getFollowerCount(userId: string): Promise<{ count: number; error: Error | null }> {
    try {
      const { count, error } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', userId)

      if (error) {
        return { count: 0, error }
      }

      return { count: typeof count === 'number' ? count : 0, error: null }
    } catch (error) {
      return { count: 0, error: error as Error }
    }
  },

  async getFollowingCount(userId: string): Promise<{ count: number; error: Error | null }> {
    try {
      const { count, error } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', userId)

      if (error) {
        return { count: 0, error }
      }

      return { count: typeof count === 'number' ? count : 0, error: null }
    } catch (error) {
      return { count: 0, error: error as Error }
    }
  }
}