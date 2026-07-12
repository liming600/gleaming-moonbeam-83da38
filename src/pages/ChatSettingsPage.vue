<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ArrowLeft, X, BellOff, Pin, Search,
  Trash2, ShieldBan, AlertTriangle, ChevronRight, Clock
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'
import { useUiStore } from '@/stores/uiStore'
import { userService } from '@/services/userService'
import { messageService, type Message } from '@/services/messageService'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const uiStore = useUiStore()

const otherUserId = route.params.id as string

const otherUser = ref({
  name: '',
  avatar: ''
})

// Search state
const showSearch = ref(false)
const searchQuery = ref('')
const allMessages = ref<Message[]>([])
const isSearching = ref(false)

const filteredMessages = computed(() => {
  if (!searchQuery.value.trim()) return []
  const q = searchQuery.value.trim().toLowerCase()
  return allMessages.value.filter(m => m.content.toLowerCase().includes(q))
})

const openSearch = async () => {
  showSearch.value = true
  isSearching.value = true
  if (userStore.currentUser) {
    const { messages: msgs } = await messageService.getMessages(otherUserId, userStore.currentUser.id)
    allMessages.value = msgs
  }
  isSearching.value = false
}

const closeSearch = () => {
  showSearch.value = false
  searchQuery.value = ''
  allMessages.value = []
}

const jumpToMessage = (_messageId: string) => {
  router.push(`/chat/${otherUserId}`)
}

const formatSearchTime = (dateString: string): string => {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) + ' ' +
    date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// Settings state
const muteKey = computed(() => `chat_mute_${userStore.currentUser?.id}_${otherUserId}`)
const pinKey = computed(() => `chat_pin_${userStore.currentUser?.id}_${otherUserId}`)
const blockKey = computed(() => `chat_blocked_${userStore.currentUser?.id}`)

const isMuted = ref(false)
const isPinned = ref(false)
const isBlocked = ref(false)

const loadSettings = () => {
  isMuted.value = localStorage.getItem(muteKey.value) === 'true'
  isPinned.value = localStorage.getItem(pinKey.value) === 'true'
  const blockedList = JSON.parse(localStorage.getItem(blockKey.value) || '[]')
  isBlocked.value = blockedList.includes(otherUserId)
}

// Actions
const togglePin = () => {
  isPinned.value = !isPinned.value
  localStorage.setItem(pinKey.value, String(isPinned.value))
  uiStore.showSuccessToast(isPinned.value ? '已设为置顶' : '已取消置顶')
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
  localStorage.setItem(muteKey.value, String(isMuted.value))
  uiStore.showSuccessToast(isMuted.value ? '已开启免打扰' : '已关闭免打扰')
}

const clearConversation = async () => {
  if (!userStore.currentUser) return
  const { success } = await messageService.clearConversation(userStore.currentUser.id, otherUserId)
  if (success) {
    uiStore.showSuccessToast('聊天记录已清空')
    router.back()
  } else {
    uiStore.showErrorToast('清空失败，请稍后重试')
  }
}

const toggleBlock = () => {
  const blockedList: string[] = JSON.parse(localStorage.getItem(blockKey.value) || '[]')
  if (isBlocked.value) {
    const idx = blockedList.indexOf(otherUserId)
    if (idx >= 0) blockedList.splice(idx, 1)
    isBlocked.value = false
    uiStore.showSuccessToast('已取消拉黑')
  } else {
    blockedList.push(otherUserId)
    isBlocked.value = true
    uiStore.showSuccessToast('已拉黑该用户')
  }
  localStorage.setItem(blockKey.value, JSON.stringify(blockedList))
}

const reportUser = () => {
  uiStore.showWarningToast('举报功能开发中')
}

const goToProfile = () => {
  router.push(`/user/${otherUserId}`)
}

const back = () => {
  if (showSearch.value) {
    closeSearch()
  } else {
    router.back()
  }
}

// Grouped settings
interface SettingItem {
  icon: any
  label: string
  desc?: string
  rightType: 'toggle' | 'arrow' | 'text'
  toggleValue?: boolean
  textValue?: string
  danger?: boolean
  action: () => void
}

interface SettingGroup {
  title?: string
  items: SettingItem[]
}

