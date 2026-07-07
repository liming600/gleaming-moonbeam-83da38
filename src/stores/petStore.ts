import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { petService } from '@/services/petService'
import { petPawService } from '@/services/petPawService'
import type { Pet as ApiPet } from '@/services/petService'
import type { Pet } from '@/mock/pets'
import { useUserStore } from './userStore'
import { handleApiError } from '@/utils/errorHandler'
import { logger } from '@/utils/logger'
import { cache, CACHE_TTL } from '@/utils/cache'

const mapApiPetToPet = (apiPet: ApiPet): Pet => ({
  id: apiPet.id,
  name: apiPet.name,
  breed: apiPet.breed || '',
  age: apiPet.birth_date ? calculateAge(apiPet.birth_date) : '',
  avatar: apiPet.avatar_url || '',
  avatar_url: apiPet.avatar_url,
  coverImage: '',
  description: apiPet.personality || '',
  posts: apiPet.posts_count || 0,
  likes: apiPet.likes_count || 0,
  followers: apiPet.followers_count || 0,
  createdAt: apiPet.created_at || '',
  created_at: apiPet.created_at,
  ownerId: apiPet.owner_id,
  owner_id: apiPet.owner_id,
  ownerName: apiPet.owner_name || '',
  ownerAvatar: apiPet.owner_avatar_url || '',
  milestones: []
})

const calculateAge = (birthDate: string): string => {
  const birth = new Date(birthDate)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()
  if (years > 0) return `${years}岁`
  if (months > 0) return `${months}个月`
  return '不久前'
}

const parseAgeToBirthDate = (age: string): string | undefined => {
  if (!age || age.trim() === '') return undefined
  
  const yearMatch = age.match(/(\d+)岁/)
  if (yearMatch) {
    const years = parseInt(yearMatch[1], 10)
    const date = new Date()
    date.setFullYear(date.getFullYear() - years)
    return date.toISOString().split('T')[0]
  }
  
  const monthMatch = age.match(/(\d+)个月/)
  if (monthMatch) {
    const months = parseInt(monthMatch[1], 10)
    const date = new Date()
    date.setMonth(date.getMonth() - months)
    return date.toISOString().split('T')[0]
  }
  
  if (age.includes('不久前') || age.includes('刚出生')) {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return date.toISOString().split('T')[0]
  }
  
  return undefined
}

