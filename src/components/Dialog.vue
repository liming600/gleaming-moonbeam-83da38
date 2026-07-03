<script setup lang="ts">
import { useUiStore } from '@/stores/uiStore'

const uiStore = useUiStore()
</script>

<template>
  <Transition name="dialog">
    <div
      v-if="uiStore.dialogVisible"
      class="dialog-overlay"
      @click="uiStore.closeDialog(false)"
    >
      <div
        class="dialog-wrapper"
        @click.stop
      >
        <div v-if="uiStore.dialogTitle" class="dialog-title">
          {{ uiStore.dialogTitle }}
        </div>
        <div class="dialog-content">
          {{ uiStore.dialogContent }}
        </div>
        <div class="dialog-actions">
          <button
            v-if="uiStore.dialogShowCancel"
            class="dialog-btn cancel"
            @click="uiStore.closeDialog(false)"
          >
            {{ uiStore.dialogCancelText }}
          </button>
          <button
            class="dialog-btn confirm"
            @click="uiStore.closeDialog(true)"
          >
            {{ uiStore.dialogConfirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.dialog-wrapper {
  width: 100%;
  max-width: 320px;
  background: #fff;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 12px;
  text-align: center;
}

.dialog-content {
  font-size: 15px;
  color: #57534E;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 24px;
}

.dialog-actions {
  display: flex;
  gap: 12px;
}

.dialog-btn {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dialog-btn.cancel {
  background: #F5F5F4;
  color: #57534E;
}

.dialog-btn.cancel:active {
  background: #E7E5E4;
}

.dialog-btn.confirm {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
}

.dialog-btn.confirm:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(251, 146, 60, 0.2);
}

.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .dialog-wrapper,
.dialog-leave-to .dialog-wrapper {
  transform: scale(0.9);
}
</style>