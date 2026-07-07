﻿﻿﻿import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, type AuthUser } from '@/services/authService'
import { handleAuthError } from '@/utils/errorHandler'
import { logger } from '@/utils/logger'
import { supabase } from '@/supabase/supabaseClient'

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false)
  const currentUser = ref<AuthUser | null>(null)
  const isLoading = ref(false)

  const profileStats = ref({
    following: 0,
    posts: 0,
    points: 0,
    likes: 0,
    followers: 0,
    mutualHelps: 0,
    notificationCount: 0
  })

  const registrationDate = ref(new Date())

  const updateNotificationCount = (count: number) => {
    profileStats.value.notificationCount = count
  }

  const getDaysJoined = computed(() => {
    const diff = Date.now() - registrationDate.value.getTime()
    return Math.floor(diff / (24 * 60 * 60 * 1000))
  })

  const login = async (email: string, password: string) => {
    isLoading.value = true
    const { user, error } = await authService.signIn(email, password)
    isLoading.value = false

    if (error) {
      const result = handleAuthError(error)
      return { success: false, message: result.message }
    }

    if (user) {
      isLoggedIn.value = true
      currentUser.value = user
      await loadProfileStats()
      return { success: true, message: '登录成功' }
    }

    return { success: false, message: '登录失败' }
  }

  const signUp = async (email: string, password: string, name: string) => {
    isLoading.value = true
    const { user, error } = await authService.signUp(email, password, name)
    isLoading.value = false

    if (error) {
      const result = handleAuthError(error)
      return { success: false, message: result.message }
    }

    if (user) {
      isLoggedIn.value = true
      currentUser.value = user
      await loadProfileStats()
      return { success: true, message: '注册成功' }
    }

    return { success: false, message: '注册失败' }
  }

  

  const resetPassword = async (email: string) => {
    isLoading.value = true
    const { error } = await authService.resetPassword(email)
    isLoading.value = false

    if (error) {
      return { success: false, message: error.message }
    }

    return { success: true, message: '密码重置链接已发送到您的邮箱' }
  }

  const logout = async () => {
    await authService.signOut()
    isLoggedIn.value = false
    currentUser.value = null
  }

  const autoLogin = async () => {
    const { user, error } = await authService.getCurrentUser()
    
    if (error) {
      logger.warn('自动登录失败:', error.message)
      return false
    }

    if (user) {
      isLoggedIn.value = true
      currentUser.value = user
      await loadProfileStats()
      return true
    }

    return false
  }

  const loadProfileStats = async () => {
    if (!currentUser.value) return

    const userId = currentUser.value.id

    const [followersCountRes, followingCountRes, helpsCountRes, userResult] = await Promise.all([
      supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', userId),
      supabase.from('follows').select('id', { count: 'exact' }).eq('follower_id', userId),
      supabase.from('help_posts').select('id', { count: 'exact' }).eq('author_id', userId),
      supabase.from('users').select('created_at').eq('id', userId).single()
    ])

    const { data: userPets, error: petsError } = await supabase
      .from('pets')
      .select('id')
      .eq('owner_id', userId)
    
    let postsCount = 0
    if (!petsError && userPets && userPets.length > 0) {
      const petIds = userPets.map(p => p.id)
      const { count } = await supabase
        .from('posts')
        .select('id', { count: 'exact' })
        .in('pet_id', petIds)
      postsCount = typeof count === 'number' ? count : 0
    }

    const followersCount = followersCountRes.count || 0
    const followingCount = followingCountRes.count || 0
    const helpsCount = helpsCountRes.count || 0

    profileStats.value = {
      following: followingCount,
      posts: postsCount,
      points: Math.floor(postsCount * 10 + helpsCount * 20),
      likes: 0,
      followers: followersCount,
      mutualHelps: helpsCount,
      notificationCount: profileStats.value.notificationCount
    }

    if (userResult.data?.created_at) {
      registrationDate.value = new Date(userResult.data.created_at)
    }
  }

  const updateUserAvatar = async (avatarUrl: string) => {
    if (currentUser.value) {
      currentUser.value = { ...currentUser.value, avatar_url: avatarUrl }
      await authService.updateUserProfile({ id: currentUser.value.id, avatar_url: avatarUrl })
    }
  }

  const getCurrentUserId = computed(() => {
    return currentUser.value?.id || ''
  })

  return {
    isLoggedIn,
    currentUser,
    isLoading,
    profileStats,
    login,
    signUp,
    resetPassword,
    logout,
    autoLogin,
    loadProfileStats,
    updateUserAvatar,
    getCurrentUserId,
    updateNotificationCount,
    getDaysJoined
  }
}, {
  persist: {
    key: 'petcircle_user',
    storage: localStorage,
    paths: ['isLoggedIn', 'currentUser']
  }
})