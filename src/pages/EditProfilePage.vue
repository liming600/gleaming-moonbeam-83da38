<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Camera, Check, X } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useUiStore } from '@/stores/uiStore'
import { storageService } from '@/services/storageService'

const router = useRouter()
const userStore = useUserStore()
const uiStore = useUiStore()

const avatarInput = ref<HTMLInputElement | null>(null)

const formData = ref({
    name: '',
    avatar: '',
    bio: '',
    gender: '',
    age: ''
  })

  const showGenderSelector = ref(false)
  const showAgeSelector = ref(false)

const genderOptions = [
  { value: '', label: '选择性别' },
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' }
]

const ageOptions = [
  { value: '', label: '选择年龄段' },
  { value: '18-25', label: '18-25岁' },
  { value: '26-35', label: '26-35岁' },
  { value: '36-45', label: '36-45岁' },
  { value: '46-55', label: '46-55岁' },
  { value: '55+', label: '55岁以上' }
]

const isDirty = computed(() => {
  const user = userStore.currentUser
  if (!user) return false
  return (
    formData.value.name !== user.name ||
    formData.value.bio !== (user.bio || '') ||
    formData.value.gender !== (user.gender || '') ||
    formData.value.age !== (user.age || '')
  )
})

const back = () => {
  router.back()
}

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const userId = userStore.currentUser?.id
  if (!userId) return

  uiStore.showLoading('上传中...')

  try {
    const result = await storageService.uploadAvatar(file, userId)
    if (result.url) {
      formData.value.avatar = result.url
      uiStore.showSuccessToast('头像上传成功')
    } else {
      uiStore.showErrorToast('上传失败，请重试')
    }
  } catch (error) {
    uiStore.showErrorToast('上传失败，请重试')
  } finally {
    target.value = ''
  }
}

const handleSubmit = async () => {
  if (!formData.value.name.trim()) {
    uiStore.showWarningToast('请输入昵称')
    return
  }

  uiStore.showLoading('保存中...')

  try {
    const result = await userStore.updateProfile({
      name: formData.value.name,
      avatar_url: formData.value.avatar || undefined,
      bio: formData.value.bio || undefined,
      gender: formData.value.gender || undefined,
      age: formData.value.age || undefined
    })

    if (result.success) {
      uiStore.showSuccessToast('资料更新成功')
      router.back()
    } else {
      uiStore.showErrorToast(result.message)
    }
  } finally {
    uiStore.hideLoading()
  }
}

const loadUserProfile = () => {
  const user = userStore.currentUser
  if (!user) return

  formData.value = {
    name: user.name,
    avatar: user.avatar_url || '',
    bio: user.bio || '',
    gender: user.gender || '',
    age: user.age || ''
  }
}

onMounted(() => {
  loadUserProfile()
})
</script>

