<script setup lang="ts">
import { ref } from 'vue'
import { ImagePlus, Send, Lock, ArrowLeft } from 'lucide-vue-next'
import DatePicker from '@/components/DatePicker.vue'
import LocationPicker from '@/components/LocationPicker.vue'
import { usePetStore } from '@/stores/petStore'
import { useFeedStore } from '@/stores/feedStore'
import { useUiStore } from '@/stores/uiStore'
import { useRouter } from 'vue-router'
import type { Location } from '@/mock/posts'

const petStore = usePetStore()
const feedStore = useFeedStore()
const uiStore = useUiStore()
const router = useRouter()

const selectedPetId = ref<string>('')
const content = ref('')
const images = ref<string[]>([])
const selectedTags = ref<string[]>([])
const selectedDate = ref(new Date().toISOString().split('T')[0])
const isPublic = ref(false)
const selectedMood = ref<string>('')
const location = ref<Location | null>(null)

const moods = [
  { emoji: '😊', label: '开心', key: 'happy' },
  { emoji: '🥰', label: '幸福', key: 'love' },
  { emoji: '😢', label: '难过', key: 'sad' },
  { emoji: '😴', label: '慵懒', key: 'lazy' },
  { emoji: '😤', label: '烦躁', key: 'angry' },
  { emoji: '😎', label: '酷', key: 'cool' }
]

const availableTags = ['#日记', '#日常', '#成长', '#记录', '#心情', '#健康', '#饮食', '#训练']

const selectPet = (petId: string) => {
  selectedPetId.value = petId
}

const selectMood = (moodKey: string) => {
  selectedMood.value = selectedMood.value === moodKey ? '' : moodKey
}

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

const addImage = () => {
  images.value.push('https://neeko-copilot.bytedance.net/api/text2image?prompt=cute%20pet%20daily%20life&image_size=landscape_4_3')
}

const removeImage = (index: number) => {
  images.value.splice(index, 1)
}

const handleSubmit = () => {
  if (!selectedPetId.value) {
    uiStore.showWarningToast('请选择写日记的宠物')
    return
  }
  if (!content.value.trim()) {
    uiStore.showWarningToast('请输入日记内容')
    return
  }

  const pet = petStore.getPetById(selectedPetId.value)
  if (!pet) return

  feedStore.addDiary({
    petId: pet.id,
    petName: pet.name,
    petAvatar: pet.avatar,
    content: content.value,
    images: images.value,
    tags: selectedTags.value,
    date: selectedDate.value,
    isPublic: isPublic.value,
    mood: selectedMood.value,
    location: location.value
  })

  router.push('/')
}

const back = () => {
  router.back()
}
</script>

<template>
  <div class="diary-create-page">
    <header class="header">
      <button class="back-btn" @click="back">
        <ArrowLeft :size="24" />
      </button>
      <h1 class="header-title">写日记</h1>
      <button class="submit-btn" @click="handleSubmit">
        <Send :size="18" />
        <span>保存</span>
      </button>
    </header>

    <div class="select-pet-section">
      <h3 class="section-title">🐾 选择写日记的宠物</h3>
      <div class="pet-list">
        <div
          v-for="pet in petStore.userPets"
          :key="pet.id"
          class="pet-item"
          :class="{ selected: selectedPetId === pet.id }"
          @click="selectPet(pet.id)"
        >
          <img :src="pet.avatar" :alt="pet.name" class="pet-avatar" />
          <span class="pet-name">{{ pet.name }}</span>
          <div v-if="selectedPetId === pet.id" class="check-mark">✓</div>
        </div>
        <div class="pet-item add-pet" @click="router.push('/pet-create?returnTo=/diary-create')">
          <div class="add-icon">+</div>
          <span class="add-text">添加宠物</span>
        </div>
      </div>
    </div>

    <div class="date-section">
      <h3 class="section-title">📅 选择日期</h3>
      <DatePicker v-model="selectedDate" :max="new Date().toISOString().split('T')[0]" />
      <p class="date-hint">可以选择过往日期补记录</p>
    </div>

    <div class="mood-section">
      <h3 class="section-title">😊 今日心情</h3>
      <div class="mood-list">
        <button
          v-for="mood in moods"
          :key="mood.key"
          class="mood-item"
          :class="{ selected: selectedMood === mood.key }"
          @click="selectMood(mood.key)"
        >
          <span class="mood-emoji">{{ mood.emoji }}</span>
          <span class="mood-label">{{ mood.label }}</span>
        </button>
      </div>
    </div>

    <div class="privacy-section">
      <div class="privacy-toggle" @click="isPublic = !isPublic">
        <div class="privacy-icon">
          <Lock :size="18" />
        </div>
        <div class="privacy-content">
          <span class="privacy-label">公开成长线</span>
          <span class="privacy-desc">{{ isPublic ? '所有人可见' : '仅自己可见' }}</span>
        </div>
        <div class="toggle-switch" :class="{ active: isPublic }">
          <div class="toggle-thumb"></div>
        </div>
      </div>
    </div>

    <div class="image-upload-section">
      <h3 class="section-title">📷 添加图片</h3>
      <div class="image-grid">
        <div
          v-for="(img, index) in images"
          :key="index"
          class="image-item"
        >
          <img :src="img" alt="上传的图片" />
          <button class="remove-btn" @click="removeImage(index)">✕</button>
        </div>
        <button v-if="images.length < 9" class="add-image-btn" @click="addImage">
          <ImagePlus :size="24" />
          <span>添加图片</span>
        </button>
      </div>
    </div>

    <div class="content-section">
      <textarea
        v-model="content"
        placeholder="记录毛孩子的成长点滴..."
        class="content-textarea"
        maxlength="500"
      ></textarea>
      <span class="char-count">{{ content.length }}/500</span>
    </div>

    <div class="location-section">
      <h3 class="section-title">📍 添加位置</h3>
      <LocationPicker v-model="location" />
    </div>

    <div class="tags-section">
      <h3 class="section-title">🏷️ 添加标签</h3>
      <div class="tags-list">
        <button
          v-for="tag in availableTags"
          :key="tag"
          class="tag-item"
          :class="{ selected: selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.diary-create-page {
  min-height: 100vh;
  background-color: #FFFBEB;
  padding-bottom: 80px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #FDE68A;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #292524;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #FDF6E3;
  color: #292524;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:active {
  transform: scale(0.95);
  background: #FDE68A;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.submit-btn:active {
  transform: scale(0.98);
}

