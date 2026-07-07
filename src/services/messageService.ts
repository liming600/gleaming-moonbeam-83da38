import { supabase } from '@/supabase/supabaseClient'

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
}

export const messageService = {
  async getMessages(otherUserId: string, currentUserId: string): Promise<{ messages: Message[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${otherUserId},sender_id.eq.${currentUserId}`)
        .or(`receiver_id.eq.${otherUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: true })

      if (error) {
        return { messages: [], error }
      }

      return { messages: data || [], error: null }
    } catch (error) {
      return { messages: [], error: error as Error }
    }
  },

  async sendMessage(otherUserId: string, currentUserId: string, content: string): Promise<{ message: Message | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: otherUserId,
          content,
          read: false
        })
        .select('*')
        .single()

      if (error) {
        return { message: null, error }
      }

      return { message: data || null, error: null }
    } catch (error) {
      return { message: null, error: error as Error }
    }
  },

  async markAsRead(messageId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId)

      if (error) {
        return { success: false, error }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  }
}