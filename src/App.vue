<script setup lang="ts">
import { useRoute } from 'vue-router'
import TabBar from '@/components/TabBar.vue'
import Toast from '@/components/Toast.vue'
import Dialog from '@/components/Dialog.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const route = useRoute()

const showTabBar = () => {
  return route.meta.showTabBar !== false
}
</script>

<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <TabBar v-if="showTabBar()" />
    <Toast />
    <Dialog />
    <LoadingSpinner />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #FFF9F5;
}

.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
