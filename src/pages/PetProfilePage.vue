﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Hand } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { usePetStore } from '@/stores/petStore'
import { useFeedStore } from '@/stores/feedStore'
import { useUiStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'

import PostCard from '@/components/PostCard.vue'

const route = useRoute()
const router = useRouter()
const petStore = usePetStore()
const feedStore = useFeedStore()
const uiStore = useUiStore()
const userStore = useUserStore()

const activeTab = ref<'posts' | 'growth'>('posts')
const pawsCount = ref(0)
const hasPawedToday = ref(false)
const petId = computed(() => route.params.id as string)
const expandedItems = ref<Set<string>>(new Set())

const toggleExpand = (itemId: string) => {
  if (expandedItems.value.has(itemId)) {
    expandedItems.value.delete(itemId)
  } else {
    expandedItems.value.add(itemId)
  }
}

const moodMap: Record<string, { emoji: string; label: string }> = {
  happy: { emoji: '😊', label: '开心' },
  love: { emoji: '🥰', label: '幸福' },
  sad: { emoji: '😢', label: '难过' },
  lazy: { emoji: '😴', label: '慵懒' },
  angry: { emoji: '😤', label: '烦躁' },
  cool: { emoji: '😎', label: '酷' }
}

const getMoodInfo = (mood: string) => {
  return moodMap[mood] || null
}

const isLoading = ref(true)
const pet = computed(() => {
  const result = petStore.getPetById(petId.value)
  if (result) {
    isLoading.value = false
  }
  return result
})



const petPosts = computed(() => {
  const currentPet = pet.value
  if (!currentPet) return []
  return feedStore.posts.filter(p => p.petId === currentPet.id)
})

const growthLineItems = computed(() => {
  const currentPet = pet.value
  if (!currentPet) return []

  const items: Array<{
    id: string
    type: 'post' | 'milestone' | 'diary'
    date: string
    title?: string
    description?: string
    icon?: string
    content?: string
    images?: string[]
    likes?: number
    comments?: number
    tags?: string[]
    isPublic?: boolean
    mood?: string
  }> = []

  pet.value.milestones.forEach(m => {
    items.push({
      id: m.id,
      type: 'milestone',
      date: m.date,
      title: m.title,
      description: m.description,
      icon: m.icon,
      isPublic: true
    })
  })

  petPosts.value.forEach(p => {
    items.push({
      id: p.id,
      type: p.isDiary ? 'diary' : 'post',
      date: p.date,
      content: p.content,
      images: p.images,
      likes: p.likes,
      comments: p.comments,
      tags: p.tags,
      isPublic: p.isPublic,
      mood: p.mood
    })
  })

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const back = () => {
  router.back()
}

const handlePaw = async () => {
  if (!userStore.isLoggedIn) {
    uiStore.showWarningToast('请先登录')
    router.push('/login')
    return
  }

  const { success, message } = await petStore.addPetPaw(petId.value)
  if (success) {
    pawsCount.value++
    hasPawedToday.value = true
    uiStore.showSuccessToast(message)
  } else {
    uiStore.showWarningToast(message)
  }
}

const loadPawsData = async () => {
  pawsCount.value = await petStore.getPetPawsCount(petId.value)
  if (userStore.isLoggedIn) {
    hasPawedToday.value = await petStore.checkHasPawedToday(petId.value)
  }
}

onMounted(async () => {
  await petStore.loadPetById(petId.value)
  await feedStore.loadPostsByPet(petId.value)
  await loadPawsData()
})

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20pet%20placeholder&image_size=square'
}

const handleAvatarError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cat%20avatar&image_size=square'
}

const goToOwner = (ownerId: string) => {
  router.push(`/user/${ownerId}`)
}

const tabs = [
  { key: 'posts', label: '帖子' },
  { key: 'growth', label: '成长线' }
] as const
</script>

<template>
  <div class="pet-profile-page">
    <header class="header">
      <button class="back-btn" @click="back">
        <ArrowLeft :size="24" />
      </button>
      <h1 class="header-title">{{ pet?.name || '宠物主页' }}</h1>
      <div class="header-placeholder"></div>
    </header>

    <div v-if="isLoading" class="pet-profile-skeleton">
      <div class="skeleton-cover"></div>
      <div class="skeleton-avatar-container">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-name"></div>
        <div class="skeleton-info"></div>
        <div class="skeleton-follow-btn"></div>
      </div>
      <div class="skeleton-owner"></div>
      <div class="skeleton-stats"></div>
      <div class="skeleton-posts">
        <div class="skeleton-post-card" v-for="i in 3" :key="i"></div>
      </div>
    </div>

    <div v-else-if="pet" class="pet-header">
      <div class="profile-card">
        <div class="cover-wrapper">
          <img :src="pet.coverImage || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20pets%20collection%20cats%20dogs%20happy%20warm%20colorful&image_size=landscape_16_9'" :alt="pet.name" class="cover-image" @error="handleImageError" />
          <div class="cover-overlay"></div>
        </div>
        <div class="avatar-section">
          <div class="pet-avatar-wrapper">
            <img :src="pet.avatar" :alt="pet.name" class="pet-avatar" @error="handleAvatarError" />
          </div>
          <div class="pet-info">
            <div class="pet-name">{{ pet.name }}</div>
            <div class="pet-meta">
              <span>{{ pet.breed }}</span>
              <span>·</span>
              <span>{{ pet.age }}</span>
              <span>·</span>
              <span>🐾 已陪伴 {{ Math.floor((Date.now() - new Date(pet.createdAt).getTime()) / (1000 * 60 * 60 * 24)) }} 天</span>
            </div>
          </div>
          <button class="paw-btn" :class="{ pawed: hasPawedToday }" @click="handlePaw">
            <Hand :size="18" />
            <span>{{ hasPawedToday ? '已击掌' : '击掌' }}</span>
          </button>
        </div>

        <div class="owner-info" @click="goToOwner(pet.ownerId)">
          <img :src="pet.ownerAvatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20avatar%20friendly%20face&image_size=square'" :alt="pet.ownerName" class="owner-avatar" />
          <div class="owner-detail">
            <span class="owner-name">{{ pet.ownerName || '主人' }}</span>
            <span class="owner-label">主人</span>
          </div>
          <span class="owner-arrow">›</span>
        </div>

        <div class="stats-card">
          <div class="stat-item">
            <div class="stat-value">{{ pet.posts }}</div>
            <div class="stat-label">帖子</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value">{{ pet.likes }}</div>
            <div class="stat-label">获赞</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value">{{ pawsCount }}</div>
            <div class="stat-label">击掌</div>
          </div>
        </div>
      </div>
    </div>

    

    <div class="tab-container">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="activeTab === 'posts'" class="posts-section">
      <PostCard
        v-for="(post, index) in petPosts"
        :key="post.id"
        :post="post"
        :index="index"
      />
      <div v-if="petPosts.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <p>还没有帖子~</p>
      </div>
    </div>

    <div v-if="activeTab === 'growth'" class="growth-section">
      <div v-for="(item, index) in growthLineItems" :key="item.id" class="growth-item">
        <div class="growth-dot" :class="{ milestone: item.type === 'milestone', post: item.type === 'post', diary: item.type === 'diary' }">
          <span class="dot-icon">{{ item.type === 'milestone' ? item.icon : (item.type === 'diary' ? '📖' : '📝') }}</span>
        </div>
        <div v-if="index < growthLineItems.length - 1" class="growth-line"></div>
        
        <div v-if="item.type === 'milestone'" class="growth-content milestone-card">
          <div class="growth-date">{{ item.date }}</div>
          <div class="growth-title">{{ item.title }}</div>
          <div class="growth-desc">{{ item.description }}</div>
        </div>
        
        <div v-else-if="item.type === 'diary'" class="growth-content diary-card">
          <div class="growth-date">{{ item.date }}</div>
          <div class="diary-header">
            <span class="diary-label">📖 日记</span>
            <span v-if="item.mood" class="mood-badge">{{ getMoodInfo(item.mood)?.emoji }}</span>
            <span v-if="!item.isPublic" class="private-badge">🔒 私密</span>
          </div>
          <p class="post-content-text" :class="{ expanded: expandedItems.has(item.id) }">{{ item.content }}</p>
          <button v-if="item.content && item.content.length > 100" class="expand-btn" @click="toggleExpand(item.id)">
            {{ expandedItems.has(item.id) ? '收起' : '展开' }}
          </button>
          <div v-if="item.images && item.images.length > 0" class="post-images" :class="{ collapsed: !expandedItems.has(item.id) && item.images.length > 3 }">
            <img v-for="(img, idx) in (expandedItems.has(item.id) ? item.images : item.images.slice(0, 3))" :key="idx" :src="img" alt="日记图片" class="post-image" @error="handleImageError" />
            <div v-if="item.images.length > 3 && !expandedItems.has(item.id)" class="image-more">
              +{{ item.images.length - 3 }}
            </div>
          </div>
          <div v-if="item.tags && item.tags.length > 0" class="post-tags">
            <span v-for="tag in (expandedItems.has(item.id) ? item.tags : item.tags.slice(0, 2))" :key="tag" class="post-tag diary-tag">{{ tag }}</span>
            <span v-if="item.tags.length > 2" class="post-tag more-tag">+{{ item.tags.length - 2 }}</span>
          </div>
        </div>
        
        <div v-else class="growth-content post-card">
          <div class="growth-date">{{ item.date }}</div>
          <p class="post-content-text" :class="{ expanded: expandedItems.has(item.id) }">{{ item.content }}</p>
          <button v-if="item.content && item.content.length > 100" class="expand-btn" @click="toggleExpand(item.id)">
            {{ expandedItems.has(item.id) ? '收起' : '展开' }}
          </button>
          <div v-if="item.images && item.images.length > 0" class="post-images" :class="{ collapsed: !expandedItems.has(item.id) && item.images.length > 3 }">
            <img v-for="(img, idx) in (expandedItems.has(item.id) ? item.images : item.images.slice(0, 3))" :key="idx" :src="img" alt="帖子图片" class="post-image" @error="handleImageError" />
            <div v-if="item.images.length > 3 && !expandedItems.has(item.id)" class="image-more">
              +{{ item.images.length - 3 }}
            </div>
          </div>
          <div v-if="item.tags && item.tags.length > 0" class="post-tags">
            <span v-for="tag in (expandedItems.has(item.id) ? item.tags : item.tags.slice(0, 2))" :key="tag" class="post-tag">{{ tag }}</span>
            <span v-if="item.tags.length > 2" class="post-tag more-tag">+{{ item.tags.length - 2 }}</span>
          </div>
          <div class="post-actions">
            <button class="action-btn">
              <span>❤️ {{ item.likes }}</span>
            </button>
            <button class="action-btn">
              <span>💬 {{ item.comments }}</span>
            </button>
          </div>
        </div>
      </div>
      <div v-if="growthLineItems.length === 0" class="empty-state">
        <span class="empty-icon">📅</span>
        <p>还没有成长记录~</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pet-profile-page {
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

.pet-header {
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

.pet-avatar-wrapper {
  position: relative;
}

.pet-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.15);
}

.change-pet-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.4);
  transition: all 0.2s ease;
}

