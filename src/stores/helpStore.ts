import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { helpService, type HelpPost as ApiHelpPost } from '@/services/helpService'
import { notificationService } from '@/services/notificationService'
import { zoneConfig, type HelpPost } from '@/mock/helpPosts'
import { useUserStore } from './userStore'
import { handleApiError } from '@/utils/errorHandler'
import { logger } from '@/utils/logger'
import { supabase } from '@/supabase/supabaseClient'

// Internal type with raw ISO date for reliable sorting
type HelpPostWithSort = HelpPost & { _sortDate?: string }

const mapApiHelpPostToHelpPost = (apiPost: ApiHelpPost): HelpPostWithSort => ({
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
  createdAt: formatDate(apiPost.created_at),
  _sortDate: apiPost.created_at  // raw ISO for reliable sorting
})

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString // already formatted, return as-is
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

// Sort: urgent first (resolved urgent posts are treated as non-urgent), then by raw ISO date descending
const sortHelpPosts = (posts: HelpPostWithSort[]): HelpPostWithSort[] => {
  return [...posts].sort((a, b) => {
    // Resolved urgent posts should sort as non-urgent
    const aIsUrgent = a.isUrgent && a.status !== 'resolved'
    const bIsUrgent = b.isUrgent && b.status !== 'resolved'
    if (aIsUrgent && !bIsUrgent) return -1
    if (!aIsUrgent && bIsUrgent) return 1
    const rawA = a._sortDate || a.createdAt
    const rawB = b._sortDate || b.createdAt
    const timeA = new Date(rawA).getTime()
    const timeB = new Date(rawB).getTime()
    if (!isNaN(timeA) && !isNaN(timeB)) return timeB - timeA
    return 0 // fallback: keep original order if dates can't be parsed
  })
}

// In-place update of a post in the reactive array, preserving reactivity
const updatePostInStore = (posts: HelpPostWithSort[], postId: string, updates: Partial<HelpPostWithSort>) => {
  const index = posts.findIndex(p => p.id === postId)
  if (index >= 0) {
    posts[index] = { ...posts[index], ...updates }
  }
}

export const useHelpStore = defineStore('help', () => {
  const helpPosts = ref<HelpPostWithSort[]>([])
  const currentZone = ref<'all' | 'experience' | 'question' | 'rescue' | 'mutual'>('all')
  const isLoading = ref(false)

  const filteredPosts = computed(() => {
    if (currentZone.value === 'all') {
      return sortHelpPosts(helpPosts.value) as HelpPost[]
    }
    return sortHelpPosts(
      helpPosts.value.filter(p => p.zone === currentZone.value)
    ) as HelpPost[]
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
      helpPosts.value = []
      return { success: true, message: '没有更多帖子' }
    }

    const mappedPosts = loadedPosts.map(mapApiHelpPostToHelpPost)

    // Merge: server data always takes precedence, then keep local-only posts
    const serverIdSet = new Set(mappedPosts.map(p => p.id))
    const localOnlyPosts = helpPosts.value.filter(p => !serverIdSet.has(p.id))

    helpPosts.value = [...mappedPosts, ...localOnlyPosts]

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

    const { data: authData } = await supabase.auth.getUser()
    console.log('[HelpStore] createHelpPost - authData.user.id:', authData?.user?.id)
    console.log('[HelpStore] createHelpPost - userStore.currentUser.id:', userStore.currentUser.id)

    if (!authData?.user) {
      console.warn('LocalStorage有用户信息但Supabase认证已过期，尝试重新登录')
      await userStore.autoLogin()
      if (!userStore.currentUser) {
        return { success: false, message: '登录状态已过期，请重新登录' }
      }
    }

    if (authData?.user?.id !== userStore.currentUser.id) {
      console.error('[HelpStore] ID不匹配! auth:', authData?.user?.id, 'store:', userStore.currentUser.id)
      return { success: false, message: '用户认证状态异常，请重新登录' }
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
      console.error('[HelpStore] 发布互助帖子错误:', error)
      console.error('[HelpStore] 错误详情:', JSON.stringify(error, null, 2))
      const errorMessage = error.message || '发布互助帖子失败'
      return { success: false, message: errorMessage }
    }

    if (post) {
      const newPost = mapApiHelpPostToHelpPost(post)
      helpPosts.value.push(newPost)
      return { success: true, message: '发布成功', post: newPost }
    }

    return { success: false, message: '发布失败：未返回数据' }
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
        // Notify help post author (fire-and-forget)
        if (post.authorId && post.authorId !== userStore.currentUser.id) {
          notificationService.createNotification(post.authorId, 'help_answer', postId)
        }
      }

      return { success: true, message: '回答成功', answer }
    }

    return { success: false, message: '回答失败' }
  }

  const acceptAnswer = async (postId: string, answerId: string) => {
    isLoading.value = true
    const { error, acceptedAnswer } = await helpService.acceptAnswer(postId, answerId)
    isLoading.value = false

    if (error) {
      logger.warn('采纳回答失败:', error.message)
      return { success: false, message: error.message }
    }

    // In-place update triggers reactivity without replacing entire array
    updatePostInStore(helpPosts.value, postId, {
      status: 'resolved',
      statusLabel: '已解决',
      acceptedAnswer: acceptedAnswer || undefined
    })

    return { success: true, message: '采纳成功' }
  }

  const endHelp = async (postId: string) => {
    isLoading.value = true
    const { error } = await helpService.updateHelpPostStatus(postId, 'resolved')
    isLoading.value = false

    if (error) {
      logger.warn('结束求助失败:', error.message)
      return { success: false, message: error.message }
    }

    // In-place update triggers reactivity without replacing entire array
    updatePostInStore(helpPosts.value, postId, {
      status: 'resolved',
      statusLabel: '已解决'
    })

    return { success: true, message: '求助已结束' }
  }

  const deleteHelpPost = async (postId: string) => {
    isLoading.value = true
    const { success, error } = await helpService.deleteHelpPost(postId)
    isLoading.value = false

    if (!success) {
      return { success: false, message: error?.message || '删除失败' }
    }

    helpPosts.value = helpPosts.value.filter(p => p.id !== postId)

    return { success: true, message: '删除成功' }
  }

  const updateHelpPost = async (postId: string, postData: Partial<Omit<HelpPost, 'id' | 'authorId' | 'authorName' | 'authorAvatar' | 'answers' | 'createdAt' | 'zoneLabel' | 'statusLabel'>>) => {
    isLoading.value = true
    const { post, error } = await helpService.updateHelpPost(postId, {
      zone: postData.zone,
      title: postData.title,
      content: postData.content,
      status: postData.status,
      is_urgent: postData.isUrgent,
      location: postData.location
    })
    isLoading.value = false

    if (error) {
      logger.warn('更新求助帖失败:', error.message)
      return { success: false, message: error.message }
    }

    if (post) {
      const mappedPost = mapApiHelpPostToHelpPost(post)
      updatePostInStore(helpPosts.value, postId, mappedPost)
      return { success: true, message: '更新成功', post: mappedPost }
    }

    return { success: false, message: '更新失败' }
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
    acceptAnswer,
    endHelp,
    deleteHelpPost,
    updateHelpPost
  }
}, {
  persist: {
    key: 'petcircle_help',
    storage: localStorage,
    paths: ['currentZone']
  }
})
