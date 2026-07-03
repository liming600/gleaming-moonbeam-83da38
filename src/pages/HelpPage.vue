<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MessageCircleQuestion, Trophy, BookOpen, ChevronDown, RefreshCw } from 'lucide-vue-next'
import { useHelpStore } from '@/stores/helpStore'
import { useRouter } from 'vue-router'
import { useFeedStore } from '@/stores/feedStore'
import LeaderboardModal from '@/components/LeaderboardModal.vue'

const helpStore = useHelpStore()
const feedStore = useFeedStore()
const router = useRouter()
const showLeaderboardModal = ref(false)
const dailyPetTip = ref<{ title: string; content: string; category: string; tags: string[] } | null>(null)
const isExpanded = ref(false)

onMounted(() => {
  setTimeout(() => {
    dailyPetTip.value = feedStore.getDailyPetTip()
  }, 300)
})

const refreshTip = () => {
  const tips = [
    {
      title: '猫咪呕吐的几种常见原因及应对方法',
      content: '猫咪偶尔呕吐是正常的，但如果频率较高就需要注意了。常见原因包括：1）毛球症：定期梳毛和喂食化毛膏可以预防；2）饮食过快：使用慢食碗；3）食物不新鲜或过敏；4）肠胃疾病：持续呕吐需就医。',
      category: '🐱 猫咪养护',
      tags: ['猫咪', '健康', '呕吐']
    },
    {
      title: '狗狗洗澡的正确频率和注意事项',
      content: '狗狗洗澡频率取决于品种和活动量：短毛犬1-2周一次，长毛犬1周一次。注意事项：1）使用专用宠物沐浴露；2）水温控制在38-40°C；3）避免水进入耳朵和眼睛；4）洗完彻底吹干。',
      category: '🐶 狗狗养护',
      tags: ['狗狗', '洗澡', '护理']
    },
    {
      title: '如何帮助宠物度过炎热夏季',
      content: '夏季高温对宠物是巨大挑战。防暑要点：1）保证充足饮水；2）避免正午外出；3）提供阴凉休息处；4）不要将宠物单独留在车内；5）注意修剪毛发但不要剃光；6）警惕中暑症状。',
      category: '☀️ 季节护理',
      tags: ['防暑', '夏季', '健康']
    },
    {
      title: '宠物口腔护理的重要性和方法',
      content: '口腔问题是宠物常见疾病。护理方法：1）定期刷牙（每周2-3次）；2）提供洁牙零食和玩具；3）定期检查口腔；4）牙结石严重时需专业洗牙。',
      category: '🦷 口腔健康',
      tags: ['口腔', '护理', '牙齿']
    },
    {
      title: '正确的宠物营养配比和喂食原则',
      content: '宠物饮食需遵循：1）选择优质主粮；2）不要喂食人类食物（巧克力、洋葱等有毒）；3）控制零食量；4）定时定量喂食；5）根据年龄和体重调整食量；6）保证新鲜饮水。',
      category: '🍖 营养饮食',
      tags: ['饮食', '营养', '喂食']
    },
    {
      title: '猫咪应激反应的识别和缓解',
      content: '猫咪敏感，环境变化容易应激。表现：躲起来、食欲下降、过度舔毛。缓解方法：1）提供安全空间；2）保持环境稳定；3）使用信息素喷雾；4）耐心安抚，不要强迫互动。',
      category: '🐱 猫咪养护',
      tags: ['猫咪', '应激', '心理']
    },
    {
      title: '宠物疫苗接种时间表和注意事项',
      content: '疫苗是保护宠物健康的关键。幼宠首次免疫：8周开始，间隔3-4周，共3针猫/狗四联+1针狂犬。成年后每年加强。接种前后一周避免洗澡和外出。',
      category: '💉 疫苗接种',
      tags: ['疫苗', '健康', '免疫']
    },
    {
      title: '如何正确训练狗狗定点大小便',
      content: '定点训练关键：1）规律作息，定时带出门；2）选择固定地点；3）成功后及时奖励；4）耐心引导，不要打骂；5）准备尿垫备用；6）循序渐进，一般1-2周可学会。',
      category: '🐶 狗狗训练',
      tags: ['狗狗', '训练', '定点']
    },
    {
      title: '宠物毛发护理的常见误区',
      content: '错误护理会伤害宠物：1）频繁洗澡破坏皮肤屏障；2）用人用梳子伤害毛发；3）吹干不彻底导致皮肤病；4）忽视换毛期护理；5）剪毛过短损伤毛囊。',
      category: '✂️ 毛发护理',
      tags: ['毛发', '护理', '误区']
    },
    {
      title: '老年宠物的特殊照顾要点',
      content: '老年宠物需要更多关爱：1）定期体检，关注器官功能；2）提供易消化的老年粮；3）适当运动但避免过度；4）温暖舒适的休息环境；5）关注牙齿和关节健康；6）多陪伴。',
      category: '👴 老年护理',
      tags: ['老年', '护理', '健康']
    }
  ]
  dailyPetTip.value = tips[Math.floor(Math.random() * tips.length)]
  isExpanded.value = false
}

