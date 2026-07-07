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

async function fetchPetInfo(petId: string): Promise<{ name: string; avatar_url: string; owner_id: string } | null> {
  const { data, error } = await supabase
    .from('pets')
    .select('name, avatar_url, owner_id')
    .eq('id', petId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    name: data.name,
    avatar_url: data.avatar_url || '',
    owner_id: data.owner_id || ''
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
    const postType = post.isDiary ? 'diary' : (post.isPublic ? 'public' : 'private')
    
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
    const { data, error } = await executeSingleQuery<ApiComment>(
      supabase
        .from('comments')
        .insert({ post_id: postId, user_id: userId, content })
        .select(COMMENTS_SELECT)
        .single()
    )

    if (error) {
      return { comment: null, error }
    }

    if (data) {
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
    }

    return { comment: data ? mapApiCommentToComment(data) : null, error: null }
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
      const { data: commentData, error: selectError } = await supabase
        .from('comments')
        .select('post_id')
        .eq('id', commentId)
        .single()

      if (selectError) {
        return { success: false, error: selectError }
      }

      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (deleteError) {
        return { success: false, error: deleteError }
      }

      if (commentData?.post_id) {
        const { data: post } = await supabase
          .from('posts')
          .select('comments_count')
          .eq('id', commentData.post_id)
          .single()
        if (post) {
          await supabase
            .from('posts')
            .update({ comments_count: Math.max(0, post.comments_count - 1) })
            .eq('id', commentData.post_id)
        }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  }
}