<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, Send, AlertTriangle } from 'lucide-vue-next'
import LocationPicker from '@/components/LocationPicker.vue'
import { useUiStore } from '@/stores/uiStore'
import { useRouter } from 'vue-router'
import type { Location } from '@/mock/helpPosts'

const uiStore = useUiStore()
const router = useRouter()

const title = ref('')
const content = ref('')
const selectedZone = ref<'experience' | 'question' | 'rescue' | 'mutual'>('question')
const isUrgent = ref(false)
const location = ref<Location | null>(null)

const zones: Array<{ key: 'experience' | 'question' | 'rescue' | 'mutual', label: string, icon: string, desc: string, color: string }> = [
  { key: 'experience', label: '经验', icon: '📚', desc: '分享养宠经验', color: '#F97316' },
  { key: 'question', label: '问答', icon: '❓', desc: '提出养宠疑问', color: '#3B82F6' },
  { key: 'rescue', label: '救助', icon: '🚑', desc: '发布救助信息', color: '#EF4444' },
  { key: 'mutual', label: '互帮', icon: '🤝', desc: '代遛代喂临时照看', color: '#22C55E' }
]

const back = () => {
  router.back()
}

const handleSubmit = () => {
  if (!title.value.trim()) {
    uiStore.showWarningToast('请输入标题')
    return
  }
  if (!content.value.trim()) {
    uiStore.showWarningToast('请输入内容')
    return
  }

  const zoneConfig = zones.find(z => z.key === selectedZone.value)!
  
  uiStore.showSuccessToast(`成功发布${zoneConfig.label}帖子：${title.value}`)
  router.push('/help')
}
</script>

<template>
  <div class="help-create-page">
    <header class="header">
      <button class="back-btn" @click="back">
        <ArrowLeft :size="24" />
      </button>
      <h1 class="header-title">发互助</h1>
      <button class="submit-btn" @click="handleSubmit">
        <Send :size="18" />
        <span>发布</span>
      </button>
    </header>

    <div class="content">
      <div class="zone-section">
        <h3 class="section-title">选择栏目</h3>
        <div class="zone-grid">
          <div
            v-for="zone in zones"
            :key="zone.key"
            class="zone-card"
            :class="{ selected: selectedZone === zone.key }"
            :style="{ '--zone-color': zone.color as string }"
            @click="selectedZone = zone.key"
          >
            <span class="zone-icon">{{ zone.icon }}</span>
            <span class="zone-label">{{ zone.label }}</span>
            <span class="zone-desc">{{ zone.desc }}</span>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-item">
          <label class="form-label">标题</label>
          <input
            v-model="title"
            type="text"
            placeholder="简洁描述你的需求..."
            class="form-input"
            maxlength="50"
          />
          <span class="char-count">{{ title.length }}/50</span>
        </div>

        <div class="form-item">
          <label class="form-label">详细内容</label>
          <textarea
            v-model="content"
            placeholder="详细描述你的问题或需求，便于其他宠友帮助你..."
            class="form-textarea"
            maxlength="500"
          ></textarea>
          <span class="char-count">{{ content.length }}/500</span>
        </div>

        <div class="location-section">
          <label class="form-label">📍 位置信息</label>
          <LocationPicker v-model="location" />
        </div>

        <div v-if="selectedZone === 'rescue'" class="urgent-section">
          <div class="urgent-toggle" @click="isUrgent = !isUrgent">
            <div class="urgent-icon" :class="{ active: isUrgent }">
              <AlertTriangle :size="20" />
            </div>
            <div class="urgent-content">
              <span class="urgent-label">紧急求助</span>
              <span class="urgent-desc">标记为紧急将获得更多曝光</span>
            </div>
            <div class="toggle-switch" :class="{ active: isUrgent }">
              <div class="toggle-thumb"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="tips-section">
        <h4 class="tips-title">💡 温馨提示</h4>
        <ul class="tips-list">
          <li v-if="selectedZone === 'experience'">分享你的养宠心得，帮助更多新手宠友</li>
          <li v-if="selectedZone === 'question'">详细描述问题，更容易获得准确解答</li>
          <li v-if="selectedZone === 'rescue'">紧急求助请提供详细地址和联系方式</li>
          <li v-if="selectedZone === 'mutual'">明确互助需求，提高匹配效率</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.help-create-page {
  min-height: 100vh;
  background-color: #F0FDF4;
  padding-bottom: 80px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #D1FAE5;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #F0FDF4;
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
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #34D399, #6EE7B7);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(52, 211, 153, 0.3);
}

.content {
  padding: 20px 16px;
}

.zone-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 12px;
}

.zone-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.zone-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.zone-card.selected {
  border-color: var(--zone-color);
  background: rgba(52, 211, 153, 0.05);
}

.zone-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.zone-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #292524;
  margin-bottom: 4px;
}

.zone-desc {
  display: block;
  font-size: 12px;
  color: #A8A29E;
}

.form-section {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
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
  border-color: #34D399;
}

.form-textarea {
  width: 100%;
  height: 150px;
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
  border-color: #34D399;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #A8A29E;
  margin-top: 8px;
}

.urgent-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #F5F5F4;
}

.urgent-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #FEF2F2;
  border-radius: 12px;
  cursor: pointer;
}

.urgent-icon {
  width: 36px;
  height: 36px;
  background: #FECACA;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #EF4444;
}

.urgent-icon.active {
  background: #EF4444;
  color: #fff;
}

.urgent-content {
  flex: 1;
}

.urgent-label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #EF4444;
}

.urgent-desc {
  display: block;
  font-size: 12px;
  color: #F87171;
  margin-top: 2px;
}

.toggle-switch {
  width: 48px;
  height: 26px;
  background: #E7E5E4;
  border-radius: 13px;
  position: relative;
  transition: all 0.25s ease;
}

.toggle-switch.active {
  background: #EF4444;
}

.toggle-thumb {
  width: 22px;
  height: 22px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.25s ease;
}

.toggle-switch.active .toggle-thumb {
  left: 24px;
}

.tips-section {
  background: rgba(52, 211, 153, 0.08);
  border-radius: 16px;
  padding: 16px;
}

.tips-title {
  font-size: 14px;
  font-weight: 600;
  color: #059669;
  margin-bottom: 10px;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
}

.tips-list li {
  font-size: 13px;
  color: #047857;
  line-height: 1.6;
}
</style>
