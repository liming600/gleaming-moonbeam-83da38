import { supabase } from '@/supabase/supabaseClient'

export interface Pet {
  id: string
  owner_id: string
  name: string
  avatar_url?: string
  breed?: string
  gender?: string
  birth_date?: string
  weight?: number
  color?: string
  personality?: string
  created_at?: string
  updated_at?: string
  posts_count?: number
  likes_count?: number
  followers_count?: number
  owner_name?: string
  owner_avatar_url?: string
}

export const petService = {
  async getPetsByOwner(ownerId: string): Promise<{ pets: Pet[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

      if (error) {
        return { pets: [], error }
      }

      return { pets: data || [], error: null }
    } catch (error) {
      return { pets: [], error: error as Error }
    }
  },

  async getPetById(petId: string): Promise<{ pet: Pet | null; error: Error | null }> {
    try {
      const { data: petData, error: petError } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single()

      if (petError) {
        return { pet: null, error: petError }
      }

      if (!petData) {
        return { pet: null, error: null }
      }

      const { data: userData } = await supabase
        .from('users')
        .select('name, avatar_url')
        .eq('id', petData.owner_id)
        .single()

      const [postsRes, pawsRes] = await Promise.all([
        supabase.from('posts').select('id, likes_count', { count: 'exact' }).eq('pet_id', petId),
        supabase.from('pet_paws').select('id', { count: 'exact' }).eq('pet_id', petId)
      ])

      const totalLikes = (postsRes.data || []).reduce((sum, post) => sum + (post.likes_count || 0), 0)

      const pet: Pet = {
        ...petData,
        posts_count: postsRes.count || 0,
        likes_count: totalLikes,
        followers_count: pawsRes.count || 0,
        owner_name: userData?.name || '',
        owner_avatar_url: userData?.avatar_url || ''
      }

      return { pet, error: null }
    } catch (error) {
      return { pet: null, error: error as Error }
    }
  },

  async createPet(pet: Omit<Pet, 'id' | 'created_at' | 'updated_at'>): Promise<{ pet: Pet | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('pets')
        .insert(pet)
        .select('*')
        .single()

      if (error) {
        return { pet: null, error }
      }

      return { pet: data || null, error: null }
    } catch (error) {
      return { pet: null, error: error as Error }
    }
  },

  async updatePet(petId: string, pet: Partial<Pet>): Promise<{ pet: Pet | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('pets')
        .update(pet)
        .eq('id', petId)
        .select('*')
        .single()

      if (error) {
        return { pet: null, error }
      }

      return { pet: data || null, error: null }
    } catch (error) {
      return { pet: null, error: error as Error }
    }
  },

  async deletePet(petId: string): Promise<{ success: boolean; message: string; error: Error | null }> {
    try {
      const { error } = await supabase.from('pets').delete().eq('id', petId)
      if (error) {
        return { success: false, message: error.message, error }
      }
      return { success: true, message: '删除成功', error: null }
    } catch (error) {
      const err = error as Error
      return { success: false, message: err.message, error: err }
    }
  }
}