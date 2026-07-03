<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MessageCircleQuestion, Trophy, BookOpen } from 'lucide-vue-next'
import { useHelpStore } from '@/stores/helpStore'
import { useRouter } from 'vue-router'
import { useFeedStore } from '@/stores/feedStore'
import LeaderboardModal from '@/components/LeaderboardModal.vue'
import PetTipModal from '@/components/PetTipModal.vue'

const helpStore = useHelpStore()
const feedStore = useFeedStore()
const router = useRouter()
const showLeaderboardModal = ref(false)
const showTipModal = ref(false)
const dailyPetTip = ref<{ title: string; content: string; category: string; tags: string[] } | null>(null)

onMounted(() => {
  setTimeout(() => {
    dailyPetTip.value = feedStore.getDailyPetTip()
  }, 300)
})

const zones = [
  { key: 'all', label: '全部', icon: '📋' },
  { key: 'experience', label: '经验', icon: '📚' },
  { key: 'question', label: '问答', icon: '❓' },
  { key: 'rescue', label: '救助', icon: '🚑' },
  { key: 'mutual', label: '互帮', icon: '🤝' }
] as const

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'resolved':
      return 'bg-green-100 text-green-600'
    case 'taken':
      return 'bg-blue-100 text-blue-600'
    default:
      return 'bg-orange-100 text-orange-600'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'resolved':
      return '已解决'
    case 'taken':
      return '已接单'
    default:
      return '求助中'
  }
}

const goToHelpDetail = (id: string) => {
  router.push(`/help/${id}`)
}

const openLeaderboard = () => {
  showLeaderboardModal.value = true
}

const closeLeaderboard = () => {
  showLeaderboardModal.value = false
}

const openTipModal = () => {
  showTipModal.value = true
}

const closeTipModal = () => {
  showTipModal.value = false
}
</script>

<template>
  <div class="help-page">
    <header class="header">
      <div class="page-content header-content">
        <div class="logo-area">
          <div class="logo-icon">💬</div>
          <span class="logo-text">互助大厅</span>
        </div>
        <button class="leaderboard-btn" @click="openLeaderboard">
          <Trophy :size="20" />
          <span>热心榜</span>
        </button>
      </div>
    </header>

    <div class="page-content">
      <div v-if="dailyPetTip" class="daily-quote-card" @click="openTipModal">
        <div class="quote-content">
          <BookOpen :size="20" class="quote-icon" />
          <p class="quote-text">{{ dailyPetTip.title }}</p>
        </div>
        <div class="quote-animals">
          <span class="animal-emoji">{{ dailyPetTip.category }}</span>
        </div>
      </div>

      <div class="zone-tabs">
        <button
          v-for="zone in zones"
          :key="zone.key"
          class="zone-tab"
          :class="{ active: helpStore.currentZone === zone.key }"
          @click="helpStore.setZone(zone.key)"
        >
          <span class="zone-icon">{{ zone.icon }}</span>
          <span class="zone-label">{{ zone.label }}</span>
        </button>
      </div>
      <div class="help-list">
      <div
        v-for="post in helpStore.filteredPosts"
        :key="post.id"
        class="help-card"
        :class="{ urgent: post.isUrgent }"
        @click="goToHelpDetail(post.id)"
      >
        <div class="help-header">
          <img :src="post.authorAvatar" :alt="post.authorName" class="author-avatar" />
          <div class="author-info">
            <div class="author-row">
              <span class="author-name">{{ post.authorName }}</span>
              <span v-if="post.isUrgent" class="urgent-tag">🔴 紧急</span>
            </div>
            <span class="post-time">{{ post.createdAt }}</span>
          </div>
          <span class="status-tag" :class="getStatusStyle(post.status)">
            {{ getStatusLabel(post.status) }}
          </span>
        </div>

        <h3 class="help-title">{{ post.title }}</h3>
        <p class="help-content">{{ post.content }}</p>

        <div class="help-footer">
          <span class="zone-tag">
            {{ helpStore.getZoneConfig(post.zone).icon }} {{ post.zoneLabel }}
          </span>
          <div class="help-meta">
            <span class="meta-item">
              <MessageCircleQuestion :size="16" />
              <span>{{ post.answers }} 回答</span>
            </span>
          </div>
        </div>

        <div v-if="post.acceptedAnswer" class="accepted-answer">
          <span class="accepted-label">💡 采纳答案：</span>
          <span class="accepted-text">{{ post.acceptedAnswer }}</span>
        </div>
      </div>
    </div>

    <div v-if="helpStore.filteredPosts.length === 0" class="empty-state">
      <span class="empty-icon">📭</span>
      <p>暂无相关内容</p>
    </div>
    </div>

    <LeaderboardModal :show="showLeaderboardModal" @close="closeLeaderboard" />
    <PetTipModal :show="showTipModal" :tip="dailyPetTip" @close="closeTipModal" />
  </div>
</template>

<style scoped>
.help-page {
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

.leaderboard-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  transition: all 0.2s ease;
}

.leaderboard-btn:active {
  transform: scale(0.98);
}

.daily-quote-card {
  margin: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  border-radius: 20px;
  color: #fff;
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
}

.daily-quote-card:active {
  transform: scale(0.98);
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.quote-animals {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.animal-emoji {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
}

.zone-tabs {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 0 16px;
  margin-bottom: 16px;
}

.zone-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 4px;
  border-radius: 16px;
  border: none;
  background: #fff;
  color: #57534E;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.zone-tab.active {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
}

.zone-icon {
  font-size: 22px;
}

.zone-label {
  font-size: 12px;
}

.help-list {
  padding: 0 16px;
}

.help-card {
  background: #fff;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
  position: relative;
  transition: all 0.2s ease;
}

.help-card:active {
  transform: scale(0.98);
}

.help-card.urgent {
  border: 2px solid #EF4444;
}

.help-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.author-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.author-name {
  font-size: 15px;
  font-weight: 600;
  color: #292524;
  flex-shrink: 0;
}

.urgent-tag {
  font-size: 12px;
  font-weight: 600;
  color: #EF4444;
  white-space: nowrap;
  animation: pulse 2s ease-in-out infinite;
}

.post-time {
  font-size: 12px;
  color: #A8A29E;
  margin-top: 2px;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.help-title {
  font-size: 16px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 8px;
}

.help-content {
  font-size: 14px;
  color: #57534E;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.help-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.zone-tag {
  padding: 4px 12px;
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.help-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #A8A29E;
  font-size: 13px;
}

.accepted-answer {
  margin-top: 12px;
  padding: 12px;
  background: rgba(34, 197, 94, 0.08);
  border-radius: 12px;
  border-left: 4px solid #22C55E;
}

.accepted-label {
  font-size: 13px;
  font-weight: 600;
  color: #22C55E;
}

.accepted-text {
  font-size: 14px;
  color: #57534E;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #A8A29E;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 14px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
</style>
