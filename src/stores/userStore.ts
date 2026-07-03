import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, type AuthUser } from '@/services/authService'

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false)
  const currentUser = ref<AuthUser | null>(null)
  const isLoading = ref(false)

  const demoUser: AuthUser = {
    id: 'demo1',
    email: 'demo@example.com',
    name: '铲屎官小明',
    avatar_url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=young%20man%20portrait%20friendly%20smile&image_size=square',
    bio: null
  }

  const profileStats = ref({
    posts: 28,
    points: 56,
    likes: 390,
    followers: 245,
    mutualHelps: 12
  })

  const login = async (email: string, password: string) => {
    isLoading.value = true
    const { user, error } = await authService.signIn(email, password)
    isLoading.value = false

    if (error) {
      return { success: false, message: error.message }
    }

    if (user) {
      isLoggedIn.value = true
      currentUser.value = user
      return { success: true, message: '登录成功' }
    }

    return { success: false, message: '登录失败' }
  }

  const signUp = async (email: string, password: string, name: string) => {
    isLoading.value = true
    const { user, error } = await authService.signUp(email, password, name)
    isLoading.value = false

    if (error) {
      return { success: false, message: error.message }
    }

    if (user) {
      isLoggedIn.value = true
      currentUser.value = user
      return { success: true, message: '注册成功' }
    }

    return { success: false, message: '注册失败' }
  }

  const register = async (email: string, password: string, name: string) => {
    return signUp(email, password, name)
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
      console.warn('自动登录失败:', error.message)
      return false
    }

    if (user) {
      isLoggedIn.value = true
      currentUser.value = user
      return true
    }

    return false
  }

  const useDemoUser = () => {
    isLoggedIn.value = true
    currentUser.value = demoUser
  }

  const getCurrentUserId = computed(() => {
    return currentUser.value?.id || ''
  })

  return {
    isLoggedIn,
    currentUser,
    isLoading,
    demoUser,
    profileStats,
    login,
    signUp,
    register,
    resetPassword,
    logout,
    autoLogin,
    useDemoUser,
    getCurrentUserId
  }
}, {
  persist: {
    key: 'petcircle_user',
    storage: localStorage,
    paths: ['isLoggedIn', 'currentUser']
  }
})