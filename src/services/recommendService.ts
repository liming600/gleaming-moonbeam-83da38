import { supabase } from '@/supabase/supabaseClient'
import type { Post } from './postService'
import { mapApiPostToPost } from '@/utils/mappers'
import { executeQuery } from '@/utils/supabaseQuery'

interface UserPreference {
  tag: string
  score: number
}

interface SimilarUser {
  user_id: string
  similarity: number
}

export const recommendService = {
  async getUserPreferences(userId: string): Promise<{ preferences: UserPreference[]; error: Error | null }> {
    try {
      const [likedPosts, followedUsersPosts, commentedPosts] = await Promise.all([
        supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', userId),
        supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId),
        supabase
          .from('comments')
          .select('post_id')
          .eq('user_id', userId)
      ])

      const likedPostIds = (likedPosts.data || []).map(l => l.post_id)
      const followedUserIds = (followedUsersPosts.data || []).map(f => f.following_id)
      const commentedPostIds = (commentedPosts.data || []).map(c => c.post_id)

      const allPostIds = [...new Set([...likedPostIds, ...commentedPostIds])]

      let tagsMap: Record<string, number> = {}

      if (allPostIds.length > 0) {
        const { data: posts, error } = await supabase
          .from('posts')
          .select('tags')
          .in('id', allPostIds)

        if (!error && posts) {
          posts.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
              post.tags.forEach(tag => {
                tagsMap[tag] = (tagsMap[tag] || 0) + 1
              })
            }
          })
        }
      }

      if (followedUserIds.length > 0) {
        const { data: pets, error } = await supabase
          .from('pets')
          .select('breed')
          .in('owner_id', followedUserIds)

        if (!error && pets) {
          pets.forEach(pet => {
            if (pet.breed) {
              tagsMap[pet.breed] = (tagsMap[pet.breed] || 0) + 0.5
            }
          })
        }
      }

      const preferences = Object.entries(tagsMap)
        .map(([tag, score]) => ({ tag, score }))
        .sort((a, b) => b.score - a.score)

      return { preferences, error: null }
    } catch (error) {
      return { preferences: [], error: error as Error }
    }
  },

  async getSimilarUsers(userId: string, limit: number = 5): Promise<{ similarUsers: SimilarUser[]; error: Error | null }> {
    try {
      const { data: currentUserLikes, error: likesError } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', userId)

      if (likesError) {
        return { similarUsers: [], error: likesError }
      }

      const currentLikedPosts = (currentUserLikes || []).map(l => l.post_id)
      if (currentLikedPosts.length === 0) {
        return { similarUsers: [], error: null }
      }

      const { data: otherLikes, error: otherLikesError } = await supabase
        .from('likes')
        .select('user_id, post_id')
        .in('post_id', currentLikedPosts)
        .neq('user_id', userId)

      if (otherLikesError) {
        return { similarUsers: [], error: otherLikesError }
      }

      const userPostMap: Record<string, Set<string>> = {}
      ;(otherLikes || []).forEach(like => {
        if (!userPostMap[like.user_id]) {
          userPostMap[like.user_id] = new Set()
        }
        userPostMap[like.user_id].add(like.post_id)
      })

      const similarUsers: SimilarUser[] = []
      const currentLikedSet = new Set(currentLikedPosts)

      for (const [user_id, likedPosts] of Object.entries(userPostMap)) {
        const intersection = [...likedPosts].filter(postId => currentLikedSet.has(postId))
        const union = new Set([...currentLikedSet, ...likedPosts])
        const similarity = intersection.length / union.size

        if (similarity > 0.1) {
          similarUsers.push({ user_id, similarity })
        }
      }

      similarUsers.sort((a, b) => b.similarity - a.similarity)
      return { similarUsers: similarUsers.slice(0, limit), error: null }
    } catch (error) {
      return { similarUsers: [], error: error as Error }
    }
  },

  async getRecommendedPosts(userId: string, page: number = 1, pageSize: number = 10): Promise<{ posts: Post[]; error: Error | null }> {
    try {
      const [preferencesResult, similarUsersResult] = await Promise.all([
        this.getUserPreferences(userId),
        this.getSimilarUsers(userId, 5)
      ])

      if (preferencesResult.error || similarUsersResult.error) {
        return await this.getTrendingPosts(page, pageSize)
      }

      const preferences = preferencesResult.preferences
      const similarUsers = similarUsersResult.similarUsers

      const likedPostIds = (await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', userId)).data?.map(l => l.post_id) || []

      const commentedPostIds = (await supabase
        .from('comments')
        .select('post_id')
        .eq('user_id', userId)).data?.map(c => c.post_id) || []

      const seenPostIds = [...new Set([...likedPostIds, ...commentedPostIds])]

      let recommendedPostIds: Set<string> = new Set()

      if (similarUsers.length > 0) {
        const similarUserIds = similarUsers.map(s => s.user_id)
        const { data: similarUserPets } = await supabase
          .from('pets')
          .select('id')
          .in('owner_id', similarUserIds)

        if (similarUserPets) {
          const petIds = similarUserPets.map(p => p.id)
          const { data: similarUserPosts } = await supabase
            .from('posts')
            .select('id')
            .in('pet_id', petIds)
            .order('likes_count', { ascending: false })
            .limit(pageSize * 2)

          if (similarUserPosts) {
            similarUserPosts.forEach(post => {
              if (!seenPostIds.includes(post.id)) {
                recommendedPostIds.add(post.id)
              }
            })
          }
        }
      }

      if (preferences.length > 0 && recommendedPostIds.size < pageSize) {
        const popularTags = preferences.slice(0, 3).map(p => p.tag)
        const tagConditions = popularTags.map(tag => `tags.ilike.%${tag}%`).join(',')

        const { data: tagPosts } = await supabase
          .from('posts')
          .select('id')
          .or(tagConditions)
          .order('likes_count', { ascending: false })
          .limit(pageSize * 2)

        if (tagPosts) {
          tagPosts.forEach(post => {
            if (!seenPostIds.includes(post.id) && recommendedPostIds.size < pageSize) {
              recommendedPostIds.add(post.id)
            }
          })
        }
      }

      if (recommendedPostIds.size === 0) {
        return await this.getTrendingPosts(page, pageSize)
      }

      const postIdsArray = Array.from(recommendedPostIds).slice((page - 1) * pageSize, page * pageSize)

      if (postIdsArray.length === 0) {
        return { posts: [], error: null }
      }

      const { data, error } = await executeQuery(
        supabase
          .from('posts')
          .select(`
            *,
            pets(name, avatar_url, owner_id, breed)
          `)
          .in('id', postIdsArray)
      )

      if (error) {
        return { posts: [], error }
      }

      return { posts: data.map(mapApiPostToPost), error: null }
    } catch (error) {
      return { posts: [], error: error as Error }
    }
  },

  async getTrendingPosts(page: number = 1, pageSize: number = 10): Promise<{ posts: Post[]; error: Error | null }> {
    try {
      const { data, error } = await executeQuery(
        supabase
          .from('posts')
          .select(`
            *,
            pets(name, avatar_url, owner_id, breed)
          `)
          .order('likes_count', { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1)
      )

      if (error) {
        return { posts: [], error }
      }

      return { posts: data.map(mapApiPostToPost), error: null }
    } catch (error) {
      return { posts: [], error: error as Error }
    }
  },

  async getRecommendedBloggers(userId: string, limit: number = 6): Promise<{ userIds: string[]; error: Error | null }> {
    try {
      const { data: followedUsers } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId)

      const followedIds = (followedUsers || []).map(f => f.following_id)

      if (followedIds.length === 0) {
        const { data: topUsers } = await supabase
          .from('users')
          .select('id')
          .order('followers_count', { ascending: false })
          .limit(limit)

        return { userIds: topUsers?.map(u => u.id) || [], error: null }
      }

      const { data: secondDegreeFollows } = await supabase
        .from('follows')
        .select('following_id')
        .in('follower_id', followedIds)
        .neq('following_id', userId)

      const secondDegreeIds = (secondDegreeFollows || []).map(f => f.following_id)
      const recommendationCounts: Record<string, number> = {}

      secondDegreeIds.forEach(id => {
        if (!followedIds.includes(id)) {
          recommendationCounts[id] = (recommendationCounts[id] || 0) + 1
        }
      })

      const recommendedIds = Object.entries(recommendationCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => id)
        .slice(0, limit)

      if (recommendedIds.length < limit) {
        const { data: topUsers } = await supabase
          .from('users')
          .select('id')
          .order('followers_count', { ascending: false })
          .limit(limit * 2)

        if (topUsers) {
          topUsers.forEach(user => {
            if (!followedIds.includes(user.id) && !recommendedIds.includes(user.id)) {
              recommendedIds.push(user.id)
            }
          })
        }
      }

      return { userIds: recommendedIds.slice(0, limit), error: null }
    } catch (error) {
      return { userIds: [], error: error as Error }
    }
  }
}