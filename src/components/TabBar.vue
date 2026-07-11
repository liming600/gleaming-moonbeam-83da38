<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Home, MessageCircleQuestion, PlusCircle, Compass, User, FileText, HeartHandshake } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const showPostMenu = ref(false)

const tabs = [
  { key: '/', label: '首页', icon: Home },
  { key: '/help', label: '互助', icon: MessageCircleQuestion },
  { key: '/post-create', label: '发布', icon: PlusCircle },
  { key: '/discover', label: '发现', icon: Compass },
  { key: '/profile', label: '我的', icon: User }
]

const isActive = (key: string) => {
  return route.path === key
}

const goTo = (key: string) => {
  router.push(key)
}

const handlePostClick = () => {
  showPostMenu.value = !showPostMenu.value
}

const selectPostType = (type: 'post' | 'help' | 'diary') => {
  showPostMenu.value = false
  if (type === 'post') {
    router.push('/post-create')
  } else if (type === 'help') {
    router.push('/help-create')
  } else {
    router.push('/diary-create')
  }
}

const closeMenu = () => {
  showPostMenu.value = false
}

onMounted(() => {
  document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
})
</script>

<template>
  <nav class="tab-bar">
    <div class="tab-bar-content">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: isActive(tab.key), 'center-btn': tab.key === '/post-create' }"
        @click.stop="tab.key === '/post-create' ? handlePostClick() : goTo(tab.key)"
      >
        <div class="icon-wrapper" :class="{ 'center-icon': tab.key === '/post-create' }">
          <component :is="tab.icon" :size="tab.key === '/post-create' ? 24 : 22" />
        </div>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>
  </nav>

  <Transition name="fade">
    <div v-if="showPostMenu" class="post-overlay" @click="closeMenu">
      <div class="post-menu-container">
        <TransitionGroup name="button">
          <button
            v-for="(item, index) in [
              { type: 'post', label: '发日常', icon: PlusCircle, color: '#F97316', gradient: 'linear-gradient(135deg, #F97316, #FB923C)' },
              { type: 'help', label: '发互助', icon: HeartHandshake, color: '#34D399', gradient: 'linear-gradient(135deg, #34D399, #6EE7B7)' },
              { type: 'diary', label: '写日记', icon: FileText, color: '#FBBF24', gradient: 'linear-gradient(135deg, #FBBF24, #F59E0B)' }
            ]"
            :key="item.type"
            class="post-menu-btn"
            :style="{
              background: item.gradient,
              boxShadow: `0 8px 32px ${item.color}40`,
              animationDelay: `${index * 0.1}s`
            }"
            @click.stop="selectPostType(item.type as 'post' | 'help' | 'diary')"
          >
            <component :is="item.icon" :size="28" />
            <span>{{ item.label }}</span>
          </button>
        </TransitionGroup>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-bar-content {
  padding: 0 16px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 56px;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.tab-item.center-btn {
  margin-top: -20px;
}

.icon-wrapper {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--text-light);
  transition: all 0.2s ease;
}

.icon-wrapper.center-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: #fff;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.4);
  transition: all 0.3s ease;
}

.tab-item.active .icon-wrapper:not(.center-icon) {
  color: var(--primary);
}

.tab-item.active.center-btn .icon-wrapper.center-icon {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.5);
}

.tab-label {
  font-size: 11px;
  color: var(--text-light);
  transition: color 0.2s ease;
}

.tab-item.active .tab-label {
  color: var(--primary);
  font-weight: 500;
}

.tab-item.center-btn .tab-label {
  display: none;
}

.tab-item:active:not(.center-btn) {
  transform: scale(0.95);
}

.tab-item.center-btn:active .icon-wrapper.center-icon {
  transform: scale(0.95);
}

.post-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-menu-container {
  display: flex;
  gap: 24px;
}

.post-menu-btn {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: none;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
  font-weight: 600;
  animation: bounceIn 0.4s ease forwards;
  opacity: 0;
}

.post-menu-btn:hover {
  transform: scale(1.1);
}

.post-menu-btn:active {
  transform: scale(0.95);
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(20px);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) translateY(-5px);
  }
  70% {
    transform: scale(0.95) translateY(2px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.button-enter-active,
.button-leave-active {
  transition: all 0.3s ease;
}

.button-enter-from {
  opacity: 0;
  transform: scale(0.3) translateY(20px);
}

.button-leave-to {
  opacity: 0;
  transform: scale(0.3) translateY(20px);
}

.button-move {
  transition: transform 0.3s ease;
}
</style>
