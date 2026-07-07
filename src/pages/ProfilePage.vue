﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Settings, LogOut, Camera, ArrowLeft, Users } from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'
import { usePetStore } from '@/stores/petStore'
import { useUiStore } from '@/stores/uiStore'
import { useHelpStore } from '@/stores/helpStore'
import { useRouter } from 'vue-router'
import { storageService } from '@/services/storageService'

const userStore = useUserStore()
const petStore = usePetStore()
const uiStore = useUiStore()
const helpStore = useHelpStore()
const router = useRouter()

const isUploading = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)

const userHelpPosts = computed(() => {
  const userId = userStore.currentUser?.id
  if (!userId) return []
  return helpStore.helpPosts.filter(p => p.authorId === userId)
})

onMounted(async () => {
  if (userStore.isLoggedIn) {
    await userStore.loadProfileStats()
    await petStore.loadUserPets()
    await helpStore.loadHelpPosts()
  }
})

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
    <header class="header">
      <button class="back-btn" @click="router.back()">
        <ArrowLeft :size="24" />
      </button>
      <h1 class="header-title">我的主页</h1>
      <button class="settings-btn" @click="router.push('/settings')">
        <Settings :size="20" />
      </button>
    </header>

    <div v-if="user" class="user-header">
      <div class="profile-card">
        <div class="cover-wrapper">
          <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20pets%20collection%20cats%20dogs%20happy%20warm%20colorful&image_size=landscape_16_9" alt="封面" class="cover-image" />
          <div class="cover-overlay"></div>
        </div>
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <img :src="user.avatar_url || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20avatar%20friendly%20face&image_size=square'" :alt="user.name" class="user-avatar" />
            <button class="change-avatar-btn" @click="avatarInput?.click()">
              <Camera :size="14" />
            </button>
            <input ref="avatarInput" type="file" accept="image/*" class="avatar-input" @change="handleAvatarUpload" />
          </div>
          <div class="profile-info">
            <div class="user-name" @click="router.push('/settings')">{{ user.name }}</div>
            <p class="user-desc">{{ user.bio || '这家伙很懒，什么都没写~' }}</p>
          </div>
          <div class="self-badge">我的主页</div>
        </div>

        <div class="stats-card">
          <div class="stat-item" @click="router.push('/followers?type=following')">
            <div class="stat-value">{{ profileStats.following }}</div>
            <div class="stat-label">关注</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" @click="router.push('/followers?type=followers')">
            <div class="stat-value">{{ profileStats.followers }}</div>
            <div class="stat-label">粉丝</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" @click="router.push('/my-pets')">
            <div class="stat-value">{{ petStore.userPets.length }}</div>
            <div class="stat-label">宠物</div>
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

    <div v-if="user" class="section">
      <div class="section-header">
        <h3 class="section-title">🐾 我的宠物</h3>
        <Users :size="18" class="section-icon" />
      </div>
      <div class="pet-grid">
        <div
          v-for="pet in petStore.userPets"
          :key="pet.id"
          class="pet-card"
          @click="router.push(`/pet/${pet.id}`)"
        >
          <img :src="pet.avatar" :alt="pet.name" class="pet-avatar" />
          <span class="pet-name">{{ pet.name }}</span>
          <span class="pet-followers">{{ pet.followers }} 粉丝</span>
        </div>
        <div v-if="petStore.userPets.length === 0" class="empty-pets">
          <span class="empty-icon">🐱</span>
          <p>还没有宠物~</p>
        </div>
      </div>
    </div>

    <div v-if="user" class="section">
      <div class="section-header">
        <h3 class="section-title">💡 互助帖子</h3>
      </div>
      <div class="posts-section">
        <div
          v-for="post in userHelpPosts"
          :key="post.id"
          class="help-post-item"
          @click="router.push(`/help/${post.id}`)"
        >
          <div class="help-post-header">
            <span class="help-post-zone">{{ post.zoneLabel }}</span>
          </div>
          <h4 class="help-post-title">{{ post.title }}</h4>
          <p class="help-post-content">{{ post.content }}</p>
          <div class="help-post-meta">
            <span class="meta-item">💬 {{ post.answers }} 回答</span>
            <span class="meta-item">{{ post.statusLabel }}</span>
          </div>
        </div>
        <div v-if="userHelpPosts.length === 0" class="empty-state">
          <span class="empty-icon">📭</span>
          <p>还没有发布互助帖子~</p>
        </div>
      </div>
    </div>

    <div v-if="user" class="section">
      <button class="logout-btn" @click="handleLogout">
        <LogOut :size="20" />
        <span>退出登录</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #FFF9F5;
  padding-bottom: 80px;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 249, 245, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #fff;
  color: #292524;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #292524;
}

.settings-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #fff;
  color: #292524;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.user-header {
  padding-top: 50px;
}

.profile-card {
  background: #fff;
  margin: 16px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.1);
}

.cover-wrapper {
  position: relative;
  height: 120px;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.95), transparent);
}

.avatar-section {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 0 20px 20px;
  margin-top: -50px;
  position: relative;
}

.user-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.15);
  flex-shrink: 0;
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
}

.avatar-input {
  display: none;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 20px;
  font-weight: 700;
  color: #292524;
  cursor: pointer;
}

.user-desc {
  margin-top: 4px;
  font-size: 13px;
  color: #57534E;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.self-badge {
  padding: 8px 24px;
  background: #F5F5F4;
  color: #A8A29E;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
}

.stats-card {
  margin: 0 16px 16px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #FFF9F5;
  border-radius: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  cursor: pointer;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #292524;
}

.stat-label {
  font-size: 12px;
  color: #A8A29E;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #F5F5F4;
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
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #292524;
}

.section-icon {
  color: #F97316;
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
  background: #FFF9F5;
  border-radius: 16px;
  cursor: pointer;
  min-width: 80px;
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

.pet-card .pet-followers {
  font-size: 11px;
  color: #A8A29E;
}

.empty-pets {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 30px;
  color: #A8A29E;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.empty-pets p {
  font-size: 13px;
}

.posts-section {
  padding: 0;
}

.help-post-item {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.help-post-item:last-child {
  margin-bottom: 0;
}

.help-post-header {
  margin-bottom: 8px;
}

.help-post-zone {
  padding: 4px 12px;
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.help-post-title {
  font-size: 16px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 8px;
}

.help-post-content {
  font-size: 14px;
  color: #57534E;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.help-post-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.meta-item {
  font-size: 13px;
  color: #A8A29E;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #A8A29E;
}

.empty-state .empty-icon {
  font-size: 48px;
}

.empty-state p {
  font-size: 14px;
}

.guest-header {
  padding-top: 50px;
}

.guest-header .page-content {
  padding: 0;
}

.guest-content {
  background: linear-gradient(135deg, #F97316, #FB923C);
  padding: 32px 0 28px;
  text-align: center;
  border-radius: 0 0 24px 24px;
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
