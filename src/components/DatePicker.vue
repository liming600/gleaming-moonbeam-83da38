<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  max?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPicker = ref(false)
const currentDate = ref(new Date(props.modelValue || Date.now()))

const year = computed(() => currentDate.value.getFullYear())
const month = computed(() => currentDate.value.getMonth())

const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const daysInMonth = computed(() => {
  return new Date(year.value, month.value + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  return new Date(year.value, month.value, 1).getDay()
})

const days = computed(() => {
  const result: Array<{ day: number; isCurrentMonth: boolean; isSelected: boolean; isPast: boolean }> = []
  
  for (let i = firstDayOfMonth.value - 1; i >= 0; i--) {
    const prevMonthDays = new Date(year.value, month.value, 0).getDate()
    result.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      isSelected: false,
      isPast: true
    })
  }
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 1; i <= daysInMonth.value; i++) {
    const date = new Date(year.value, month.value, i)
    date.setHours(0, 0, 0, 0)
    const isPast = date < today
    const isSelected = date.toISOString().split('T')[0] === props.modelValue
    
    result.push({
      day: i,
      isCurrentMonth: true,
      isSelected,
      isPast
    })
  }
  
  const remaining = 42 - result.length
  for (let i = 1; i <= remaining; i++) {
    result.push({
      day: i,
      isCurrentMonth: false,
      isSelected: false,
      isPast: false
    })
  }
  
  return result
})

const prevMonth = () => {
  if (month.value === 0) {
    currentDate.value = new Date(year.value - 1, 11)
  } else {
    currentDate.value = new Date(year.value, month.value - 1)
  }
}

const nextMonth = () => {
  const today = new Date()
  const maxDate = props.max ? new Date(props.max) : today
  
  if (month.value === 11) {
    const nextYear = new Date(year.value + 1, 0)
    if (nextYear <= maxDate) {
      currentDate.value = nextYear
    }
  } else {
    const nextMonth = new Date(year.value, month.value + 1)
    if (nextMonth <= maxDate) {
      currentDate.value = nextMonth
    }
  }
}

const selectDay = (day: number, isCurrentMonth: boolean) => {
  let date: Date
  if (isCurrentMonth) {
    date = new Date(year.value, month.value, day)
  } else if (day <= 14) {
    date = new Date(year.value, month.value + 1, day)
  } else {
    date = new Date(year.value, month.value - 1, day)
  }
  
  const formattedDate = date.toISOString().split('T')[0]
  
  if (props.max) {
    if (date > new Date(props.max)) {
      return
    }
  }
  
  emit('update:modelValue', formattedDate)
  showPicker.value = false
}

const togglePicker = () => {
  showPicker.value = !showPicker.value
}

const closePicker = () => {
  showPicker.value = false
}

watch(() => props.modelValue, (val) => {
  if (val) {
    currentDate.value = new Date(val)
  }
})
</script>

<template>
  <div class="date-picker-wrapper" @click="togglePicker">
    <Calendar :size="20" class="date-icon" />
    <span class="date-value">{{ modelValue ? new Date(modelValue).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : '选择日期' }}</span>
    <ChevronRight :size="16" class="date-arrow" />
  </div>

  <Transition name="fade">
    <div v-if="showPicker" class="date-picker-overlay" @click="closePicker">
      <div class="date-picker-modal" @click.stop>
        <div class="picker-header">
          <button class="nav-btn" @click="prevMonth">
            <ChevronLeft :size="20" />
          </button>
          <div class="picker-title">
            <span>{{ year }}年</span>
            <span>{{ monthNames[month] }}</span>
          </div>
          <button class="nav-btn" @click="nextMonth">
            <ChevronRight :size="20" />
          </button>
        </div>

        <div class="weekdays">
          <span v-for="day in weekDays" :key="day" class="weekday">{{ day }}</span>
        </div>

        <div class="days-grid">
          <button
            v-for="(day, index) in days"
            :key="index"
            class="day-btn"
            :class="{
              'other-month': !day.isCurrentMonth,
              'selected': day.isSelected,
              'past': day.isPast && !day.isSelected
            }"
            @click="selectDay(day.day, day.isCurrentMonth)"
          >
            {{ day.day }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.date-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #FDF6E3;
  border-radius: 12px;
  cursor: pointer;
  border: 2px solid #FDE68A;
  transition: all 0.2s ease;
}

.date-picker-wrapper:active {
  background: #FDE68A;
}

.date-icon {
  color: #D97706;
}

.date-value {
  flex: 1;
  font-size: 15px;
  color: #292524;
  font-weight: 500;
}

.date-arrow {
  color: #D97706;
}

.date-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.date-picker-modal {
  width: 100%;
  max-width: 340px;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
}

.nav-btn {
  width: 36px;
  height: 36px;
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

.nav-btn:active {
  background: rgba(255, 255, 255, 0.4);
}

.picker-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.picker-title span:first-child {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.picker-title span:last-child {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 12px 16px;
  background: #FFFBEB;
}

.weekday {
  text-align: center;
  font-size: 13px;
  color: #A8A29E;
  font-weight: 500;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 12px 16px;
  gap: 4px;
}

.day-btn {
  aspect-ratio: 1;
  border: none;
  background: transparent;
  border-radius: 50%;
  font-size: 14px;
  color: #292524;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-btn.other-month {
  color: #D6D3D1;
}

.day-btn.past {
  color: #A8A29E;
}

.day-btn.selected {
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  color: #fff;
  font-weight: 600;
}

.day-btn:active:not(.selected) {
  background: #FDF6E3;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
