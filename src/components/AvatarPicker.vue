<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, RefreshCw, Check } from 'lucide-vue-next'
import { generateMultipleAvatars, type AvatarType } from '@/utils/avatarGenerator'

const props = defineProps<{
  visible: boolean
  type?: AvatarType
  initialAvatar?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', avatarUrl: string): void
}>()

const avatars = ref<string[]>([])
const selectedAvatar = ref<string>('')
const isLoading = ref(false)

const loadAvatars = () => {
  isLoading.value = true
  avatars.value = generateMultipleAvatars(props.type || 'cat', 6)
  isLoading.value = false
}

const selectAvatar = (avatar: string) => {
  selectedAvatar.value = avatar
}

const confirmSelection = () => {
  if (selectedAvatar.value) {
    emit('select', selectedAvatar.value)
  }
}

const regenerateAvatars = () => {
  loadAvatars()
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    selectedAvatar.value = props.initialAvatar || ''
    loadAvatars()
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="avatar-picker-overlay" @click.self="emit('close')">
        <div class="avatar-picker-modal">
          <div class="modal-header">
            <h3 class="modal-title">选择头像</h3>
            <button class="close-btn" @click="emit('close')">
              <X :size="20" />
            </button>
          </div>

          <div class="modal-content">
            <div class="avatar-grid">
              <div
                v-for="(avatar, index) in avatars"
                :key="index"
                class="avatar-item"
                :class="{ selected: selectedAvatar === avatar }"
                @click="selectAvatar(avatar)"
              >
                <img :src="avatar" :alt="`头像 ${index + 1}`" class="avatar-img" />
                <div v-if="selectedAvatar === avatar" class="check-mark">
                  <Check :size="16" />
                </div>
              </div>
              <div v-if="isLoading" class="loading-item">
                <div class="loading-spinner"></div>
              </div>
            </div>

            <button class="regenerate-btn" @click="regenerateAvatars" :disabled="isLoading">
              <RefreshCw :size="16" />
              <span>换一批</span>
            </button>
          </div>

          <div class="modal-footer">
            <button class="cancel-btn" @click="emit('close')">取消</button>
            <button class="confirm-btn" @click="confirmSelection" :disabled="!selectedAvatar">
              确认
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.avatar-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.avatar-picker-modal {
  width: 100%;
  max-width: 360px;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #F5F5F4;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #292524;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #F5F5F4;
  color: #78716C;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.modal-content {
  padding: 24px;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.avatar-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.avatar-item:hover {
  transform: scale(1.05);
}

.avatar-item.selected {
  border-color: #F97316;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.check-mark {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #F97316;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.loading-item {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: #F5F5F4;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #E7E5E4;
  border-top-color: #F97316;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.regenerate-btn {
  width: 100%;
  padding: 12px;
  border: 2px dashed #E7E5E4;
  border-radius: 12px;
  background: transparent;
  color: #78716C;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.regenerate-btn:hover {
  border-color: #F97316;
  color: #F97316;
}

.regenerate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
}

.cancel-btn {
  flex: 1;
  padding: 14px;
  border: 2px solid #E7E5E4;
  border-radius: 12px;
  background: transparent;
  color: #78716C;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #F5F5F4;
}

.confirm-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
}

.confirm-btn:hover {
  transform: translateY(-2px);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
