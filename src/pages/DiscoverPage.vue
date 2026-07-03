<script setup lang="ts">
import { ref } from 'vue'
import { Search, Sparkles, TrendingUp, Users } from 'lucide-vue-next'
import { usePetStore } from '@/stores/petStore'
import { useRouter } from 'vue-router'

const petStore = usePetStore()
const router = useRouter()
const searchQuery = ref('')

const trendingTags = ['#萌宠', '#可爱', '#日常', '#调皮', '#吃货', '#户外']

const topPets = petStore.pets.slice(0, 4)

const goToPetProfile = (petId: string) => {
  router.push(`/pet/${petId}`)
}

const handleSearch = () => {
  console.log('Search:', searchQuery.value)
}
</script>

<template>
  <div class="discover-page">
    <header class="header">
      <div class="page-content">
        <div class="search-box">
          <Search :size="18" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索宠物、话题..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>
    </header>

    <div class="page-content content">
      <div class="section">
        <div class="section-header">
          <Sparkles :size="20" class="section-icon" />
          <h2 class="section-title">热门话题</h2>
        </div>
        <div class="tags-grid">
          <button
            v-for="tag in trendingTags"
            :key="tag"
            class="tag-item"
            @click="handleSearch"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <TrendingUp :size="20" class="section-icon" />
          <h2 class="section-title">人气宠物</h2>
        </div>
        <div class="pets-grid">
          <div
            v-for="pet in topPets"
            :key="pet.id"
            class="pet-card"
            @click="goToPetProfile(pet.id)"
          >
            <img :src="pet.avatar" :alt="pet.name" class="pet-avatar" />
            <div class="pet-info">
              <span class="pet-name">{{ pet.name }}</span>
              <span class="pet-likes">❤️ {{ pet.likes }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <Users :size="20" class="section-icon" />
          <h2 class="section-title">发现新朋友</h2>
        </div>
        <div class="friends-list">
          <div
            v-for="pet in petStore.pets.slice(4)"
            :key="pet.id"
            class="friend-item"
            @click="goToPetProfile(pet.id)"
          >
            <img :src="pet.avatar" :alt="pet.name" class="friend-avatar" />
            <div class="friend-info">
              <span class="friend-name">{{ pet.name }}</span>
              <span class="friend-breed">{{ pet.breed }}</span>
            </div>
            <button class="follow-btn">关注</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.discover-page {
  min-height: 100vh;
  background-color: #FFF9F5;
  padding-bottom: 80px;
}

.header {
  background: #fff;
  border-bottom: 1px solid #F5F5F4;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #A8A29E;
}

.search-input {
  width: 100%;
  height: 44px;
  padding: 0 16px 0 44px;
  background: #F5F5F4;
  border: none;
  border-radius: 22px;
  font-size: 15px;
  color: #292524;
  outline: none;
}

.search-input::placeholder {
  color: #A8A29E;
}

.content {
  padding: 16px;
}

.section {
  background: #fff;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-icon {
  color: #F97316;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #292524;
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  padding: 10px 18px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(251, 146, 60, 0.1));
  color: #F97316;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-item:active {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}

.pets-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.pet-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.pet-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  background: linear-gradient(#fff, #fff) padding-box,
              linear-gradient(135deg, #F97316, #FB923C) border-box;
}

.pet-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pet-name {
  font-size: 13px;
  font-weight: 600;
  color: #292524;
}

.pet-likes {
  font-size: 11px;
  color: #A8A29E;
}

.friends-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.friend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #F5F5F4;
  border-radius: 16px;
  cursor: pointer;
}

.friend-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}

.friend-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.friend-name {
  font-size: 15px;
  font-weight: 600;
  color: #292524;
}

.friend-breed {
  font-size: 13px;
  color: #A8A29E;
  margin-top: 2px;
}

.follow-btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(251, 146, 60, 0.3);
}

.follow-btn:active {
  transform: scale(0.98);
}
</style>
