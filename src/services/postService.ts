import { supabase } from '@/supabase/supabaseClient'

export interface PostLocation {
  address: string
  latitude: number | null
  longitude: number | null
}

export interface Post {
  id: string
  pet_id: string
  pet_name: string
  pet_avatar: string
  content: string
  images: string[]
  tags: string[]
  likes_count: number
  comments_count: number
  is_public: boolean
  is_diary: boolean
  mood?: string
  location?: PostLocation | null
  created_at: string
  date: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  user_name: string
  user_avatar: string
  content: string
  created_at: string
}

export const postService = {
  async getPosts(page: number = 1, pageSize: number = 20): Promise<{ posts: Post[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          pets(name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (error) {
        return { posts: [], error }
      }

      const posts: Post[] = (data || []).map((item: any) => ({
        id: item.id,
        pet_id: item.pet_id,
        pet_name: item.pets?.name || '',
        pet_avatar: item.pets?.avatar_url || '',
        content: item.content,
        images: item.images || [],
        tags: item.tags || [],
        likes_count: item.likes_count || 0,
        comments_count: item.comments_count || 0,
        is_public: item.is_public,
        is_diary: item.is_diary || false,
        mood: item.mood,
        location: item.location_address
          ? {
              address: item.location_address,
              latitude: item.location_latitude || null,
              longitude: item.location_longitude || null
            }
          : null,
        created_at: item.created_at,
        date: item.date
      }))

      return { posts, error: null }
    } catch (error) {
      return { posts: [], error: error as Error }
    }
  },

  async getPostsByPet(petId: string): Promise<{ posts: Post[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          pets(name, avatar_url)
        `)
        .eq('pet_id', petId)
        .order('created_at', { ascending: false })

      if (error) {
        return { posts: [], error }
      }

      const posts: Post[] = (data || []).map((item: any) => ({
        id: item.id,
        pet_id: item.pet_id,
        pet_name: item.pets?.name || '',
        pet_avatar: item.pets?.avatar_url || '',
        content: item.content,
        images: item.images || [],
        tags: item.tags || [],
        likes_count: item.likes_count || 0,
        comments_count: item.comments_count || 0,
        is_public: item.is_public,
        is_diary: item.is_diary || false,
        mood: item.mood,
        location: item.location_address
          ? {
              address: item.location_address,
              latitude: item.location_latitude || null,
              longitude: item.location_longitude || null
            }
          : null,
        created_at: item.created_at,
        date: item.date
      }))

      return { posts, error: null }
    } catch (error) {
      return { posts: [], error: error as Error }
    }
  },

  async getPostById(postId: string): Promise<{ post: Post | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          pets(name, avatar_url)
        `)
        .eq('id', postId)
        .single()

      if (error) {
        return { post: null, error }
      }

      if (!data) {
        return { post: null, error: null }
      }

      const post: Post = {
        id: data.id,
        pet_id: data.pet_id,
        pet_name: data.pets?.name || '',
        pet_avatar: data.pets?.avatar_url || '',
        content: data.content,
        images: data.images || [],
        tags: data.tags || [],
        likes_count: data.likes_count || 0,
        comments_count: data.comments_count || 0,
        is_public: data.is_public,
        is_diary: data.is_diary || false,
        mood: data.mood,
        location: data.location_address
          ? {
              address: data.location_address,
              latitude: data.location_latitude || null,
              longitude: data.location_longitude || null
            }
          : null,
        created_at: data.created_at,
        date: data.date
      }

      return { post, error: null }
    } catch (error) {
      return { post: null, error: error as Error }
    }
  },

  async createPost(post: Omit<Post, 'id' | 'likes_count' | 'comments_count' | 'created_at' | 'pet_name' | 'pet_avatar'>): Promise<{ post: Post | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          pet_id: post.pet_id,
          content: post.content,
          images: post.images,
          tags: post.tags,
          is_public: post.is_public,
          is_diary: post.is_diary,
          mood: post.mood,
          location_address: post.location?.address,
          location_latitude: post.location?.latitude,
          location_longitude: post.location?.longitude,
          date: post.date
        })
        .select(`
          *,
          pets(name, avatar_url)
        `)
        .single()

      if (error) {
        return { post: null, error }
      }

      if (!data) {
        return { post: null, error: null }
      }

      const createdPost: Post = {
        id: data.id,
        pet_id: data.pet_id,
        pet_name: data.pets?.name || '',
        pet_avatar: data.pets?.avatar_url || '',
        content: data.content,
        images: data.images || [],
        tags: data.tags || [],
        likes_count: data.likes_count || 0,
        comments_count: data.comments_count || 0,
        is_public: data.is_public,
        is_diary: data.is_diary || false,
        mood: data.mood,
        location: data.location_address
          ? {
              address: data.location_address,
              latitude: data.location_latitude || null,
              longitude: data.location_longitude || null
            }
          : null,
        created_at: data.created_at,
        date: data.date
      }

      return { post: createdPost, error: null }
    } catch (error) {
      return { post: null, error: error as Error }
    }
  },

  async getComments(postId: string): Promise<{ comments: Comment[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users(name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) {
        return { comments: [], error }
      }

      const comments: Comment[] = (data || []).map((item: any) => ({
        id: item.id,
        post_id: item.post_id,
        user_id: item.user_id,
        user_name: item.users?.name || '',
        user_avatar: item.users?.avatar_url || '',
        content: item.content,
        created_at: item.created_at
      }))

      return { comments, error: null }
    } catch (error) {
      return { comments: [], error: error as Error }
    }
  },

  async createComment(postId: string, userId: string, content: string): Promise<{ comment: Comment | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({ post_id: postId, user_id: userId, content })
        .select(`
          *,
          users(name, avatar_url)
        `)
        .single()

      if (error) {
        return { comment: null, error }
      }

      if (!data) {
        return { comment: null, error: null }
      }

      const { data: post } = await supabase
        .from('posts')
        .select('comments_count')
        .eq('id', postId)
        .single()

      if (post) {
        await supabase
          .from('posts')
          .update({ comments_count: post.comments_count + 1 })
          .eq('id', postId)
      }

      const comment: Comment = {
        id: data.id,
        post_id: data.post_id,
        user_id: data.user_id,
        user_name: data.users?.name || '',
        user_avatar: data.users?.avatar_url || '',
        content: data.content,
        created_at: data.created_at
      }

      return { comment, error: null }
    } catch (error) {
      return { comment: null, error: error as Error }
    }
  },

  async toggleLike(postId: string, userId: string): Promise<{ isLiked: boolean; error: Error | null }> {
    try {
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      if (existingLike) {
        await supabase.from('likes').delete().eq('id', existingLike.id)
        const { data: post } = await supabase
          .from('posts')
          .select('likes_count')
          .eq('id', postId)
          .single()
        if (post) {
          await supabase
            .from('posts')
            .update({ likes_count: Math.max(0, post.likes_count - 1) })
            .eq('id', postId)
        }
        return { isLiked: false, error: null }
      }

      await supabase.from('likes').insert({ post_id: postId, user_id: userId })
      const { data: post } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single()
      if (post) {
        await supabase
          .from('posts')
          .update({ likes_count: post.likes_count + 1 })
          .eq('id', postId)
      }

      return { isLiked: true, error: null }
    } catch (error) {
      return { isLiked: false, error: error as Error }
    }
  },

  async checkLike(postId: string, userId: string): Promise<{ isLiked: boolean; error: Error | null }> {
    try {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      return { isLiked: !!data, error: null }
    } catch (error) {
      return { isLiked: false, error: error as Error }
    }
  }
}