.select-pet-section,
.date-section,
.mood-section,
.privacy-section,
.image-upload-section,
.content-section,
.location-section,
.tags-section {
  background: #fff;
  margin: 16px;
  padding: 16px;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.08);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 12px;
}

.pet-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.pet-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px;
  border-radius: 16px;
  background: #FDF6E3;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.pet-item.selected {
  background: rgba(251, 191, 36, 0.15);
  border: 2px solid #FBBF24;
}

.pet-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.pet-name {
  font-size: 13px;
  color: #292524;
  font-weight: 500;
}

.check-mark {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.add-pet {
  border: 2px dashed #FDE68A;
  background: transparent;
}

.add-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #FDF6E3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #D97706;
}

.add-text {
  font-size: 13px;
  color: #D97706;
}

.date-hint {
  font-size: 12px;
  color: #A8A29E;
  margin-top: 8px;
}

.mood-list {
  display: flex;
  justify-content: space-between;
}

.mood-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: 16px;
  background: #FDF6E3;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mood-item.selected {
  background: rgba(251, 191, 36, 0.15);
  border-color: #FBBF24;
}

.mood-emoji {
  font-size: 28px;
}

.mood-label {
  font-size: 12px;
  color: #57534E;
}

.mood-item.selected .mood-label {
  color: #D97706;
  font-weight: 600;
}

.privacy-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #FDF6E3;
  border-radius: 12px;
  cursor: pointer;
}

.privacy-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.privacy-content {
  flex: 1;
}

.privacy-label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #292524;
}

.privacy-desc {
  display: block;
  font-size: 12px;
  color: #A8A29E;
  margin-top: 2px;
}

.toggle-switch {
  width: 48px;
  height: 26px;
  background: #E7E5E4;
  border-radius: 13px;
  position: relative;
  transition: all 0.25s ease;
}

.toggle-switch.active {
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
}

.toggle-thumb {
  width: 22px;
  height: 22px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.25s ease;
}

.toggle-switch.active .toggle-thumb {
  left: 24px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
}

.add-image-btn {
  aspect-ratio: 1;
  border-radius: 12px;
  border: 2px dashed #FDE68A;
  background: #FDF6E3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #D97706;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-image-btn:active {
  background: #FDE68A;
}

.content-textarea {
  width: 100%;
  height: 150px;
  border: none;
  outline: none;
  resize: none;
  font-size: 15px;
  line-height: 1.6;
  color: #292524;
  background: #FDF6E3;
  border-radius: 12px;
  padding: 12px;
  box-sizing: border-box;
}

.content-textarea::placeholder {
  color: #A8A29E;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #A8A29E;
  margin-top: 8px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 8px 14px;
  background: #FDF6E3;
  color: #57534E;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-item.selected {
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  color: #fff;
}
</style>
