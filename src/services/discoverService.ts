import { supabase } from '@/supabase/supabaseClient'

export interface Business {
  id: string
  name: string
  avatar: string
  category: string
  rating: number
  reviews: number
}

export interface Blogger {
  id: string
  name: string
  avatar: string
  bio: string
  followers: number
  posts: number
}

export const discoverService = {
  async getBusinesses(): Promise<{ businesses: Business[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, avatar_url, bio')
        .limit(6)

      if (error) {
        return { businesses: [], error }
      }

      const categories = ['宠物医院', '宠物美容', '宠物食品', '宠物用品', '宠物训练', '宠物寄养']
      const businesses: Business[] = (data || []).map((item: any, index: number) => ({
        id: item.id,
        name: item.name || `商家${index + 1}`,
        avatar: item.avatar_url || '',
        category: categories[index % categories.length],
        rating: (Math.random() * 1.5 + 3.5).toFixed(1) as unknown as number,
        reviews: Math.floor(Math.random() * 200) + 20
      }))

      return { businesses, error: null }
    } catch (error) {
      return { businesses: [], error: error as Error }
    }
  },

  async getBloggers(): Promise<{ bloggers: Blogger[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, avatar_url, bio, followers_count, posts_count')
        .order('followers_count', { ascending: false })
        .limit(6)

      if (error) {
        return { bloggers: [], error }
      }

      const bloggers: Blogger[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name || '用户',
        avatar: item.avatar_url || '',
        bio: item.bio || '热爱宠物，分享养宠经验',
        followers: item.followers_count || 0,
        posts: item.posts_count || 0
      }))

      return { bloggers, error: null }
    } catch (error) {
      return { bloggers: [], error: error as Error }
    }
  }
}