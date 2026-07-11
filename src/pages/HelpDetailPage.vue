<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, MessageCircle, Send, ThumbsUp, CheckCircle, Trash2, Edit3 } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useHelpStore } from '@/stores/helpStore'
import { useUserStore } from '@/stores/userStore'
import { useUiStore } from '@/stores/uiStore'
import { helpService, type HelpAnswer } from '@/services/helpService'
import ActionMenu from '@/components/ActionMenu.vue'

const route = useRoute()
const router = useRouter()
const helpStore = useHelpStore()
const userStore = useUserStore()
const uiStore = useUiStore()

const answerText = ref('')
const answers = ref<HelpAnswer[]>([])
const isLoading = ref(true)

const helpId = computed(() => route.params.id as string)

const helpPost = computed(() => {
  return helpStore.getHelpPostById(helpId.value)
})

const isAuthor = computed(() => {
  return helpPost.value && userStore.currentUser?.id === helpPost.value.authorId
})

const helpMenuItems = computed(() => {
  return [
    { icon: Edit3, label: '编辑', action: editHelpPost },
    { icon: Trash2, label: '删除', action: deleteHelpPost, danger: true }
  ]
})

const handleHelpMenuSelect = (item: { label: string; action: () => void | Promise<void> }) => {
  item.action()
}

const handleAnswerMenuSelect = (item: { label: string; action: () => void | Promise<void> }) => {
  item.action()
}

const canAcceptAnswer = computed(() => {
  return helpPost.value && isAuthor.value && helpPost.value.status !== 'resolved'
})

const back = () => {
  router.back()
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const relativeTimePatterns = ['刚刚', '分钟前', '小时前', '昨天', '天前']
  if (relativeTimePatterns.some(pattern => dateString.includes(pattern))) {
    return dateString
  }
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return dateString
  }
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

const isSubmittingAnswer = ref(false)

const submitAnswer = async () => {
  if (!answerText.value.trim()) return
  if (!userStore.currentUser) return
  if (isSubmittingAnswer.value) return

  isSubmittingAnswer.value = true

  try {
    const { answer, error } = await helpService.createAnswer(
      helpId.value,
      userStore.currentUser.id,
      answerText.value
    )

    if (!error && answer) {
      answers.value.push(answer)
      const post = helpStore.helpPosts.find(p => p.id === helpId.value)
      if (post) post.answers += 1
      answerText.value = ''
    }
  } finally {
    isSubmittingAnswer.value = false
  }
}

const deleteAnswer = async (answerId: string) => {
  if (!userStore.currentUser) return

  const answer = answers.value.find(a => a.id === answerId)
  if (!answer || answer.author_id !== userStore.currentUser.id) return

  try {
    console.log('[HelpDetail] 开始删除回答:', answerId)
    const { success, error } = await helpService.deleteAnswer(answerId)
    console.log('[HelpDetail] 删除回答结果:', success, error?.message)
    if (success) {
      answers.value = answers.value.filter(a => a.id !== answerId)
      const post = helpStore.helpPosts.find(p => p.id === helpId.value)
      if (post) post.answers = Math.max(0, post.answers - 1)
      uiStore.showSuccessToast('删除成功')
    } else {
      console.error('删除回答失败:', error?.message)
      uiStore.showErrorToast(error?.message || '删除失败')
    }
  } catch (e) {
    console.error('删除回答异常:', e)
    uiStore.showErrorToast('删除过程中发生错误')
  }
}

const acceptAnswer = async (answerId: string) => {
  if (!userStore.currentUser || !isAuthor.value) {
    uiStore.showWarningToast('只有帖子作者才能采纳回答')
    return
  }
  
  try {
    const result = await helpStore.acceptAnswer(helpId.value, answerId)
    if (result.success) {
      answers.value = answers.value.map(a => ({
        ...a,
        is_accepted: a.id === answerId ? true : a.is_accepted
      }))
      uiStore.showSuccessToast('采纳成功，问题已解决')
    } else {
      console.error('采纳失败:', result.message)
      uiStore.showErrorToast(result.message || '采纳失败，请稍后重试')
    }
  } catch (e) {
    console.error('采纳异常:', e)
    uiStore.showErrorToast('采纳过程中发生错误')
  }
}

const endHelp = async () => {
  if (!userStore.currentUser || !isAuthor.value) return
  
  try {
    const result = await helpStore.endHelp(helpId.value)
    if (result.success) {
      uiStore.showSuccessToast('求助已结束，问题已解决')
      await loadAnswers()
    } else {
      console.error('结束求助失败:', result.message)
      uiStore.showErrorToast(result.message || '结束求助失败')
    }
  } catch (e) {
    console.error('结束求助异常:', e)
    uiStore.showErrorToast('结束求助过程中发生错误')
  }
}

