﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Heart, MessageCircle, Share2, Send, Trash2, Edit3 } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useFeedStore } from '@/stores/feedStore'
import { postService, type Comment } from '@/services/postService'
import { logger } from '@/utils/logger'
import { useUserStore } from '@/stores/userStore'
import { useUiStore } from '@/stores/uiStore'
import ActionMenu from '@/components/ActionMenu.vue'

const route = useRoute()
const router = useRouter()
const feedStore = useFeedStore()
const userStore = useUserStore()
const uiStore = useUiStore()

const commentText = ref('')
const comments = ref<Comment[]>([])
const isLoadingComments = ref(false)

const postId = computed(() => route.params.id as string)

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const relativeTimePatterns = ['刚刚', '分钟前', '小时前', '昨天', '天前']
  if (relativeTimePatterns.some(pattern => dateString.includes(pattern))) {
    return dateString
  }
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return dateString
  }
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

const localPost = ref<typeof feedStore.posts[0] | null>(null)

const post = computed(() => {
  return localPost.value || feedStore.posts.find(p => p.id === postId.value)
})

const isOwner = computed(() => {
  if (!post.value || !userStore.currentUser) return false
  return post.value.ownerId === userStore.currentUser.id
})

const postMenuItems = computed(() => {
  return [
    { icon: Edit3, label: '编辑', action: editPost },
    { icon: Trash2, label: '删除', action: deletePost, danger: true }
  ]
})

const handlePostMenuSelect = (item: { label: string; action: () => void | Promise<void> }) => {
  item.action()
}

const handleCommentMenuSelect = (item: { label: string; action: () => void | Promise<void> }) => {
  item.action()
}

const back = () => {
  router.back()
}

const handleLike = async () => {
  if (!userStore.currentUser) {
    uiStore.showErrorToast('请先登录')
    router.push('/login')
    return
  }
  if (post.value) {
    const { success, message } = await feedStore.toggleLike(post.value.id)
    if (!success) {
      uiStore.showErrorToast(message)
    }
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
    logger.warn('加载评论失败:', error.message)
    return
  }

  comments.value = loadedComments
}

const isSubmittingComment = ref(false)

const submitComment = async () => {
  if (!commentText.value.trim()) return
  if (isSubmittingComment.value) return

  isSubmittingComment.value = true

  try {
    const { success, message } = await feedStore.addComment(postId.value, commentText.value)

    if (success) {
      commentText.value = ''
      await loadComments()
    } else {
      logger.warn('评论失败:', message)
    }
  } finally {
    isSubmittingComment.value = false
  }
}

const canDeleteComment = (comment: Comment): boolean => {
  if (!userStore.currentUser) return false
  if (comment.user_id === userStore.currentUser.id) return true
  if (post.value && post.value.ownerId === userStore.currentUser.id) return true
  return false
}

const deleteComment = async (commentId: string) => {
  try {
    console.log('[PostDetail] 开始删除评论:', commentId)
    const { success, message } = await feedStore.deleteComment(commentId, postId.value)
    console.log('[PostDetail] 删除评论结果:', success, message)
    if (success) {
      comments.value = comments.value.filter(c => c.id !== commentId)
      uiStore.showSuccessToast('删除成功')
    } else {
      uiStore.showErrorToast(message || '删除失败')
    }
  } catch (error) {
    console.error('[PostDetail] 删除评论出错:', error)
    uiStore.showErrorToast('删除失败，请稍后重试')
  }
}

const handleCommentLongPress = (comment: Comment) => {
  if (!canDeleteComment(comment)) return
  deleteComment(comment.id)
}

const deletePost = async () => {
  try {
    console.log('[PostDetail] 开始删除帖子:', postId.value)
    const { success, message } = await feedStore.deletePost(postId.value)
    console.log('[PostDetail] 删除帖子结果:', success, message)
    if (success) {
      uiStore.showSuccessToast('删除成功')
      setTimeout(() => {
        router.back()
      }, 1000)
    } else {
      uiStore.showErrorToast(message || '删除失败')
    }
  } catch (error) {
    console.error('[PostDetail] 删除帖子出错:', error)
    uiStore.showErrorToast('删除失败，请稍后重试')
  }
}

const editPost = () => {
  router.push(`/post-create?id=${postId.value}`)
}

onMounted(async () => {
  await feedStore.loadPostById(postId.value)
  
  if (!post.value) {
    try {
      const { post: fetchedPost } = await postService.getPostById(postId.value)
      if (fetchedPost) {
        localPost.value = fetchedPost
      }
    } catch (e) {
      console.error('[PostDetail] Failed to load post by ID:', e)
    }
  }
  
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
          <span class="post-time">{{ formatDate(post.createdAt) }}</span>
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
        <div v-if="isOwner" class="action-menu-wrapper">
          <ActionMenu :items="postMenuItems" @select="handlePostMenuSelect" />
        </div>
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

      <div 
        v-else 
        v-for="comment in comments" 
        :key="comment.id" 
        class="comment-item"
        @contextmenu.prevent="canDeleteComment(comment) && handleCommentLongPress(comment)"
      >
        <img
          :src="comment.user_avatar"
          :alt="comment.user_name"
          class="comment-avatar"
          @error="(e) => { (e.target as HTMLImageElement).src = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20avatar&image_size=square' }"
        />
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">{{ comment.user_name }}</span>
            <div class="comment-header-right">
              <span class="comment-time">{{ formatDate(comment.created_at) }}</span>
              <div v-if="canDeleteComment(comment)" class="comment-action-menu">
                <ActionMenu 
                  :items="[
                    { icon: Trash2, label: '删除评论', action: () => deleteComment(comment.id), danger: true }
                  ]" 
                  @select="handleCommentMenuSelect"
                />
              </div>
            </div>
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
  margin-bottom: clamp(12px, 3vw, 16px);
}

.post-image {
  width: 100%;
  border-radius: clamp(12px, 3vw, 16px);
  object-fit: cover;
  max-height: clamp(200px, 50vw, 400px);
  margin-bottom: clamp(6px, 1.5vw, 8px);
}

.post-image:last-child {
  margin-bottom: 0;
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

.comment-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
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

.comment-delete-btn {
  padding: 4px 10px;
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border: none;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.comment-delete-btn:active {
  background: rgba(239, 68, 68, 0.2);
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
