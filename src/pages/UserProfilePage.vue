<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, Users } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { usePetStore } from '@/stores/petStore'
import { useFeedStore } from '@/stores/feedStore'
import PostCard from '@/components/PostCard.vue'

const route = useRoute()
const router = useRouter()
const petStore = usePetStore()
const feedStore = useFeedStore()

const isFollowing = ref(false)
const userId = computed(() => route.params.id as string)

const users = [
  {
    id: 'demo1',
    name: '铲屎官小明',
    avatar: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=young%20man%20portrait%20friendly%20smile&image_size=square',
    posts: 28,
    followers: 245,
    mutualHelps: 12,
    description: '爱猫爱狗的铲屎官，分享宠物日常~'
  },
  {
    id: 'demo2',
    name: '爱宠达人小红',
    avatar: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=young%20woman%20portrait%20friendly%20smile&image_size=square',
    posts: 35,
    followers: 189,
    mutualHelps: 8,
    description: '专业宠物美容师，分享养宠心得~'
  },
  {
    id: 'demo3',
    name: '宠物爱好者小刚',
    avatar: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=young%20man%20portrait%20glasses%20friendly&image_size=square',
    posts: 15,
    followers: 76,
    mutualHelps: 5,
    description: '仓鼠饲养爱好者~'
  },
  {
    id: 'demo4',
    name: '猫奴阿强',
    avatar: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=young%20man%20portrait%20casual%20style&image_size=square',
    posts: 42,
    followers: 312,
    mutualHelps: 15,
    description: '资深猫奴，家有三只猫~'
  }
]

const user = computed(() => users.find(u => u.id === userId.value))

const userPets = computed(() => {
  if (!userId.value) return []
  return petStore.pets.filter(p => p.ownerId === userId.value)
})

const userPosts = computed(() => {
  if (!userId.value) return []
  const petIds = userPets.value.map(p => p.id)
  return feedStore.posts.filter(p => petIds.includes(p.petId))
})

const back = () => {
  router.back()
}

const toggleFollow = () => {
  isFollowing.value = !isFollowing.value
}

const goToPetProfile = (petId: string) => {
  router.push(`/pet/${petId}`)
}
</script>

<template>
  <div class="user-profile-page">
    <header class="header">
      <button class="back-btn" @click="back">
        <ArrowLeft :size="24" />
      </button>
      <h1 class="header-title">{{ user?.name || '用户主页' }}</h1>
      <div class="header-placeholder"></div>
    </header>

    <div v-if="user" class="user-header">
      <div class="cover-image">
        <img src="https://neeko-copilot.bytedance.net/api/text2image?prompt=cute%20pets%20collection%20cats%20dogs%20happy%20warm%20colorful&image_size=landscape_16_9" alt="封面" />
      </div>
      <div class="avatar-container">
        <img :src="user.avatar" :alt="user.name" class="user-avatar" />
        <div class="user-name">{{ user.name }}</div>
        <p class="user-desc">{{ user.description }}</p>
        <button class="follow-btn" :class="{ followed: isFollowing }" @click="toggleFollow">
          {{ isFollowing ? '已关注' : '+ 关注' }}
        </button>
      </div>

      <div class="stats-card">
        <div class="stat-item" @click="router.push(`/user/${userId}/posts`)">
          <div class="stat-value">{{ user.posts }}</div>
          <div class="stat-label">帖子</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">{{ user.followers }}</div>
          <div class="stat-label">粉丝</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">{{ user.mutualHelps }}</div>
          <div class="stat-label">互助</div>
        </div>
      </div>
    </div>

    <div v-if="user" class="section">
      <div class="section-header">
        <h3 class="section-title">🐾 {{ user.name }} 的宠物</h3>
        <Users :size="18" class="section-icon" />
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
        <h3 class="section-title">📝 最新帖子</h3>
      </div>
      <div class="posts-section">
        <PostCard
          v-for="(post, index) in userPosts"
          :key="post.id"
          :post="post"
          :index="index"
        />
        <div v-if="userPosts.length === 0" class="empty-state">
          <span class="empty-icon">📭</span>
          <p>还没有帖子~</p>
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

.header-placeholder {
  width: 40px;
}

.user-header {
  padding-top: 50px;
}

.cover-image {
  width: 100%;
  height: 140px;
  overflow: hidden;
}

.cover-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -40px;
  position: relative;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.2);
}

.user-name {
  margin-top: 12px;
  font-size: 22px;
  font-weight: 700;
  color: #292524;
}

.user-desc {
  margin-top: 6px;
  font-size: 14px;
  color: #57534E;
  text-align: center;
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.follow-btn {
  margin-top: 16px;
  padding: 10px 32px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  transition: all 0.2s ease;
}

.follow-btn:active {
  transform: scale(0.98);
}

.follow-btn.followed {
  background: #F5F5F4;
  color: #57534E;
  box-shadow: none;
}

.stats-card {
  margin: 20px 16px;
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
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
</style>
