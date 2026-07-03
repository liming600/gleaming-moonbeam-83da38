<script setup lang="ts">
import { Heart, MessageCircle, Share2 } from 'lucide-vue-next'
import { useFeedStore } from '@/stores/feedStore'
import { useRouter } from 'vue-router'
import type { Post } from '@/mock/posts'

defineProps<{
  post: Post
  index?: number
}>()

const feedStore = useFeedStore()
const router = useRouter()

const handleLike = (postId: string) => {
  feedStore.toggleLike(postId)
}

const goToPostDetail = (postId: string) => {
  router.push(`/post/${postId}`)
}

const goToPetProfile = (petId: string) => {
  router.push(`/pet/${petId}`)
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://neeko-copilot.bytedance.net/api/text2image?prompt=cute%20pet%20placeholder&image_size=square'
}

const handleAvatarError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://neeko-copilot.bytedance.net/api/text2image?prompt=cute%20cat%20avatar&image_size=square'
}
</script>

<template>
  <div
    class="post-card"
    :style="{ animationDelay: `${(index || 0) * 0.1}s` }"
    @click="goToPostDetail(post.id)"
  >
    <div class="post-header" @click.stop="goToPetProfile(post.petId)">
      <img
        :src="post.petAvatar"
        :alt="post.petName"
        class="pet-avatar"
        @error="handleAvatarError"
      />
      <div class="pet-info">
        <span class="pet-name">{{ post.petName }}</span>
        <span class="post-time">{{ post.createdAt }}</span>
      </div>
    </div>

    <p class="post-content">{{ post.content }}</p>

    <div v-if="post.images.length > 0" class="post-images">
      <img
        v-for="(img, idx) in post.images"
        :key="idx"
        :src="img"
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
  cursor: pointer;
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
}

.pet-name {
  font-size: 15px;
  font-weight: 600;
  color: #292524;
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
  margin-bottom: 12px;
}

.post-image {
  width: 100%;
  border-radius: 16px;
  object-fit: cover;
  max-height: 300px;
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
