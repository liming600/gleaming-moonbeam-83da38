<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { messageService, type Conversation } from '@/services/messageService'

const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const isLoadingMessages = ref(false)
const isLoadingNotifications = ref(false)

const activeTab = ref<'notifications' | 'messages'>('notifications')

const tabs = [
  { key: 'notifications', label: '通知' },
  { key: 'messages', label: '私信' }
] as const

const conversations = ref<Conversation[]>([])

const formatTime = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
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

const loadConversations = async () => {
  if (!userStore.currentUser) return
  isLoadingMessages.value = true
  const { conversations: data } = await messageService.getConversations(userStore.currentUser.id)
  conversations.value = data
  isLoadingMessages.value = false
}

const handleNotificationClick = (notification: any) => {
  notificationStore.markAsRead(notification.id)
  switch (notification.type) {
    case 'like':
    case 'comment':
      router.push(`/post/${notification.related_id}`)
      break
    case 'follow':
      router.push(`/user/${notification.related_id}`)
      break
    case 'help_answer':
    case 'help_accepted':
      router.push(`/help/${notification.related_id}`)
      break
    default:
      break
  }
}

const back = () => {
  router.back()
}

onMounted(async () => {
  if (userStore.currentUser) {
    loadConversations()
    isLoadingNotifications.value = true
    await notificationStore.loadNotifications(userStore.currentUser.id)
    isLoadingNotifications.value = false
  }
})
</script>

<template>
  <div class="messages-page">
    <header class="header">
      <button class="back-btn" @click="back">
        <ArrowLeft :size="24" />
      </button>
      <h1 class="header-title">消息</h1>
      <div class="header-placeholder"></div>
    </header>

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

    <div v-if="activeTab === 'notifications'" class="message-list">
      <div v-if="isLoadingNotifications" class="loading-state">
        <Loader2 :size="24" class="loader" />
        <span>加载中...</span>
      </div>
      <template v-else>
        <div
          v-for="notification in notificationStore.notifications"
          :key="notification.id"
          class="message-item"
          :class="{ unread: !notification.read }"
          @click="handleNotificationClick(notification)"
        >
          <div class="message-avatar">
            <span class="avatar-emoji">{{ notificationStore.getNotificationIcon(notification) }}</span>
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-author">{{ notificationStore.getNotificationText(notification) }}</span>
              <span class="message-time">{{ formatTime(notification.created_at) }}</span>
            </div>
          </div>
          <div v-if="!notification.read" class="unread-dot"></div>
        </div>
        <div v-if="notificationStore.notifications.length === 0 && !isLoadingNotifications" class="empty-state">
          <span class="empty-icon">🔔</span>
          <p>暂无通知</p>
        </div>
      </template>
    </div>

    <div v-if="activeTab === 'messages'" class="message-list">
      <div v-if="isLoadingMessages" class="loading-state">
        <Loader2 :size="24" class="loader" />
        <span>加载中...</span>
      </div>
      <template v-else>
        <div
          v-for="conv in conversations"
          :key="conv.userId"
          class="message-item"
          :class="{ unread: conv.unread > 0 }"
          @click="router.push(`/chat/${conv.userId}`)"
        >
          <div class="message-avatar">
            <img
              :src="conv.userAvatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20pet%20owner%20avatar&image_size=square'"
              :alt="conv.userName"
            />
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-author">{{ conv.userName }}</span>
              <span class="message-time">{{ formatTime(conv.lastTime) }}</span>
            </div>
            <p class="message-text">{{ conv.lastMessage }}</p>
          </div>
          <div v-if="conv.unread > 0" class="unread-badge">{{ conv.unread }}</div>
        </div>
        <div v-if="conversations.length === 0 && !isLoadingMessages" class="empty-state">
          <span class="empty-icon">💬</span>
          <p>暂无私信</p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.messages-page {
  min-height: 100vh;
  background-color: #FFF9F5;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 249, 245, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(249, 115, 22, 0.1);
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

.tab-container {
  display: flex;
  background: #fff;
  padding: 8px 16px;
  gap: 8px;
}

.tab-btn {
  flex: 1;
  height: 36px;
  border-radius: 18px;
  border: none;
  font-size: 15px;
  font-weight: 500;
  background: #F5F5F4;
  color: #57534E;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
}

.message-list {
  padding: 16px;
}

.message-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.05);
  transition: all 0.2s ease;
}

.message-item:active {
  transform: scale(0.98);
}

.message-item.unread {
  background: rgba(249, 115, 22, 0.03);
}

.message-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid transparent;
  background: linear-gradient(#fff, #fff) padding-box,
              linear-gradient(135deg, #F97316, #FB923C) border-box;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-avatar.system-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F97316, #FB923C);
  border: none;
}

.avatar-emoji {
  font-size: 24px;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.message-author {
  font-size: 15px;
  font-weight: 600;
  color: #292524;
}

.message-time {
  font-size: 12px;
  color: #A8A29E;
}

.message-text {
  font-size: 14px;
  color: #57534E;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #EF4444;
  flex-shrink: 0;
}

.unread-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #EF4444;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #A8A29E;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 14px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #A8A29E;
  gap: 12px;
  font-size: 14px;
}

.loader {
  animation: spin 1s linear infinite;
  color: #F97316;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
