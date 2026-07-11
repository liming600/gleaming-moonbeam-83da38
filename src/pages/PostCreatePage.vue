<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ImagePlus, Send, ArrowLeft, Loader2 } from 'lucide-vue-next'
import LocationPicker from '@/components/LocationPicker.vue'
import { usePetStore } from '@/stores/petStore'
import { useFeedStore } from '@/stores/feedStore'
import { useUiStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'
import { useRouter, useRoute } from 'vue-router'
import { storageService } from '@/services/storageService'
import { postService } from '@/services/postService'
import type { Location } from '@/mock/posts'

const petStore = usePetStore()
const feedStore = useFeedStore()
const uiStore = useUiStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const editPostId = computed(() => route.query.id as string | undefined)

interface UploadedImage {
  localUrl: string
  remoteUrl: string | null
}

const selectedPetId = ref<string>('')
const content = ref('')
const images = ref<UploadedImage[]>([])
const selectedTags = ref<string[]>([])
const location = ref<Location | null>(null)
const isSubmitting = ref(false)
const uploadProgress = ref<Record<number, number>>({})

const availableTags = ['#可爱', '#萌宠', '#日常', '#调皮', '#吃货', '#开心', '#慵懒', '#户外', '#技能', '#求助']

const breedImagePrompts: Record<string, string> = {
  '橘猫': 'orange tabby cat',
  '金毛寻回犬': 'golden retriever dog',
  '垂耳兔': 'lop eared rabbit',
  '金丝熊': 'golden hamster',
  '玄凤鹦鹉': 'cockatiel parrot',
  '英国短毛猫': 'british shorthair cat',
  '泰迪': 'teddy poodle dog',
  '哈士奇': 'husky dog',
  '柯基': 'corgi dog',
  '布偶猫': 'ragdoll cat',
  '暹罗猫': 'siamese cat',
  '柴犬': 'shiba inu dog',
  '萨摩耶': 'samoyed dog',
  '比熊': 'bichon frise dog',
  '贵宾犬': 'poodle dog',
  '雪纳瑞': 'schnauzer dog',
  '吉娃娃': 'chihuahua dog',
  '德牧': 'german shepherd dog',
  '拉布拉多': 'labrador retriever dog',
  '加菲猫': 'persian cat',
  '美短': 'american shorthair cat',
  '龙猫': 'chinchilla pet',
  '荷兰猪': 'guinea pig',
  '金鱼': 'goldfish',
  '乌龟': 'turtle',
  '仓鼠': 'hamster'
}

const generateBreedImage = (breed: string): string => {
  const prompt = breedImagePrompts[breed] || breed
  const actions = ['playing', 'eating', 'sleeping', 'running', 'cute pose', 'happy']
  const randomAction = actions[Math.floor(Math.random() * actions.length)]
  const encodedPrompt = encodeURIComponent(`${prompt} ${randomAction} cute adorable`)
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodedPrompt}&image_size=landscape_4_3`
}

const fileInput = ref<HTMLInputElement | null>(null)

const selectPet = (petId: string) => {
  selectedPetId.value = petId
}

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0) return

  const maxImages = 9 - images.value.length
  const filesToUpload = Array.from(files).slice(0, maxImages)
  const userId = userStore.getCurrentUserId

  for (let i = 0; i < filesToUpload.length; i++) {
    const file = filesToUpload[i]
    const imageIndex = images.value.length
    uploadProgress.value[imageIndex] = 0

    const reader = new FileReader()
    const readPromise = new Promise<string>((resolve) => {
      reader.onload = (e) => {
        resolve(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    })

    const [localUrl, uploadResult] = await Promise.all([
      readPromise,
      storageService.uploadImage(
        file,
        `posts/${Date.now()}_${imageIndex}_${file.name}`,
        userId
      )
    ])

    images.value.push({
      localUrl,
      remoteUrl: uploadResult.url || null
    })
    uploadProgress.value[imageIndex] = 100
    delete uploadProgress.value[imageIndex]
  }

  target.value = ''
}

const removeImage = (index: number) => {
  images.value.splice(index, 1)
  const newProgress: Record<number, number> = {}
  Object.keys(uploadProgress.value).forEach(key => {
    const oldIndex = parseInt(key)
    if (oldIndex > index) {
      newProgress[oldIndex - 1] = uploadProgress.value[oldIndex]
    } else if (oldIndex < index) {
      newProgress[oldIndex] = uploadProgress.value[oldIndex]
    }
  })
  uploadProgress.value = newProgress
}

const handleSubmit = async () => {
  if (!selectedPetId.value) {
    uiStore.showWarningToast('请选择发布帖子的宠物')
    return
  }
  if (!content.value.trim()) {
    uiStore.showWarningToast('请输入帖子内容')
    return
  }

  const pet = petStore.getPetById(selectedPetId.value)
  if (!pet) return

  isSubmitting.value = true

  let remoteUrls = images.value.map(img => img.remoteUrl).filter((url): url is string => url !== null)

  if (remoteUrls.length === 0) {
    const breed = pet.breed || pet.personality || ''
    remoteUrls = [generateBreedImage(breed)]
  }

  let result
  if (editPostId.value) {
    result = await feedStore.updatePost(editPostId.value, {
      petId: pet.id,
      content: content.value,
      images: remoteUrls,
      tags: selectedTags.value,
      date: new Date().toISOString().split('T')[0],
      location: location.value,
      isPublic: true,
      isDiary: false
    })
  } else {
    result = await feedStore.addPost({
      petId: pet.id,
      petName: pet.name,
      petAvatar: pet.avatar,
      content: content.value,
      images: remoteUrls,
      tags: selectedTags.value,
      date: new Date().toISOString().split('T')[0],
      location: location.value
    })
  }

  isSubmitting.value = false

  if (result.success) {
    uiStore.showSuccessToast(editPostId.value ? '更新成功' : '发布成功')
    if (editPostId.value) {
      router.push(`/post/${editPostId.value}`)
    } else {
      router.push('/')
    }
  } else {
    uiStore.showErrorToast(result.message || (editPostId.value ? '更新失败' : '发布失败'))
  }
}

const loadPostData = async () => {
  if (!editPostId.value) return

  const { post, error } = await postService.getPostById(editPostId.value)
  if (error || !post) {
    uiStore.showErrorToast('加载帖子失败')
    return
  }

  selectedPetId.value = post.petId
  content.value = post.content
  selectedTags.value = [...post.tags]
  location.value = post.location || null

  images.value = post.images.map(img => ({
    localUrl: img,
    remoteUrl: img
  }))
}

onMounted(() => {
  loadPostData()
})

const back = () => {
  router.back()
}
</script>

<template>
  <div class="post-create-page">
    <header class="header">
      <button class="back-btn" @click="back">
        <ArrowLeft :size="24" />
      </button>
      <h1 class="header-title">{{ editPostId ? '编辑帖子' : '发布帖子' }}</h1>
      <button class="submit-btn" @click="handleSubmit" :disabled="isSubmitting">
        <Loader2 v-if="isSubmitting" :size="18" class="loader" />
        <Send v-else :size="18" />
        <span>{{ isSubmitting ? (editPostId ? '更新中...' : '发布中...') : (editPostId ? '更新' : '发布') }}</span>
      </button>
    </header>

    <div class="select-pet-section">
      <h3 class="section-title">🐾 选择发布帖子的宠物</h3>
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
        <div class="pet-item add-pet" @click="router.push('/pet-create?returnTo=/post-create')">
          <div class="add-icon">+</div>
          <span class="add-text">添加宠物</span>
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
          <img :src="img.localUrl" alt="上传的图片" />
          <div v-if="uploadProgress[index] !== undefined" class="upload-overlay">
            <Loader2 :size="20" class="loader" />
          </div>
          <button class="remove-btn" @click="removeImage(index)">✕</button>
        </div>
        <button v-if="images.length < 9" class="add-image-btn" @click="triggerFileSelect">
          <ImagePlus :size="24" />
          <span>添加图片</span>
        </button>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        class="hidden-file-input"
        @change="handleFileChange"
      />
    </div>

    <div class="content-section">
      <textarea
        v-model="content"
        placeholder="分享你家毛孩子的故事..."
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
.post-create-page {
  min-height: 100vh;
  background-color: #FFF9F5;
  padding-bottom: 80px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #F5F5F4;
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
  background: #F5F5F4;
  color: #292524;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:active {
  transform: scale(0.95);
  background: #E7E5E4;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
}

.submit-btn:active {
  transform: scale(0.98);
}

.select-pet-section,
.image-upload-section,
.content-section,
.location-section,
.tags-section {
  background: #fff;
  margin: 16px;
  padding: 16px;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
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
  background: #F5F5F4;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.pet-item.selected {
  background: rgba(249, 115, 22, 0.1);
  border: 2px solid #F97316;
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
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.add-pet {
  border: 2px dashed #E7E5E4;
  background: transparent;
}

.add-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #F5F5F4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #A8A29E;
}

.add-text {
  font-size: 13px;
  color: #A8A29E;
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
  border: 2px dashed #E7E5E4;
  background: #F5F5F4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #A8A29E;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-image-btn:active {
  background: #E7E5E4;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader {
  animation: spin 1s linear infinite;
  color: #fff;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.hidden-file-input {
  display: none;
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
  background: #F5F5F4;
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
  background: #F5F5F4;
  color: #57534E;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-item.selected {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}
</style>
