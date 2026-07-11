<script setup lang="ts">
import { ArrowLeft, Bell, Globe, Shield, HelpCircle, Info, ChevronRight, Moon, LogOut } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { logger } from '@/utils/logger'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

const router = useRouter()

const notificationsEnabled = ref(true)
const darkMode = ref(false)

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
}

onMounted(() => {
})

const toggleSetting = (key: string) => {
  if (key === 'notificationsEnabled') {
    notificationsEnabled.value = !notificationsEnabled.value
  } else if (key === 'darkMode') {
    toggleDarkMode()
  }
}

const settingsGroups = [
  {
    title: '通知设置',
    items: [
      { icon: Bell, label: '消息通知', description: '接收新消息和互动通知', toggle: 'notificationsEnabled' }
    ]
  },
  {
    title: '通用设置',
    items: [
      { icon: Moon, label: '深色模式', description: '切换深色/浅色主题', toggle: 'darkMode' },
      { icon: Globe, label: '语言', description: '简体中文', action: 'language' }
    ]
  },
  {
    title: '隐私与安全',
    items: [
      { icon: Shield, label: '隐私设置', description: '管理您的隐私选项', action: 'privacy' },
      { icon: Shield, label: '账号安全', description: '修改密码、绑定手机', action: 'security' }
    ]
  },
  {
      title: '关于',
      items: [
        { icon: HelpCircle, label: '帮助与反馈', description: '获取帮助或提交反馈', action: 'help' },
        { icon: Info, label: '关于我们', description: '版本 1.0.0', action: 'about' }
      ],
      hasLogout: true
    }
]

const handleAction = (action: string) => {
  logger.log('Action:', action)
}

const back = () => {
  router.back()
}

// 获取开关状态的辅助函数
const getToggleValue = (toggleKey: string) => {
  if (toggleKey === 'notificationsEnabled') return notificationsEnabled.value
  if (toggleKey === 'darkMode') return darkMode.value
  return false
}
</script>

<template>
  <div class="settings-page">
    <header class="header">
      <button class="back-btn" @click="back">
        <ArrowLeft :size="24" />
      </button>
      <h1 class="header-title">设置</h1>
      <div class="header-placeholder"></div>
    </header>

    <div class="page-content">
      <div v-for="group in settingsGroups" :key="group.title" class="settings-group">
        <h3 class="group-title">{{ group.title }}</h3>
        <div class="group-content">
          <button
            v-for="item in group.items"
            :key="item.label"
            class="setting-item"
            @click="item.action ? handleAction(item.action) : toggleSetting((item as any).toggle)"
          >
            <div class="item-left">
              <component :is="item.icon" :size="20" class="item-icon" />
              <div class="item-info">
                <span class="item-label">{{ item.label }}</span>
                <span class="item-desc">{{ item.description }}</span>
              </div>
            </div>
            <div class="item-right">
              <div v-if="(item as any).toggle" class="toggle-wrapper">
                <div
                  class="toggle"
                  :class="{ active: getToggleValue((item as any).toggle) }"
                >
                  <div class="toggle-thumb"></div>
                </div>
              </div>
              <ChevronRight v-else :size="20" class="item-arrow" />
            </div>
          </button>
          <button v-if="group.hasLogout" class="logout-btn" @click="userStore.logout()">
            <LogOut :size="20" class="item-icon" />
            <span class="item-label">退出登录</span>
          </button>
        </div>
      </div>

      <div class="version-info">
        <span>宠友圈 v1.0.0</span>
        <span class="version-desc">用心记录每一刻</span>
      </div>
    </div>
  </div></template>

<style scoped>
.settings-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding-bottom: 80px;
  padding-top: calc(env(safe-area-inset-top) + 52px);
  transition: background-color 0.25s ease;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 249, 245, 0.95);
  backdrop-filter: blur(10px);
  padding: calc(env(safe-area-inset-top) + 12px) 16px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.25s ease;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--bg-card);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-placeholder {
  width: 40px;
}

.settings-group {
  margin-bottom: 20px;
}

.group-title {
  font-size: 13px;
  font-weight: 600;
  color: #A8A29E;
  padding: 0 16px;
  margin-bottom: 8px;
}

.group-content {
  background: var(--bg-card);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.05);
}

.setting-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 14px 16px;
  border: none;
  background: transparent;
  width: 100%;
  cursor: pointer;
  transition: background 0.2s ease;
  box-sizing: border-box;
  text-align: left;
}

.setting-item:active {
  background: rgba(249, 115, 22, 0.05);
}

.setting-item:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.item-icon {
  color: var(--primary);
  flex-shrink: 0;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.item-label {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
}

.item-desc {
  font-size: 12px;
  color: var(--text-light);
  line-height: 1.4;
}

.item-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: auto;
}

.toggle-wrapper {
  padding: 4px;
}

.toggle {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: #E7E5E4;
  position: relative;
  transition: background 0.3s ease;
  cursor: pointer;
}

.toggle.active {
  background: linear-gradient(135deg, #F97316, #FB923C);
}

.toggle-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle.active .toggle-thumb {
  transform: translateX(20px);
}

.item-arrow {
  color: var(--text-light);
}

.version-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  color: var(--text-light);
  gap: 4px;
}

.version-info span:first-child {
  font-size: 14px;
  font-weight: 500;
}

.version-desc {
  font-size: 12px;
}

.logout-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 14px 16px;
  border: none;
  background: transparent;
  width: 100%;
  cursor: pointer;
  transition: background 0.2s ease;
  box-sizing: border-box;
  text-align: center;
  gap: 8px;
  border-top: 1px solid var(--border-color);
}

.logout-btn:active {
  background: rgba(239, 68, 68, 0.05);
}

.logout-btn .item-icon {
  color: var(--danger);
}

.logout-btn .item-label {
  color: var(--danger);
}
</style>
