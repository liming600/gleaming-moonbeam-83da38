<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Search, Sparkles, Loader2 } from 'lucide-vue-next'
import { useFeedStore } from '@/stores/feedStore'
import { useRouter } from 'vue-router'
import PostCard from '@/components/PostCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'

const feedStore = useFeedStore()
const router = useRouter()
const dailyQuote = ref('')
const isLoading = ref(true)
const loadingMore = ref(false)
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  setTimeout(() => {
    dailyQuote.value = feedStore.getDailyQuote()
  }, 800)

  setTimeout(() => {
    feedStore.loadPosts(1, true)
    isLoading.value = false
  }, 1000)

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !feedStore.isLoading && feedStore.hasMore && !loadingMore.value) {
          loadMore()
        }
      })
    },
    { rootMargin: '100px' }
  )

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

const loadMore = async () => {
  loadingMore.value = true
  await feedStore.loadPosts(feedStore.currentPage + 1)
  loadingMore.value = false
}

const tabs = [
  { key: 'recommend', label: '推荐', badge: 'AI' },
  { key: 'latest', label: '最新', badge: '' }
] as const

const handleSearch = () => {
  router.push('/discover')
}

const handleTabChange = (tab: 'recommend' | 'latest') => {
  feedStore.setTab(tab)
  feedStore.loadPosts(1, true)
}
</script>

<template>
  <div class="home-page">
    <header class="header">
      <div class="page-content header-content">
        <div class="logo-area">
          <div class="logo-icon">🐾</div>
          <span class="logo-text">宠友圈</span>
        </div>
        <button class="search-btn" @click="handleSearch">
          <Search :size="20" />
        </button>
      </div>
    </header>

    <div class="page-content">
      <div class="daily-quote-card">
      <div class="quote-content">
        <Sparkles :size="20" class="quote-icon" />
        <p class="quote-text">{{ dailyQuote }}</p>
      </div>
      <div class="quote-animals">
        <span class="animal-emoji">🐱</span>
        <span class="animal-emoji">🐶</span>
        <span class="animal-emoji">🐰</span>
        <span class="animal-emoji">🐹</span>
        <span class="animal-emoji">🦜</span>
      </div>
    </div>

    <div class="tab-container">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: feedStore.currentTab === tab.key }"
        @click="handleTabChange(tab.key)"
      >
        {{ tab.label }}
        <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
      </button>
    </div>

    <div class="posts-container">
      <SkeletonCard v-for="i in 3" :key="i" v-if="isLoading" />
      <PostCard
        v-for="(post, index) in feedStore.filteredPosts"
        :key="post.id"
        :post="post"
        :index="index"
        v-show="!isLoading"
      />
    </div>

    <div ref="loadMoreTrigger" class="loading-more">
      <Loader2 v-if="loadingMore" :size="18" class="loader" />
      <template v-else-if="feedStore.hasMore">
        <span class="loading-icon">🐾</span>
        <span class="loading-text">加载更多...</span>
        <span class="loading-icon">🐾</span>
      </template>
      <span v-else class="no-more-text">- 已加载全部内容 -</span>
    </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #FFF9F5;
  padding-bottom: 80px;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 249, 245, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(249, 115, 22, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #F97316, #FB923C);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #fff;
  color: #57534E;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-btn:active {
  transform: scale(0.95);
}

.daily-quote-card {
  margin: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  border-radius: 20px;
  color: #fff;
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.3);
}

.quote-content {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
}

.quote-icon {
  flex-shrink: 0;
  opacity: 0.9;
}

.quote-text {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
}

.quote-animals {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.animal-emoji {
  font-size: 24px;
  animation: float 3s ease-in-out infinite;
}

.animal-emoji:nth-child(2) { animation-delay: 0.2s; }
.animal-emoji:nth-child(3) { animation-delay: 0.4s; }
.animal-emoji:nth-child(4) { animation-delay: 0.6s; }
.animal-emoji:nth-child(5) { animation-delay: 0.8s; }

.tab-container {
  display: flex;
  gap: 8px;
  padding: 0 16px;
  margin-bottom: 16px;
}

.tab-btn {
  flex: 1;
  height: 36px;
  border-radius: 18px;
  border: none;
  font-size: 15px;
  font-weight: 500;
  background: #fff;
  color: #57534E;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.tab-btn.active {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
}

.tab-btn:active {
  transform: scale(0.98);
}

.tab-badge {
  margin-left: 4px;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
}

.posts-container {
  padding: 0 16px;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: #A8A29E;
  font-size: 14px;
}

.loading-icon {
  animation: bounce 0.6s ease-in-out infinite;
}

.loading-icon:nth-child(1) { animation-delay: 0s; }
.loading-icon:nth-child(3) { animation-delay: 0.3s; }

.loader {
  animation: spin 1s linear infinite;
  color: #F97316;
}

.no-more-text {
  font-size: 13px;
  color: #D6D3D1;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
