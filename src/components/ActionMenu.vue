<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { MoreHorizontal, Edit3 } from 'lucide-vue-next'

interface MenuItem {
  icon: typeof Edit3
  label: string
  action: () => void | Promise<void>
  danger?: boolean
}

defineProps<{
  items: MenuItem[]
  position?: 'left' | 'right'
}>()

const emit = defineEmits<{
  (e: 'select', item: MenuItem): void
}>()

const isOpen = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const handleSelect = (item: MenuItem) => {
  isOpen.value = false
  emit('select', item)
}

const closeMenu = (e: Event) => {
  const target = e.target as HTMLElement
  if (!target.closest('.action-menu-wrapper')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
})
</script>

<template>
  <div class="action-menu-wrapper">
    <button class="action-menu-btn" @click.stop="toggleMenu">
      <MoreHorizontal :size="20" />
    </button>
    <div v-if="isOpen" class="action-menu" :class="position">
      <button
        v-for="(item, index) in items"
        :key="index"
        class="action-menu-item"
        :class="{ danger: item.danger }"
        @click.stop="handleSelect(item)"
      >
        <component :is="item.icon" :size="16" />
        <span>{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.action-menu-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.action-menu-btn {
  background: transparent;
  border: none;
  padding: 6px;
  border-radius: 50%;
  cursor: pointer;
  color: #6B7280;
  transition: background-color 0.15s;
}

.action-menu-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.action-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 140px;
  z-index: 1000;
}

.action-menu.left {
  right: auto;
  left: 0;
}

.action-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: background-color 0.15s;
}

.action-menu-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.action-menu-item.danger {
  color: #EF4444;
}
</style>