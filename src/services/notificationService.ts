import { supabase } from '@/supabase/supabaseClient'

export interface Notification {
  id: string
  user_id: string
  type: string
  related_id: string | null
  read: boolean
  created_at: string
  actor?: any
}

export const notificationService = {
  async getNotifications(userId: string): Promise<{ notifications: Notification[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        return { notifications: [], error }
      }

      return { notifications: data || [], error: null }
    } catch (error) {
      return { notifications: [], error: error as Error }
    }
  },

  async markAsRead(notificationId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) {
        return { success: false, error }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  },

  async markAllAsRead(userId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        return { success: false, error }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  },

  async getUnreadCount(userId: string): Promise<{ count: number; error: Error | null }> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        return { count: 0, error }
      }

      return { count: typeof count === 'number' ? count : 0, error: null }
    } catch (error) {
      return { count: 0, error: error as Error }
    }
  },

  async createNotification(userId: string, type: string, relatedId: string | null): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          related_id: relatedId
        })

      if (error) {
        return { success: false, error }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  }
}