export const usePetStore = defineStore('pet', () => {
  const pets = ref<Pet[]>([])
  const userPets = ref<Pet[]>([])
  const selectedPetId = ref<string | null>(null)
  const isLoading = ref(false)

  const selectedPet = computed(() => {
    if (!selectedPetId.value) return null
    return pets.value.find(p => p.id === selectedPetId.value) || null
  })

  const setSelectedPet = (petId: string) => {
    selectedPetId.value = petId
  }

  const getPetById = (petId: string) => {
    return pets.value.find(p => p.id === petId) || null
  }

  const loadUserPets = async (ownerId?: string) => {
    const userStore = useUserStore()
    const targetUserId = ownerId || userStore.currentUser?.id
    if (!targetUserId) return

    const cacheKey = `user_pets_${targetUserId}`
    const cachedPets = cache.get<Pet[]>(cacheKey)
    
    if (cachedPets) {
      userPets.value = [...cachedPets]
      if (cachedPets.length > 0) {
        pets.value = [...pets.value.filter(p => !cachedPets.some(lp => lp.id === p.id)), ...cachedPets]
      }
      return { success: true, message: '从缓存加载成功' }
    }

    isLoading.value = true
    const { pets: loadedPets, error } = await petService.getPetsByOwner(targetUserId)
    isLoading.value = false

    if (error) {
      const result = handleApiError(error, '加载宠物列表失败')
      return { success: false, message: result.message }
    }

    const mappedPets = loadedPets.map(mapApiPetToPet)
    userPets.value = mappedPets
    
    if (mappedPets.length > 0) {
      pets.value = [...pets.value.filter(p => !mappedPets.some(lp => lp.id === p.id)), ...mappedPets]
    }
    
    cache.set(cacheKey, mappedPets, CACHE_TTL.LONG)

    return { success: true, message: '加载成功' }
  }

  const loadPetById = async (petId: string) => {
    const cacheKey = `pet_${petId}`
    
    isLoading.value = true
    const { pet, error } = await petService.getPetById(petId)
    isLoading.value = false

    if (error) {
      const result = handleApiError(error, '加载宠物详情失败')
      return { success: false, message: result.message }
    }

    if (pet) {
      const mappedPet = mapApiPetToPet(pet)
      const existingIndex = pets.value.findIndex(p => p.id === petId)
      if (existingIndex >= 0) {
        pets.value[existingIndex] = mappedPet
      } else {
        pets.value.push(mappedPet)
      }

      const userExistingIndex = userPets.value.findIndex(p => p.id === petId)
      if (userExistingIndex >= 0) {
        userPets.value[userExistingIndex] = mappedPet
      }

      cache.set(cacheKey, mappedPet, CACHE_TTL.LONG)
    }

    return { success: true, message: '加载成功' }
  }

  const addPet = async (petData: { name: string; avatar?: string; breed?: string; age?: string; description?: string; ownerId?: string }) => {
    const userStore = useUserStore()
    if (!userStore.currentUser) {
      return { success: false, message: '请先登录' }
    }

    isLoading.value = true
    const { pet, error } = await petService.createPet({
      owner_id: petData.ownerId || userStore.currentUser.id,
      name: petData.name,
      avatar_url: petData.avatar || undefined,
      breed: petData.breed || undefined,
      gender: undefined,
      birth_date: parseAgeToBirthDate(petData.age || ''),
      weight: undefined,
      color: undefined,
      personality: petData.description || undefined
    })
    isLoading.value = false

    if (error) {
      const result = handleApiError(error, '创建宠物失败')
      return { success: false, message: result.message }
    }

    if (pet) {
      const mappedPet = mapApiPetToPet(pet)
      pets.value.push(mappedPet)
      userPets.value.push(mappedPet)
      return { success: true, message: '创建成功', pet: mappedPet }
    }

    return { success: false, message: '创建失败' }
  }

  const updatePet = async (petId: string, petData: Partial<Pet>) => {
    isLoading.value = true
    const { pet, error } = await petService.updatePet(petId, {
      name: petData.name,
      avatar_url: petData.avatar || petData.avatar_url,
      breed: petData.breed,
      gender: undefined,
      birth_date: parseAgeToBirthDate(petData.age || ''),
      weight: undefined,
      color: undefined,
      personality: petData.description || petData.personality
    })
    isLoading.value = false

    if (error) {
      const result = handleApiError(error, '更新宠物失败')
      return { success: false, message: result.message }
    }

    if (pet) {
      const mappedPet = mapApiPetToPet(pet)
      const index = pets.value.findIndex(p => p.id === petId)
      if (index >= 0) {
        pets.value[index] = mappedPet
      }

      const userIndex = userPets.value.findIndex(p => p.id === petId)
      if (userIndex >= 0) {
        userPets.value[userIndex] = mappedPet
      }

      cache.remove(`pet_${petId}`)

      return { success: true, message: '更新成功', pet: mappedPet }
    }

    return { success: false, message: '更新失败' }
  }

  const deletePet = async (petId: string) => {
    isLoading.value = true
    const { success, message, error } = await petService.deletePet(petId)
    isLoading.value = false

    if (!success) {
      logger.warn('删除宠物失败:', message)
      return { success: false, message, error }
    }

    pets.value = pets.value.filter(p => p.id !== petId)
    userPets.value = userPets.value.filter(p => p.id !== petId)

    if (selectedPetId.value === petId) {
      selectedPetId.value = null
    }

    cache.remove(`pet_${petId}`)
    const userStore = useUserStore()
    if (userStore.currentUser) {
      cache.remove(`user_pets_${userStore.currentUser.id}`)
    }

    return { success: true, message, error: null }
  }

  const updatePetAvatar = async (petId: string, avatarUrl: string) => {
    const petIndex = pets.value.findIndex(p => p.id === petId)
    if (petIndex !== -1) {
      pets.value[petIndex] = { ...pets.value[petIndex], avatar: avatarUrl }
    }

    const userPetIndex = userPets.value.findIndex(p => p.id === petId)
    if (userPetIndex !== -1) {
      userPets.value[userPetIndex] = { ...userPets.value[userPetIndex], avatar: avatarUrl }
    }

    await petService.updatePet(petId, { avatar_url: avatarUrl })
  }

  const petPawsCount = ref<Record<string, number>>({})
  const userPawedToday = ref<Record<string, boolean>>({})

  const addPetPaw = async (petId: string): Promise<{ success: boolean; message: string }> => {
    const userStore = useUserStore()
    if (!userStore.currentUser) {
      return { success: false, message: '请先登录' }
    }

    const { success, message } = await petPawService.addPaw(userStore.currentUser.id, petId)

    if (success) {
      if (petPawsCount.value[petId] !== undefined) {
        petPawsCount.value[petId]++
      }
      userPawedToday.value[`${userStore.currentUser.id}_${petId}`] = true
    }

    return { success, message }
  }

  const getPetPawsCount = async (petId: string): Promise<number> => {
    if (petPawsCount.value[petId] !== undefined) {
      return petPawsCount.value[petId]
    }

    const count = await petPawService.getPawsCount(petId)
    petPawsCount.value[petId] = count
    return count
  }

  const checkHasPawedToday = async (petId: string): Promise<boolean> => {
    const userStore = useUserStore()
    if (!userStore.currentUser) return false

    const cacheKey = `${userStore.currentUser.id}_${petId}`
    if (userPawedToday.value[cacheKey] !== undefined) {
      return userPawedToday.value[cacheKey]
    }

    const hasPawed = await petPawService.hasPawedToday(userStore.currentUser.id, petId)
    userPawedToday.value[cacheKey] = hasPawed
    return hasPawed
  }

  return {
    pets,
    userPets,
    selectedPet,
    selectedPetId,
    isLoading,
    setSelectedPet,
    getPetById,
    loadUserPets,
    loadPetById,
    addPet,
    updatePet,
    deletePet,
    updatePetAvatar,
    addPetPaw,
    getPetPawsCount,
    checkHasPawedToday
  }
}, {
  persist: {
    key: 'petcircle_pet',
    storage: localStorage,
    paths: ['selectedPetId']
  }
})