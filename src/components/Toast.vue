<script setup lang="ts">
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-vue-next'
import { useUiStore } from '@/stores/uiStore'

const uiStore = useUiStore()

const typeConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-gradient(135deg, #34D399, #6EE7B7)',
    iconColor: '#059669'
  },
  error: {
    icon: XCircle,
    bg: 'bg-gradient(135deg, #EF4444, #F87171)',
    iconColor: '#DC2626'
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-gradient(135deg, #FBBF24, #FCD34D)',
    iconColor: '#D97706'
  },
  info: {
    icon: Info,
    bg: 'bg-gradient(135deg, #3B82F6, #60A5FA)',
    iconColor: '#2563EB'
  }
}
</script>

<template>
  <Transition name="toast">
    <div
      v-if="uiStore.toastVisible"
      class="toast-container"
    >
      <div
        class="toast-wrapper"
        :class="[typeConfig[uiStore.toastType].bg]"
      >
        <component
          :is="typeConfig[uiStore.toastType].icon"
          :size="20"
          :style="{ color: typeConfig[uiStore.toastType].iconColor }"
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
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.toast-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: 24px;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  justify-content: center;
}

.toast-message {
  line-height: 1.4;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}
</style>