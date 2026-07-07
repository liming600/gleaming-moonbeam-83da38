<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { ArrowLeft, Send, MoreVertical } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { messageService } from '@/services/messageService'
import { logger } from '@/utils/logger'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const messages = ref<any[]>([])
const inputMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const isLoading = ref(false)

const otherUser = ref({
  id: route.params.id as string,
  name: '',
  avatar: ''
})

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const loadMessages = async () => {
  if (!userStore.currentUser) return
  
  isLoading.value = true
  const { messages: loadedMessages, error } = await messageService.getMessages(
    otherUser.value.id,
    userStore.currentUser.id
  )
  isLoading.value = false

  if (error) {
    logger.warn('加载消息失败:', error.message)
    return
  }

  messages.value = loadedMessages.map(msg => ({
    id: msg.id,
    content: msg.content,
    senderId: msg.sender_id,
    timestamp: msg.created_at,
    isMe: msg.sender_id === userStore.currentUser!.id
  }))
  
  scrollToBottom()
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || !userStore.currentUser) return

  const { message, error } = await messageService.sendMessage(
    otherUser.value.id,
    userStore.currentUser.id,
    inputMessage.value.trim()
  )

  if (error) {
    logger.warn('发送消息失败:', error.message)
    return
  }

  if (message) {
    messages.value.push({
      id: message.id,
      content: message.content,
      senderId: message.sender_id,
      timestamp: message.created_at,
      isMe: true
    })
    inputMessage.value = ''
    scrollToBottom()
  }
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const back = () => {
  router.push('/messages')
}

watch(() => messages.value.length, () => {
  scrollToBottom()
})

onMounted(async () => {
  if (userStore.currentUser) {
    await loadMessages()
  }
})
</script>

<template>
  <div class="chat-page">
    <header class="header">
      <button class="back-btn" @click="back">
        <ArrowLeft :size="24" />
      </button>
      <div class="header-info">
        <img :src="otherUser.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20pet%20owner%20avatar&image_size=square'" :alt="otherUser.name" class="header-avatar" />
        <span class="header-name">{{ otherUser.name || '聊天对象' }}</span>
      </div>
      <button class="more-btn">
        <MoreVertical :size="20" />
      </button>
    </header>

    <div ref="messagesContainer" class="messages-container">
      <div v-if="isLoading" class="loading">
        <span>加载中...</span>
      </div>
      <div v-else class="messages-list">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-wrapper"
          :class="{ 'me': message.isMe }"
        >
          <img
            v-if="!message.isMe"
            :src="otherUser.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20pet%20owner%20avatar&image_size=square'"
            :alt="otherUser.name"
            class="message-avatar"
          />
          <div class="message-content">
            <div class="message-bubble">
              <span class="message-text">{{ message.content }}</span>
            </div>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
        </div>
        <div v-if="messages.length === 0" class="empty-state">
          <span>还没有消息，开始聊天吧！</span>
        </div>
      </div>
    </div>

    <div class="input-area">
      <input
        v-model="inputMessage"
        type="text"
        placeholder="输入消息..."
        class="message-input"
        @keyup.enter="sendMessage"
      />
      <button
        class="send-btn"
        :class="{ active: inputMessage.trim() }"
        @click="sendMessage"
      >
        <Send :size="20" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  min-height: 100vh;
  background-color: #FFF9F5;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #F5F5F4;
  flex-shrink: 0;
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
}

.back-btn:active {
  transform: scale(0.95);
}

.header-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.header-name {
  font-size: 16px;
  font-weight: 600;
  color: #292524;
}

.more-btn {
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
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #A8A29E;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #A8A29E;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-wrapper {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.message-wrapper.me {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-wrapper.me .message-content {
  align-items: flex-end;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message-wrapper.me .message-bubble {
  background: linear-gradient(135deg, #F97316, #FB923C);
}

.message-text {
  font-size: 15px;
  line-height: 1.5;
  color: #292524;
  word-break: break-word;
}

.message-wrapper.me .message-text {
  color: #fff;
}

.message-time {
  font-size: 11px;
  color: #A8A29E;
}

.input-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #F5F5F4;
  flex-shrink: 0;
}

.message-input {
  flex: 1;
  height: 36px;
  padding: 0 14px;
  background: #F5F5F4;
  border: none;
  border-radius: 18px;
  font-size: 15px;
  color: #292524;
  outline: none;
}

.message-input::placeholder {
  color: #A8A29E;
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #E7E5E4;
  color: #A8A29E;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-btn.active {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}

.send-btn:active {
  transform: scale(0.95);
}
</style>