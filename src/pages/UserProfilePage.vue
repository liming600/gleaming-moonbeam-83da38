<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, MessageCircle } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { usePetStore } from '@/stores/petStore'
import { useUserStore } from '@/stores/userStore'
import { useHelpStore } from '@/stores/helpStore'
import { useFollowStore } from '@/stores/followStore'
import { userService, type User } from '@/services/userService'

const route = useRoute()
const router = useRouter()
const petStore = usePetStore()
const userStore = useUserStore()
const helpStore = useHelpStore()
const followStore = useFollowStore()

const isFollowing = ref(false)
const userId = computed(() => route.params.id as string)
const user = ref<User | null>(null)
const isLoading = ref(true)
const userStats = ref({ following: 0, followers: 0, pets: 0 })

const isOwnProfile = computed(() => {
  return userStore.currentUser?.id === userId.value
})

const userPets = computed(() => {
  if (!userId.value) return []
  return petStore.pets.filter(p => p.ownerId === userId.value)
})

const userHelpPosts = computed(() => {
  if (!userId.value) return []
  return helpStore.helpPosts.filter(p => p.authorId === userId.value)
})

const back = () => {
  router.back()
}

const toggleFollow = async () => {
  if (isOwnProfile.value || !userStore.currentUser) return
  
  const { success, following } = await followStore.toggleFollow(userId.value, userStore.currentUser.id)
  if (success) {
    isFollowing.value = following
    if (following) {
      userStats.value.followers++
      userStore.profileStats.following++
    } else {
      userStats.value.followers = Math.max(0, userStats.value.followers - 1)
      userStore.profileStats.following = Math.max(0, userStore.profileStats.following - 1)
    }
  }
}

const goToPetProfile = (petId: string) => {
  router.push(`/pet/${petId}`)
}

const goToChat = () => {
  if (!userStore.currentUser) {
    router.push('/login')
    return
  }
  router.push(`/chat/${userId.value}`)
}


onMounted(async () => {
  isLoading.value = true
  
  const [{ user: loadedUser }, stats] = await Promise.all([
    userService.getUserById(userId.value),
    userService.getUserStats(userId.value)
  ])
  
  if (loadedUser) {
    user.value = loadedUser
  }
  
  if (!stats.error) {
    userStats.value = {
      following: stats.following,
      followers: stats.followers,
      pets: stats.pets
    }
  }
  
  await petStore.loadUserPets(userId.value)
  await helpStore.loadHelpPosts()
  
  if (userStore.currentUser && !isOwnProfile.value) {
    isFollowing.value = await followStore.checkFollowing(userStore.currentUser.id, userId.value)
  }
  
  isLoading.value = false
})
</script>

<template>
  <div class="user-profile-page">
    <header class="header">
      <button v-if="!isOwnProfile" class="back-btn" @click="back">
        <ArrowLeft :size="24" />
      </button>
      <div v-else class="header-placeholder"></div>
      <h1 class="header-title">{{ user?.name || '用户主页' }}</h1>
      <div class="header-placeholder"></div>
    </header>

    <div v-if="isLoading" class="user-profile-skeleton">
      <div class="skeleton-cover"></div>
      <div class="skeleton-avatar-container">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-name"></div>
        <div class="skeleton-info"></div>
        <div class="skeleton-follow-btn"></div>
      </div>
      <div class="skeleton-stats"></div>
      <div class="skeleton-section">
        <div class="skeleton-section-header"></div>
        <div class="skeleton-pet-grid">
          <div class="skeleton-pet-card" v-for="i in 3" :key="i"></div>
        </div>
      </div>
      <div class="skeleton-section">
        <div class="skeleton-section-header"></div>
        <div class="skeleton-post-card" v-for="i in 3" :key="i"></div>
      </div>
    </div>

    <div v-else-if="user" class="user-header">
      <div class="profile-card">
        <div class="cover-wrapper">
          <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20pets%20collection%20cats%20dogs%20happy%20warm%20colorful&image_size=landscape_16_9" alt="封面" class="cover-image" />
          <div class="cover-overlay"></div>
        </div>
        <div class="avatar-section">
          <img 
            :src="user.avatar_url || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20avatar%20friendly%20face&image_size=square'" 
            :alt="user.name" 
            class="user-avatar" 
          />
          <div class="profile-info">
            <div class="user-name">{{ user.name }}</div>
            <p class="user-desc">{{ user.bio || '这家伙很懒，什么都没写~' }}</p>
          </div>
          <div v-if="!isOwnProfile" class="action-buttons">
            <button
              class="follow-btn"
              :class="{ followed: isFollowing }"
              @click="toggleFollow"
            >
              {{ isFollowing ? '已关注' : '+ 关注' }}
            </button>
            <button class="message-btn" @click="goToChat">
              <MessageCircle :size="16" />
              <span>发私信</span>
            </button>
          </div>
          <div v-else class="self-badge">我的主页</div>
        </div>

        <div class="stats-card">
          <div class="stat-item" @click="router.push(`/followers/${userId}?type=following`)">
            <div class="stat-value">{{ userStats.following }}</div>
            <div class="stat-label">关注</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" @click="router.push(`/followers/${userId}?type=followers`)">
            <div class="stat-value">{{ userStats.followers }}</div>
            <div class="stat-label">粉丝</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" @click="isOwnProfile && router.push('/my-pets')">
            <div class="stat-value">{{ userStats.pets }}</div>
            <div class="stat-label">宠物</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!isLoading && !user" class="empty-state">
      <span class="empty-icon">😕</span>
      <p>用户不存在</p>
    </div>

    <div v-if="user" class="section">
      <div class="section-header">
        <h3 class="section-title">🐾 {{ user.name }} 的宠物</h3>
      </div>
      <div class="pet-grid">
        <div
          v-for="pet in userPets"
          :key="pet.id"
          class="pet-card"
          @click="goToPetProfile(pet.id)"
        >
          <img :src="pet.avatar" :alt="pet.name" class="pet-avatar" />
          <span class="pet-name">{{ pet.name }}</span>
          <span class="pet-followers">{{ pet.followers }} 粉丝</span>
        </div>
        <div v-if="userPets.length === 0" class="empty-pets">
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
  </div>
