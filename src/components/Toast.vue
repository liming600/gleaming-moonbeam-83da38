<script setup lang="ts">
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-vue-next'
import { useUiStore } from '@/stores/uiStore'

const uiStore = useUiStore()

// 提示类型配置：白底黑字，用彩色图标区分类型
const typeConfig = {
  success: { icon: CheckCircle, color: '#10B981' },
  error:   { icon: XCircle,     color: '#EF4444' },
  warning: { icon: AlertTriangle, color: '#F59E0B' },
  info:    { icon: Info,        color: '#3B82F6' }
}
</script>

<template>
  <Transition name="toast">
    <div
      v-if="uiStore.toastVisible"
      class="toast-container"
    >
      <div class="toast-wrapper">
        <component
          :is="typeConfig[uiStore.toastType].icon"
          :size="22"
          :style="{ color: typeConfig[uiStore.toastType].color }"
        />
        <span class="toast-message">{{ uiStore.toastMessage }}</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

/* 白底黑字样式 */
.toast-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: 16px;
  background: #FFFFFF;
  color: #1F2937;
  font-size: 15px;
  font-weight: 500;
  opacity: 1 !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  max-width: 80vw;
  justify-content: center;
}

.toast-message {
  line-height: 1.4;
}

.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}
</style>
