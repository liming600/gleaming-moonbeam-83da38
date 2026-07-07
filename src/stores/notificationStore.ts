import { defineStore } from 'pinia'
import { ref } from 'vue'
import { notificationService, type Notification } from '@/services/notificationService'
import { handleApiError } from '@/utils/errorHandler'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const isLoading = ref(false)

  const loadNotifications = async (userId: string): Promise<{ success: boolean; message: string }> => {
    isLoading.value = true
    const { notifications: data, error } = await notificationService.getNotifications(userId)
    isLoading.value = false

    if (error) {
      const result = handleApiError(error, '加载通知失败')
      return { success: false, message: result.message }
    }

    notifications.value = data
    return { success: true, message: '' }
  }

  const loadUnreadCount = async (userId: string): Promise<void> => {
    const { count, error } = await notificationService.getUnreadCount(userId)
    if (error) {
      handleApiError(error, '获取未读通知数失败')
      unreadCount.value = 0
      return
    }
    unreadCount.value = count
  }

  const markAsRead = async (notificationId: string): Promise<{ success: boolean; message: string }> => {
    const { error } = await notificationService.markAsRead(notificationId)
    if (error) {
      const result = handleApiError(error, '标记已读失败')
      return { success: false, message: result.message }
    }

    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }

    return { success: true, message: '' }
  }

  const markAllAsRead = async (userId: string): Promise<{ success: boolean; message: string }> => {
    const { error } = await notificationService.markAllAsRead(userId)
    if (error) {
      const result = handleApiError(error, '全部标记已读失败')
      return { success: false, message: result.message }
    }

    notifications.value.forEach(n => n.read = true)
    unreadCount.value = 0

    return { success: true, message: '' }
  }

  const getNotificationText = (notification: Notification): string => {
    switch (notification.type) {
      case 'like':
        return '有人点赞了你的帖子'
      case 'comment':
        return '有人评论了你的帖子'
      case 'follow':
        return '有人关注了你'
      case 'help_answer':
        return '有人回答了你的求助'
      case 'help_accepted':
        return '你的回答被采纳了'
      default:
        return '收到新通知'
    }
  }

  const getNotificationIcon = (notification: Notification): string => {
    switch (notification.type) {
      case 'like':
        return '❤️'
      case 'comment':
        return '💬'
      case 'follow':
        return '👤'
      case 'help_answer':
        return '🙋'
      case 'help_accepted':
        return '✅'
      default:
        return '🔔'
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    getNotificationText,
    getNotificationIcon
  }
})