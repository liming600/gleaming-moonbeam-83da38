import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { petService } from '@/services/petService'
import type { Pet as ApiPet } from '@/services/petService'
import { mockPets, currentUserPets, type Pet } from '@/mock/pets'
import { useUserStore } from './userStore'

const mapApiPetToPet = (apiPet: ApiPet): Pet => ({
  id: apiPet.id,
  name: apiPet.name,
  breed: apiPet.breed || '',
  age: apiPet.birth_date ? calculateAge(apiPet.birth_date) : '',
  avatar: apiPet.avatar_url || '',
  avatar_url: apiPet.avatar_url,
  coverImage: '',
  description: apiPet.personality || '',
  posts: 0,
  likes: 0,
  followers: 0,
  createdAt: apiPet.created_at || '',
  created_at: apiPet.created_at,
  ownerId: apiPet.owner_id,
  owner_id: apiPet.owner_id,
  ownerName: '',
  ownerAvatar: '',
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

export const usePetStore = defineStore('pet', () => {
  const pets = ref<Pet[]>(mockPets)
  const userPets = ref<Pet[]>(currentUserPets)
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

  const loadUserPets = async () => {
    const userStore = useUserStore()
    if (!userStore.currentUser) return

    isLoading.value = true
    const { pets: loadedPets, error } = await petService.getPetsByOwner(userStore.currentUser.id)
    isLoading.value = false

    if (error) {
      console.warn('加载宠物列表失败:', error.message)
      return { success: false, message: error.message }
    }

    if (loadedPets.length > 0) {
      const mappedPets = loadedPets.map(mapApiPetToPet)
      userPets.value = mappedPets
      pets.value = [...pets.value.filter(p => !mappedPets.some(lp => lp.id === p.id)), ...mappedPets]
    }

    return { success: true, message: '加载成功' }
  }

  const loadPetById = async (petId: string) => {
    isLoading.value = true
    const { pet, error } = await petService.getPetById(petId)
    isLoading.value = false

    if (error) {
      console.warn('加载宠物详情失败:', error.message)
      return { success: false, message: error.message }
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
    }

    return { success: true, message: '加载成功' }
  }

  const addPet = async (petData: Omit<Pet, 'id' | 'created_at' | 'updated_at'>) => {
    const userStore = useUserStore()
    if (!userStore.currentUser) {
      return { success: false, message: '请先登录' }
    }

    isLoading.value = true
    const { pet, error } = await petService.createPet({
      owner_id: userStore.currentUser.id,
      name: petData.name,
      avatar_url: petData.avatar || petData.avatar_url,
      breed: petData.breed,
      gender: undefined,
      birth_date: undefined,
      weight: undefined,
      color: undefined,
      personality: petData.description
    })
    isLoading.value = false

    if (error) {
      console.warn('创建宠物失败:', error.message)
      return { success: false, message: error.message }
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
      birth_date: undefined,
      weight: undefined,
      color: undefined,
      personality: petData.description
    })
    isLoading.value = false

    if (error) {
      console.warn('更新宠物失败:', error.message)
      return { success: false, message: error.message }
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

      return { success: true, message: '更新成功', pet: mappedPet }
    }

    return { success: false, message: '更新失败' }
  }

  const deletePet = async (petId: string) => {
    isLoading.value = true
    const { error } = await petService.deletePet(petId)
    isLoading.value = false

    if (error) {
      console.warn('删除宠物失败:', error.message)
      return { success: false, message: error.message }
    }

    pets.value = pets.value.filter(p => p.id !== petId)
    userPets.value = userPets.value.filter(p => p.id !== petId)

    if (selectedPetId.value === petId) {
      selectedPetId.value = null
    }

    return { success: true, message: '删除成功' }
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
    updatePetAvatar
  }
}, {
  persist: {
    key: 'petcircle_pet',
    storage: localStorage,
    paths: ['selectedPetId']
  }
})