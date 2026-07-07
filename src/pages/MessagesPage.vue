<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const activeTab = ref<'notifications' | 'messages'>('notifications')

const tabs = [
  { key: 'notifications', label: '通知' },
  { key: 'messages', label: '私信' }
] as const

const notifications = ref([
  {
    id: '1',
    type: 'like',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cat%20avatar&image_size=square',
    author: '橘猫球球',
    content: '赞了你发布的帖子',
    time: '5分钟前',
    unread: true
  },
  {
    id: '2',
    type: 'comment',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20dog%20avatar&image_size=square',
    author: '金毛旺财',
    content: '评论了你发布的帖子：太可爱了！',
    time: '30分钟前',
    unread: true
  },
  {
    id: '3',
    type: 'follow',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20rabbit%20avatar&image_size=square',
    author: '兔子小白',
    content: '关注了你家猫咪',
    time: '1小时前',
    unread: false
  },
  {
    id: '4',
    type: 'help',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20hamster%20avatar&image_size=square',
    author: '仓鼠团团',
    content: '采纳了你在互助大厅的回答',
    time: '2小时前',
    unread: false
  },
  {
    id: '5',
    type: 'system',
    avatar: '🐾',
    author: '系统通知',
    content: '恭喜你完成首次互助回答！',
    time: '昨天',
    unread: false
  }
])

const messages = ref([
  {
    id: '1',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cat%20avatar&image_size=square',
    name: '橘猫球球',
    lastMessage: '你家猫咪太可爱了！',
    time: '5分钟前',
    unread: 2
  },
  {
    id: '2',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20dog%20avatar&image_size=square',
    name: '金毛旺财',
    lastMessage: '周末一起遛狗呀',
    time: '1小时前',
    unread: 0
  },
  {
    id: '3',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20rabbit%20avatar&image_size=square',
    name: '兔子小白',
    lastMessage: '谢谢你的建议',
    time: '昨天',
    unread: 0
  },
  {
    id: '4',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20bird%20avatar&image_size=square',
    name: '鹦鹉乐乐',
    lastMessage: '我家鹦鹉会说话了！',
    time: '2天前',
    unread: 1
  }
])

const back = () => {
  router.back()
}
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
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="message-item"
        :class="{ unread: notification.unread }"
      >
        <div class="message-avatar" :class="{ 'system-avatar': notification.type === 'system' }">
          <template v-if="notification.type === 'system'">
            <span class="avatar-emoji">{{ notification.avatar }}</span>
          </template>
          <template v-else>
            <img :src="notification.avatar" :alt="notification.author" />
          </template>
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-author">{{ notification.author }}</span>
            <span class="message-time">{{ notification.time }}</span>
          </div>
          <p class="message-text">{{ notification.content }}</p>
        </div>
        <div v-if="notification.unread" class="unread-dot"></div>
      </div>
      <div v-if="notifications.length === 0" class="empty-state">
        <span class="empty-icon">🔔</span>
        <p>暂无通知</p>
      </div>
    </div>

    <div v-if="activeTab === 'messages'" class="message-list">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message-item"
        :class="{ unread: message.unread > 0 }"
        @click="router.push(`/chat/${message.id}`)"
      >
        <div class="message-avatar">
          <img :src="message.avatar" :alt="message.name" />
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-author">{{ message.name }}</span>
            <span class="message-time">{{ message.time }}</span>
          </div>
          <p class="message-text">{{ message.lastMessage }}</p>
        </div>
        <div v-if="message.unread > 0" class="unread-badge">{{ message.unread }}</div>
      </div>
      <div v-if="messages.length === 0" class="empty-state">
        <span class="empty-icon">💬</span>
        <p>暂无私信</p>
      </div>
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
</style>
