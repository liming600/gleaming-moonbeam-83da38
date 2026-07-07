import { supabase } from '@/supabase/supabaseClient'
import type { Post } from '@/services/postService'
import type { Pet } from '@/services/petService'
import type { AuthUser } from '@/services/authService'

export interface SearchResult {
  type: 'pet' | 'user' | 'post'
  data: Pet | AuthUser | Post
}

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
        .select('*')
        .or(`content.ilike.%${query}%,tags.ilike.%${query}%`)
        .limit(10)

      if (error) {
        return { posts: [], error }
      }

      return { posts: data || [], error: null }
    } catch (error) {
      return { posts: [], error: error as Error }
    }
  },

  async searchAll(query: string): Promise<{ results: SearchResult[]; error: Error | null }> {
    try {
      const [petsResult, usersResult, postsResult] = await Promise.all([
        this.searchPets(query),
        this.searchUsers(query),
        this.searchPosts(query)
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

      return { results, error: null }
    } catch (error) {
      return { results: [], error: error as Error }
    }
  }
}