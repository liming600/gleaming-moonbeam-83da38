import { supabase } from '@/supabase/supabaseClient'
import type { Post } from '@/services/postService'
import type { Pet } from '@/services/petService'
import type { AuthUser } from '@/services/authService'
import { mapApiPostToPost } from '@/utils/mappers'

export interface SearchResult {
  type: 'pet' | 'user' | 'post' | 'business'
  data: Pet | AuthUser | Post | any
}

export interface SearchHistoryItem {
  query: string
  timestamp: number
}

const SEARCH_HISTORY_KEY = 'petcircle_search_history'
const MAX_HISTORY = 10

const hotSearches = [
  { keyword: '猫咪', count: 12580 },
  { keyword: '狗狗', count: 9870 },
  { keyword: '宠物美容', count: 5620 },
  { keyword: '萌宠', count: 8930 },
  { keyword: '宠物用品', count: 4520 },
  { keyword: '猫咪领养', count: 3890 },
  { keyword: '狗狗训练', count: 2750 },
  { keyword: '猫粮推荐', count: 6230 }
]

export const searchService = {
  async searchPets(query: string): Promise<{ pets: Pet[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .or(`name.ilike.%${query}%,breed.ilike.%${query}%`)
        .limit(10)

      if (error) {
        return { pets: [], error }
      }

      return { pets: data || [], error: null }
    } catch (error) {
      return { pets: [], error: error as Error }
    }
  },

  async searchUsers(query: string): Promise<{ users: AuthUser[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10)

      if (error) {
        return { users: [], error }
      }

      return { users: data || [], error: null }
    } catch (error) {
      return { users: [], error: error as Error }
    }
  },

  async searchPosts(query: string): Promise<{ posts: Post[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          pets(name, avatar_url, owner_id, breed)
        `)
        .or(`content.ilike.%${query}%,tags.ilike.%${query}%`)
        .limit(10)

      if (error) {
        return { posts: [], error }
      }

      const posts = (data || []).map(mapApiPostToPost)
      return { posts, error: null }
    } catch (error) {
      return { posts: [], error: error as Error }
    }
  },

  async searchBusinesses(query: string): Promise<{ businesses: any[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, avatar_url, bio')
        .or(`name.ilike.%${query}%,bio.ilike.%${query}%`)
        .limit(10)

      if (error) {
        return { businesses: [], error }
      }

      const categories = ['宠物医院', '宠物美容', '宠物食品', '宠物用品', '宠物训练', '宠物寄养']
      const businesses = (data || []).map((item: any, index: number) => ({
        id: item.id,
        name: item.name || `商家${index + 1}`,
        avatar: item.avatar_url || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20pet%20business%20logo&image_size=square`,
        category: categories[index % categories.length],
        rating: (Math.random() * 1.5 + 3.5).toFixed(1) as unknown as number,
        reviews: Math.floor(Math.random() * 200) + 20
      }))

      return { businesses, error: null }
    } catch (error) {
      return { businesses: [], error: error as Error }
    }
  },

  async searchAll(query: string): Promise<{ results: SearchResult[]; error: Error | null }> {
    try {
      this.addToHistory(query)

      const [petsResult, usersResult, postsResult, businessesResult] = await Promise.all([
        this.searchPets(query),
        this.searchUsers(query),
        this.searchPosts(query),
        this.searchBusinesses(query)
      ])

      const results: SearchResult[] = []

      if (!petsResult.error) {
        petsResult.pets.forEach(pet => {
          results.push({ type: 'pet', data: pet })
        })
      }

      if (!usersResult.error) {
        usersResult.users.forEach(user => {
          results.push({ type: 'user', data: user })
        })
      }

      if (!postsResult.error) {
        postsResult.posts.forEach(post => {
          results.push({ type: 'post', data: post })
        })
      }

      if (!businessesResult.error) {
        businessesResult.businesses.forEach(business => {
          results.push({ type: 'business', data: business })
        })
      }

      return { results, error: null }
    } catch (error) {
      return { results: [], error: error as Error }
    }
  },

  async searchByTag(tag: string): Promise<{ results: SearchResult[]; error: Error | null }> {
    try {
      this.addToHistory(tag)

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          pets(name, avatar_url, owner_id, breed)
        `)
        .or(`tags.ilike.%${tag}%,content.ilike.%${tag}%`)
        .limit(20)

      if (error) {
        return { results: [], error }
      }

      const results: SearchResult[] = (data || []).map(post => ({
        type: 'post',
        data: mapApiPostToPost(post)
      }))

      return { results, error: null }
    } catch (error) {
      return { results: [], error: error as Error }
    }
  },

  getHotSearches(): typeof hotSearches {
    return hotSearches
  },

  getHistory(): SearchHistoryItem[] {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  addToHistory(query: string): void {
    try {
      const history = this.getHistory()
      const filtered = history.filter(h => h.query !== query)
      filtered.unshift({ query, timestamp: Date.now() })
      const trimmed = filtered.slice(0, MAX_HISTORY)
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmed))
    } catch {
      // ignore
    }
  },

  clearHistory(): void {
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  },

  removeFromHistory(query: string): void {
    try {
      const history = this.getHistory()
      const filtered = history.filter(h => h.query !== query)
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered))
    } catch {
      // ignore
    }
  }
}