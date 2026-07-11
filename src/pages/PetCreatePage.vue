<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Camera, Check, Search, X, Sparkles } from 'lucide-vue-next'
import { useUiStore } from '@/stores/uiStore'
import { usePetStore } from '@/stores/petStore'
import { useUserStore } from '@/stores/userStore'
import { useRouter, useRoute } from 'vue-router'
import { storageService } from '@/services/storageService'
import { generatePetAvatar } from '@/utils/avatarGenerator'

const uiStore = useUiStore()
const petStore = usePetStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const isEditMode = computed(() => !!route.query.id)
const editPetId = computed(() => route.query.id as string)

const returnTo = computed(() => {
  return (route.query.returnTo as string) || '/my-pets'
})

const petName = ref('')
const petBreed = ref('')
const petAge = ref('')
const petAvatar = ref('')
const petDescription = ref('')
const breedSearch = ref('')
const showBreedSelector = ref(false)
const selectedCategory = ref('all')
const avatarInput = ref<HTMLInputElement | null>(null)

const breedCategories = [
  {
    id: 'cat',
    emoji: 'cat',
    name: '猫咪',
    breeds: ['橘猫', '英国短毛猫', '布偶猫', '暹罗猫', '波斯猫', '美短', '加菲猫', '狸花猫', '蓝猫', '金渐层', '银渐层', '缅因猫', '德文卷毛猫', '无毛猫', '其他猫咪']
  },
  {
    id: 'dog',
    emoji: 'dog',
    name: '狗狗',
    breeds: ['金毛寻回犬', '哈士奇', '泰迪', '柯基', '拉布拉多', '柴犬', '萨摩耶', '边牧', '法斗', '比熊', '博美', '贵宾犬', '雪纳瑞', '斗牛犬', '其他狗狗']
  },
  {
    id: 'rabbit',
    emoji: 'rabbit',
    name: '兔子',
    breeds: ['垂耳兔', '侏儒兔', '荷兰兔', '狮子兔', '安哥拉兔', '其他兔子']
  },
  {
    id: 'hamster',
    emoji: 'hamster',
    name: '仓鼠',
    breeds: ['金丝熊', '布丁仓鼠', '银狐仓鼠', '紫仓', '老公公仓鼠', '老婆婆仓鼠', '其他仓鼠']
  },
  {
    id: 'bird',
    emoji: 'bird',
    name: '鸟类',
    breeds: ['玄凤鹦鹉', '虎皮鹦鹉', '牡丹鹦鹉', '八哥', '画眉', '金丝雀', '其他鸟类']
  },
  {
    id: 'other',
    emoji: 'other',
    name: '其他',
    breeds: ['金鱼', '乌龟', '松鼠', '龙猫', '蜜袋鼯', '蜥蜴', '蛇', '刺猬', '香猪', '羊驼', '其他宠物']
  }
]

const emojiMap: Record<string, string> = {
  cat: '🐱',
  dog: '🐶',
  rabbit: '🐰',
  hamster: '🐹',
  bird: '🦜',
  other: '🐢'
}

const filteredCategories = computed(() => {
  if (!breedSearch.value.trim()) {
    return breedCategories
  }
  const search = breedSearch.value.toLowerCase()
  return breedCategories.map(cat => ({
    ...cat,
    breeds: cat.breeds.filter(b => b.toLowerCase().includes(search))
  })).filter(cat => cat.breeds.length > 0)
})

const back = () => {
  router.back()
}

const handleSubmit = async () => {
  if (!petName.value.trim()) {
    uiStore.showWarningToast('请输入宠物名称')
    return
  }
  if (!petBreed.value) {
    uiStore.showWarningToast('请选择宠物品种')
    return
  }

  if (!userStore.currentUser) {
    uiStore.showWarningToast('请先登录')
    router.push('/login')
    return
  }

  if (!petAvatar.value) {
    petAvatar.value = generatePetAvatar(petBreed.value)
  }

  if (isEditMode.value) {
    const result = await petStore.updatePet(editPetId.value, {
      name: petName.value,
      avatar: petAvatar.value,
      breed: petBreed.value,
      age: petAge.value,
      description: petDescription.value
    })

    if (result.success) {
      uiStore.showSuccessToast('宠物信息更新成功')
      router.push(returnTo.value)
    } else {
      uiStore.showErrorToast(result.message)
    }
  } else {
    const result = await petStore.addPet({
      name: petName.value,
      avatar: petAvatar.value,
      breed: petBreed.value,
      age: petAge.value,
      description: petDescription.value,
      ownerId: userStore.currentUser.id
    })

    if (result.success) {
      uiStore.showSuccessToast(`成功添加宠物：${petName.value}`)
      router.push(returnTo.value)
    } else {
      uiStore.showErrorToast(result.message)
    }
  }
}

