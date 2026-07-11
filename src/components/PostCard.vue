<script setup lang="ts">
import { Heart, MessageCircle, Share2, MoreHorizontal, Edit3, Trash2 } from 'lucide-vue-next'
import { ref } from 'vue'
import { useFeedStore } from '@/stores/feedStore'
import { useRouter } from 'vue-router'
import type { Post } from '@/services/postService'
import { useUserStore } from '@/stores/userStore'
import { useUiStore } from '@/stores/uiStore'
import vLazy from '@/directives/vLazy'

const props = defineProps<{
  post: Post
  index?: number
  showOwnerButton?: boolean
}>()

const feedStore = useFeedStore()
const router = useRouter()
const userStore = useUserStore()
const uiStore = useUiStore()

const showMenu = ref(false)

const isPostOwner = () => {
  return props.post.ownerId === userStore.currentUser?.id
}

const toggleMenu = (e: Event) => {
  e.stopPropagation()
  showMenu.value = !showMenu.value
}

const closeMenu = () => {
  showMenu.value = false
}

const handleEdit = (e: Event) => {
  e.stopPropagation()
  closeMenu()
  router.push(`/post-create?id=${props.post.id}`)
}

const handleDelete = async (e: Event) => {
  e.stopPropagation()
  if (!confirm('确定要删除这个帖子吗？')) return
  
  closeMenu()
  uiStore.showLoading('删除中...')
  const { success, message } = await feedStore.deletePost(props.post.id)
  if (success) {
    uiStore.showSuccessToast('删除成功')
  } else {
    uiStore.showErrorToast(message)
  }
}

const moodEmojis: Record<string, string> = {
  happy: '😄',
  love: '❤️',
  sad: '😢',
  lazy: '😴',
  angry: '😠',
  cool: '😎'
}

const getMoodEmoji = (mood?: string) => {
  return mood ? moodEmojis[mood] || '' : ''
}

const handleLike = async (postId: string) => {
  if (!userStore.currentUser) {
    uiStore.showErrorToast('请先登录')
    router.push('/login')
    return
  }
  const { success, message } = await feedStore.toggleLike(postId)
  if (!success) {
    uiStore.showErrorToast(message)
  }
}

const goToPostDetail = (postId: string) => {
  router.push(`/post/${postId}`)
}

const goToPetProfile = (petId: string) => {
  router.push(`/pet/${petId}`)
}

const goToUserProfile = (ownerId: string) => {
  router.push(`/user/${ownerId}`)
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20pet%20placeholder&image_size=square'
}

const handleAvatarError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cat%20avatar&image_size=square'
}
</script>

<template>
  <div
    class="post-card"
    :style="{ animationDelay: `${(index || 0) * 0.1}s` }"
    @click="goToPostDetail(post.id)"
  >
    <div class="post-header">
      <img
        v-lazy="post.petAvatar"
        :alt="post.petName"
        class="pet-avatar"
        @click.stop="goToPetProfile(post.petId)"
        @error="handleAvatarError"
      />
      <div class="pet-info">
        <div class="pet-name-row">
          <span class="pet-name" @click.stop="goToPetProfile(post.petId)">{{ post.petName }}</span>
          <span v-if="post.isDiary && getMoodEmoji(post.mood)" class="mood-emoji">{{ getMoodEmoji(post.mood) }}</span>
        </div>
        <div class="post-meta">
          <span class="post-time">{{ post.createdAt }}</span>
        </div>
      </div>
      <div class="post-header-right">
        <button 
          v-if="showOwnerButton && post.ownerId" 
          class="owner-avatar-btn" 
          @click.stop="goToUserProfile(post.ownerId)"
          title="查看主人主页"
        >
          <span class="owner-icon">👤</span>
        </button>
        <button 
          v-if="isPostOwner()" 
          class="more-btn" 
          @click="toggleMenu"
          title="更多操作"
        >
          <MoreHorizontal :size="18" />
        </button>
      </div>
    </div>

    <div v-if="showMenu" class="post-menu" @click.stop>
      <button class="menu-item edit-item" @click="handleEdit">
        <Edit3 :size="16" />
        <span>编辑</span>
      </button>
      <button class="menu-item delete-item" @click="handleDelete">
        <Trash2 :size="16" />
        <span>删除</span>
      </button>
    </div>

    <p class="post-content">{{ post.content }}</p>

    <div v-if="post.images.length > 0" class="post-images">
      <img
        v-for="(img, idx) in post.images"
        :key="idx"
        v-lazy="img"
        alt="帖子图片"
        class="post-image"
        @error="handleImageError"
      />
    </div>

    <div v-if="post.tags.length > 0" class="post-tags">
      <span v-for="tag in post.tags" :key="tag" class="post-tag">
        {{ tag }}
      </span>
    </div>

    <div class="post-actions">
      <button class="action-btn" @click.stop="handleLike(post.id)">
        <Heart
          :size="20"
          :class="{ 'liked': post.isLiked }"
        />
        <span>{{ post.likes }}</span>
      </button>
      <button class="action-btn" @click.stop="goToPostDetail(post.id)">
        <MessageCircle :size="20" />
        <span>{{ post.comments }}</span>
      </button>
      <button class="action-btn" @click.stop>
        <Share2 :size="20" />
        <span>分享</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.post-card {
  position: relative;
  background: #fff;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
  animation: fadeIn 0.4s ease forwards;
  opacity: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.post-card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.1);
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  justify-content: space-between;
}

.pet-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  background: linear-gradient(#fff, #fff) padding-box,
              linear-gradient(135deg, #F97316, #FB923C) border-box;
}

.pet-info {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.owner-avatar-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(249, 115, 22, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.owner-avatar-btn:active {
  background: rgba(249, 115, 22, 0.2);
  transform: scale(0.95);
}

.owner-icon {
  font-size: 16px;
}

.pet-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pet-name {
  font-size: 15px;
  font-weight: 600;
  color: #292524;
}

.mood-emoji {
  font-size: 16px;
}

.post-time {
  font-size: 12px;
  color: #A8A29E;
  margin-top: 2px;
}

.post-content {
  font-size: 15px;
  line-height: 1.6;
  color: #292524;
  margin-bottom: 12px;
  white-space: pre-wrap;
}

.post-images {
  margin-bottom: clamp(8px, 2vw, 12px);
}

.post-image {
  width: 100%;
  border-radius: clamp(12px, 3vw, 16px);
  object-fit: cover;
  max-height: clamp(200px, 50vw, 300px);
  margin-bottom: clamp(6px, 1.5vw, 8px);
}

.post-image:last-child {
  margin-bottom: 0;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.post-tag {
  padding: 4px 12px;
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.post-actions {
  display: flex;
  justify-content: space-around;
  padding-top: 12px;
  border-top: 1px solid #F5F5F4;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #57534E;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 20px;
}

.action-btn:active {
  background: rgba(249, 115, 22, 0.05);
}

.action-btn .liked {
  color: #FB7185;
  fill: #FB7185;
}

.post-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.more-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #57534E;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.more-btn:active {
  background: rgba(249, 115, 22, 0.1);
}

.post-menu {
  position: absolute;
  top: 50px;
  right: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;
  min-width: 120px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  width: 100%;
  border: none;
  background: transparent;
  color: #292524;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-item:active {
  background: #F5F5F4;
}

.delete-item {
  color: #EF4444;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
