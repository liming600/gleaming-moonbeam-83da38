import { supabase } from '@/supabase/supabaseClient'
import { mapApiPostToPost, mapApiCommentToComment, type ApiPost, type ApiComment } from '@/utils/mappers'
import { executeQuery, executeSingleQuery } from '@/utils/supabaseQuery'

export interface PostLocation {
  address: string
  latitude: number | null
  longitude: number | null
}

export type Post = ReturnType<typeof mapApiPostToPost>
export type Comment = ReturnType<typeof mapApiCommentToComment>

const POSTS_SELECT = `
  *
`

const COMMENTS_SELECT = `
  *,
  users(name, avatar_url)
`

async function fetchPetInfo(petId: string): Promise<{ name: string; avatar_url: string; owner_id: string; breed: string } | null> {
  const { data, error } = await supabase
    .from('pets')
    .select('name, avatar_url, owner_id, breed')
    .eq('id', petId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    name: data.name,
    avatar_url: data.avatar_url || '',
    owner_id: data.owner_id || '',
    breed: data.breed || ''
  }
}

async function enrichPostsWithPetInfo(posts: ApiPost[]): Promise<ApiPost[]> {
  return Promise.all(
    posts.map(async (post) => {
      if (!post.pets || !post.pets.name) {
        const petInfo = await fetchPetInfo(post.pet_id)
        if (petInfo) {
          post.pets = petInfo
        }
      }
      return post
    })
  )
}