const deleteHelpPost = async () => {
  try {
    console.log('[HelpDetail] 开始删除求助帖:', helpId.value)
    const { success, message } = await helpStore.deleteHelpPost(helpId.value)
    console.log('[HelpDetail] 删除求助帖结果:', success, message)
    if (success) {
      uiStore.showSuccessToast('删除成功')
      setTimeout(() => {
        router.back()
      }, 1000)
    } else {
      uiStore.showErrorToast(message || '删除失败')
    }
  } catch (error) {
    console.error('[HelpDetail] 删除求助帖出错:', error)
    uiStore.showErrorToast('删除失败，请稍后重试')
  }
}

const editHelpPost = () => {
  router.push(`/help-create?id=${helpId.value}`)
}

const loadAnswers = async () => {
  isLoading.value = true
  const { answers: loadedAnswers, error } = await helpService.getAnswers(helpId.value)
  if (!error) {
    answers.value = [...loadedAnswers].sort((a, b) => {
      if (a.is_accepted && !b.is_accepted) return -1
      if (!a.is_accepted && b.is_accepted) return 1
      return 0
    })
  }
  isLoading.value = false
}

onMounted(async () => {
  await helpStore.loadHelpPostById(helpId.value)
  await loadAnswers()
})
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
        <div class="status-container">
          <span v-if="helpPost.zone !== 'experience' && helpPost.status === 'resolved'" class="status-tag resolved">
            已解决
          </span>
          <span 
            v-else-if="helpPost.zone !== 'experience' && isAuthor && helpPost.status !== 'resolved'" 
            class="status-tag end-help-btn"
            @click="endHelp"
          >
            结束求助
          </span>
          <div v-if="isAuthor" class="help-action-menu">
            <ActionMenu :items="helpMenuItems" @select="handleHelpMenuSelect" />
          </div>
        </div>
      </div>

      <div v-if="helpPost.isUrgent && helpPost.status !== 'resolved'" class="urgent-badge">
        <span class="urgent-icon">🔴</span>
        <span>紧急求助</span>
      </div>

      <h2 class="help-title">{{ helpPost.title }}</h2>
      <p class="help-text">{{ helpPost.content }}</p>
    </div>

    <div class="answers-section">
      <h3 class="answers-title">回答 ({{ answers.length }})</h3>

      <div v-for="answer in answers" :key="answer.id" class="answer-item" :class="{ accepted: helpPost?.zone !== 'experience' && answer.is_accepted }">
        <img 
          :src="answer.author_avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20avatar%20friendly%20face&image_size=square'" 
          :alt="answer.author_name" 
          class="answer-avatar" 
        />
        <div class="answer-content">
          <div class="answer-header">
            <span class="answer-author">{{ answer.author_name }}</span>
            <div class="answer-header-right">
              <span class="answer-time">{{ formatDate(answer.created_at) }}</span>
              <div v-if="userStore.currentUser?.id === answer.author_id" class="answer-action-menu">
                <ActionMenu 
                  :items="[
                    { icon: Trash2, label: '删除回答', action: () => deleteAnswer(answer.id), danger: true }
                  ]" 
                  @select="handleAnswerMenuSelect"
                />
              </div>
              <button 
                v-if="helpPost?.zone !== 'experience' && canAcceptAnswer && !answer.is_accepted" 
                class="accept-btn" 
                @click="acceptAnswer(answer.id)"
              >
                <CheckCircle :size="14" />
                <span>采纳</span>
              </button>
              <span v-if="helpPost?.zone !== 'experience' && answer.is_accepted" class="accepted-badge">
                <CheckCircle :size="14" />
                <span>已采纳</span>
              </span>
            </div>
          </div>
          <p class="answer-text">{{ answer.content }}</p>
          <div class="answer-footer">
            <button class="like-btn">
              <ThumbsUp :size="16" />
              <span>点赞</span>
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
  align-items: flex-start;
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

.status-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.status-tag.open,
.status-tag.taken {
  background: rgba(249, 115, 22, 0.15);
  color: #F97316;
}

.status-tag.resolved {
  background: rgba(34, 197, 94, 0.15);
  color: #22C55E;
}

.end-help-btn {
  padding: 4px 10px;
  background: rgba(249, 115, 22, 0.15);
  color: #F97316;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.end-help-btn:hover {
  background: rgba(249, 115, 22, 0.25);
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.answer-author {
  font-size: 15px;
  font-weight: 600;
  color: #292524;
  flex-shrink: 0;
}

.answer-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.answer-time {
  font-size: 12px;
  color: #A8A29E;
  flex-shrink: 0;
}

.delete-btn {
  padding: 4px 10px;
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}

.accept-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(34, 197, 94, 0.1);
  color: #22C55E;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.accept-btn:active {
  background: rgba(34, 197, 94, 0.2);
}

.answer-item.accepted {
  background: rgba(34, 197, 94, 0.05);
  border-left: 4px solid #22C55E;
}

.answer-item.accepted .accepted-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #22C55E;
  color: #fff;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
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
