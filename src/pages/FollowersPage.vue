<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, UserCheck } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const type = computed(() => route.query.type as string || 'followers')
const userId = computed(() => route.params.id as string || userStore.currentUser?.id)
const pageTitle = computed(() => type.value === 'followers' ? '我的粉丝' : '我的关注')

const followers = ref<any[]>([])
const isLoading = ref(false)

const goBack = () => {
  router.back()
}

const goToUserProfile = (userId: string) => {
  router.push(`/user/${userId}`)
}

onMounted(async () => {
  isLoading.value = true
  await loadFollowers()
  isLoading.value = false
})

const loadFollowers = async () => {
  const { default: supabase } = await import('@/supabase/supabaseClient')
  
  let userIds: string[] = []
  
  if (type.value === 'followers') {
    const { data, error } = await supabase.from('follows')
      .select('follower_id')
      .eq('following_id', userId.value)
    
    if (!error && data) {
      userIds = data.map((item: { follower_id: string }) => item.follower_id)
    }
  } else {
    const { data, error } = await supabase.from('follows')
      .select('following_id')
      .eq('follower_id', userId.value)
    
    if (!error && data) {
      userIds = data.map((item: { following_id: string }) => item.following_id)
    }
  }
  
  if (userIds.length > 0) {
    const { data: usersData } = await supabase.from('users')
      .select('id, name, avatar_url')
      .in('id', userIds)
    
    if (usersData) {
      followers.value = usersData
    }
  }
}
</script>

<template>
  <div class="followers-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft :size="20" />
      </button>
      <h1 class="page-title">{{ pageTitle }}</h1>
      <div class="placeholder"></div>
    </div>

    <div class="page-content">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="followers.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>{{ type === 'followers' ? '还没有粉丝' : '还没有关注' }}</h3>
        <p>{{ type === 'followers' ? '快去发布精彩内容吸引粉丝吧' : '快去关注有趣的用户吧' }}</p>
      </div>

      <div v-else class="followers-list">
        <div
          v-for="follower in followers"
          :key="follower.id"
          class="follower-item"
        >
          <div class="follower-info" @click="goToUserProfile(follower.id)">
            <img 
              :src="follower.avatar_url || 'https://neeko-copilot.bytedance.net/api/text2image?prompt=cute%20pet%20lover%20avatar&image_size=square'" 
              :alt="follower.name" 
              class="follower-avatar" 
            />
            <div class="follower-details">
              <h4 class="follower-name">{{ follower.name }}</h4>
              <p class="follower-meta">铲屎官</p>
            </div>
          </div>
          <button class="follow-btn">
            <UserCheck :size="16" />
            <span>已关注</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.followers-page {
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

.placeholder {
  width: 40px;
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
  font-size: 64px;
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
}

.followers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.follower-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.follower-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  cursor: pointer;
}

.follower-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #F5F5F4;
}

.follower-details {
  display: flex;
  flex-direction: column;
}

.follower-name {
  font-size: 15px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 2px;
}

.follower-meta {
  font-size: 12px;
  color: #A8A29E;
}

.follow-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
</style>