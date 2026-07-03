<script setup lang="ts">
import { useUiStore } from '@/stores/uiStore'

const uiStore = useUiStore()
</script>

<template>
  <Transition name="loading">
    <div
      v-if="uiStore.loadingVisible"
      class="loading-overlay"
    >
      <div class="loading-wrapper">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-center"></div>
        </div>
        <span class="loading-text">{{ uiStore.loadingText }}</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 249, 245, 0.9);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  position: relative;
  width: 56px;
  height: 56px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid rgba(249, 115, 22, 0.2);
  border-top-color: #F97316;
  animation: spin 1s linear infinite;
}

.spinner-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F97316, #FB923C);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.4);
}

.loading-text {
  font-size: 15px;
  color: #57534E;
  font-weight: 500;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-enter-active,
.loading-leave-active {
  transition: opacity 0.3s ease;
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}
</style>