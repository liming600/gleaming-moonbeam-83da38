<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { ArrowLeft, Send, MoreHorizontal, BellOff, Trash2, ShieldBan } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useUiStore } from '@/stores/uiStore'
import { messageService } from '@/services/messageService'
import { userService } from '@/services/userService'
import { logger } from '@/utils/logger'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const uiStore = useUiStore()

const messages = ref<any[]>([])
const inputMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const isLoading = ref(false)
const showSettings = ref(false)

const otherUser = ref({
  id: route.params.id as string,
  name: '',
  avatar: ''
})

// Chat settings state (persisted to localStorage)
const muteKey = computed(() => `chat_mute_${userStore.currentUser?.id}_${otherUser.value.id}`)
const blockKey = computed(() => `chat_blocked_${userStore.currentUser?.id}`)

const isMuted = ref(false)
const isBlocked = ref(false)

const loadSettings = () => {
  isMuted.value = localStorage.getItem(muteKey.value) === 'true'
  const blockedList = JSON.parse(localStorage.getItem(blockKey.value) || '[]')
  isBlocked.value = blockedList.includes(otherUser.value.id)
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
  localStorage.setItem(muteKey.value, String(isMuted.value))
  showSettings.value = false
  uiStore.showSuccessToast(isMuted.value ? '已开启免打扰' : '已关闭免打扰')
}

const clearConversation = async () => {
  if (!userStore.currentUser) return
  showSettings.value = false
  const { success } = await messageService.clearConversation(userStore.currentUser.id, otherUser.value.id)
  if (success) {
    messages.value = []
    uiStore.showSuccessToast('聊天记录已清空')
  } else {
    uiStore.showErrorToast('清空失败，请稍后重试')
  }
}

const toggleBlock = () => {
  const blockedList: string[] = JSON.parse(localStorage.getItem(blockKey.value) || '[]')
  if (isBlocked.value) {
    // Unblock
    const idx = blockedList.indexOf(otherUser.value.id)
    if (idx >= 0) blockedList.splice(idx, 1)
    isBlocked.value = false
    uiStore.showSuccessToast('已取消拉黑')
  } else {
    // Block
    blockedList.push(otherUser.value.id)
    isBlocked.value = true
    uiStore.showSuccessToast('已拉黑该用户')
  }
  localStorage.setItem(blockKey.value, JSON.stringify(blockedList))
  showSettings.value = false
}

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
  if (isBlocked.value) {
    uiStore.showWarningToast('你已拉黑该用户，无法发送消息')
    return
  }

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
  router.back()
}

const settingsItems = [
  { icon: BellOff, label: '免打扰', desc: computed(() => isMuted.value ? '已开启' : '已关闭'), action: toggleMute, toggle: true, active: isMuted },
  { icon: Trash2, label: '清空聊天记录', action: clearConversation, danger: true },
  { icon: ShieldBan, label: computed(() => isBlocked.value ? '取消拉黑' : '拉黑'), action: toggleBlock, danger: true },
]

watch(() => messages.value.length, () => {
  scrollToBottom()
})

onMounted(async () => {
  const { user } = await userService.getUserById(otherUser.value.id)
  if (user) {
    otherUser.value.name = user.name
    otherUser.value.avatar = user.avatar_url || ''
  }

  loadSettings()

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
      <div class="header-center">
        <span class="header-name">{{ otherUser.name || '聊天' }}</span>
        <span v-if="isMuted" class="mute-indicator">🔕 免打扰</span>
      </div>
      <button class="more-btn" @click="showSettings = true">
        <MoreHorizontal :size="22" />
      </button>
    </header>

    <!-- Settings Overlay -->
    <div v-if="showSettings" class="settings-overlay" @click.self="showSettings = false">
      <div class="settings-panel">
        <div class="settings-header">
          <span class="settings-title">聊天设置</span>
          <button class="settings-close" @click="showSettings = false">完成</button>
        </div>
        <div class="settings-list">
          <div
            v-for="item in settingsItems"
            :key="item.label.toString()"
            class="settings-item"
            :class="{ danger: item.danger }"
            @click="item.action"
          >
            <component :is="item.icon" :size="20" class="settings-item-icon" />
            <span class="settings-item-label">{{ item.label }}</span>
            <span v-if="item.toggle" class="settings-item-extra">
              {{ item.active ? '开' : '关' }}
            </span>
            <span v-if="item.desc" class="settings-item-desc">{{ item.desc }}</span>
          </div>
        </div>
      </div>
    </div>

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

.header-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.header-name {
  font-size: 18px;
  font-weight: 600;
  color: #292524;
  text-align: center;
}

.mute-indicator {
  font-size: 11px;
  color: #A8A29E;
  margin-top: 2px;
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

.more-btn:active {
  transform: scale(0.95);
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

/* Settings Panel */
.settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.settings-panel {
  width: 100%;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 20px 16px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  animation: slideUp 0.25s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #F5F5F4;
}

.settings-title {
  font-size: 16px;
  font-weight: 600;
  color: #292524;
}

.settings-close {
  font-size: 14px;
  font-weight: 500;
  color: #F97316;
  border: none;
  background: transparent;
  cursor: pointer;
}

.settings-list {
  display: flex;
  flex-direction: column;
}

.settings-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 0;
  cursor: pointer;
  transition: background 0.2s ease;
  border-radius: 12px;
  padding: 14px 12px;
}

.settings-item:active {
  background: #F5F5F4;
}

.settings-item-icon {
  color: #57534E;
  flex-shrink: 0;
}

.settings-item.danger .settings-item-icon {
  color: #EF4444;
}

.settings-item-label {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #292524;
}

.settings-item.danger .settings-item-label {
  color: #EF4444;
}

.settings-item-extra {
  font-size: 13px;
  color: #A8A29E;
}

.settings-item-desc {
  font-size: 13px;
  color: #A8A29E;
}
</style>