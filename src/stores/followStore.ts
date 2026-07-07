import { defineStore } from 'pinia'
import { ref } from 'vue'
import { followService } from '@/services/followService'
import { handleApiError } from '@/utils/errorHandler'

export const useFollowStore = defineStore('follow', () => {
  const followers = ref<any[]>([])
  const following = ref<any[]>([])
  const isLoading = ref(false)

  const toggleFollow = async (targetUserId: string, currentUserId: string): Promise<{ success: boolean; message: string; following: boolean }> => {
    const { following: isFollowing, error: checkError } = await followService.isFollowing(currentUserId, targetUserId)
    
    if (checkError) {
      handleApiError(checkError, '检查关注状态失败')
      return { success: false, message: '检查关注状态失败', following: false }
    }

    if (isFollowing) {
      const { error } = await followService.unfollow(currentUserId, targetUserId)
      if (error) {
        const result = handleApiError(error, '取消关注失败')
        return { success: false, message: result.message, following: true }
      }
      return { success: true, message: '已取消关注', following: false }
    } else {
      const { error } = await followService.follow(currentUserId, targetUserId)
      if (error) {
        const result = handleApiError(error, '关注失败')
        return { success: false, message: result.message, following: false }
      }
      return { success: true, message: '关注成功', following: true }
    }
  }

  const checkFollowing = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
    const { following, error } = await followService.isFollowing(currentUserId, targetUserId)
    if (error) {
      handleApiError(error, '检查关注状态失败')
      return false
    }
    return following
  }

  const loadFollowers = async (userId: string): Promise<{ success: boolean; message: string }> => {
    isLoading.value = true
    const { followers: data, error } = await followService.getFollowers(userId)
    isLoading.value = false

    if (error) {
      const result = handleApiError(error, '加载粉丝列表失败')
      return { success: false, message: result.message }
    }

    followers.value = data
    return { success: true, message: '' }
  }

  const loadFollowing = async (userId: string): Promise<{ success: boolean; message: string }> => {
    isLoading.value = true
    const { following: data, error } = await followService.getFollowing(userId)
    isLoading.value = false

    if (error) {
      const result = handleApiError(error, '加载关注列表失败')
      return { success: false, message: result.message }
    }

    following.value = data
    return { success: true, message: '' }
  }

  const getFollowerCount = async (userId: string): Promise<number> => {
    const { count, error } = await followService.getFollowerCount(userId)
    if (error) {
      handleApiError(error, '获取粉丝数失败')
      return 0
    }
    return count
  }

  const getFollowingCount = async (userId: string): Promise<number> => {
    const { count, error } = await followService.getFollowingCount(userId)
    if (error) {
      handleApiError(error, '获取关注数失败')
      return 0
    }
    return count
  }

  return {
    followers,
    following,
    isLoading,
    toggleFollow,
    checkFollowing,
    loadFollowers,
    loadFollowing,
    getFollowerCount,
    getFollowingCount
  }
})