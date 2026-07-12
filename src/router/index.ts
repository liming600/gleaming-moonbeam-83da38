import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

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
    meta: { showTabBar: false, requiresAuth: true }
  },
  {
    path: '/diary-create',
    name: 'DiaryCreate',
    component: () => import('@/pages/DiaryCreatePage.vue'),
    meta: { showTabBar: false, requiresAuth: true }
  },
  {
    path: '/help-create',
    name: 'HelpCreate',
    component: () => import('@/pages/HelpCreatePage.vue'),
    meta: { showTabBar: false, requiresAuth: true }
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
    meta: { showTabBar: false, requiresAuth: true }
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
    meta: { showTabBar: false, requiresAuth: true }
  },
  {
    path: '/posts',
    name: 'UserPosts',
    component: () => import('@/pages/UserPostsPage.vue'),
    meta: { showTabBar: false, requiresAuth: true }
  },
  {
    path: '/posts/:id',
    name: 'UserPostsById',
    component: () => import('@/pages/UserPostsPage.vue'),
    meta: { showTabBar: false, requiresAuth: true }
  },
  {
    path: '/followers',
    name: 'Followers',
    component: () => import('@/pages/FollowersPage.vue'),
    meta: { showTabBar: false, requiresAuth: true }
  },
  {
    path: '/followers/:id',
    name: 'FollowersById',
    component: () => import('@/pages/FollowersPage.vue'),
    meta: { showTabBar: false, requiresAuth: true }
  },
  {
    path: '/my-pets',
    name: 'MyPets',
    component: () => import('@/pages/MyPetsPage.vue'),
    meta: { showTabBar: false, requiresAuth: true }
  },
  {
    path: '/edit-profile',
    name: 'EditProfile',
    component: () => import('@/pages/EditProfilePage.vue'),
    meta: { showTabBar: false, requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/pages/NotificationsPage.vue'),
    meta: { showTabBar: false, requiresAuth: true }
  },
  {
    path: '/chat/:id',
    name: 'Chat',
    component: () => import('@/pages/ChatPage.vue'),
    meta: { showTabBar: false, requiresAuth: true }
  },
  {
    path: '/chat/:id/settings',
    name: 'ChatSettings',
    component: () => import('@/pages/ChatSettingsPage.vue'),
    meta: { showTabBar: false, requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    await userStore.autoLogin()
    if (!userStore.isLoggedIn) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  }
  
  if ((to.name === 'Login' || to.name === 'Register') && userStore.isLoggedIn) {
    next({ name: 'Home' })
    return
  }
  
  next()
})

export default router
