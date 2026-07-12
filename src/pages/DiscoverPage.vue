<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Search, Sparkles, Flame, Store, Star, X, PawPrint, User, Clock, Building2, ChevronRight, Hash, ArrowLeft } from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { businessCategories } from '@/mock/business'
import { discoverService, type Business, type Blogger } from '@/services/discoverService'
import { searchService, type SearchResult, type SearchHistoryItem } from '@/services/searchService'
import { followService } from '@/services/followService'
import { handleApiError } from '@/utils/errorHandler'

const userStore = useUserStore()
const router = useRouter()
const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])
const isSearching = ref(false)
const showSearchResults = ref(false)
const showSearchHistory = ref(false)
const activeCategory = ref<string | null>(null)
const activeResultTab = ref<'user' | 'business' | 'pet' | 'post'>('user')

const hotSearches = computed(() => searchService.getHotSearches())
const searchHistory = ref<SearchHistoryItem[]>([])

const groupedResults = computed(() => {
  const groups: Record<string, SearchResult[]> = {
    user: [],
    business: [],
    pet: [],
    post: []
  }
  searchResults.value.forEach(result => {
    groups[result.type].push(result)
  })
  return groups
})

const filteredResults = computed(() => {
  return groupedResults.value[activeResultTab.value] || []
})

const businesses = ref<Business[]>([])
const bloggers = ref<Blogger[]>([])
const isLoading = ref(true)

const resultTabs = [
  { key: 'user', label: '用户', icon: User },
  { key: 'business', label: '商家', icon: Building2 },
  { key: 'pet', label: '宠物', icon: PawPrint },
  { key: 'post', label: '帖子', icon: Hash }
] as const

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    showSearchResults.value = false
    showSearchHistory.value = true
    return
  }

  isSearching.value = true
  showSearchHistory.value = false
  const { results, error } = await searchService.searchAll(searchQuery.value.trim())
  isSearching.value = false

  if (error) {
    handleApiError(error, '搜索失败')
    return
  }

  searchResults.value = results
  showSearchResults.value = true
  activeResultTab.value = 'user'
}

const handleHotSearch = (keyword: string) => {
  searchQuery.value = keyword
  showSearchHistory.value = false
  showSearchResults.value = true
  isSearching.value = true
  handleSearch()
}

const handleHistorySearch = (query: string) => {
  searchQuery.value = query
  showSearchHistory.value = false
  showSearchResults.value = true
  isSearching.value = true
  handleSearch()
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  showSearchResults.value = false
  showSearchHistory.value = false
}

const clearSearchInput = () => {
  searchQuery.value = ''
}

const clearHistory = () => {
  searchService.clearHistory()
  loadSearchHistory()
}

const loadSearchHistory = () => {
  searchHistory.value = searchService.getHistory()
}

const goToUserProfile = (userId: string) => {
  router.push(`/user/${userId}`)
  clearSearch()
}

const goToPostDetail = (postId: string) => {
  router.push(`/post/${postId}`)
  clearSearch()
}

const goToPetProfile = (petId: string) => {
  router.push(`/pet/${petId}`)
  clearSearch()
}

const formatFollowers = (count: number) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

const handleCategoryClick = (key: string) => {
  activeCategory.value = key
}

const followBlogger = async (bloggerId: string) => {
  if (!userStore.currentUser) {
    router.push('/login')
    return
  }

  const blogger = bloggers.value.find(b => b.id === bloggerId)
  if (!blogger) return

  const isFollowing = blogger.following || false

  if (isFollowing) {
    const { success, error } = await followService.unfollow(userStore.currentUser.id, bloggerId)
    if (success) {
      blogger.following = false
      blogger.followers -= 1
    } else if (error) {
      handleApiError(error, '取消关注失败')
    }
  } else {
    const { success, error } = await followService.follow(userStore.currentUser.id, bloggerId)
    if (success) {
      blogger.following = true
      blogger.followers += 1
    } else if (error) {
      handleApiError(error, '关注失败')
    }
  }
}

watch(searchQuery, (val) => {
  if (!val) {
    showSearchHistory.value = true
    loadSearchHistory()
  } else {
    showSearchHistory.value = false
  }
})

onMounted(async () => {
  loadSearchHistory()

  isLoading.value = true
  const [businessesResult, bloggersResult] = await Promise.all([
    discoverService.getBusinesses(),
    discoverService.getBloggers()
  ])
  
  if (!businessesResult.error) {
    businesses.value = businessesResult.businesses.sort((a, b) => b.rating - a.rating)
  }
  
  if (!bloggersResult.error) {
    bloggers.value = bloggersResult.bloggers
    if (userStore.currentUser) {
      for (const blogger of bloggers.value) {
        const { following } = await followService.isFollowing(userStore.currentUser.id, blogger.id)
        blogger.following = following
      }
    }
  }
  
  isLoading.value = false
})
</script>

