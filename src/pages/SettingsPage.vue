<script setup lang="ts">
import { ArrowLeft, Bell, Globe, Shield, HelpCircle, Info, ChevronRight, Moon } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { logger } from '@/utils/logger'

const router = useRouter()

const notificationsEnabled = ref(true)
const darkMode = ref(false)

// 深色模式切换：切换 body 的 class 并持久化
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  if (darkMode.value) {
    document.documentElement.classList.add('dark-mode')
  } else {
    document.documentElement.classList.remove('dark-mode')
  }
}

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
    ]
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
            @click="item.action ? handleAction(item.action) : toggleSetting(item.toggle!)"
          >
            <div class="item-left">
              <component :is="item.icon" :size="20" class="item-icon" />
              <div class="item-info">
                <span class="item-label">{{ item.label }}</span>
                <span class="item-desc">{{ item.description }}</span>
              </div>
            </div>
            <div class="item-right">
              <div v-if="item.toggle" class="toggle-wrapper">
                <div
                  class="toggle"
                  :class="{ active: getToggleValue(item.toggle) }"
                >
                  <div class="toggle-thumb"></div>
                </div>
              </div>
              <ChevronRight v-else :size="20" class="item-arrow" />
            </div>
          </button>
        </div>
      </div>

      <div class="version-info">
        <span>宠友圈 v1.0.0</span>
        <span class="version-desc">用心记录每一刻</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  min-height: 100vh;
  background-color: #FFF9F5;
  padding-bottom: 80px;
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
  background: #fff;
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
  border-bottom: 1px solid #F5F5F4;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.item-icon {
  color: #F97316;
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
  color: #292524;
  line-height: 1.4;
}

.item-desc {
  font-size: 12px;
  color: #A8A29E;
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
  color: #A8A29E;
}

.version-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  color: #A8A29E;
  gap: 4px;
}

.version-info span:first-child {
  font-size: 14px;
  font-weight: 500;
}

.version-desc {
  font-size: 12px;
}
</style>