<template>
  <div class="edit-profile-page">
    <header class="header">
      <button class="back-btn" @click="back">
        <ArrowLeft :size="24" />
      </button>
      <h1 class="header-title">编辑资料</h1>
      <button class="save-btn" @click="handleSubmit" :disabled="!isDirty">
        <Check :size="20" />
      </button>
    </header>

    <div class="content">
      <div class="avatar-section">
        <div class="avatar-container" @click="avatarInput?.click()">
          <img
            v-if="formData.avatar"
            :src="formData.avatar"
            alt="头像"
            class="user-avatar"
          />
          <div v-else class="avatar-placeholder">
            <Camera :size="32" />
            <span>上传头像</span>
          </div>
        </div>
        <input ref="avatarInput" type="file" accept="image/*" class="avatar-input" @change="handleAvatarUpload" />
        <div class="avatar-actions">
          <button class="upload-btn" @click="avatarInput?.click()">
            <Camera :size="16" />
            <span>上传头像</span>
          </button>
        </div>
      </div>

      <div class="form-section">
        <div class="form-item">
          <label class="form-label">昵称</label>
          <div class="input-wrapper">
            <input
              v-model="formData.name"
              type="text"
              placeholder="请输入昵称"
              class="form-input"
              maxlength="20"
            />
            <span class="char-count">{{ formData.name.length }}/20</span>
          </div>
        </div>

        <div class="form-item">
          <label class="form-label">个性签名</label>
          <div class="input-wrapper">
            <textarea
              v-model="formData.bio"
              placeholder="说说你自己..."
              class="form-textarea"
              maxlength="100"
            ></textarea>
            <span class="char-count">{{ formData.bio.length }}/100</span>
          </div>
        </div>

        <div class="form-item">
          <label class="form-label">性别</label>
          <div class="selector-trigger" @click="showGenderSelector = !showGenderSelector">
            <span v-if="formData.gender" class="selector-value">{{ genderOptions.find(g => g.value === formData.gender)?.label }}</span>
            <span v-else class="selector-placeholder">选择性别（选填）</span>
            <span class="selector-arrow">▼</span>
          </div>
        </div>

        <div class="form-item">
          <label class="form-label">年龄段</label>
          <div class="selector-trigger" @click="showAgeSelector = !showAgeSelector">
            <span v-if="formData.age" class="selector-value">{{ ageOptions.find(a => a.value === formData.age)?.label }}</span>
            <span v-else class="selector-placeholder">选择年龄段（选填）</span>
            <span class="selector-arrow">▼</span>
          </div>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="showGenderSelector" class="selector-overlay" @click="showGenderSelector = false">
        <div class="selector-modal" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">选择性别</h3>
            <button class="modal-close" @click="showGenderSelector = false">
              <X :size="20" />
            </button>
          </div>
          <div class="selector-list">
            <button
              v-for="option in genderOptions"
              :key="option.value"
              class="selector-option"
              :class="{ selected: formData.gender === option.value }"
              @click="formData.gender = option.value; showGenderSelector = false"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showAgeSelector" class="selector-overlay" @click="showAgeSelector = false">
        <div class="selector-modal" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">选择年龄段</h3>
            <button class="modal-close" @click="showAgeSelector = false">
              <X :size="20" />
            </button>
          </div>
          <div class="selector-list">
            <button
              v-for="option in ageOptions"
              :key="option.value"
              class="selector-option"
              :class="{ selected: formData.age === option.value }"
              @click="formData.age = option.value; showAgeSelector = false"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.edit-profile-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  padding-top: calc(env(safe-area-inset-top) + 52px);
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

.save-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(251, 146, 60, 0.3);
  transition: all 0.2s ease;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.content {
  padding: 24px 16px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.avatar-container {
  width: clamp(100px, 28vw, 120px);
  height: clamp(100px, 28vw, 120px);
  border-radius: 50%;
  border: 4px solid transparent;
  background: linear-gradient(var(--bg-card), var(--bg-card)) padding-box,
              linear-gradient(135deg, var(--primary), var(--primary-light)) border-box;
  overflow: hidden;
  margin-bottom: 16px;
  cursor: pointer;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-light);
  background: var(--border-color);
}

.avatar-input {
  display: none;
}

.avatar-actions {
  display: flex;
  gap: 12px;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: rgba(249, 115, 22, 0.1);
  color: var(--primary);
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.form-section {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
}

.form-item {
  margin-bottom: 20px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: clamp(14px, 3.5vw, 15px);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: clamp(14px, 3.5vw, 15px);
  color: var(--text-primary);
  background: var(--bg-card);
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--primary);
}

.form-textarea {
  width: 100%;
  height: 100px;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: clamp(14px, 3.5vw, 15px);
  color: var(--text-primary);
  background: var(--bg-card);
  outline: none;
  resize: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-textarea:focus {
  border-color: var(--primary);
}

.char-count {
  display: block;
  text-align: right;
  font-size: clamp(11px, 2.8vw, 12px);
  color: var(--text-light);
  margin-top: 8px;
}

.selector-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-card);
  cursor: pointer;
  transition: all 0.2s ease;
}

.selector-trigger:focus-within {
  border-color: var(--primary);
}

.selector-value {
  font-size: clamp(14px, 3.5vw, 15px);
  color: var(--text-primary);
}

.selector-placeholder {
  font-size: clamp(14px, 3.5vw, 15px);
  color: var(--text-light);
}

.selector-arrow {
  font-size: clamp(11px, 2.8vw, 12px);
  color: var(--text-light);
}

.selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 300;
  display: flex;
  align-items: flex-end;
}

.selector-modal {
  width: 100%;
  background: var(--bg-card);
  border-radius: 24px 24px 0 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: clamp(17px, 4vw, 18px);
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--border-color);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.selector-list {
  padding: 16px;
  overflow-y: auto;
}

.selector-option {
  display: block;
  width: 100%;
  padding: 14px 16px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: clamp(14px, 3.5vw, 15px);
  text-align: left;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.selector-option:hover,
.selector-option:active {
  background: rgba(249, 115, 22, 0.05);
}

.selector-option.selected {
  background: rgba(249, 115, 22, 0.1);
  color: var(--primary);
  font-weight: 600;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>