</template>

<style scoped>
.user-profile-page {
  min-height: 100vh;
  background-color: #FFF9F5;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 249, 245, 0.95);
  backdrop-filter: blur(10px);
  padding: calc(env(safe-area-inset-top) + 12px) 16px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--bg-card);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-placeholder {
  width: 40px;
}

.user-header {
  padding-top: calc(env(safe-area-inset-top) + 52px);
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
  background: linear-gradient(135deg, #F97316, #FB923C);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
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
  align-items: center;
  gap: 12px;
  padding: 0 20px 20px;
  margin-top: -50px;
  position: relative;
  flex-wrap: wrap;
}

.avatar-section .profile-info {
  flex: 1 1 calc(100% - 110px);
  min-width: 120px;
}

.avatar-section .action-buttons,
.avatar-section .self-badge {
  flex-basis: 100%;
  margin-top: 8px;
}

@media (min-width: 400px) {
  .avatar-section .action-buttons,
  .avatar-section .self-badge {
    flex-basis: auto;
    margin-top: 0;
  }
}

.user-avatar {
  width: clamp(70px, 20vw, 90px);
  height: clamp(70px, 20vw, 90px);
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--bg-card);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.15);
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: clamp(18px, 4.5vw, 22px);
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-desc {
  margin-top: 4px;
  font-size: clamp(12px, 3vw, 14px);
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.self-badge {
  padding: clamp(6px, 1.5vw, 8px) clamp(16px, 4vw, 24px);
  background: var(--border-color);
  color: var(--text-light);
  border-radius: 20px;
  font-size: clamp(12px, 3vw, 14px);
  font-weight: 500;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.follow-btn {
  padding: clamp(6px, 1.5vw, 8px) clamp(16px, 4vw, 24px);
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: clamp(12px, 3vw, 14px);
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(249, 115, 22, 0.25);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.follow-btn:active {
  transform: scale(0.98);
}

.follow-btn.followed {
  background: var(--border-color);
  color: var(--text-secondary);
  box-shadow: none;
}

.message-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px);
  background: #fff;
  color: #F97316;
  border: 1.5px solid #F97316;
  border-radius: 20px;
  font-size: clamp(12px, 3vw, 14px);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.message-btn:active {
  transform: scale(0.98);
  background: rgba(249, 115, 22, 0.05);
}

.stats-card {
  margin: 0 16px 16px;
  padding: clamp(12px, 3vw, 16px) clamp(16px, 4vw, 20px);
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: var(--bg-primary);
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

.stat-icon {
  font-size: 28px;
}

.stat-info {
  text-align: center;
}

.stat-value {
  font-size: clamp(18px, 4.5vw, 22px);
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: clamp(11px, 2.8vw, 12px);
  color: var(--text-light);
}

.stat-divider {
  width: 1px;
  height: clamp(32px, 8vw, 40px);
  background: var(--border-color);
}

.section {
  background: var(--bg-card);
  margin: 16px;
  padding: clamp(12px, 3vw, 16px);
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(12px, 3vw, 16px);
}

.section-title {
  font-size: clamp(14px, 3.5vw, 15px);
  font-weight: 600;
  color: var(--text-primary);
}



.pet-grid {
  display: flex;
  gap: clamp(8px, 2vw, 12px);
  overflow-x: auto;
  padding-bottom: 8px;
}

.pet-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: clamp(10px, 2.5vw, 12px);
  background: var(--bg-primary);
  border-radius: 16px;
  cursor: pointer;
  min-width: clamp(70px, 18vw, 80px);
}

.pet-card .pet-avatar {
  width: clamp(50px, 14vw, 60px);
  height: clamp(50px, 14vw, 60px);
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  background: linear-gradient(#fff, #fff) padding-box,
              linear-gradient(135deg, #F97316, #FB923C) border-box;
}

.pet-card .pet-name {
  font-size: clamp(12px, 3vw, 13px);
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pet-card .pet-followers {
  font-size: clamp(10px, 2.5vw, 11px);
  color: var(--text-light);
}

.empty-pets {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(16px, 4vw, 20px) clamp(24px, 6vw, 30px);
  color: var(--text-light);
}

.empty-icon {
  font-size: clamp(28px, 7vw, 32px);
  margin-bottom: 8px;
}

.empty-pets p {
  font-size: clamp(12px, 3vw, 13px);
}

.posts-section {
  padding: 0;
}

.help-post-item {
  background: var(--bg-card);
  border-radius: 16px;
  padding: clamp(12px, 3vw, 16px);
  margin-bottom: clamp(8px, 2vw, 12px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.help-post-header {
  margin-bottom: 8px;
}

.help-post-zone {
  padding: clamp(3px, 1vw, 4px) clamp(10px, 2.5vw, 12px);
  background: rgba(249, 115, 22, 0.1);
  color: var(--primary);
  border-radius: 12px;
  font-size: clamp(11px, 2.8vw, 12px);
  font-weight: 500;
}

.help-post-title {
  font-size: clamp(15px, 3.8vw, 16px);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.help-post-content {
  font-size: clamp(13px, 3.3vw, 14px);
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: clamp(8px, 2vw, 12px);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.help-post-meta {
  display: flex;
  align-items: center;
  gap: clamp(12px, 3vw, 16px);
}

.meta-item {
  font-size: clamp(12px, 3vw, 13px);
  color: var(--text-light);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(32px, 8vw, 48px);
  color: var(--text-light);
}

.empty-state .empty-icon {
  font-size: clamp(36px, 9vw, 48px);
}

.empty-state p {
  font-size: clamp(13px, 3.3vw, 14px);
}

.user-profile-skeleton {
  padding-top: 50px;
  animation: shimmer 1.5s infinite;
}

.skeleton-cover {
  width: 100%;
  height: 140px;
  background: linear-gradient(90deg, rgba(229, 229, 229, 0.3) 25%, rgba(229, 229, 229, 0.6) 50%, rgba(229, 229, 229, 0.3) 75%);
  background-size: 200% 100%;
}

.skeleton-avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -40px;
  position: relative;
}

.skeleton-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(90deg, rgba(229, 229, 229, 0.3) 25%, rgba(229, 229, 229, 0.6) 50%, rgba(229, 229, 229, 0.3) 75%);
  background-size: 200% 100%;
  border: 4px solid #fff;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.2);
}

.skeleton-name {
  width: 40%;
  height: 24px;
  margin-top: 12px;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(229, 229, 229, 0.3) 25%, rgba(229, 229, 229, 0.6) 50%, rgba(229, 229, 229, 0.3) 75%);
  background-size: 200% 100%;
}

.skeleton-info {
  width: 60%;
  height: 14px;
  margin-top: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(229, 229, 229, 0.3) 25%, rgba(229, 229, 229, 0.6) 50%, rgba(229, 229, 229, 0.3) 75%);
  background-size: 200% 100%;
}

.skeleton-follow-btn {
  width: 120px;
  height: 40px;
  margin-top: 16px;
  border-radius: 20px;
  background: linear-gradient(90deg, rgba(229, 229, 229, 0.3) 25%, rgba(229, 229, 229, 0.6) 50%, rgba(229, 229, 229, 0.3) 75%);
  background-size: 200% 100%;
}

.skeleton-stats {
  margin: 20px 16px;
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.skeleton-stats > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.skeleton-stats > div::before {
  content: '';
  width: 40px;
  height: 20px;
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(229, 229, 229, 0.3) 25%, rgba(229, 229, 229, 0.6) 50%, rgba(229, 229, 229, 0.3) 75%);
  background-size: 200% 100%;
}

.skeleton-stats > div::after {
  content: '';
  width: 30px;
  height: 12px;
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(229, 229, 229, 0.3) 25%, rgba(229, 229, 229, 0.6) 50%, rgba(229, 229, 229, 0.3) 75%);
  background-size: 200% 100%;
}

.skeleton-section {
  background: #fff;
  margin: 16px;
  padding: 16px;
  border-radius: 20px;
}

.skeleton-section-header {
  width: 40%;
  height: 18px;
  margin-bottom: 16px;
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(229, 229, 229, 0.3) 25%, rgba(229, 229, 229, 0.6) 50%, rgba(229, 229, 229, 0.3) 75%);
  background-size: 200% 100%;
}

.skeleton-pet-grid {
  display: flex;
  gap: 12px;
}

.skeleton-pet-card {
  width: 80px;
  height: 100px;
  border-radius: 16px;
  background: linear-gradient(90deg, rgba(229, 229, 229, 0.3) 25%, rgba(229, 229, 229, 0.6) 50%, rgba(229, 229, 229, 0.3) 75%);
  background-size: 200% 100%;
}

.skeleton-post-card {
  height: 200px;
  margin-bottom: 16px;
  border-radius: 20px;
  background: linear-gradient(90deg, rgba(229, 229, 229, 0.3) 25%, rgba(229, 229, 229, 0.6) 50%, rgba(229, 229, 229, 0.3) 75%);
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>