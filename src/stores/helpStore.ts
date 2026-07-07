import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { helpService, type HelpPost as ApiHelpPost } from '@/services/helpService'
import { zoneConfig, type HelpPost } from '@/mock/helpPosts'
import { useUserStore } from './userStore'
import { handleApiError } from '@/utils/errorHandler'
import { logger } from '@/utils/logger'

const mapApiHelpPostToHelpPost = (apiPost: ApiHelpPost): HelpPost => ({
  id: apiPost.id,
  authorId: apiPost.author_id,
  authorName: apiPost.author_name,
  authorAvatar: apiPost.author_avatar,
  zone: apiPost.zone,
  zoneLabel: apiPost.zoneLabel,
  title: apiPost.title,
  content: apiPost.content,
  answers: apiPost.answers_count,
  status: apiPost.status,
  statusLabel: apiPost.statusLabel,
  isUrgent: apiPost.is_urgent,
  acceptedAnswer: apiPost.accepted_answer,
  location: apiPost.location,
  createdAt: formatDate(apiPost.created_at)
})

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

export const useHelpStore = defineStore('help', () => {
  const helpPosts = ref<HelpPost[]>([])
  const currentZone = ref<'all' | 'experience' | 'question' | 'rescue' | 'mutual'>('all')
  const isLoading = ref(false)

  const filteredPosts = computed(() => {
    if (currentZone.value === 'all') {
      return [...helpPosts.value].sort((a, b) => {
        if (a.isUrgent && !b.isUrgent) return -1
        if (!a.isUrgent && b.isUrgent) return 1
        const dateA = new Date(a.createdAt)
        const dateB = new Date(b.createdAt)
        return dateB.getTime() - dateA.getTime()
      })
    }
    return helpPosts.value.filter(p => p.zone === currentZone.value).sort((a, b) => {
      if (a.isUrgent && !b.isUrgent) return -1
      if (!a.isUrgent && b.isUrgent) return 1
      const dateA = new Date(a.createdAt)
      const dateB = new Date(b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })
  })

  const setZone = (zone: 'all' | 'experience' | 'question' | 'rescue' | 'mutual') => {
    currentZone.value = zone
  }

  const getZoneConfig = (zone: string) => {
    return zoneConfig[zone as keyof typeof zoneConfig] || { label: '未知', icon: '❓', color: '#999' }
  }

  const getHelpPostById = (id: string) => {
    return helpPosts.value.find(p => p.id === id) || null
  }

  const loadHelpPosts = async (zone?: string) => {
    isLoading.value = true
    const { posts: loadedPosts, error } = await helpService.getHelpPosts(zone)
    isLoading.value = false

    if (error) {
      const result = handleApiError(error, '加载互助帖子失败')
      return { success: false, message: result.message }
    }

    if (loadedPosts.length === 0) {
      return { success: true, message: '没有更多帖子' }
    }

    const mappedPosts = loadedPosts.map(mapApiHelpPostToHelpPost)
    const existingIds = new Set(helpPosts.value.map(p => p.id))
    const newPosts = mappedPosts.filter(p => !existingIds.has(p.id))

    helpPosts.value = [...newPosts, ...helpPosts.value]

    return { success: true, message: '加载成功' }
  }

  const loadHelpPostById = async (postId: string) => {
    isLoading.value = true
    const { post, error } = await helpService.getHelpPostById(postId)
    isLoading.value = false

    if (error) {
      const result = handleApiError(error, '加载互助帖子详情失败')
      return { success: false, message: result.message }
    }

    if (post) {
      const mappedPost = mapApiHelpPostToHelpPost(post)
      const index = helpPosts.value.findIndex(p => p.id === postId)
      if (index >= 0) {
        helpPosts.value[index] = mappedPost
      } else {
        helpPosts.value.push(mappedPost)
      }

      return { success: true, message: '加载成功', post: mappedPost }
    }

    return { success: false, message: '帖子不存在' }
  }

  const createHelpPost = async (postData: {
    zone: 'experience' | 'question' | 'rescue' | 'mutual'
    title: string
    content: string
    isUrgent: boolean
    location?: { address: string; latitude: number | null; longitude: number | null } | null
  }) => {
    const userStore = useUserStore()
    if (!userStore.currentUser) {
      return { success: false, message: '请先登录' }
    }

    isLoading.value = true
    const { post, error } = await helpService.createHelpPost({
      author_id: userStore.currentUser.id,
      zone: postData.zone,
      title: postData.title,
      content: postData.content,
      status: 'open',
      is_urgent: postData.isUrgent,
      location: postData.location
    })
    isLoading.value = false

    if (error) {
      const result = handleApiError(error, '发布互助帖子失败')
      return { success: false, message: result.message }
    }

    if (post) {
      const newPost = mapApiHelpPostToHelpPost(post)
      helpPosts.value.unshift(newPost)
      return { success: true, message: '发布成功', post: newPost }
    }

    return { success: false, message: '发布失败' }
  }

  const createAnswer = async (postId: string, content: string) => {
    const userStore = useUserStore()
    if (!userStore.currentUser) {
      return { success: false, message: '请先登录' }
    }

    isLoading.value = true
    const { answer, error } = await helpService.createAnswer(postId, userStore.currentUser.id, content)
    isLoading.value = false

    if (error) {
      logger.warn('发表回答失败:', error.message)
      return { success: false, message: error.message }
    }

    if (answer) {
      const post = helpPosts.value.find(p => p.id === postId)
      if (post) {
        post.answers += 1
      }

      return { success: true, message: '回答成功', answer }
    }

    return { success: false, message: '回答失败' }
  }

  const acceptAnswer = async (postId: string, answerId: string) => {
    isLoading.value = true
    const { error } = await helpService.acceptAnswer(postId, answerId)
    isLoading.value = false

    if (error) {
      logger.warn('采纳回答失败:', error.message)
      return { success: false, message: error.message }
    }

    const post = helpPosts.value.find(p => p.id === postId)
    if (post) {
      post.status = 'resolved'
      post.statusLabel = '已解决'
    }

    return { success: true, message: '采纳成功' }
  }

  return {
    helpPosts,
    currentZone,
    isLoading,
    filteredPosts,
    setZone,
    getZoneConfig,
    getHelpPostById,
    loadHelpPosts,
    loadHelpPostById,
    createHelpPost,
    createAnswer,
    acceptAnswer
  }
}, {
  persist: {
    key: 'petcircle_help',
    storage: localStorage,
    paths: ['currentZone']
  }
})