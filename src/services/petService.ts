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
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single()

      if (error) {
        return { pet: null, error }
      }

      return { pet: data || null, error: null }
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

  async deletePet(petId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.from('pets').delete().eq('id', petId)
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }
}