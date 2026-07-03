<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, RefreshCw, BookOpen } from 'lucide-vue-next'

interface PetTip {
  title: string
  content: string
  category: string
  tags: string[]
}

const props = defineProps<{
  show: boolean
  tip: PetTip | null
}>()

const emit = defineEmits<{
  close: []
}>()

const currentTip = ref<PetTip | null>(null)

watch(() => props.tip, (newTip) => {
  currentTip.value = newTip
}, { immediate: true })

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

const refreshTip = () => {
  const filteredTips = tips.filter(t => t.title !== currentTip.value?.title)
  if (filteredTips.length > 0) {
    currentTip.value = filteredTips[Math.floor(Math.random() * filteredTips.length)]
  } else {
    currentTip.value = tips[Math.floor(Math.random() * tips.length)]
  }
}

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <div class="header-left">
              <BookOpen :size="20" />
              <span class="header-title">今日宠知识</span>
            </div>
            <div class="header-right">
              <button class="refresh-btn" @click="refreshTip">
                <RefreshCw :size="18" />
              </button>
              <button class="close-btn" @click="closeModal">
                <X :size="20" />
              </button>
            </div>
          </div>

          <div v-if="currentTip" class="modal-body">
            <span class="tip-category">{{ currentTip.category }}</span>
            <h3 class="tip-title">{{ currentTip.title }}</h3>
            <p class="tip-content">{{ currentTip.content }}</p>

            <div class="tip-tags">
              <span
                v-for="tag in currentTip.tags"
                :key="tag"
                class="tip-tag"
              >
                #{{ tag }}
              </span>
            </div>
          </div>

          <div class="modal-footer">
            <button class="close-btn-full" @click="closeModal">
              知道了
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-radius: 24px 24px 0 0;
  padding: 24px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #F97316;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #292524;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #F5F5F4;
  color: #57534E;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:active {
  transform: rotate(180deg);
  background: #E7E5E4;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #F5F5F4;
  color: #57534E;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:active {
  background: #E7E5E4;
}

.modal-body {
  margin-bottom: 24px;
}

.tip-category {
  font-size: 13px;
  font-weight: 500;
  color: #F97316;
  margin-bottom: 12px;
  display: block;
}

.tip-title {
  font-size: 20px;
  font-weight: 700;
  color: #292524;
  line-height: 1.4;
  margin-bottom: 16px;
}

.tip-content {
  font-size: 15px;
  color: #57534E;
  line-height: 1.7;
  margin-bottom: 20px;
}

.tip-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tip-tag {
  padding: 6px 12px;
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.modal-footer {
  padding-top: 16px;
  border-top: 1px solid #F5F5F4;
}

.close-btn-full {
  width: 100%;
  padding: 14px;
  border: none;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn-full:active {
  transform: scale(0.98);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: translateY(100%);
}
</style>
