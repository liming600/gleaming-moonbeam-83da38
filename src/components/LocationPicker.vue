<script setup lang="ts">
import { ref, watch } from 'vue'
import { MapPin, Navigation, X } from 'lucide-vue-next'

interface Location {
  address: string
  latitude: number | null
  longitude: number | null
}

const props = defineProps<{
  modelValue: Location | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Location | null): void
}>()

const isLocating = ref(false)
const locationInput = ref('')
const currentLocation = ref<Location | null>(null)

watch(() => props.modelValue, (val) => {
  currentLocation.value = val
  if (val) {
    locationInput.value = val.address
  }
}, { immediate: true })

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert('您的浏览器不支持定位功能')
    return
  }

  isLocating.value = true
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      const location: Location = {
        address: `纬度: ${latitude.toFixed(4)}, 经度: ${longitude.toFixed(4)}`,
        latitude,
        longitude
      }
      currentLocation.value = location
      locationInput.value = location.address
      emit('update:modelValue', location)
      isLocating.value = false
    },
    (error) => {
      isLocating.value = false
      switch (error.code) {
        case error.PERMISSION_DENIED:
          alert('请允许定位权限')
          break
        case error.POSITION_UNAVAILABLE:
          alert('位置信息不可用')
          break
        case error.TIMEOUT:
          alert('定位超时')
          break
        default:
          alert('定位失败，请手动输入地址')
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}

const handleInputChange = () => {
  if (!locationInput.value.trim()) {
    currentLocation.value = null
    emit('update:modelValue', null)
  } else {
    currentLocation.value = {
      address: locationInput.value,
      latitude: null,
      longitude: null
    }
    emit('update:modelValue', currentLocation.value)
  }
}

const clearLocation = () => {
  locationInput.value = ''
  currentLocation.value = null
  emit('update:modelValue', null)
}
</script>

<template>
  <div class="location-picker">
    <div class="location-input-wrapper">
      <div class="location-icon">
        <MapPin :size="18" />
      </div>
      <input
        v-model="locationInput"
        type="text"
        placeholder="点击定位或输入地址..."
        class="location-input"
        @input="handleInputChange"
      />
      <button v-if="currentLocation" class="clear-btn" @click="clearLocation">
        <X :size="16" />
      </button>
    </div>
    <button
      class="locate-btn"
      :class="{ locating: isLocating }"
      @click="getCurrentLocation"
      :disabled="isLocating"
    >
      <Navigation :size="16" :class="{ spinning: isLocating }" />
      <span>{{ isLocating ? '定位中...' : '获取当前位置' }}</span>
    </button>
    <p v-if="currentLocation && currentLocation.latitude" class="location-coords">
      📍 坐标: {{ currentLocation.latitude.toFixed(4) }}, {{ currentLocation.longitude?.toFixed(4) }}
    </p>
  </div>
</template>

<style scoped>
.location-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.location-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #F5F5F4;
  border-radius: 12px;
  padding: 0 14px;
  height: 44px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.location-input-wrapper:focus-within {
  border-color: #3B82F6;
  background: #fff;
}

.location-icon {
  color: #3B82F6;
  flex-shrink: 0;
}

.location-input {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #292524;
}

.location-input::placeholder {
  color: #A8A29E;
}

.clear-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #E7E5E4;
  color: #57534E;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #D6D3D1;
}

.locate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #3B82F6, #60A5FA);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.locate-btn:active {
  transform: scale(0.98);
}

.locate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.locate-btn.locating {
  background: linear-gradient(135deg, #60A5FA, #93C5FD);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.location-coords {
  font-size: 12px;
  color: #3B82F6;
  margin: 0;
  padding-left: 4px;
}
</style>
