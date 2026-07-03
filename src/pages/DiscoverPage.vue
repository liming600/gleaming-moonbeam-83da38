<script setup lang="ts">
import { ref } from 'vue'
import { Search, Sparkles, TrendingUp, Users, Store, Star, BadgeCheck, Heart } from 'lucide-vue-next'
import { usePetStore } from '@/stores/petStore'
import { useRouter } from 'vue-router'
import { businessCategories, mockBusinesses, mockBloggers } from '@/mock/business'

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

const formatFollowers = (count: number) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

const handleCategoryClick = (key: string) => {
  console.log('Category:', key)
}

const handleBusinessClick = (id: string) => {
  console.log('Business:', id)
}

const handleBloggerClick = (id: string) => {
  console.log('Blogger:', id)
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
            placeholder="搜索宠物、商家、话题..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>
    </header>

    <div class="page-content content">
      <!-- 热门话题 -->
      <div class="section">
        <div class="section-header">
          <TrendingUp :size="20" class="section-icon" />
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

      <!-- 人气宠物 -->
      <div class="section">
        <div class="section-header">
          <Users :size="20" class="section-icon" />
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

      <!-- 商家快捷入口 -->
      <div class="business-section">
        <div class="business-categories">
          <button
            v-for="cat in businessCategories"
            :key="cat.key"
            class="category-btn"
            @click="handleCategoryClick(cat.key)"
          >
            <div class="category-icon" :style="{ background: cat.color + '15' }">
              <span>{{ cat.icon }}</span>
            </div>
            <span class="category-label">{{ cat.label }}</span>
          </button>
        </div>
      </div>

      <!-- 精选商家推荐（横向滑动） -->
      <div class="section">
        <div class="section-header">
          <Store :size="20" class="section-icon" />
          <h2 class="section-title">精选商家</h2>
          <span class="section-more">查看更多</span>
        </div>
        <div class="business-scroll">
          <div
            v-for="biz in mockBusinesses"
            :key="biz.id"
            class="business-card"
            @click="handleBusinessClick(biz.id)"
          >
            <div class="business-cover-wrapper">
              <img :src="biz.cover" :alt="biz.name" class="business-cover" />
              <span class="business-type-tag">{{ biz.typeIcon }} {{ biz.typeName }}</span>
              <span v-if="biz.isVerified" class="verified-badge">
                <BadgeCheck :size="12" /> 认证
              </span>
            </div>
            <div class="business-info">
              <div class="business-name-row">
                <img :src="biz.logo" :alt="biz.name" class="business-logo" />
                <div class="business-detail">
                  <h3 class="business-name">{{ biz.name }}</h3>
                  <div class="business-meta">
                    <span class="rating">
                      <Star :size="12" class="star-icon" />
                      {{ biz.rating }}
                    </span>
                    <span class="distance">· {{ biz.distance }}</span>
                  </div>
                </div>
              </div>
              <div class="business-promotion">
                <span class="promo-tag">🎉 {{ biz.promotion }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 达人动态（横向滑动） -->
      <div class="section">
        <div class="section-header">
          <Sparkles :size="20" class="section-icon" />
          <h2 class="section-title">达人动态</h2>
          <span class="section-more">查看更多</span>
        </div>
        <div class="bloggers-scroll">
          <div
            v-for="blogger in mockBloggers"
            :key="blogger.id"
            class="blogger-card"
            @click="handleBloggerClick(blogger.id)"
          >
            <div class="blogger-header">
              <img :src="blogger.avatar" :alt="blogger.name" class="blogger-avatar" />
              <div class="blogger-info">
                <div class="blogger-name-row">
                  <span class="blogger-name">{{ blogger.name }}</span>
                  <BadgeCheck v-if="blogger.isVerified" :size="12" class="verified-icon" />
                </div>
                <span class="blogger-stats">{{ formatFollowers(blogger.followers) }}粉丝</span>
              </div>
              <button class="follow-btn">关注</button>
            </div>
            <div class="blogger-post">
              <span v-if="blogger.latestPost.isAd" class="ad-tag">广告</span>
              <span class="post-specialty">{{ blogger.specialty }}</span>
              <img :src="blogger.latestPost.cover" :alt="blogger.latestPost.title" class="post-cover" />
              <p class="post-title">{{ blogger.latestPost.title }}</p>
              <div class="post-meta">
                <span class="post-likes">
                  <Heart :size="12" />
                  {{ blogger.latestPost.likes }}
                </span>
              </div>
            </div>
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

/* 商家快捷入口 */
.business-section {
  margin-bottom: 16px;
}

.business-categories {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  background: #fff;
  border-radius: 20px;
  padding: 16px 8px;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-btn:active {
  transform: scale(0.95);
}

.category-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.category-label {
  font-size: 11px;
  font-weight: 500;
  color: #57534E;
}

/* 通用 Section */
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
  flex-shrink: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #292524;
  flex: 1;
}

.section-more {
  font-size: 13px;
  color: #A8A29E;
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}

/* 精选商家 - 横向滑动 */
.business-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0 8px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.business-scroll::-webkit-scrollbar {
  display: none;
}

.business-card {
  flex-shrink: 0;
  width: 240px;
  background: #FAFAF9;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.business-card:active {
  transform: scale(0.98);
}

.business-cover-wrapper {
  position: relative;
  width: 100%;
  height: 100px;
  overflow: hidden;
}

.business-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.business-type-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 3px 8px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.verified-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 3px 6px;
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: #fff;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 2px;
}

.business-info {
  padding: 10px 12px;
}

.business-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.business-logo {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.business-detail {
  flex: 1;
  min-width: 0;
}

.business-name {
  font-size: 14px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.business-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #F97316;
  font-weight: 600;
}

.star-icon {
  fill: #F97316;
}

.distance {
  color: #A8A29E;
}

.business-promotion {
  margin-bottom: 0;
}

.promo-tag {
  display: inline-block;
  padding: 3px 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
}

/* 达人动态 - 横向滑动 */
.bloggers-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0 8px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.bloggers-scroll::-webkit-scrollbar {
  display: none;
}

.blogger-card {
  flex-shrink: 0;
  width: 220px;
  background: #FAFAF9;
  border-radius: 16px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.blogger-card:active {
  transform: scale(0.98);
}

.blogger-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.blogger-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.blogger-info {
  flex: 1;
  min-width: 0;
}

.blogger-name-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}

.blogger-name {
  font-size: 13px;
  font-weight: 600;
  color: #292524;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.verified-icon {
  color: #3B82F6;
  flex-shrink: 0;
}

.blogger-stats {
  font-size: 11px;
  color: #A8A29E;
}

.follow-btn {
  padding: 5px 12px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(251, 146, 60, 0.3);
  flex-shrink: 0;
}

.follow-btn:active {
  transform: scale(0.95);
}

.blogger-post {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ad-tag {
  display: inline-block;
  align-self: flex-start;
  padding: 2px 6px;
  background: rgba(168, 162, 158, 0.2);
  color: #78716C;
  border-radius: 4px;
  font-size: 10px;
}

.post-specialty {
  display: inline-block;
  align-self: flex-start;
  padding: 2px 8px;
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.post-cover {
  width: 100%;
  height: 100px;
  border-radius: 10px;
  object-fit: cover;
}

.post-title {
  font-size: 13px;
  font-weight: 500;
  color: #292524;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.post-likes {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #A8A29E;
}

/* 热门话题 */
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

/* 人气宠物 */
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
</style>