const zones = [
  { key: 'all', label: '全部', icon: '📋' },
  { key: 'experience', label: '经验', icon: '📚' },
  { key: 'question', label: '问答', icon: '❓' },
  { key: 'rescue', label: '救助', icon: '🚑' },
  { key: 'mutual', label: '互帮', icon: '🤝' }
] as const

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'resolved':
      return 'bg-green-100 text-green-600'
    case 'taken':
      return 'bg-blue-100 text-blue-600'
    default:
      return 'bg-orange-100 text-orange-600'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'resolved':
      return '已解决'
    case 'taken':
      return '已接单'
    default:
      return '求助中'
  }
}

const goToHelpDetail = (id: string) => {
  router.push(`/help/${id}`)
}

const openLeaderboard = () => {
  showLeaderboardModal.value = true
}

const closeLeaderboard = () => {
  showLeaderboardModal.value = false
}
</script>

<template>
  <div class="help-page">
    <header class="header">
      <div class="page-content header-content">
        <div class="logo-area">
          <div class="logo-icon">💬</div>
          <span class="logo-text">互助大厅</span>
        </div>
        <button class="leaderboard-btn" @click="openLeaderboard">
          <Trophy :size="20" />
          <span>热心榜</span>
        </button>
      </div>
    </header>

    <div class="page-content">
      <div v-if="dailyPetTip" class="pet-knowledge-card">
        <div class="card-header">
          <div class="card-left">
            <BookOpen :size="20" class="card-icon" />
            <span class="card-title">今日宠知识</span>
          </div>
          <button class="refresh-btn" @click="refreshTip">
            <RefreshCw :size="16" />
          </button>
        </div>
        <div class="card-body">
          <span class="tip-category">{{ dailyPetTip.category }}</span>
          <h3 class="tip-title">{{ dailyPetTip.title }}</h3>
          <div class="tip-content" :class="{ expanded: isExpanded }">
            <p>{{ dailyPetTip.content }}</p>
          </div>
          <button class="expand-btn" @click="isExpanded = !isExpanded">
            <span>{{ isExpanded ? '收起详情' : '查看详情' }}</span>
            <ChevronDown :size="16" :class="{ rotated: isExpanded }" />
          </button>
        </div>
        <div class="card-footer">
          <span
            v-for="tag in dailyPetTip.tags"
            :key="tag"
            class="tip-tag"
          >
            #{{ tag }}
          </span>
        </div>
      </div>

      <div class="zone-tabs">
        <button
          v-for="zone in zones"
          :key="zone.key"
          class="zone-tab"
          :class="{ active: helpStore.currentZone === zone.key }"
          @click="helpStore.setZone(zone.key)"
        >
          <span class="zone-icon">{{ zone.icon }}</span>
          <span class="zone-label">{{ zone.label }}</span>
        </button>
      </div>

      <div class="help-list">
      <div
        v-for="post in helpStore.filteredPosts"
        :key="post.id"
        class="help-card"
        :class="{ urgent: post.isUrgent }"
        @click="goToHelpDetail(post.id)"
      >
        <div class="help-header">
          <img :src="post.authorAvatar" :alt="post.authorName" class="author-avatar" />
          <div class="author-info">
            <div class="author-row">
              <span class="author-name">{{ post.authorName }}</span>
              <span v-if="post.isUrgent" class="urgent-tag">🔴 紧急</span>
            </div>
            <span class="post-time">{{ post.createdAt }}</span>
          </div>
          <span class="status-tag" :class="getStatusStyle(post.status)">
            {{ getStatusLabel(post.status) }}
          </span>
        </div>

        <h3 class="help-title">{{ post.title }}</h3>
        <p class="help-content">{{ post.content }}</p>

        <div class="help-footer">
          <span class="zone-tag">
            {{ helpStore.getZoneConfig(post.zone).icon }} {{ post.zoneLabel }}
          </span>
          <div class="help-meta">
            <span class="meta-item">
              <MessageCircleQuestion :size="16" />
              <span>{{ post.answers }} 回答</span>
            </span>
          </div>
        </div>

        <div v-if="post.acceptedAnswer" class="accepted-answer">
          <span class="accepted-label">💡 采纳答案：</span>
          <span class="accepted-text">{{ post.acceptedAnswer }}</span>
        </div>
      </div>
    </div>

    <div v-if="helpStore.filteredPosts.length === 0" class="empty-state">
      <span class="empty-icon">📭</span>
      <p>暂无相关内容</p>
    </div>
    </div>

    <LeaderboardModal :show="showLeaderboardModal" @close="closeLeaderboard" />
  </div>
