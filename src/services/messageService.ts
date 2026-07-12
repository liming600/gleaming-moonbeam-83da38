import { supabase } from '@/supabase/supabaseClient'

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
}

export interface Conversation {
  userId: string
  userName: string
  userAvatar: string
  lastMessage: string
  lastTime: string
  unread: number
}

export const messageService = {
  async getMessages(otherUserId: string, currentUserId: string): Promise<{ messages: Message[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
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
  },

  async markAllAsRead(otherUserId: string, currentUserId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('receiver_id', currentUserId)
        .eq('sender_id', otherUserId)

      if (error) {
        return { success: false, error }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  },

  async deleteMessage(messageId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) {
        return { success: false, error }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  },

  async getConversations(currentUserId: string): Promise<{ conversations: Conversation[]; error: Error | null }> {
    try {
      // Get all messages involving current user, ordered by created_at desc
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false })

      if (error) {
        return { conversations: [], error }
      }

      if (!data || data.length === 0) {
        return { conversations: [], error: null }
      }

      // Group by conversation partner and find latest message + unread count
      const conversationMap = new Map<string, { lastMessage: string; lastTime: string; unread: number }>()

      for (const msg of data) {
        const partnerId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            lastMessage: msg.content,
            lastTime: msg.created_at,
            unread: 0
          })
        }
        // Count unread messages received from this partner
        if (msg.receiver_id === currentUserId && msg.sender_id === partnerId && !msg.read) {
          conversationMap.get(partnerId)!.unread++
        }
      }

      // Fetch user profiles for all conversation partners
      const partnerIds = Array.from(conversationMap.keys())
      const { data: users } = await supabase
        .from('users')
        .select('id, name, avatar_url')
        .in('id', partnerIds)

      const userMap: Record<string, { name: string; avatar: string }> = {}
      if (users) {
        for (const u of users) {
          userMap[u.id] = { name: u.name || '', avatar: u.avatar_url || '' }
        }
      }

      const conversations: Conversation[] = partnerIds.map(id => ({
        userId: id,
        userName: userMap[id]?.name || '未知用户',
        userAvatar: userMap[id]?.avatar || '',
        lastMessage: conversationMap.get(id)!.lastMessage,
        lastTime: conversationMap.get(id)!.lastTime,
        unread: conversationMap.get(id)!.unread
      }))

      return { conversations, error: null }
    } catch (error) {
      return { conversations: [], error: error as Error }
    }
  },

  async clearConversation(userId1: string, userId2: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .or(`(sender_id.eq.${userId1},receiver_id.eq.${userId2}),(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)

      if (error) {
        return { success: false, error }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  }
}