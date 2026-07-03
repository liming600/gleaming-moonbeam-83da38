<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search, Sparkles } from 'lucide-vue-next'
import { useFeedStore } from '@/stores/feedStore'
import { useRouter } from 'vue-router'
import PostCard from '@/components/PostCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'

const feedStore = useFeedStore()
const router = useRouter()
const dailyQuote = ref('')
const isLoading = ref(true)

onMounted(() => {
  setTimeout(() => {
    dailyQuote.value = feedStore.getDailyQuote()
    isLoading.value = false
  }, 800)
})

const tabs = [
  { key: 'recommend', label: '推荐' },
  { key: 'latest', label: '最新' }
] as const

const handleSearch = () => {
  router.push('/discover')
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
        @click="feedStore.setTab(tab.key)"
      >
        {{ tab.label }}
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

    <div class="loading-more">
      <span class="loading-icon">🐾</span>
      <span class="loading-text">加载更多...</span>
      <span class="loading-icon">🐾</span>
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

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
</style>
