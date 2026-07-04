<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Plus, Camera } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { usePetStore } from '@/stores/petStore'
import { storageService } from '@/services/storageService'
import { useUiStore } from '@/stores/uiStore'

const router = useRouter()
const petStore = usePetStore()
const uiStore = useUiStore()

const avatarInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

const pets = computed(() => petStore.userPets)

const goBack = () => {
  router.back()
}

const goToPetProfile = (petId: string) => {
  router.push(`/pet/${petId}`)
}

const addPet = () => {
  router.push('/pet-create')
}

const handleAvatarUpload = async (event: Event, petId: string) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isUploading.value = true
  uiStore.showLoading('上传中...')

  try {
    const result = await storageService.uploadPetAvatar(file, petId)
    if (result.url) {
      await petStore.updatePetAvatar(petId, result.url)
      uiStore.showSuccessToast('头像更新成功')
    } else {
      uiStore.showErrorToast('上传失败')
    }
  } catch (error) {
    uiStore.showErrorToast('上传失败')
  } finally {
    isUploading.value = false
    target.value = ''
  }
}

onMounted(async () => {
  await petStore.loadUserPets()
})
</script>

<template>
  <div class="my-pets-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft :size="20" />
      </button>
      <h1 class="page-title">我的宠物</h1>
      <button class="add-btn" @click="addPet">
        <Plus :size="18" />
      </button>
    </div>

    <div class="page-content">
      <div v-if="petStore.isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="pets.length === 0" class="empty-state">
        <div class="empty-icon">🐾</div>
        <h3>还没有宠物</h3>
        <p>点击右上角添加你的宠物吧</p>
        <button class="add-pet-btn" @click="addPet">
          <Plus :size="18" />
          <span>添加宠物</span>
        </button>
      </div>

      <div v-else class="pets-grid">
        <div
          v-for="pet in pets"
          :key="pet.id"
          class="pet-card"
          @click="goToPetProfile(pet.id)"
        >
          <div class="pet-avatar-wrapper">
            <img 
              :src="pet.avatar || 'https://neeko-copilot.bytedance.net/api/text2image?prompt=cute%20pet%20avatar%20cartoon&image_size=square'" 
              :alt="pet.name" 
              class="pet-avatar" 
            />
            <button 
              class="change-avatar-btn" 
              @click.stop="avatarInput?.click()"
              :disabled="isUploading"
            >
              <Camera :size="14" />
            </button>
            <input 
              ref="avatarInput" 
              type="file" 
              accept="image/*" 
              class="avatar-input" 
              @change="(e) => handleAvatarUpload(e, pet.id)" 
            />
          </div>
          <div class="pet-info">
            <h4 class="pet-name">{{ pet.name }}</h4>
            <p class="pet-breed">{{ pet.breed || '未知品种' }}</p>
          </div>
          <div class="pet-stats">
            <span class="stat">📝 {{ pet.posts || 0 }} 动态</span>
            <span class="stat">❤️ {{ pet.likes || 0 }} 喜欢</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-pets-page {
  min-height: 100vh;
  background-color: #FFF9F5;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #F5F5F4;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #292524;
}

.page-title {
  font-size: 17px;
  font-weight: 600;
  color: #292524;
}

.add-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #F97316, #FB923C);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.page-content {
  padding: 16px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #F5F5F4;
  border-top-color: #F97316;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px;
  color: #A8A29E;
  margin-bottom: 24px;
}

.add-pet-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.pets-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.pet-card {
  background: #fff;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.pet-avatar-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.pet-avatar {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 16px;
}

.change-avatar-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid #fff;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.4);
}

.avatar-input {
  display: none;
}

.pet-info {
  margin-bottom: 8px;
}

.pet-name {
  font-size: 16px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 4px;
}

.pet-breed {
  font-size: 13px;
  color: #A8A29E;
}

.pet-stats {
  display: flex;
  gap: 12px;
}

.stat {
  font-size: 12px;
  color: #A8A29E;
}
</style>