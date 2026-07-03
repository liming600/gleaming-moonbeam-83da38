<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, MessageCircle, Send, ThumbsUp } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useHelpStore } from '@/stores/helpStore'

const route = useRoute()
const router = useRouter()
const helpStore = useHelpStore()

const answerText = ref('')

const helpId = computed(() => route.params.id as string)

const helpPost = computed(() => {
  return helpStore.getHelpPostById(helpId.value)
})

const answers = ref([
  { id: '1', author: '兽医小李', avatar: '', content: '建议先停换新粮，喂益生菌调理，慢慢过渡', likes: 28, isLiked: false },
  { id: '2', author: '资深铲屎官', avatar: '', content: '可以试试布拉迪酵母，效果不错', likes: 15, isLiked: false },
  { id: '3', author: '新手养猫', avatar: '', content: '我家猫之前也这样，换粮要循序渐进', likes: 8, isLiked: false }
])

const back = () => {
  router.back()
}

const toggleLike = (answerId: string) => {
  const answer = answers.value.find(a => a.id === answerId)
  if (answer) {
    answer.isLiked = !answer.isLiked
    answer.likes += answer.isLiked ? 1 : -1
  }
}

const submitAnswer = () => {
  if (!answerText.value.trim()) return

  answers.value.push({
    id: String(Date.now()),
    author: '我',
    avatar: '',
    content: answerText.value,
    likes: 0,
    isLiked: false
  })
  answerText.value = ''
}
</script>

<template>
  <div class="help-detail-page">
    <header class="header">
      <button class="back-btn" @click="back">
        <ArrowLeft :size="24" />
      </button>
      <h1 class="header-title">求助详情</h1>
      <div class="header-placeholder"></div>
    </header>

    <div v-if="helpPost" class="help-content">
      <div class="help-header">
        <img :src="helpPost.authorAvatar" :alt="helpPost.authorName" class="author-avatar" />
        <div class="author-info">
          <span class="author-name">{{ helpPost.authorName }}</span>
          <span class="post-time">{{ helpPost.createdAt }}</span>
        </div>
        <span class="zone-tag">
          {{ helpStore.getZoneConfig(helpPost.zone).icon }} {{ helpPost.zoneLabel }}
        </span>
      </div>

      <div v-if="helpPost.isUrgent" class="urgent-badge">
        <span class="urgent-icon">🔴</span>
        <span>紧急求助</span>
      </div>

      <h2 class="help-title">{{ helpPost.title }}</h2>
      <p class="help-text">{{ helpPost.content }}</p>

      <div v-if="helpPost.acceptedAnswer" class="accepted-answer">
        <div class="accepted-header">
          <span class="accepted-badge">✅ 已采纳答案</span>
        </div>
        <p class="accepted-text">{{ helpPost.acceptedAnswer }}</p>
      </div>
    </div>

    <div class="answers-section">
      <h3 class="answers-title">回答 ({{ answers.length }})</h3>

      <div v-for="answer in answers" :key="answer.id" class="answer-item">
        <div class="answer-avatar">👤</div>
        <div class="answer-content">
          <div class="answer-header">
            <span class="answer-author">{{ answer.author }}</span>
          </div>
          <p class="answer-text">{{ answer.content }}</p>
          <div class="answer-footer">
            <button class="like-btn" @click="toggleLike(answer.id)">
              <ThumbsUp :size="16" :class="{ 'liked': answer.isLiked }" />
              <span>{{ answer.likes }}</span>
            </button>
            <button class="reply-btn">
              <MessageCircle :size="16" />
              <span>回复</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="answer-input-section">
      <input
        v-model="answerText"
        type="text"
        placeholder="发表回答..."
        class="answer-input"
        @keyup.enter="submitAnswer"
      />
      <button class="send-btn" @click="submitAnswer">
        <Send :size="18" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.help-detail-page {
  min-height: 100vh;
  background-color: #FFF9F5;
  padding-bottom: 80px;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 249, 245, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #fff;
  color: #292524;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #292524;
}

.header-placeholder {
  width: 40px;
}

.help-content {
  padding: 80px 16px 24px;
}

.help-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
  color: #292524;
}

.post-time {
  font-size: 13px;
  color: #A8A29E;
  margin-top: 2px;
}

.zone-tag {
  padding: 6px 12px;
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

.urgent-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #EF4444;
  color: #fff;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
  animation: pulse 2s ease-in-out infinite;
}

.urgent-icon {
  animation: blink 1s ease-in-out infinite;
}

.help-title {
  font-size: 20px;
  font-weight: 700;
  color: #292524;
  margin-bottom: 12px;
}

.help-text {
  font-size: 16px;
  line-height: 1.6;
  color: #57534E;
  margin-bottom: 20px;
}

.accepted-answer {
  background: rgba(34, 197, 94, 0.08);
  border-radius: 16px;
  padding: 16px;
  border-left: 4px solid #22C55E;
}

.accepted-header {
  margin-bottom: 8px;
}

.accepted-badge {
  padding: 4px 10px;
  background: #22C55E;
  color: #fff;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.accepted-text {
  font-size: 15px;
  color: #57534E;
  line-height: 1.5;
}

.answers-section {
  padding: 0 16px;
}

.answers-title {
  font-size: 16px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 16px;
}

.answer-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 12px;
}

.answer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #F5F5F4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.answer-content {
  flex: 1;
}

.answer-header {
  margin-bottom: 8px;
}

.answer-author {
  font-size: 15px;
  font-weight: 600;
  color: #292524;
}

.answer-text {
  font-size: 15px;
  color: #57534E;
  line-height: 1.5;
  margin-bottom: 12px;
}

.answer-footer {
  display: flex;
  gap: 24px;
}

.like-btn,
.reply-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #A8A29E;
  font-size: 13px;
  cursor: pointer;
  border-radius: 12px;
}

.like-btn:active,
.reply-btn:active {
  background: rgba(249, 115, 22, 0.05);
}

.like-btn .liked {
  color: #F97316;
}

.answer-input-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #F5F5F4;
}

.answer-input {
  flex: 1;
  height: 44px;
  padding: 0 16px;
  border: 2px solid #E7E5E4;
  border-radius: 22px;
  font-size: 15px;
  color: #292524;
  outline: none;
  transition: all 0.2s ease;
}

.answer-input:focus {
  border-color: #F97316;
}

.answer-input::placeholder {
  color: #A8A29E;
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
