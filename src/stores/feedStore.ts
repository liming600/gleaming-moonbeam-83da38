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

  const petTips = [
    {
      title: '猫咪呕吐的几种常见原因及应对方法',
      content: '猫咪偶尔呕吐是正常的，但如果频率较高就需要注意了。常见原因包括：1）毛球症：定期梳毛和喂食化毛膏可以预防；2）饮食过快：使用慢食碗；3）食物不新鲜或过敏；4）肠胃疾病：持续呕吐需就医。',
      category: '🐱 猫咪养护',
      tags: ['猫咪', '健康', '呕吐']
    },
    {
      title: '狗狗洗澡的正确频率和注意事项',
      content: '狗狗洗澡频率取决于品种和活动量：短毛犬1-2周一次，长毛犬1周一次。注意事项：1）使用专用宠物沐浴露；2）水温控制在38-40°C；3）避免水进入耳朵和眼睛；4）洗完彻底吹干。',
      category: '🐶 狗狗养护',
      tags: ['狗狗', '洗澡', '护理']
    },
    {
      title: '如何帮助宠物度过炎热夏季',
      content: '夏季高温对宠物是巨大挑战。防暑要点：1）保证充足饮水；2）避免正午外出；3）提供阴凉休息处；4）不要将宠物单独留在车内；5）注意修剪毛发但不要剃光；6）警惕中暑症状。',
      category: '☀️ 季节护理',
      tags: ['防暑', '夏季', '健康']
    },
    {
      title: '宠物口腔护理的重要性和方法',
      content: '口腔问题是宠物常见疾病。护理方法：1）定期刷牙（每周2-3次）；2）提供洁牙零食和玩具；3）定期检查口腔；4）牙结石严重时需专业洗牙。',
      category: '🦷 口腔健康',
      tags: ['口腔', '护理', '牙齿']
    },
    {
      title: '正确的宠物营养配比和喂食原则',
      content: '宠物饮食需遵循：1）选择优质主粮；2）不要喂食人类食物（巧克力、洋葱等有毒）；3）控制零食量；4）定时定量喂食；5）根据年龄和体重调整食量；6）保证新鲜饮水。',
      category: '🍖 营养饮食',
      tags: ['饮食', '营养', '喂食']
    },
    {
      title: '猫咪应激反应的识别和缓解',
      content: '猫咪敏感，环境变化容易应激。表现：躲起来、食欲下降、过度舔毛。缓解方法：1）提供安全空间；2）保持环境稳定；3）使用信息素喷雾；4）耐心安抚，不要强迫互动。',
      category: '🐱 猫咪养护',
      tags: ['猫咪', '应激', '心理']
    },
    {
      title: '宠物疫苗接种时间表和注意事项',
      content: '疫苗是保护宠物健康的关键。幼宠首次免疫：8周开始，间隔3-4周，共3针猫/狗四联+1针狂犬。成年后每年加强。接种前后一周避免洗澡和外出。',
      category: '💉 疫苗接种',
      tags: ['疫苗', '健康', '免疫']
    },
    {
      title: '如何正确训练狗狗定点大小便',
      content: '定点训练关键：1）规律作息，定时带出门；2）选择固定地点；3）成功后及时奖励；4）耐心引导，不要打骂；5）准备尿垫备用；6）循序渐进，一般1-2周可学会。',
      category: '🐶 狗狗训练',
      tags: ['狗狗', '训练', '定点']
    },
    {
      title: '宠物毛发护理的常见误区',
      content: '错误护理会伤害宠物：1）频繁洗澡破坏皮肤屏障；2）用人用梳子伤害毛发；3）吹干不彻底导致皮肤病；4）忽视换毛期护理；5）剪毛过短损伤毛囊。',
      category: '✂️ 毛发护理',
      tags: ['毛发', '护理', '误区']
    },
    {
      title: '老年宠物的特殊照顾要点',
      content: '老年宠物需要更多关爱：1）定期体检，关注器官功能；2）提供易消化的老年粮；3）适当运动但避免过度；4）温暖舒适的休息环境；5）关注牙齿和关节健康；6）多陪伴。',
      category: '👴 老年护理',
      tags: ['老年', '护理', '健康']
    }
  ]

  const getDailyPetTip = () => {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    return petTips[dayOfYear % petTips.length]
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
    getDailyPetTip,
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