</template>

<style scoped>
.help-page {
  min-height: 100vh;
  background-color: #FFF9F5;
  padding-bottom: 80px;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 249, 245, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(249, 115, 22, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #F97316, #FB923C);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.leaderboard-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  transition: all 0.2s ease;
}

.leaderboard-btn:active {
  transform: scale(0.98);
}

.pet-knowledge-card {
  margin: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  border-radius: 20px;
  color: #fff;
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-icon {
  opacity: 0.9;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  opacity: 0.95;
}

.refresh-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:active {
  transform: rotate(180deg);
  background: rgba(255, 255, 255, 0.3);
}

.card-body {
  margin-bottom: 12px;
}

.tip-category {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.85;
  margin-bottom: 8px;
  display: block;
}

.tip-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 12px;
}

.tip-content {
  max-height: 60px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.tip-content.expanded {
  max-height: 200px;
}

.tip-content p {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.9;
}

.expand-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-btn:active {
  opacity: 0.7;
}

.expand-btn .rotated {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.card-footer {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tip-tag {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.zone-tabs {
  display: flex;
  overflow-x: auto;
  gap: 8px;
  padding: 0 16px;
  margin-bottom: 16px;
  white-space: nowrap;
}

.zone-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 20px;
  border: none;
  background: #fff;
  color: #57534E;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.zone-tab.active {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
}

.zone-icon {
  font-size: 16px;
}

.help-list {
  padding: 0 16px;
}

.help-card {
  background: #fff;
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
  position: relative;
  transition: all 0.2s ease;
}

.help-card:active {
  transform: scale(0.98);
}

.help-card.urgent {
  border: 2px solid #EF4444;
}

.help-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.author-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.author-name {
  font-size: 15px;
  font-weight: 600;
  color: #292524;
  flex-shrink: 0;
}

.urgent-tag {
  font-size: 12px;
  font-weight: 600;
  color: #EF4444;
  white-space: nowrap;
  animation: pulse 2s ease-in-out infinite;
}

.post-time {
  font-size: 12px;
  color: #A8A29E;
  margin-top: 2px;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.help-title {
  font-size: 16px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 8px;
}

.help-content {
  font-size: 14px;
  color: #57534E;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.help-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.zone-tag {
  padding: 4px 12px;
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.help-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #A8A29E;
  font-size: 13px;
}

.accepted-answer {
  margin-top: 12px;
  padding: 12px;
  background: rgba(34, 197, 94, 0.08);
  border-radius: 12px;
  border-left: 4px solid #22C55E;
}

.accepted-label {
  font-size: 13px;
  font-weight: 600;
  color: #22C55E;
}

.accepted-text {
  font-size: 14px;
  color: #57534E;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #A8A29E;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 14px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
</style>