const settingGroups = computed<SettingGroup[]>(() => [
  {
    title: '聊天管理',
    items: [
      {
        icon: Pin,
        label: '设为置顶',
        desc: '置顶后该对话将显示在消息列表顶部',
        rightType: 'toggle',
        toggleValue: isPinned.value,
        action: togglePin
      },
      {
        icon: BellOff,
        label: '消息免打扰',
        desc: '开启后不再接收该对话的通知',
        rightType: 'toggle',
        toggleValue: isMuted.value,
        action: toggleMute
      }
    ]
  },
  {
    title: '内容管理',
    items: [
      {
        icon: Search,
        label: '查找聊天记录',
        rightType: 'arrow',
        action: openSearch
      },
      {
        icon: Trash2,
        label: '清空聊天记录',
        desc: '删除与该用户的所有消息',
        rightType: 'arrow',
        danger: true,
        action: clearConversation
      }
    ]
  },
  {
    title: '安全与隐私',
    items: [
      {
        icon: ShieldBan,
        label: isBlocked.value ? '取消拉黑' : '拉黑该用户',
        desc: '拉黑后对方无法给你发消息',
        rightType: 'arrow',
        danger: true,
        action: toggleBlock
      },
      {
        icon: AlertTriangle,
        label: '举报该用户',
        desc: '举报违规内容或行为',
        rightType: 'arrow',
        danger: true,
        action: reportUser
      }
    ]
  }
])

onMounted(async () => {
  loadSettings()
  const { user } = await userService.getUserById(otherUserId)
  if (user) {
    otherUser.value.name = user.name
    otherUser.value.avatar = user.avatar_url || ''
  }
})
</script>

