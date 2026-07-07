<script setup lang="ts">
import { onMounted } from 'vue'
import { ArrowLeft, Bell, CheckCircle, Loader2 } from 'lucide-vue-next'
import { useNotificationStore } from '@/stores/notificationStore'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'

const notificationStore = useNotificationStore()
const userStore = useUserStore()
const router = useRouter()

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN')
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

const handleMarkAllRead = () => {
  notificationStore.markAllAsRead(userStore.getCurrentUserId)
}

onMounted(() => {
  if (userStore.isLoggedIn && userStore.currentUser) {
    notificationStore.loadNotifications(userStore.currentUser.id)
    notificationStore.loadUnreadCount(userStore.currentUser.id)
  }
})
</script>

<template>
  <div class="notifications-page">
    <header class="header">
      <button class="back-btn" @click="router.back()">
        <ArrowLeft :size="24" />
      </button>
      <h1 class="header-title">通知</h1>
      <button class="mark-all-btn" @click="handleMarkAllRead" v-if="notificationStore.unreadCount > 0">
        <CheckCircle :size="16" />
        <span>全部已读</span>
      </button>
    </header>

    <div class="content">
      <div v-if="notificationStore.isLoading" class="loading-state">
        <Loader2 :size="32" class="loader" />
        <span class="loading-text">加载中...</span>
      </div>

      <div v-else-if="notificationStore.notifications.length === 0" class="empty-state">
        <Bell :size="64" class="empty-icon" />
        <h2 class="empty-title">暂无通知</h2>
        <p class="empty-desc">当有新的互动时，这里会显示通知</p>
      </div>

      <div v-else class="notifications-list">
        <div
          v-for="notification in notificationStore.notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.read }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon">
            {{ notificationStore.getNotificationIcon(notification) }}
          </div>
          <div class="notification-content">
            <span class="notification-text">{{ notificationStore.getNotificationText(notification) }}</span>
            <span class="notification-time">{{ formatDate(notification.created_at) }}</span>
          </div>
          <div v-if="!notification.read" class="unread-dot"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-page {
  min-height: 100vh;
  background-color: #FFF9F5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #F5F5F4;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #292524;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #F5F5F4;
  color: #292524;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:active {
  transform: scale(0.95);
  background: #E7E5E4;
}

.mark-all-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.mark-all-btn:active {
  transform: scale(0.98);
}

.content {
  padding: 16px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loader {
  animation: spin 1s linear infinite;
  color: #F97316;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text,
.empty-title,
.empty-desc {
  margin-top: 16px;
}

.loading-text {
  font-size: 14px;
  color: #A8A29E;
}

.empty-icon {
  color: #E7E5E4;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #292524;
}

.empty-desc {
  font-size: 14px;
  color: #A8A29E;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-item:active {
  transform: scale(0.99);
}

.notification-item.unread {
  background: rgba(249, 115, 22, 0.05);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #F5F5F4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-text {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #292524;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: #A8A29E;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #F97316;
  flex-shrink: 0;
}
</style>