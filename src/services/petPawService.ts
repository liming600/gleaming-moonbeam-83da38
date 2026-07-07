import { supabase } from '@/supabase/supabaseClient'

export interface PetPaw {
  id: string
  user_id: string
  pet_id: string
  created_at: string
}

export const petPawService = {
  async addPaw(userId: string, petId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('pet_paws')
        .insert({
          user_id: userId,
          pet_id: petId
        })

      if (error) {
        if (error.code === '23505') {
          return { success: false, message: '今天已经给这只宠物击掌过了' }
        }
        return { success: false, message: error.message }
      }

      return { success: true, message: '击掌成功！' }
    } catch (error) {
      return { success: false, message: '击掌失败，请重试' }
    }
  },

  async getPawsCount(petId: string): Promise<number> {
    try {
      const { count } = await supabase
        .from('pet_paws')
        .select('id', { count: 'exact' })
        .eq('pet_id', petId)

      return count || 0
    } catch {
      return 0
    }
  },

  async hasPawedToday(userId: string, petId: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('pet_paws')
        .select('id')
        .eq('user_id', userId)
        .eq('pet_id', petId)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)

      return !!data && data.length > 0
    } catch {
      return false
    }
  }
}
