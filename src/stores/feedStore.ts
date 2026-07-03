import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { postService, type Post as ApiPost } from '@/services/postService'
import { mockPosts, dailyQuotes, type Post } from '@/mock/posts'
import { useUserStore } from './userStore'

const mapApiPostToPost = (apiPost: ApiPost, isLiked: boolean = false): Post => ({
  id: apiPost.id,
  petId: apiPost.pet_id,
  petName: apiPost.pet_name,
  petAvatar: apiPost.pet_avatar,
  content: apiPost.content,
  images: apiPost.images,
  tags: apiPost.tags,
  createdAt: formatDate(apiPost.created_at),
  date: apiPost.date,
  likes: apiPost.likes_count,
  comments: apiPost.comments_count,
  isLiked,
  isDiary: apiPost.is_diary ?? false,
  isPublic: apiPost.is_public ?? true,
  mood: apiPost.mood,
  location: apiPost.location
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

export const useFeedStore = defineStore('feed', () => {
  const posts = ref<Post[]>(mockPosts)
  const currentTab = ref<'recommend' | 'latest'>('recommend')
  const isLoading = ref(false)
  const hasMore = ref(true)
  const currentPage = ref(1)

  const filteredPosts = computed(() => {
    if (currentTab.value === 'latest') {
      return [...posts.value].sort((a, b) => {
        const order = ['刚刚', '10分钟前', '1小时前', '2小时前', '3小时前', '5小时前', '6小时前', '8小时前', '昨天', '2天前', '3天前', '4天前']
        const aIndex = order.indexOf(a.createdAt)
        const bIndex = order.indexOf(b.createdAt)
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        return aIndex - bIndex
      })
    }
    return posts.value
  })

  const toggleLike = async (postId: string) => {
    const userStore = useUserStore()
    if (!userStore.currentUser) {
      return { success: false, message: '请先登录' }
    }

    const post = posts.value.find(p => p.id === postId)
    if (!post) {
      return { success: false, message: '帖子不存在' }
    }

    const { isLiked, error } = await postService.toggleLike(postId, userStore.currentUser.id)

    if (error) {
      console.warn('点赞失败:', error.message)
      return { success: false, message: error.message }
    }

    post.isLiked = isLiked
    post.likes += isLiked ? 1 : -1

    return { success: true, message: isLiked ? '点赞成功' : '取消点赞' }
  }

  const checkLike = async (postId: string) => {
    const userStore = useUserStore()
    if (!userStore.currentUser) {
      return false
    }

    const { isLiked, error } = await postService.checkLike(postId, userStore.currentUser.id)

    if (error) {
      console.warn('检查点赞状态失败:', error.message)
      return false
    }

    return isLiked
  }

  const setTab = (tab: 'recommend' | 'latest') => {
    currentTab.value = tab
  }

  const getDailyQuote = () => {
    return dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)]
  }

  const loadPosts = async (page: number = 1, reset: boolean = false) => {
    isLoading.value = true
    const userStore = useUserStore()

    if (reset) {
      currentPage.value = 1
      hasMore.value = true
    }

    const { posts: loadedPosts, error } = await postService.getPosts(page, 20)

    if (error) {
      isLoading.value = false
      console.warn('加载帖子失败:', error.message)
      return { success: false, message: error.message }
    }

    if (loadedPosts.length === 0) {
      isLoading.value = false
      hasMore.value = false
      return { success: true, message: '没有更多帖子' }
    }

    const mappedPosts = await Promise.all(
      loadedPosts.map(async (apiPost) => {
        if (userStore.currentUser) {
          const { isLiked } = await postService.checkLike(apiPost.id, userStore.currentUser.id)
          return mapApiPostToPost(apiPost, isLiked)
        }
        return mapApiPostToPost(apiPost, false)
      })
    )

    if (reset) {
      posts.value = [...mappedPosts, ...posts.value.filter(p => !mappedPosts.some(mp => mp.id === p.id))]
    } else {
      posts.value = [...posts.value, ...mappedPosts.filter(mp => !posts.value.some(p => p.id === mp.id))]
    }

    currentPage.value = page
    isLoading.value = false

    return { success: true, message: '加载成功' }
  }

  const loadPostsByPet = async (petId: string) => {
    isLoading.value = true
    const userStore = useUserStore()
    const { posts: loadedPosts, error } = await postService.getPostsByPet(petId)

    if (error) {
      isLoading.value = false
      console.warn('加载宠物帖子失败:', error.message)
      return { success: false, message: error.message }
    }

    const mappedPosts = await Promise.all(
      loadedPosts.map(async (apiPost) => {
        if (userStore.currentUser) {
          const { isLiked } = await postService.checkLike(apiPost.id, userStore.currentUser.id)
          return mapApiPostToPost(apiPost, isLiked)
        }
        return mapApiPostToPost(apiPost, false)
      })
    )

    const existingPetPosts = posts.value.filter(p => p.petId !== petId)
    posts.value = [...existingPetPosts, ...mappedPosts]

    isLoading.value = false
    return { success: true, message: '加载成功' }
  }

  const addPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'isLiked' | 'isDiary' | 'isPublic'>) => {
    const userStore = useUserStore()
    if (!userStore.currentUser) {
      return { success: false, message: '请先登录' }
    }

    isLoading.value = true
    const { post, error } = await postService.createPost({
      pet_id: postData.petId,
      content: postData.content,
      images: postData.images,
      tags: postData.tags,
      is_public: true,
      is_diary: false,
      mood: postData.mood,
      location: postData.location,
      date: new Date().toISOString().split('T')[0]
    })
    isLoading.value = false

    if (error) {
      console.warn('发布帖子失败:', error.message)
      return { success: false, message: error.message }
    }

    if (post) {
      const newPost = mapApiPostToPost(post)
      posts.value.unshift(newPost)
      return { success: true, message: '发布成功', post: newPost }
    }

    return { success: false, message: '发布失败' }
  }

  const addDiary = async (diaryData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'isLiked' | 'isDiary'>) => {
    const userStore = useUserStore()
    if (!userStore.currentUser) {
      return { success: false, message: '请先登录' }
    }

    isLoading.value = true
    const { post, error } = await postService.createPost({
      pet_id: diaryData.petId,
      content: diaryData.content,
      images: diaryData.images,
      tags: diaryData.tags,
      is_public: diaryData.isPublic ?? true,
      is_diary: true,
      mood: diaryData.mood,
      location: diaryData.location,
      date: new Date().toISOString().split('T')[0]
    })
    isLoading.value = false

    if (error) {
      console.warn('写日记失败:', error.message)
      return { success: false, message: error.message }
    }

    if (post) {
      const newDiary = mapApiPostToPost(post)
      posts.value.unshift(newDiary)
      return { success: true, message: '日记保存成功', post: newDiary }
    }

    return { success: false, message: '保存失败' }
  }

  const loadPostById = async (postId: string) => {
    isLoading.value = true
    const userStore = useUserStore()
    const { post, error } = await postService.getPostById(postId)

    if (error) {
      isLoading.value = false
      console.warn('加载帖子详情失败:', error.message)
      return { success: false, message: error.message }
    }

    if (post) {
      let isLiked = false
      if (userStore.currentUser) {
        const { isLiked: liked } = await postService.checkLike(postId, userStore.currentUser.id)
        isLiked = liked
      }

      const mappedPost = mapApiPostToPost(post, isLiked)
      const index = posts.value.findIndex(p => p.id === postId)
      if (index >= 0) {
        posts.value[index] = mappedPost
      } else {
        posts.value.push(mappedPost)
      }

      isLoading.value = false
      return { success: true, message: '加载成功', post: mappedPost }
    }

    isLoading.value = false
    return { success: false, message: '帖子不存在' }
  }

  const addComment = async (postId: string, content: string) => {
    const userStore = useUserStore()
    if (!userStore.currentUser) {
      return { success: false, message: '请先登录' }
    }

    isLoading.value = true
    const { comment, error } = await postService.createComment(postId, userStore.currentUser.id, content)
    isLoading.value = false

    if (error) {
      console.warn('发表评论失败:', error.message)
      return { success: false, message: error.message }
    }

    if (comment) {
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        post.comments += 1
      }

      return { success: true, message: '评论成功', comment }
    }

    return { success: false, message: '评论失败' }
  }

  return {
    posts,
    currentTab,
    isLoading,
    hasMore,
    currentPage,
    filteredPosts,
    toggleLike,
    checkLike,
    setTab,
    getDailyQuote,
    loadPosts,
    loadPostsByPet,
    loadPostById,
    addPost,
    addDiary,
    addComment
  }
}, {
  persist: {
    key: 'petcircle_feed',
    storage: localStorage,
    paths: ['currentTab']
  }
})