<template>
  <div class="chat-settings-page">
    <header class="header">
      <button class="back-btn" @click="back">
        <ArrowLeft :size="24" />
      </button>
      <h1 class="header-title">聊天设置</h1>
      <div class="header-placeholder"></div>
    </header>

    <!-- Search Mode -->
    <template v-if="showSearch">
      <div class="search-bar">
        <div class="search-input-wrapper">
          <Search :size="16" class="search-input-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索聊天记录..."
            class="search-input"
            autofocus
          />
          <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
            <X :size="14" />
          </button>
        </div>
        <button class="search-cancel" @click="closeSearch">取消</button>
      </div>
      <div class="search-results">
        <div v-if="isSearching" class="search-status">加载中...</div>
        <div v-else-if="!searchQuery.trim()" class="search-status">输入关键词搜索聊天记录</div>
        <div v-else-if="filteredMessages.length === 0" class="search-status">未找到相关消息</div>
        <div v-else class="search-result-list">
          <div
            v-for="msg in filteredMessages"
            :key="msg.id"
            class="search-result-item"
            @click="jumpToMessage(msg.id)"
          >
            <Clock :size="14" class="search-result-icon" />
            <div class="search-result-content">
              <p class="search-result-text" v-html="msg.content.replace(new RegExp(`(${searchQuery})`, 'gi'), '<em class=\"highlight\">$1</em>')"></p>
              <span class="search-result-time">{{ formatSearchTime(msg.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Normal Mode -->
    <template v-else>
      <!-- Profile Card -->
      <div class="profile-card" @click="goToProfile">
        <img
          :src="otherUser.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20pet%20owner%20avatar&image_size=square'"
          :alt="otherUser.name"
          class="profile-avatar"
        />
        <div class="profile-info">
          <span class="profile-name">{{ otherUser.name }}</span>
          <span class="profile-hint">查看主页 <ChevronRight :size="14" /></span>
        </div>
      </div>

      <!-- Settings Groups -->
      <div v-for="(group, gi) in settingGroups" :key="gi" class="setting-group">
        <h3 v-if="group.title" class="group-title">{{ group.title }}</h3>
        <div class="group-items">
          <div
            v-for="(item, ii) in group.items"
            :key="ii"
            class="setting-item"
            :class="{ 'has-desc': item.desc, danger: item.danger }"
            @click="item.action"
          >
            <component :is="item.icon" :size="20" class="item-icon" />
            <div class="item-content">
              <span class="item-label" :class="{ 'label-danger': item.danger }">{{ item.label }}</span>
              <span v-if="item.desc" class="item-desc">{{ item.desc }}</span>
            </div>
            <div v-if="item.rightType === 'arrow'" class="item-right">
              <ChevronRight v-if="!item.danger" :size="16" class="arrow-icon" />
            </div>
            <div v-else-if="item.rightType === 'toggle'" class="item-right">
              <label class="toggle-switch" @click.stop="item.action">
                <input type="checkbox" :checked="item.toggleValue" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="danger-section">
        <button class="danger-btn" @click="clearConversation">
          <Trash2 :size="18" />
          <span>清空聊天记录</span>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.chat-settings-page {
  min-height: 100vh;
  background: #F5F5F4;
  padding-bottom: 40px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #E7E5E4;
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

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #292524;
}

.header-placeholder {
  width: 40px;
}

/* Profile Card */
.profile-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 16px;
  margin: 16px;
  background: #fff;
  border-radius: 16px;
  cursor: pointer;
}

.profile-card:active {
  background: #FAFAFA;
}

.profile-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #FFE0D6;
}

.profile-info {
  flex: 1;
}

.profile-name {
  display: block;
  font-size: 17px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 2px;
}

.profile-hint {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  color: #F97316;
}

/* Setting Groups */
.setting-group {
  margin: 0 16px 12px;
}

.group-title {
  font-size: 13px;
  font-weight: 500;
  color: #A8A29E;
  padding: 8px 4px;
  text-transform: none;
}

.group-items {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.setting-item:not(:last-child) {
  border-bottom: 1px solid #F5F5F4;
}

.setting-item:active {
  background: #FAFAFA;
}

.setting-item.has-desc {
  padding: 12px 16px;
}

.setting-item.has-desc .item-icon {
  align-self: flex-start;
  margin-top: 2px;
}

.item-icon {
  color: #57534E;
  flex-shrink: 0;
}

.setting-item.danger .item-icon {
  color: #EF4444;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-label {
  font-size: 15px;
  font-weight: 500;
  color: #292524;
}

.label-danger {
  color: #EF4444 !important;
}

.item-desc {
  display: block;
  font-size: 12px;
  color: #A8A29E;
  margin-top: 2px;
}

.item-right {
  flex-shrink: 0;
}

.arrow-icon {
  color: #CCC;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #DDD;
  border-radius: 14px;
  transition: all 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 24px;
  width: 24px;
  left: 2px;
  bottom: 2px;
  background: #fff;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.toggle-switch input:checked + .toggle-slider {
  background: #22C55E;
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

/* Danger Section */
.danger-section {
  margin: 24px 16px;
}

.danger-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: #fff;
  border: 1.5px solid #EF4444;
  border-radius: 16px;
  color: #EF4444;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.danger-btn:active {
  background: rgba(239, 68, 68, 0.05);
}

/* Search Bar */
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #E7E5E4;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-icon {
  position: absolute;
  left: 12px;
  color: #A8A29E;
}

.search-input {
  width: 100%;
  height: 36px;
  padding: 0 36px 0 36px;
  background: #F5F5F4;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  color: #292524;
  outline: none;
}

.search-input::placeholder {
  color: #A8A29E;
}

.search-clear {
  position: absolute;
  right: 8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: #CCC;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.search-cancel {
  font-size: 15px;
  color: #F97316;
  border: none;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
}

/* Search Results */
.search-results {
  padding: 16px;
}

.search-status {
  text-align: center;
  padding: 40px 20px;
  color: #A8A29E;
  font-size: 14px;
}

.search-result-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.search-result-item {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.search-result-item:active {
  background: #FAFAFA;
}

.search-result-icon {
  color: #CCC;
  flex-shrink: 0;
  margin-top: 2px;
}

.search-result-content {
  flex: 1;
  min-width: 0;
}

.search-result-text {
  font-size: 14px;
  line-height: 1.5;
  color: #292524;
  margin-bottom: 4px;
  word-break: break-word;
}

.search-result-text :deep(.highlight) {
  color: #F97316;
  font-style: normal;
  font-weight: 600;
}

.search-result-time {
  font-size: 12px;
  color: #A8A29E;
}
</style>