const loadPetData = async () => {
  if (!isEditMode.value || !editPetId.value) return

  uiStore.showLoading('加载中...')
  const { success } = await petStore.loadPetById(editPetId.value)
  
  if (success) {
    const pet = petStore.getPetById(editPetId.value)
    if (pet) {
      petName.value = pet.name
      petBreed.value = pet.breed
      petAge.value = pet.age
      petAvatar.value = pet.avatar || ''
      petDescription.value = pet.description
    }
  }
  
  uiStore.hideLoading()
}

onMounted(() => {
  loadPetData()
})

const selectBreed = (breed: string) => {
  petBreed.value = breed
  showBreedSelector.value = false
}

const openBreedSelector = () => {
  showBreedSelector.value = true
}

const closeBreedSelector = () => {
  showBreedSelector.value = false
  breedSearch.value = ''
  selectedCategory.value = 'all'
}

const clearBreed = () => {
  petBreed.value = ''
}

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uiStore.showLoading('上传中...')

  try {
    const tempPetId = `temp_${Date.now()}`
    const result = await storageService.uploadPetAvatar(file, tempPetId)
    if (result.url) {
      petAvatar.value = result.url
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

const generateRandomAvatar = () => {
  if (!petBreed.value) {
    uiStore.showWarningToast('请先选择宠物品种')
    openBreedSelector()
    return
  }
  
  petAvatar.value = generatePetAvatar(petBreed.value)
}
</script>

<template>
  <div class="pet-create-page">
    <header class="header">
      <button class="back-btn" @click="back">
        <ArrowLeft :size="24" />
      </button>
      <h1 class="header-title">{{ isEditMode ? '编辑宠物' : '添加宠物' }}</h1>
      <button class="submit-btn" @click="handleSubmit">
        <Check :size="20" />
      </button>
    </header>

    <div class="content">
      <div class="avatar-section">
        <div class="avatar-container" @click="avatarInput?.click()">
          <img
            v-if="petAvatar"
            :src="petAvatar"
            alt="宠物头像"
            class="pet-avatar"
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
          <button class="generate-btn" @click="generateRandomAvatar">
            <Sparkles :size="16" />
            <span>随机生成</span>
          </button>
        </div>
      </div>

      <div class="form-section">
        <div class="form-item">
          <label class="form-label">宠物名称</label>
          <input
            v-model="petName"
            type="text"
            placeholder="给宠物取个名字"
            class="form-input"
          />
        </div>

        <div class="form-item">
          <label class="form-label">宠物品种</label>
          <div class="breed-selector-trigger" @click="openBreedSelector">
            <span v-if="petBreed" class="breed-selected">{{ petBreed }}</span>
            <span v-else class="breed-placeholder">选择或搜索宠物品种</span>
            <button v-if="petBreed" class="clear-btn" @click.stop="clearBreed">
              <X :size="16" />
            </button>
          </div>
        </div>

        <div class="form-item">
          <label class="form-label">年龄</label>
          <input
            v-model="petAge"
            type="text"
            placeholder="例如：2岁"
            class="form-input"
          />
        </div>

        <div class="form-item">
          <label class="form-label">描述</label>
          <textarea
            v-model="petDescription"
            placeholder="简单介绍一下你的宠物"
            class="form-textarea"
            maxlength="200"
          ></textarea>
          <span class="char-count">{{ petDescription.length }}/200</span>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="showBreedSelector" class="breed-modal-overlay" @click="closeBreedSelector">
        <div class="breed-modal" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">选择宠物品种</h3>
            <button class="modal-close" @click="closeBreedSelector">
              <X :size="20" />
            </button>
          </div>

          <div class="search-box">
            <Search :size="18" class="search-icon" />
            <input
              v-model="breedSearch"
              type="text"
              placeholder="搜索宠物品种..."
              class="search-input"
            />
          </div>

          <div class="category-tabs">
            <button
              class="category-tab"
              :class="{ active: selectedCategory === 'all' }"
              @click="selectedCategory = 'all'"
            >
              全部
            </button>
            <button
              v-for="cat in breedCategories"
              :key="cat.id"
              class="category-tab"
              :class="{ active: selectedCategory === cat.id }"
              @click="selectedCategory = cat.id"
            >
              {{ emojiMap[cat.emoji] }}
            </button>
          </div>

          <div class="breed-list">
            <div v-for="category in (selectedCategory === 'all' ? filteredCategories : breedCategories.filter(c => c.id === selectedCategory))" :key="category.id" class="breed-group">
              <h4 class="breed-group-title">{{ emojiMap[category.emoji] }} {{ category.name }}</h4>
              <div class="breed-options">
                <button
                  v-for="breed in category.breeds"
                  :key="breed"
                  class="breed-option"
                  :class="{ selected: petBreed === breed }"
                  @click="selectBreed(breed)"
                >
                  {{ breed }}
                </button>
              </div>
            </div>
          </div>

          <div class="custom-input-section">
            <input
              v-model="petBreed"
              type="text"
              placeholder="没有找到？输入自定义品种"
              class="custom-input"
              @click.stop
            />
            <button class="custom-confirm-btn" @click="closeBreedSelector">
              确认
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.pet-create-page {
  min-height: 100vh;
  background-color: #FFF9F5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #F5F5F4;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #F5F5F4;
  color: #292524;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #292524;
}

.submit-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(251, 146, 60, 0.3);
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
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid transparent;
  background: linear-gradient(#fff, #fff) padding-box,
              linear-gradient(135deg, #F97316, #FB923C) border-box;
  overflow: hidden;
  margin-bottom: 16px;
}

.pet-avatar {
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
  color: #A8A29E;
  background: #F5F5F4;
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
  color: #F97316;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.generate-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: rgba(139, 92, 246, 0.1);
  color: #8B5CF6;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.generate-btn:active {
  transform: scale(0.98);
}

.avatar-input {
  display: none;
}

.form-section {
  background: #fff;
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
  font-size: 15px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 10px;
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  border: 2px solid #E7E5E4;
  border-radius: 12px;
  font-size: 15px;
  color: #292524;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #F97316;
}

.form-input::placeholder {
  color: #A8A29E;
}

.breed-selector-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  border: 2px solid #E7E5E4;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.breed-selector-trigger:focus-within {
  border-color: #F97316;
}

.breed-selected {
  font-size: 15px;
  color: #292524;
}

.breed-placeholder {
  font-size: 15px;
  color: #A8A29E;
}

.clear-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #F5F5F4;
  color: #A8A29E;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.form-textarea {
  width: 100%;
  height: 100px;
  padding: 12px 16px;
  border: 2px solid #E7E5E4;
  border-radius: 12px;
  font-size: 15px;
  color: #292524;
  outline: none;
  resize: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-textarea:focus {
  border-color: #F97316;
}

.form-textarea::placeholder {
  color: #A8A29E;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #A8A29E;
  margin-top: 8px;
}

.breed-modal-overlay {
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

.breed-modal {
  width: 100%;
  background: #fff;
  border-radius: 24px 24px 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #F5F5F4;
  flex-shrink: 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #292524;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #F5F5F4;
  color: #57534E;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px;
  padding: 12px 16px;
  background: #F5F5F4;
  border-radius: 12px;
  flex-shrink: 0;
}

.search-icon {
  color: #A8A29E;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #292524;
  outline: none;
}

.search-input::placeholder {
  color: #A8A29E;
}

.category-tabs {
  display: flex;
  gap: 8px;
  padding: 0 16px 16px;
  overflow-x: auto;
  flex-shrink: 0;
  border-bottom: 1px solid #F5F5F4;
}

.category-tab {
  padding: 10px 14px;
  background: #F5F5F4;
  color: #57534E;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-tab.active {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}

.breed-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.breed-group {
  margin-bottom: 20px;
}

.breed-group:last-child {
  margin-bottom: 0;
}

.breed-group-title {
  font-size: 14px;
  font-weight: 600;
  color: #A8A29E;
  margin-bottom: 10px;
}

.breed-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.breed-option {
  padding: 10px 14px;
  background: #F5F5F4;
  color: #57534E;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.breed-option.selected {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}

.custom-input-section {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #F5F5F4;
}

.custom-input {
  flex: 1;
  height: 44px;
  padding: 0 16px;
  border: 2px solid #E7E5E4;
  border-radius: 12px;
  font-size: 15px;
  color: #292524;
  outline: none;
}

.custom-input:focus {
  border-color: #F97316;
}

.custom-confirm-btn {
  padding: 0 24px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
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
