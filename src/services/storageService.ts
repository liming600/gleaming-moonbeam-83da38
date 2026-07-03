import { supabase } from '@/supabase/supabaseClient'

export const storageService = {
  async uploadImage(file: File, path: string, userId?: string): Promise<{ url: string | null; data: any; error: Error | null }> {
    try {
      const { data, error: uploadError } = await supabase.storage
        .from('images')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: userId ? { user_id: userId } : undefined
        })

      if (uploadError) {
        return { url: null, data: null, error: uploadError }
      }

      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path)

      return { url: publicUrl, data, error: null }
    } catch (error) {
      return { url: null, data: null, error: error as Error }
    }
  },

  async uploadAvatar(file: File, userId: string): Promise<{ url: string | null; data: any; error: Error | null }> {
    const path = `avatars/${userId}/${Date.now()}_${file.name}`
    return this.uploadImage(file, path, userId)
  },

  async uploadPetAvatar(file: File, petId: string, userId?: string): Promise<{ url: string | null; data: any; error: Error | null }> {
    const path = `pets/${petId}/${Date.now()}_${file.name}`
    return this.uploadImage(file, path, userId)
  },

  async uploadPostImage(file: File, postId: string, index: number, userId?: string): Promise<{ url: string | null; data: any; error: Error | null }> {
    const path = `posts/${postId}/${index}_${Date.now()}_${file.name}`
    return this.uploadImage(file, path, userId)
  },

  async deleteImage(path: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.storage.from('images').remove([path])
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  },

  getImageUrl(path: string): string {
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path)
    return publicUrl || path
  }
}