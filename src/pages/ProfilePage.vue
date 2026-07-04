<script setup lang="ts">
import { ref, computed } from 'vue'
import { Mail, Settings, LogOut, Camera } from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'
import { usePetStore } from '@/stores/petStore'
import { useUiStore } from '@/stores/uiStore'
import { useRouter } from 'vue-router'
import { storageService } from '@/services/storageService'

const userStore = useUserStore()
const petStore = usePetStore()
const uiStore = useUiStore()
const router = useRouter()

const isUploading = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)

const menuItems = [
  { icon: Settings, label: '设置', action: 'settings' }
]

const handleNotificationClick = () => {
  router.push('/messages')
}

const goToPosts = () => {
  router.push('/posts')
}

const goToFollowers = () => {
  router.push('/followers?type=followers')
}

const goToPets = () => {
  router.push('/my-pets')
}

const user = computed(() => {
  if (userStore.isLoggedIn) {
    return userStore.currentUser
  }
  return null
})

const profileStats = computed(() => {
  return userStore.profileStats
})

const goToLogin = () => {
  router.push('/login')
}

const handleMenuClick = (action: string) => {
  if (!userStore.isLoggedIn) {
    goToLogin()
    return
  }
  if (action === 'settings') {
    router.push('/settings')
  }
}

const handleLogout = () => {
  userStore.logout()
}

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const userId = userStore.currentUser?.id
  if (!userId) return

  isUploading.value = true
  uiStore.showLoading('上传中...')

  try {
    const result = await storageService.uploadAvatar(file, userId)
      if (result.url) {
        await userStore.updateUserAvatar(result.url)
        uiStore.showSuccessToast('头像更换成功')
      } else {
        uiStore.showErrorToast('上传失败，请重试')
      }
  } catch (error) {
    uiStore.showErrorToast('上传失败，请重试')
  } finally {
    isUploading.value = false
    target.value = ''
  }
}
</script>

<template>
  <div class="profile-page">
    <div v-if="user" class="user-header">
      <div class="page-content">
        <button class="notification-btn" @click="handleNotificationClick">
          <Mail :size="22" />
          <span class="notification-badge">3</span>
        </button>
        <div class="header-bg"></div>
        <div class="user-info">
          <div class="avatar-wrapper">
            <img :src="user.avatar_url || 'https://neeko-copilot.bytedance.net/api/text2image?prompt=pet%20lover%20avatar%20friendly&image_size=square'" :alt="user.name" class="user-avatar" />
            <button class="change-avatar-btn" @click="avatarInput?.click()">
              <Camera :size="16" />
            </button>
          </div>
          <div class="user-details">
            <h2 class="user-name">{{ user.name }}</h2>
            <p class="user-meta">🐾 铲屎官 | 已加入 365 天</p>
          </div>
          <input ref="avatarInput" type="file" accept="image/*" class="avatar-input" @change="handleAvatarUpload" />
        </div>

        <div class="stats-row">
          <div class="stat-card" @click="goToPosts">
            <div class="stat-value">{{ profileStats.posts }}</div>
            <div class="stat-label">帖子</div>
          </div>
          <div class="stat-card" @click="goToFollowers">
            <div class="stat-value">{{ profileStats.followers }}</div>
            <div class="stat-label">粉丝</div>
          </div>
          <div class="stat-card" @click="goToPets">
            <div class="stat-value">{{ petStore.userPets.length }}</div>
            <div class="stat-label">我的宠物</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="guest-header">
      <div class="page-content">
        <div class="guest-content">
          <div class="guest-icon">👤</div>
          <h2 class="guest-title">欢迎来到宠友圈</h2>
          <p class="guest-desc">登录后可以发布帖子、参与互助</p>
          <button class="login-btn" @click="goToLogin">立即登录</button>
        </div>
      </div>
    </div>

    <div class="page-content">
      <div class="section">
        <div class="menu-list">
          <button
            v-for="item in menuItems"
            :key="item.action"
            class="menu-item"
            @click="handleMenuClick(item.action)"
          >
            <component :is="item.icon" :size="20" class="menu-icon" />
            <span class="menu-label">{{ item.label }}</span>
            <span class="menu-arrow">›</span>
          </button>
        </div>
      </div>

      <div v-if="user" class="section">
        <button class="logout-btn" @click="handleLogout">
          <LogOut :size="20" />
          <span>退出登录</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #FFF9F5;
  padding-bottom: 80px;
}

.user-header {
  position: relative;
  padding-bottom: 24px;
}

/* 顶部内容与下方 section 边距保持一致 */
.user-header .page-content {
  padding: 0 32px;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 180px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  border-radius: 0 0 40px 40px;
}

.notification-btn {
  position: absolute;
  top: 20px;
  left: 16px;
  z-index: 10;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.notification-btn:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.95);
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #EF4444;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 16px;
  padding-top: 80px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.avatar-wrapper {
  position: relative;
}

.change-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid #fff;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.4);
  transition: all 0.2s ease;
}

.change-avatar-btn:active {
  transform: scale(0.9);
}

.avatar-input {
  display: none;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.user-meta {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.stats-row {
  display: flex;
  justify-content: space-around;
  padding: 0 16px;
  position: relative;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px 20px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.1);
  flex: 1;
  margin: 0 6px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #F97316, #FB923C);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 12px;
  color: #A8A29E;
  margin-top: 4px;
}

.guest-header {
  background: linear-gradient(135deg, #F97316, #FB923C);
  padding: 32px 0 28px;
  text-align: center;
  border-radius: 0 0 24px 24px;
}

/* 游客头部取消 page-content 的 padding，避免双重边距 */
.guest-header .page-content {
  padding: 0;
}

.guest-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.guest-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6px;
}

.guest-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 16px;
}

.login-btn {
  padding: 14px 40px;
  background: #fff;
  color: #F97316;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.section {
  background: #fff;
  margin: 16px;
  padding: 16px;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #292524;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.pet-grid {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.pet-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px;
  background: #F5F5F4;
  border-radius: 16px;
  cursor: pointer;
}

.pet-card .pet-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  background: linear-gradient(#fff, #fff) padding-box,
              linear-gradient(135deg, #F97316, #FB923C) border-box;
}

.pet-card .pet-name {
  font-size: 13px;
  color: #292524;
  font-weight: 500;
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #F5F5F4;
  background: transparent;
  border: none;
  border-bottom: 1px solid #F5F5F4;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: rgba(249, 115, 22, 0.05);
}

.menu-icon {
  color: #F97316;
}

.menu-label {
  flex: 1;
  font-size: 15px;
  color: #292524;
}

.menu-arrow {
  font-size: 20px;
  color: #A8A29E;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
  background: transparent;
  color: #EF4444;
  border: 1px solid #EF4444;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.logout-btn:active {
  background: rgba(239, 68, 68, 0.1);
}
</style>
