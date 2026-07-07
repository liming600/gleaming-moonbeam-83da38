<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Sparkles, TrendingUp, Users, Store, Star, X, PawPrint, User, MessageSquare } from 'lucide-vue-next'
import { usePetStore } from '@/stores/petStore'
import { useRouter } from 'vue-router'
import { businessCategories } from '@/mock/business'
import { discoverService, type Business, type Blogger } from '@/services/discoverService'
import { searchService, type SearchResult } from '@/services/searchService'
import { handleApiError } from '@/utils/errorHandler'
import { logger } from '@/utils/logger'

const petStore = usePetStore()
const router = useRouter()
const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])
const isSearching = ref(false)
const showSearchResults = ref(false)

const trendingTags = ['#萌宠', '#可爱', '#日常', '#调皮', '#吃货', '#户外']

const topPets = computed(() => petStore.pets.slice(0, 4))

const businesses = ref<Business[]>([])
const bloggers = ref<Blogger[]>([])
const isLoading = ref(true)

const goToPetProfile = (petId: string) => {
  router.push(`/pet/${petId}`)
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    showSearchResults.value = false
    return
  }

  isSearching.value = true
  const { results, error } = await searchService.searchAll(searchQuery.value.trim())
  isSearching.value = false

  if (error) {
    handleApiError(error, '搜索失败')
    return
  }

  searchResults.value = results
  showSearchResults.value = true
}

const handleTagSearch = (tag: string) => {
  searchQuery.value = tag.replace('#', '')
  handleSearch()
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  showSearchResults.value = false
}

const goToUserProfile = (userId: string) => {
  router.push(`/user/${userId}`)
  clearSearch()
}

const goToPostDetail = (postId: string) => {
  router.push(`/post/${postId}`)
  clearSearch()
}

const formatFollowers = (count: number) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

const handleCategoryClick = (key: string) => {
  logger.log('Category:', key)
}

const handleBusinessClick = (id: string) => {
  logger.log('Business:', id)
}

onMounted(async () => {
  isLoading.value = true
  const [businessesResult, bloggersResult] = await Promise.all([
    discoverService.getBusinesses(),
    discoverService.getBloggers()
  ])
  
  if (!businessesResult.error) {
    businesses.value = businessesResult.businesses
  }
  
  if (!bloggersResult.error) {
    bloggers.value = bloggersResult.bloggers
  }
  
  isLoading.value = false
})

const handleBloggerClick = (id: string) => {
  logger.log('Blogger:', id)
}
</script>

