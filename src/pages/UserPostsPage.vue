<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { useFeedStore } from '@/stores/feedStore'
import { useUserStore } from '@/stores/userStore'
import { usePetStore } from '@/stores/petStore'

const router = useRouter()
const route = useRoute()
const feedStore = useFeedStore()
const userStore = useUserStore()
const petStore = usePetStore()

const userId = computed(() => route.params.id as string || userStore.currentUser?.id)

const posts = computed(() => {
  if (!userId.value) return []
  return feedStore.posts.filter(post => {
    const userPetIds = petStore.userPets
      .filter(pet => pet.ownerId === userId.value)
      .map(pet => pet.id)
    return userPetIds.includes(post.petId)
  })
})

const isLoading = ref(false)

const goBack = () => {
  router.back()
}

const goToPostDetail = (postId: string) => {
  router.push(`/post/${postId}`)
}

onMounted(async () => {
  isLoading.value = true
  await Promise.all([
    feedStore.loadPosts(),
    petStore.loadUserPets()
  ])
  isLoading.value = false
})
</script>

<template>
  <div class="user-posts-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft :size="20" />
      </button>
      <h1 class="page-title">我的帖子</h1>
      <div class="placeholder"></div>
    </div>

    <div class="page-content">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="posts.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>还没有帖子</h3>
        <p>快去发布你的第一条动态吧</p>
      </div>

      <div v-else class="posts-list">
        <div
          v-for="post in posts"
          :key="post.id"
          class="post-item"
          @click="goToPostDetail(post.id)"
        >
          <div class="post-content">
            <p class="post-text">{{ post.content }}</p>
            <div v-if="post.images && post.images.length > 0" class="post-images">
              <div class="images-grid">
                <img
                  v-for="(image, index) in post.images.slice(0, 3)"
                  :key="index"
                  :src="image"
                  class="post-image"
                />
                <div v-if="post.images.length > 3" class="more-images">
                  +{{ post.images.length - 3 }}
                </div>
              </div>
            </div>
          </div>
          <div class="post-meta">
            <span class="meta-item">❤️ {{ post.likes || 0 }}</span>
            <span class="meta-item">💬 {{ post.comments || 0 }}</span>
            <span class="meta-time">{{ post.date }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-posts-page {
  min-height: 100vh;
  background-color: #FFF9F5;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #F5F5F4;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #292524;
}

.page-title {
  font-size: 17px;
  font-weight: 600;
  color: #292524;
}

.placeholder {
  width: 40px;
}

.page-content {
  padding: 16px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #F5F5F4;
  border-top-color: #F97316;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px;
  color: #A8A29E;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-item {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.post-content {
  margin-bottom: 12px;
}

.post-text {
  font-size: 15px;
  color: #292524;
  line-height: 1.6;
  margin-bottom: 12px;
}

.post-images {
  margin-top: 12px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.post-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 12px;
}

.more-images {
  width: 100%;
  aspect-ratio: 1;
  background: #F5F5F4;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #A8A29E;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #F5F5F4;
}

.meta-item {
  font-size: 13px;
  color: #A8A29E;
}

.meta-time {
  margin-left: auto;
  font-size: 12px;
  color: #D6D3D1;
}
</style>