export const postService = {
  async getPosts(page: number = 1, pageSize: number = 20): Promise<{ posts: Post[]; error: Error | null }> {
    const { data, error } = await executeQuery<ApiPost>(
      supabase
        .from('posts')
        .select(POSTS_SELECT)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)
    )
    
    if (error) {
      return { posts: [], error }
    }

    const enrichedPosts = await enrichPostsWithPetInfo(data)
    return { posts: enrichedPosts.map(mapApiPostToPost), error: null }
  },

  async getPostsByPet(petId: string): Promise<{ posts: Post[]; error: Error | null }> {
    const { data, error } = await executeQuery<ApiPost>(
      supabase
        .from('posts')
        .select(POSTS_SELECT)
        .eq('pet_id', petId)
        .order('created_at', { ascending: false })
    )
    
    if (error) {
      return { posts: [], error }
    }

    const enrichedPosts = await enrichPostsWithPetInfo(data)
    return { posts: enrichedPosts.map(mapApiPostToPost), error: null }
  },

  async getPostById(postId: string): Promise<{ post: Post | null; error: Error | null }> {
    const { data, error } = await executeSingleQuery<ApiPost>(
      supabase
        .from('posts')
        .select(POSTS_SELECT)
        .eq('id', postId)
        .single()
    )
    
    if (error) {
      return { post: null, error }
    }

    if (data) {
      if (!data.pets || !data.pets.name) {
        const petInfo = await fetchPetInfo(data.pet_id)
        if (petInfo) {
          data.pets = petInfo
        }
      }
      return { post: mapApiPostToPost(data), error: null }
    }

    return { post: null, error: null }
  },

  async createPost(post: Omit<Post, 'id' | 'likes' | 'comments' | 'createdAt' | 'petName' | 'petAvatar' | 'isLiked'>): Promise<{ post: Post | null; error: Error | null }> {
    const postType = post.isDiary ? 'diary' : 'public'
    
    const { data, error } = await executeSingleQuery<ApiPost>(
      supabase
        .from('posts')
        .insert({
          pet_id: post.petId,
          content: post.content,
          images: post.images,
          tags: post.tags,
          post_type: postType,
          mood: post.mood,
          location_address: post.location?.address,
          location_latitude: post.location?.latitude,
          location_longitude: post.location?.longitude,
          date: post.date
        })
        .select(POSTS_SELECT)
        .single()
    )
    
    if (error) {
      return { post: null, error }
    }

    if (data) {
      if (!data.pets || !data.pets.name) {
        const petInfo = await fetchPetInfo(data.pet_id)
        if (petInfo) {
          data.pets = petInfo
        }
      }
      return { post: mapApiPostToPost(data), error: null }
    }

    return { post: null, error: null }
  },

  async getComments(postId: string): Promise<{ comments: Comment[]; error: Error | null }> {
    const { data, error } = await executeQuery<ApiComment>(
      supabase
        .from('comments')
        .select(COMMENTS_SELECT)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
    )
    
    return { comments: data.map(mapApiCommentToComment), error }
  },

  async createComment(postId: string, userId: string, content: string): Promise<{ comment: Comment | null; error: Error | null }> {
    try {
      const { data: authData } = await supabase.auth.getUser()
      console.log('[PostService] createComment - Supabase auth user:', authData?.user?.id, 'User ID:', userId)

      const { data, error } = await supabase
        .from('comments')
        .insert({ post_id: postId, user_id: userId, content })
        .select(COMMENTS_SELECT)
        .single()

      if (error) {
        console.error('[PostService] createComment error:', error)
        console.error('[PostService] createComment error code:', (error as any)?.code)
        console.error('[PostService] createComment error details:', (error as any)?.details)
        return { comment: null, error }
      }

      console.log('[PostService] createComment success:', data?.id)
      return { comment: data ? mapApiCommentToComment(data) : null, error: null }
    } catch (error) {
      console.error('[PostService] createComment exception:', error)
      console.error('[PostService] createComment exception stack:', (error as Error).stack)
      return { comment: null, error: error as Error }
    }
  },

  async toggleLike(postId: string, userId: string): Promise<{ isLiked: boolean; error: Error | null }> {
    try {
      const { data: likesData, error: likeError } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .limit(1)

      if (likeError) {
        return { isLiked: false, error: likeError }
      }

      const existingLike = likesData && likesData.length > 0 ? likesData[0] : null

      if (existingLike) {
        // DB trigger (trigger_update_post_likes) handles likes_count decrement
        await supabase.from('likes').delete().eq('id', existingLike.id)
        return { isLiked: false, error: null }
      }

      // DB trigger (trigger_update_post_likes) handles likes_count increment
      await supabase.from('likes').insert({ post_id: postId, user_id: userId })
      return { isLiked: true, error: null }
    } catch (error) {
      return { isLiked: false, error: error as Error }
    }
  },

  async checkLike(postId: string, userId: string): Promise<{ isLiked: boolean; error: Error | null }> {
    try {
      const { data: likesData, error } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .limit(1)

      if (error) {
        return { isLiked: false, error }
      }

      return { isLiked: !!likesData && likesData.length > 0, error: null }
    } catch (error) {
      return { isLiked: false, error: error as Error }
    }
  },

  async deletePost(postId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) {
        return { success: false, error }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  },

  async deleteComment(commentId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error, count } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .select()

      if (error) {
        return { success: false, error }
      }

      if (count === 0) {
        return { success: false, error: new Error('评论不存在或无权限删除') }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  },

  async updatePost(postId: string, postData: Partial<Omit<Post, 'id' | 'likes' | 'comments' | 'createdAt' | 'petName' | 'petAvatar' | 'isLiked' | 'ownerId'>>): Promise<{ post: Post | null; error: Error | null }> {
    try {
      const postType = postData.isDiary ? 'diary' : postData.isPublic ? 'public' : undefined

      const { data, error } = await executeSingleQuery<ApiPost>(
        supabase
          .from('posts')
          .update({
            content: postData.content,
            images: postData.images,
            tags: postData.tags,
            post_type: postType,
            mood: postData.mood,
            location_address: postData.location?.address,
            location_latitude: postData.location?.latitude,
            location_longitude: postData.location?.longitude,
            date: postData.date
          })
          .eq('id', postId)
          .select(POSTS_SELECT)
          .single()
      )

      if (error) {
        return { post: null, error }
      }

      if (data) {
        if (!data.pets || !data.pets.name) {
          const petInfo = await fetchPetInfo(data.pet_id)
          if (petInfo) {
            data.pets = petInfo
          }
        }
        return { post: mapApiPostToPost(data), error: null }
      }

      return { post: null, error: null }
    } catch (error) {
      return { post: null, error: error as Error }
    }
  }
}