<template>
  <div class="discover-page">
    <header class="header">
      <div class="page-content">
        <div class="search-box">
          <Search :size="18" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索宠物、商家、话题..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
            <X :size="16" />
          </button>
        </div>
      </div>
    </header>

    <div v-if="showSearchResults" class="search-results-overlay">
      <div class="search-results-container">
        <div class="results-header">
          <span class="results-count">搜索结果 ({{ searchResults.length }})</span>
        </div>
        <div class="results-list">
          <div v-if="isSearching" class="searching-indicator">
            <span class="loading-text">搜索中...</span>
          </div>
          <div v-else-if="searchResults.length === 0" class="no-results">
            <span class="no-results-text">没有找到相关内容</span>
          </div>
          <div
            v-for="(result, index) in searchResults"
            :key="index"
            class="search-result-item"
            @click="result.type === 'pet' ? goToPetProfile((result.data as any).id) : result.type === 'user' ? goToUserProfile((result.data as any).id) : goToPostDetail((result.data as any).id)"
          >
            <div class="result-icon-wrapper" :class="result.type">
              <PawPrint v-if="result.type === 'pet'" :size="16" />
              <User v-else-if="result.type === 'user'" :size="16" />
              <MessageSquare v-else :size="16" />
            </div>
            <div class="result-info">
              <span class="result-title">
                {{ result.type === 'pet' ? (result.data as any).name : result.type === 'user' ? (result.data as any).name : '帖子' }}
              </span>
              <span v-if="result.type === 'pet'" class="result-desc">
                {{ (result.data as any).breed || '未知品种' }}
              </span>
              <span v-else-if="result.type === 'user'" class="result-desc">
                {{ (result.data as any).email || '用户' }}
              </span>
              <span v-else class="result-desc">
                {{ ((result.data as any).content || '').slice(0, 30) }}{{ ((result.data as any).content || '').length > 30 ? '...' : '' }}
              </span>
            </div>
            <span class="result-type-tag">{{ result.type === 'pet' ? '宠物' : result.type === 'user' ? '用户' : '帖子' }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="page-content content">
      <!-- 热门话题 -->
      <div class="section">
        <div class="section-header">
          <TrendingUp :size="20" class="section-icon" />
          <h2 class="section-title">热门话题</h2>
        </div>
        <div class="tags-grid">
          <button
            v-for="tag in trendingTags"
            :key="tag"
            class="tag-item"
            @click="handleTagSearch(tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- 人气宠物 -->
      <div class="section">
        <div class="section-header">
          <Users :size="20" class="section-icon" />
          <h2 class="section-title">人气宠物</h2>
        </div>
        <div class="pets-grid">
          <div
            v-for="pet in topPets"
            :key="pet.id"
            class="pet-card"
            @click="goToPetProfile(pet.id)"
          >
            <img v-lazy="pet.avatar" :alt="pet.name" class="pet-avatar" />
            <div class="pet-info">
              <span class="pet-name">{{ pet.name }}</span>
              <span class="pet-likes">❤️ {{ pet.likes }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 商家快捷入口 -->
      <div class="business-section">
        <div class="business-categories">
          <button
            v-for="cat in businessCategories"
            :key="cat.key"
            class="category-btn"
            @click="handleCategoryClick(cat.key)"
          >
            <div class="category-icon" :style="{ background: cat.color + '15' }">
              <span>{{ cat.icon }}</span>
            </div>
            <span class="category-label">{{ cat.label }}</span>
          </button>
        </div>
      </div>

      <!-- 精选商家推荐（横向滑动） -->
      <div class="section">
        <div class="section-header">
          <Store :size="20" class="section-icon" />
          <h2 class="section-title">精选商家</h2>
          <span class="section-more">查看更多</span>
        </div>
        <div v-if="isLoading" class="loading-row">
          <div class="loading-card" v-for="i in 3" :key="i"></div>
        </div>
        <div v-else class="business-scroll">
          <div
            v-for="biz in businesses"
            :key="biz.id"
            class="business-card"
            @click="handleBusinessClick(biz.id)"
          >
            <div class="business-cover-wrapper">
              <img v-lazy="biz.avatar" :alt="biz.name" class="business-cover" />
              <span class="business-type-tag">{{ biz.category }}</span>
            </div>
            <div class="business-info">
              <div class="business-name-row">
                <img v-lazy="biz.avatar" :alt="biz.name" class="business-logo" />
                <div class="business-detail">
                  <h3 class="business-name">{{ biz.name }}</h3>
                  <div class="business-meta">
                    <span class="rating">
                      <Star :size="12" class="star-icon" />
                      {{ biz.rating }}
                    </span>
                    <span class="distance">· {{ biz.reviews }}条评价</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 达人动态（横向滑动） -->
      <div class="section">
        <div class="section-header">
          <Sparkles :size="20" class="section-icon" />
          <h2 class="section-title">达人动态</h2>
          <span class="section-more">查看更多</span>
        </div>
        <div v-if="isLoading" class="loading-row">
          <div class="loading-card" v-for="i in 3" :key="i"></div>
        </div>
        <div v-else class="bloggers-scroll">
          <div
            v-for="blogger in bloggers"
            :key="blogger.id"
            class="blogger-card"
            @click="handleBloggerClick(blogger.id)"
          >
            <div class="blogger-header">
              <img v-lazy="blogger.avatar" :alt="blogger.name" class="blogger-avatar" />
              <div class="blogger-info">
                <div class="blogger-name-row">
                  <span class="blogger-name">{{ blogger.name }}</span>
                </div>
                <span class="blogger-stats">{{ formatFollowers(blogger.followers) }}粉丝 · {{ blogger.posts }}帖子</span>
              </div>
              <button class="follow-btn">关注</button>
            </div>
            <div class="blogger-post">
              <span class="post-bio">{{ blogger.bio }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.discover-page {
  min-height: 100vh;
  background-color: #FFF9F5;
  padding-bottom: 80px;
}

.header {
  background: #fff;
  border-bottom: 1px solid #F5F5F4;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #A8A29E;
}

.search-input {
  width: 100%;
  height: 44px;
  padding: 0 16px 0 44px;
  background: #F5F5F4;
  border: none;
  border-radius: 22px;
  font-size: 15px;
  color: #292524;
  outline: none;
}

.search-input::placeholder {
  color: #A8A29E;
}

.content {
  padding: 16px;
}

/* 商家快捷入口 */
.business-section {
  margin-bottom: 16px;
}

.business-categories {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  background: #fff;
  border-radius: 20px;
  padding: 16px 8px;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-btn:active {
  transform: scale(0.95);
}

.category-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.category-label {
  font-size: 11px;
  font-weight: 500;
  color: #57534E;
}

/* 通用 Section */
.section {
  background: #fff;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-icon {
  color: #F97316;
  flex-shrink: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #292524;
  flex: 1;
}

.section-more {
  font-size: 13px;
  color: #A8A29E;
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}

/* 精选商家 - 横向滑动 */
.business-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0 8px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.business-scroll::-webkit-scrollbar {
  display: none;
}

.business-card {
  flex-shrink: 0;
  width: 240px;
  background: #FAFAF9;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.business-card:active {
  transform: scale(0.98);
}

.business-cover-wrapper {
  position: relative;
  width: 100%;
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
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.verified-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 6px;
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: #fff;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 2px;
}

.business-info {
  padding: 10px 12px;
}

.business-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.business-logo {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.business-detail {
  flex: 1;
  min-width: 0;
}

.business-name {
  font-size: 14px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.business-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #F97316;
  font-weight: 600;
}

.star-icon {
  fill: #F97316;
}

.distance {
  color: #A8A29E;
}

.business-promotion {
  margin-bottom: 0;
}

.promo-tag {
  display: inline-block;
  padding: 3px 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
}

.loading-row {
  display: flex;
  gap: 12px;
  padding: 8px 0;
}

.loading-card {
  flex-shrink: 0;
  width: 180px;
  height: 180px;
  background: linear-gradient(90deg, #F5F5F4 25%, #E7E5E4 50%, #F5F5F4 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 16px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.post-bio {
  font-size: 12px;
  color: #A8A29E;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 达人动态 - 横向滑动 */
.bloggers-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0 8px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.bloggers-scroll::-webkit-scrollbar {
  display: none;
}

.blogger-card {
  flex-shrink: 0;
  width: 220px;
  background: #FAFAF9;
  border-radius: 16px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.blogger-card:active {
  transform: scale(0.98);
}

.blogger-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.blogger-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.blogger-info {
  flex: 1;
  min-width: 0;
}

.blogger-name-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}

.blogger-name {
  font-size: 13px;
  font-weight: 600;
  color: #292524;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.verified-icon {
  color: #3B82F6;
  flex-shrink: 0;
}

.blogger-stats {
  font-size: 11px;
  color: #A8A29E;
}

.follow-btn {
  padding: 5px 12px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(251, 146, 60, 0.3);
  flex-shrink: 0;
}

.follow-btn:active {
  transform: scale(0.95);
}

.blogger-post {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ad-tag {
  display: inline-block;
  align-self: flex-start;
  padding: 2px 6px;
  background: rgba(168, 162, 158, 0.2);
  color: #78716C;
  border-radius: 4px;
  font-size: 10px;
}

.post-specialty {
  display: inline-block;
  align-self: flex-start;
  padding: 2px 8px;
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.post-cover {
  width: 100%;
  height: 100px;
  border-radius: 10px;
  object-fit: cover;
}

.post-title {
  font-size: 13px;
  font-weight: 500;
  color: #292524;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.post-likes {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #A8A29E;
}

/* 热门话题 */
.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  padding: 10px 18px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(251, 146, 60, 0.1));
  color: #F97316;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-item:active {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}

/* 人气宠物 */
.pets-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.pet-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.pet-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  background: linear-gradient(#fff, #fff) padding-box,
              linear-gradient(135deg, #F97316, #FB923C) border-box;
}

.pet-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pet-name {
  font-size: 13px;
  font-weight: 600;
  color: #292524;
}

.pet-likes {
  font-size: 11px;
  color: #A8A29E;
}

/* 搜索结果 */
.search-results-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.search-results-container {
  background: #fff;
  border-radius: 20px 20px 0 0;
  max-height: 70vh;
  width: 100%;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.results-header {
  padding: 16px;
  border-bottom: 1px solid #F5F5F4;
}

.results-count {
  font-size: 14px;
  font-weight: 600;
  color: #292524;
}

.results-list {
  max-height: calc(60vh - 50px);
  overflow-y: auto;
}

.searching-indicator,
.no-results {
  padding: 32px;
  text-align: center;
}

.loading-text,
.no-results-text {
  font-size: 14px;
  color: #A8A29E;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #FAFAF9;
  cursor: pointer;
  transition: background 0.2s ease;
}

.search-result-item:active {
  background: #FAFAF9;
}

.result-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.result-icon-wrapper.pet {
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
}

.result-icon-wrapper.user {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.result-icon-wrapper.post {
  background: rgba(168, 85, 247, 0.1);
  color: #A855F7;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-title {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 2px;
}

.result-desc {
  display: block;
  font-size: 13px;
  color: #A8A29E;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-type-tag {
  padding: 4px 10px;
  background: #F5F5F4;
  color: #78716C;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  flex-shrink: 0;
}

.clear-btn {
  position: absolute;
  right: 16px;
  width: 24px;
  height: 24px;
  border: none;
  background: #E7E5E4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #78716C;
  cursor: pointer;
}
</style>