<template>
  <div class="discover-page">
    <header class="header">
      <div class="page-content">
        <div class="search-box" @click="showSearchHistory = true">
          <Search :size="18" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索你感兴趣的内容..."
            class="search-input"
            @keyup.enter="handleSearch"
            @focus="showSearchHistory = true"
          />
          <button v-if="searchQuery" class="clear-btn" @click.stop="clearSearch">
            <X :size="16" />
          </button>
        </div>
      </div>
    </header>

    <div v-if="showSearchResults || showSearchHistory" class="search-results-overlay">
      <div class="search-results-container">
        <div class="results-header">
          <button class="back-btn" @click="clearSearch">
            <ArrowLeft :size="20" />
          </button>
          <div class="search-box-result">
            <Search :size="16" class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              class="search-input-result"
              @keyup.enter="handleSearch"
            />
            <button v-if="searchQuery" class="clear-btn" @click.stop="clearSearchInput">
              <X :size="14" />
            </button>
          </div>
        </div>
        
        <template v-if="showSearchResults">
          <div class="result-tabs">
            <button
              v-for="tab in resultTabs"
              :key="tab.key"
              class="result-tab"
              :class="{ active: activeResultTab === tab.key }"
              @click="activeResultTab = tab.key"
            >
              <component :is="tab.icon" :size="14" class="tab-icon" />
              <span class="tab-label">{{ tab.label }}</span>
              <span v-if="groupedResults[tab.key].length > 0" class="tab-count">{{ groupedResults[tab.key].length }}</span>
            </button>
          </div>
          
          <div class="results-list">
            <div v-if="isSearching" class="searching-indicator">
              <span class="loading-text">搜索中...</span>
            </div>
            <div v-else-if="filteredResults.length === 0" class="no-results">
              <span class="no-results-text">没有找到{{ resultTabs.find(t => t.key === activeResultTab)?.label }}相关内容</span>
            </div>
            
            <div
              v-for="(result, index) in filteredResults"
              :key="index"
              class="search-result-item"
              @click="result.type === 'pet' ? goToPetProfile((result.data as any).id) : result.type === 'user' || result.type === 'business' ? goToUserProfile((result.data as any).id) : goToPostDetail((result.data as any).id)"
            >
              <img 
                v-if="result.type !== 'post'"
                :src="(result.data as any).avatar_url || (result.data as any).avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20pet%20avatar&image_size=square'" 
                class="result-avatar" 
              />
              <div v-else class="result-icon-wrapper"><Hash :size="20" /></div>
              <div class="result-info">
                <span class="result-title">
                  {{ result.type === 'pet' ? (result.data as any).name : result.type === 'user' ? (result.data as any).name : result.type === 'business' ? (result.data as any).name : ((result.data as any).content || '').slice(0, 30) }}
                </span>
                <span v-if="result.type === 'pet'" class="result-desc">
                  {{ (result.data as any).breed || '未知品种' }}
                </span>
                <span v-else-if="result.type === 'user'" class="result-desc">
                  {{ (result.data as any).email || '用户' }}
                </span>
                <span v-else-if="result.type === 'business'" class="result-desc">
                  {{ (result.data as any).category || '商家' }} · 评分 {{ (result.data as any).rating }}
                </span>
                <span v-else class="result-desc">
                  {{ ((result.data as any).content || '').length > 30 ? ((result.data as any).content || '').slice(30, 60) + '...' : '' }}
                </span>
              </div>
              <ChevronRight :size="14" class="result-arrow" />
            </div>
          </div>
        </template>
        
        <template v-else-if="showSearchHistory">
          <div class="history-header">
            <div class="history-header-left">
              <Clock :size="16" class="history-title-icon" />
              <span class="history-title">搜索历史</span>
            </div>
            <button v-if="searchHistory.length > 0" class="clear-history-btn" @click="clearHistory">清空</button>
          </div>
          <div v-if="searchHistory.length > 0" class="history-list">
            <div
              v-for="(item, index) in searchHistory"
              :key="index"
              class="history-item"
              @click="handleHistorySearch(item.query)"
            >
              <Clock :size="16" class="history-icon" />
              <span class="history-text">{{ item.query }}</span>
            </div>
          </div>
          <div v-else class="no-history">
            <span class="no-history-text">暂无搜索记录</span>
          </div>
          <div class="hot-searches-section">
            <div class="hot-header">
              <Flame :size="16" class="hot-icon" />
              <span class="hot-title">热门搜索</span>
            </div>
            <div class="hot-list-grid">
              <div
                v-for="(hot, index) in hotSearches.slice(0, 8)"
                :key="index"
                class="hot-item-grid"
                @click="handleHotSearch(hot.keyword)"
              >
                <span class="hot-rank-grid" :class="{ 'top-three': index < 3 }">{{ index + 1 }}</span>
                <span class="hot-keyword-grid">{{ hot.keyword }}</span>
                <span class="hot-count-grid">{{ hot.count }}次</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="page-content content">
      <div class="business-section">
        <div class="section-header">
          <Store :size="20" class="section-icon" />
          <h2 class="section-title">服务分类</h2>
        </div>
        <div class="business-categories">
          <button
            v-for="cat in businessCategories"
            :key="cat.key"
            class="category-btn"
            :class="{ active: activeCategory === cat.key }"
            @click="handleCategoryClick(cat.key)"
          >
            <div class="category-icon" :style="{ background: cat.color + '15' }">
              <span>{{ cat.icon }}</span>
            </div>
            <span class="category-label">{{ cat.label }}</span>
          </button>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <Store :size="20" class="section-icon" />
          <h2 class="section-title">精选商家</h2>
          <span class="section-more-text">查看更多</span>
        </div>
        <div v-if="isLoading" class="loading-row">
          <div class="loading-card" v-for="i in 3" :key="i"></div>
        </div>
        <div v-else class="business-scroll">
          <div
            v-for="biz in businesses.slice(0, 6)"
            :key="biz.id"
            class="business-card"
          >
            <div class="business-cover-wrapper">
              <img v-lazy="biz.avatar" :alt="biz.name" class="business-cover" />
              <span class="business-type-tag">{{ biz.category }}</span>
              <div class="business-rating-badge">
                <Star :size="10" class="star-icon" />
                <span>{{ biz.rating }}</span>
              </div>
            </div>
            <div class="business-info">
              <h3 class="business-name">{{ biz.name }}</h3>
              <div class="business-meta">
                <span class="reviews">{{ biz.reviews }}条评价</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <Sparkles :size="20" class="section-icon" />
          <h2 class="section-title">达人推荐</h2>
          <span class="section-more-text">查看更多</span>
        </div>
        <div v-if="isLoading" class="loading-row">
          <div class="loading-card" v-for="i in 3" :key="i"></div>
        </div>
        <div v-else class="bloggers-scroll">
          <div
            v-for="blogger in bloggers"
            :key="blogger.id"
            class="blogger-card"
          >
            <img v-lazy="blogger.avatar" :alt="blogger.name" class="blogger-avatar" />
            <div class="blogger-info">
              <span class="blogger-name">{{ blogger.name }}</span>
              <span class="blogger-stats">{{ formatFollowers(blogger.followers) }}粉丝 · {{ blogger.posts }}作品</span>
            </div>
            <button 
              class="follow-btn"
              :class="{ 'followed': blogger.following }"
              @click.stop="followBlogger(blogger.id)"
            >
              {{ blogger.following ? '已关注' : '+ 关注' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.discover-page {
  min-height: 100vh;
  background-color: #F8F8F8;
  padding-bottom: 80px;
}

.header {
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 50;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: #999;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 14px 0 40px;
  background: #EEEEEE;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: #333;
  outline: none;
}

.search-input::placeholder {
  color: #999;
}

.content {
  padding: 12px;
}

.hot-search-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.hot-search-card-grid {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hot-search-card-grid:active {
  opacity: 0.7;
}

.hot-rank-grid {
  font-size: 13px;
  font-weight: 600;
  color: #999;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}

.hot-rank-grid.top-three {
  color: #FF6633;
}

.hot-keyword-grid {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.hot-count-grid {
  font-size: 13px;
  color: #999;
  flex-shrink: 0;
}

.business-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
}

.section-icon {
  color: #FF6633;
  flex-shrink: 0;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.section-more {
  color: #999;
  flex-shrink: 0;
}

.section-more-text {
  font-size: 13px;
  color: #999;
  cursor: pointer;
}

.business-categories {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 8px 0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.category-btn.active {
  background: rgba(255, 102, 51, 0.08);
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s ease;
}

.category-btn.active .category-icon {
  transform: scale(1.1);
}

.category-label {
  font-size: 11px;
  font-weight: 500;
  color: #666;
}

.section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.business-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}

.business-scroll::-webkit-scrollbar {
  display: none;
}

.business-card {
  background: #FAFAFA;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  width: 150px;
}

.business-card:active {
  transform: scale(0.98);
}

.business-cover-wrapper {
  position: relative;
  width: 150px;
  height: 100px;
  overflow: hidden;
}

.business-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.business-type-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #FF6633;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.business-rating-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 8px;
  background: rgba(0, 0, 0, 0.5);
  color: #FFD700;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 2px;
}

.star-icon {
  fill: #FFD700;
}

.business-info {
  padding: 10px;
}

.business-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.business-meta {
  display: flex;
  align-items: center;
  gap: 4px;
}

.reviews {
  font-size: 11px;
  color: #999;
}

.loading-row {
  display: flex;
  gap: 10px;
  padding: 8px 0;
}

.loading-card {
  flex-shrink: 0;
  width: 140px;
  height: 160px;
  background: linear-gradient(90deg, #F5F5F5 25%, #E8E8E8 50%, #F5F5F5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.bloggers-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}

.bloggers-scroll::-webkit-scrollbar {
  display: none;
}

.blogger-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #FAFAFA;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  min-width: 90px;
}

.blogger-card:active {
  transform: scale(0.98);
}

.blogger-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #FFE0D6;
  flex-shrink: 0;
}

.blogger-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.blogger-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.blogger-stats {
  font-size: 11px;
  color: #999;
}

.follow-btn {
  padding: 6px 14px;
  background: linear-gradient(135deg, #FF6633, #FF9933);
  color: #fff;
  border: none;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.follow-btn:active {
  transform: scale(0.95);
}

.follow-btn.followed {
  background: #EEEEEE;
  color: #666;
}

.search-results-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.search-results-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.results-header {
  padding: 12px 16px;
  border-bottom: 1px solid #F5F5F5;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
}

.history-header {
  padding: 16px;
  border-bottom: 1px solid #F5F5F5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.results-count,
.history-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.history-title-icon {
  color: #FF6633;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #F5F5F5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  cursor: pointer;
}

.clear-history-btn {
  font-size: 13px;
  color: #FF6633;
  border: none;
  background: transparent;
  cursor: pointer;
}

.back-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  cursor: pointer;
  flex-shrink: 0;
}

.back-btn:active {
  background: #F5F5F5;
}

.search-box-result {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-result {
  width: 100%;
  height: 36px;
  padding: 0 14px 0 36px;
  background: #EEEEEE;
  border: none;
  border-radius: 18px;
  font-size: 14px;
  color: #333;
  outline: none;
}

.search-input-result:focus {
  background: #fff;
  border: 1px solid #FF6633;
}

.result-tabs {
  display: flex;
  padding: 12px 16px;
  gap: 8px;
  border-bottom: 1px solid #F5F5F5;
  background: #FAFAFA;
}

.result-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #999;
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-tab.active {
  background: #FF6633;
  color: #fff;
}

.tab-icon {
  flex-shrink: 0;
}

.tab-count {
  font-size: 11px;
  opacity: 0.8;
}

.results-list {
  flex: 1;
  overflow-y: auto;
}

.history-list {
  max-height: calc(60vh - 100px);
  overflow-y: auto;
}

.searching-indicator,
.no-results,
.no-history {
  padding: 32px;
  text-align: center;
}

.loading-text,
.no-results-text,
.no-history-text {
  font-size: 14px;
  color: #999;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.search-result-item:active {
  background: #FAFAFA;
}

.result-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.result-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #F3E8FF;
  color: #9B59B6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-title {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.result-desc {
  display: block;
  font-size: 13px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-arrow {
  color: #CCC;
  flex-shrink: 0;
}

.clear-btn {
  position: absolute;
  right: 14px;
  width: 24px;
  height: 24px;
  border: none;
  background: #DDD;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  cursor: pointer;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
}

.history-item:active {
  background: #FAFAFA;
}

.history-icon {
  color: #999;
  flex-shrink: 0;
}

.history-text {
  font-size: 14px;
  color: #333;
}

.hot-searches-section {
  padding: 16px;
  border-top: 1px solid #F5F5F5;
}

.hot-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.hot-icon {
  color: #FF6633;
}

.hot-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.hot-list-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.hot-item-grid {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hot-item-grid:active {
  opacity: 0.7;
}

.hot-rank {
  font-size: 13px;
  font-weight: 600;
  color: #999;
  width: 20px;
  text-align: center;
}

.hot-rank.top-three {
  color: #FF6633;
}

.hot-keyword {
  font-size: 14px;
  color: #333;
}

.hot-count {
  font-size: 13px;
  color: #999;
}

.hot-rank-grid {
  font-size: 13px;
  font-weight: 600;
  color: #999;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}

.hot-rank-grid.top-three {
  color: #FF6633;
}

.hot-keyword-grid {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.hot-count-grid {
  font-size: 13px;
  color: #999;
  flex-shrink: 0;
}
</style>