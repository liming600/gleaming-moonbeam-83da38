<script setup lang="ts">
import { X, Medal } from 'lucide-vue-next'
import { mockLeaderboard } from '@/mock/leaderboard'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const leaderboard = mockLeaderboard

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient(135deg, #FBBF24, #F59E0B)'
    case 2:
      return 'bg-gradient(135deg, #E5E7EB, #D1D5DB)'
    case 3:
      return 'bg-gradient(135deg, #FDBA74, #FB923C)'
    default:
      return 'bg-gray-100'
  }
}

const getRankText = (rank: number) => {
  switch (rank) {
    case 1:
      return '🥇'
    case 2:
      return '🥈'
    case 3:
      return '🥉'
    default:
      return rank
  }
}

const goToUserProfile = (_userId: string) => {
  emit('close')
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="leaderboard-overlay" @click="emit('close')">
      <div class="leaderboard-modal" @click.stop>
        <div class="modal-header">
          <div class="header-icon">
            <Medal :size="24" />
          </div>
          <h2 class="modal-title">热心榜</h2>
          <button class="close-btn" @click="emit('close')">
            <X :size="20" />
          </button>
        </div>

        <div class="stats-header">
          <div class="stat-item">
            <span class="stat-label">回答数</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">采纳数</span>
          </div>
        </div>

        <div class="leaderboard-list">
          <div
            v-for="(user, index) in leaderboard"
            :key="user.id"
            class="leaderboard-item"
            :class="{ 'top-three': user.rank <= 3 }"
            :style="{ animationDelay: `${index * 0.05}s` }"
            @click="goToUserProfile(user.id)"
          >
            <div class="rank-badge" :style="{ background: getRankStyle(user.rank) }">
              <span>{{ getRankText(user.rank) }}</span>
            </div>

            <div class="user-info">
              <img :src="user.avatar" :alt="user.name" class="user-avatar" />
              <div class="user-detail">
                <span class="user-name">{{ user.name }}</span>
                <div class="user-stats">
                  <span class="stat-value">{{ user.answers }} 回答</span>
                  <span class="stat-divider">·</span>
                  <span class="stat-value accepted">{{ user.accepted }} 采纳</span>
                </div>
              </div>
            </div>

            <div class="user-score">
              <div class="score-value">{{ user.accepted }}</div>
              <div class="score-label">采纳</div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <p class="footer-text">榜单每日更新，感谢每一位热心的宠友 ❤️</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.leaderboard-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.leaderboard-modal {
  width: 100%;
  max-width: 360px;
  max-height: 80vh;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #34D399, #6EE7B7);
}

.header-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.modal-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.stats-header {
  display: flex;
  padding: 12px 20px;
  background: #F0FDF4;
  border-bottom: 1px solid #D1FAE5;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-label {
  font-size: 13px;
  font-weight: 600;
  color: #059669;
}

.leaderboard-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 16px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  animation: slideIn 0.3s ease forwards;
  opacity: 0;
}

.leaderboard-item:hover {
  background: #F9FAFB;
}

.leaderboard-item.top-three {
  background: linear-gradient(135deg, #FFFBEB, #FEFCE8);
  border: 1px solid #FDE68A;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rank-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.rank-badge span {
  font-size: 14px;
}

.user-info {
  flex: 1;
  display: flex;
  gap: 12px;
  min-width: 0;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.user-detail {
  flex: 1;
  min-width: 0;
}

.user-name {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 4px;
}

.user-stats {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #A8A29E;
}

.stat-value {
  color: #57534E;
}

.stat-value.accepted {
  color: #059669;
  font-weight: 600;
}

.stat-divider {
  color: #D6D3D1;
}

.user-score {
  text-align: right;
}

.score-value {
  font-size: 18px;
  font-weight: 700;
  color: #34D399;
}

.score-label {
  font-size: 11px;
  color: #A8A29E;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #F5F5F4;
}

.footer-text {
  font-size: 13px;
  color: #A8A29E;
  text-align: center;
  margin: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
