import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/HomePage.vue'),
    meta: { showTabBar: true }
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import('@/pages/HelpPage.vue'),
    meta: { showTabBar: true }
  },
  {
    path: '/post-create',
    name: 'PostCreate',
    component: () => import('@/pages/PostCreatePage.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/diary-create',
    name: 'DiaryCreate',
    component: () => import('@/pages/DiaryCreatePage.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/help-create',
    name: 'HelpCreate',
    component: () => import('@/pages/HelpCreatePage.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/discover',
    name: 'Discover',
    component: () => import('@/pages/DiscoverPage.vue'),
    meta: { showTabBar: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/ProfilePage.vue'),
    meta: { showTabBar: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/RegisterPage.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: () => import('@/pages/PostDetailPage.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/pet/:id',
    name: 'PetProfile',
    component: () => import('@/pages/PetProfilePage.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/pet-create',
    name: 'PetCreate',
    component: () => import('@/pages/PetCreatePage.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/help/:id',
    name: 'HelpDetail',
    component: () => import('@/pages/HelpDetailPage.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/pages/MessagesPage.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: () => import('@/pages/UserProfilePage.vue'),
    meta: { showTabBar: false }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/SettingsPage.vue'),
    meta: { showTabBar: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