.change-pet-avatar-btn:active {
  transform: scale(0.9);
}

.pet-avatar-input {
  display: none;
}

.pet-info {
  flex: 1;
  min-width: 0;
}

.pet-name {
  font-size: 20px;
  font-weight: 700;
  color: #292524;
}

.pet-meta {
  margin-top: 4px;
  font-size: 13px;
  color: #57534E;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.paw-btn {
  padding: 8px 24px;
  background: linear-gradient(135deg, #3B82F6, #60A5FA);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(59, 130, 246, 0.25);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.paw-btn:active {
  transform: scale(0.98);
}

.paw-btn.pawed {
  background: #F5F5F4;
  color: #57534E;
  box-shadow: none;
}

.owner-info {
  margin: 0 16px 16px;
  padding: 12px;
  background: #FFF9F5;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.owner-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  background: linear-gradient(#fff, #fff) padding-box,
              linear-gradient(135deg, #F97316, #FB923C) border-box;
}

.owner-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.owner-name {
  font-size: 15px;
  font-weight: 600;
  color: #292524;
}

.owner-label {
  font-size: 12px;
  color: #A8A29E;
}

.owner-arrow {
  font-size: 20px;
  color: #A8A29E;
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

.posts-section {
  padding: 0 16px 80px;
}

.growth-section {
  padding: 0 16px 80px;
}

.growth-item {
  display: flex;
  gap: 16px;
  position: relative;
  padding-bottom: 24px;
}

.growth-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.growth-dot.milestone {
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
}

.growth-dot.post {
  background: linear-gradient(135deg, #F97316, #FB923C);
}

.growth-dot.diary {
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
}

.dot-icon {
  font-size: 20px;
}

.growth-line {
  position: absolute;
  left: 19px;
  top: 40px;
  width: 2px;
  height: calc(100% - 40px);
  background: linear-gradient(180deg, #FBBF24, #F97316);
}

.growth-content {
  flex: 1;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.milestone-card {
  background: #fff;
}

.post-card {
  background: #FFF9F5;
}

.diary-card {
  background: #FFFBEB;
  border-left: 4px solid #FBBF24;
}

.growth-date {
  font-size: 12px;
  color: #A8A29E;
  margin-bottom: 8px;
}

.growth-title {
  font-size: 16px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 4px;
}

.growth-desc {
  font-size: 14px;
  color: #57534E;
  line-height: 1.5;
}

.post-content-text {
  font-size: 15px;
  color: #292524;
  line-height: 1.5;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
}

.post-content-text.expanded {
  -webkit-line-clamp: unset;
  overflow: visible;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
  position: relative;
}

.post-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 12px;
}

.image-more {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: calc(33.333% - 5px);
  aspect-ratio: 1;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.post-tag {
  padding: 4px 12px;
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
  font-size: 12px;
  border-radius: 12px;
}

.post-tag.diary-tag {
  background: rgba(251, 191, 36, 0.15);
  color: #D97706;
}

.post-tag.more-tag {
  background: rgba(168, 162, 158, 0.15);
  color: #A8A29E;
}

.expand-btn {
  background: transparent;
  border: none;
  color: #F97316;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 0;
}

.mood-badge {
  font-size: 16px;
  margin-left: 4px;
}

.diary-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.diary-label {
  font-size: 13px;
  font-weight: 600;
  color: #D97706;
}

.private-badge {
  font-size: 12px;
  color: #A8A29E;
  padding: 2px 8px;
  background: #F5F5F4;
  border-radius: 10px;
}

.post-actions {
  display: flex;
  gap: 24px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  font-size: 14px;
  color: #57534E;
  cursor: pointer;
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

.pet-profile-skeleton {
  padding-top: 50px;
  animation: shimmer 1.5s infinite;
}

.skeleton-cover {
  width: 100%;
  height: 150px;
  background: linear-gradient(90deg, rgba(229, 229, 229, 0.3) 25%, rgba(229, 229, 229, 0.6) 50%, rgba(229, 229, 229, 0.3) 75%);
  background-size: 200% 100%;
}

.skeleton-avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -45px;
  position: relative;
}

.skeleton-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(90deg, rgba(229, 229, 229, 0.3) 25%, rgba(229, 229, 229, 0.6) 50%, rgba(229, 229, 229, 0.3) 75%);
  background-size: 200% 100%;
  border: 4px solid #fff;
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.2);
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

.skeleton-owner {
  margin: 16px;
  padding: 12px;
  background: #fff;
  border-radius: 16px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.skeleton-owner::before {
  content: '';
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, rgba(229, 229, 229, 0.3) 25%, rgba(229, 229, 229, 0.6) 50%, rgba(229, 229, 229, 0.3) 75%);
  background-size: 200% 100%;
}

.skeleton-owner::after {
  content: '';
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skeleton-owner::after::before {
  content: '';
  width: 50%;
  height: 16px;
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(229, 229, 229, 0.3) 25%, rgba(229, 229, 229, 0.6) 50%, rgba(229, 229, 229, 0.3) 75%);
  background-size: 200% 100%;
}

.skeleton-owner::after::after {
  content: '';
  width: 30%;
  height: 12px;
  border-radius: 4px;
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
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(90deg, rgba(229, 229, 229, 0.3) 25%, rgba(229, 229, 229, 0.6) 50%, rgba(229, 229, 229, 0.3) 75%);
  background-size: 200% 100%;
}

.skeleton-stats > div::after {
  content: '';
  width: 40px;
  height: 20px;
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(229, 229, 229, 0.3) 25%, rgba(229, 229, 229, 0.6) 50%, rgba(229, 229, 229, 0.3) 75%);
  background-size: 200% 100%;
}

.skeleton-posts {
  padding: 0 16px;
}

.skeleton-post-card {
  background: #fff;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 16px;
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
