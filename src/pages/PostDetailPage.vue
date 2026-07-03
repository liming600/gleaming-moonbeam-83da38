<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Heart, MessageCircle, Share2, Send } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useFeedStore } from '@/stores/feedStore'
import { postService, type Comment } from '@/services/postService'

const route = useRoute()
const router = useRouter()
const feedStore = useFeedStore()

const commentText = ref('')
const comments = ref<Comment[]>([])
const isLoadingComments = ref(false)

const postId = computed(() => route.params.id as string)

const post = computed(() => {
  return feedStore.posts.find(p => p.id === postId.value)
})

const back = () => {
  router.back()
}

const handleLike = () => {
  if (post.value) {
    feedStore.toggleLike(post.value.id)
  }
}

const goToPetProfile = () => {
  if (post.value) {
    router.push(`/pet/${post.value.petId}`)
  }
}

const loadComments = async () => {
  isLoadingComments.value = true
  const { comments: loadedComments, error } = await postService.getComments(postId.value)
  isLoadingComments.value = false

  if (error) {
    console.warn('加载评论失败:', error.message)
    return
  }

  comments.value = loadedComments
}

const submitComment = async () => {
  if (!commentText.value.trim()) return

  const { success, message } = await feedStore.addComment(postId.value, commentText.value)

  if (success) {
    commentText.value = ''
    await loadComments()
  } else {
    console.warn('评论失败:', message)
  }
}

onMounted(() => {
  loadComments()
})
</script>

<template>
  <div class="post-detail-page">
    <header class="header">
      <button class="back-btn" @click="back">
        <ArrowLeft :size="24" />
      </button>
      <h1 class="header-title">帖子详情</h1>
      <div class="header-placeholder"></div>
    </header>

    <div v-if="post" class="post-content">
      <div class="post-header" @click="goToPetProfile">
        <img :src="post.petAvatar" :alt="post.petName" class="pet-avatar" />
        <div class="pet-info">
          <span class="pet-name">{{ post.petName }}</span>
          <span class="post-time">{{ post.createdAt }}</span>
        </div>
      </div>

      <p class="post-text">{{ post.content }}</p>

      <div v-if="post.images.length > 0" class="post-images">
        <img
          v-for="(img, idx) in post.images"
          :key="idx"
          :src="img"
          alt="帖子图片"
          class="post-image"
        />
      </div>

      <div v-if="post.tags.length > 0" class="post-tags">
        <span v-for="tag in post.tags" :key="tag" class="post-tag">
          {{ tag }}
        </span>
      </div>

      <div class="post-actions">
        <button class="action-btn" @click="handleLike">
          <Heart :size="24" :class="{ 'liked': post.isLiked }" />
          <span>{{ post.likes }}</span>
        </button>
        <button class="action-btn">
          <MessageCircle :size="24" />
          <span>{{ comments.length }}</span>
        </button>
        <button class="action-btn">
          <Share2 :size="24" />
          <span>分享</span>
        </button>
      </div>
    </div>

    <div class="comments-section">
      <h3 class="comments-title">评论 ({{ comments.length }})</h3>

      <div v-if="isLoadingComments" class="loading-comments">
        <span>加载中...</span>
      </div>

      <div v-else-if="comments.length === 0" class="no-comments">
        <span>暂无评论，快来抢沙发吧~</span>
      </div>

      <div v-else v-for="comment in comments" :key="comment.id" class="comment-item">
        <img
          :src="comment.user_avatar"
          :alt="comment.user_name"
          class="comment-avatar"
          @error="(e) => { (e.target as HTMLImageElement).src = 'https://neeko-copilot.bytedance.net/api/text2image?prompt=cute%20avatar&image_size=square' }"
        />
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">{{ comment.user_name }}</span>
            <span class="comment-time">{{ comment.created_at }}</span>
          </div>
          <p class="comment-text">{{ comment.content }}</p>
        </div>
      </div>
    </div>

    <div class="comment-input-section">
      <input
        v-model="commentText"
        type="text"
        placeholder="发表评论..."
        class="comment-input"
        @keyup.enter="submitComment"
      />
      <button class="send-btn" @click="submitComment">
        <Send :size="18" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.post-detail-page {
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

.header-placeholder {
  width: 40px;
}

.post-content {
  padding: 80px 16px 24px;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  cursor: pointer;
}

.pet-avatar {
  width: 48px;
  height: 48px;
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
  font-size: 16px;
  font-weight: 600;
  color: #292524;
}

.post-time {
  font-size: 13px;
  color: #A8A29E;
  margin-top: 2px;
}

.post-text {
  font-size: 16px;
  line-height: 1.6;
  color: #292524;
  margin-bottom: 16px;
  white-space: pre-wrap;
}

.post-images {
  margin-bottom: 16px;
}

.post-image {
  width: 100%;
  border-radius: 16px;
  object-fit: cover;
  margin-bottom: 8px;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.post-tag {
  padding: 6px 14px;
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.post-actions {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: #57534E;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:active {
  background: rgba(249, 115, 22, 0.05);
  border-radius: 12px;
}

.action-btn .liked {
  color: #FB7185;
  fill: #FB7185;
}

.comments-section {
  padding: 0 16px;
}

.comments-title {
  font-size: 16px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 16px;
}

.loading-comments {
  text-align: center;
  padding: 24px;
  color: #A8A29E;
}

.no-comments {
  text-align: center;
  padding: 24px;
  color: #A8A29E;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 12px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  font-size: 15px;
  font-weight: 600;
  color: #292524;
}

.comment-time {
  font-size: 12px;
  color: #A8A29E;
}

.comment-text {
  font-size: 15px;
  color: #57534E;
  line-height: 1.5;
}

.comment-input-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #F5F5F4;
}

.comment-input {
  flex: 1;
  height: 44px;
  padding: 0 16px;
  border: 2px solid #E7E5E4;
  border-radius: 22px;
  font-size: 15px;
  color: #292524;
  outline: none;
  transition: all 0.2s ease;
}

.comment-input:focus {
  border-color: #F97316;
}

.comment-input::placeholder {
  color: #A8A29E;
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
</style>
