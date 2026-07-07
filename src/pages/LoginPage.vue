<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-vue-next'
import { useUserStore } from '@/stores/userStore'
import { useUiStore } from '@/stores/uiStore'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const uiStore = useUiStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)

const handleLogin = async () => {
  if (!email.value.trim()) {
    uiStore.showWarningToast('请输入邮箱')
    return
  }

  if (!password.value.trim()) {
    uiStore.showWarningToast('请输入密码')
    return
  }

  isLoading.value = true

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    uiStore.showWarningToast('请输入有效的邮箱地址')
    isLoading.value = false
    return
  }

  const result = await userStore.login(email.value, password.value)
  isLoading.value = false

  if (result.success) {
    uiStore.showSuccessToast(result.message)
    router.push('/')
  } else {
    uiStore.showErrorToast(result.message)
  }
}

const handleDemoLogin = () => {
  email.value = 'user1@test.com'
  password.value = '123456'
  handleLogin()
}

const handleForgotPassword = async () => {
  if (!email.value.trim()) {
    uiStore.showWarningToast('请先输入邮箱地址')
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    uiStore.showWarningToast('请输入有效的邮箱地址')
    return
  }

  isLoading.value = true
  const result = await userStore.resetPassword(email.value)
  isLoading.value = false

  if (result.success) {
    uiStore.showSuccessToast(result.message)
  } else {
    uiStore.showErrorToast(result.message)
  }
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="login-page">
    <div class="login-bg"></div>

    <button class="back-btn" @click="goBack">
      <ArrowLeft :size="24" />
    </button>

    <div class="login-content">
      <div class="logo-section">
        <div class="logo-icon">🐾</div>
        <h1 class="logo-title">宠友圈</h1>
        <p class="logo-desc">分享你的养宠故事</p>
      </div>

      <div class="form-card">
        <div class="input-group">
          <Mail :size="18" class="input-icon" />
          <input
            v-model="email"
            type="email"
            placeholder="邮箱地址"
            class="input-field"
          />
        </div>

        <div class="input-group">
          <Lock :size="18" class="input-icon" />
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="密码"
            class="input-field"
          />
          <button class="toggle-password" @click="showPassword = !showPassword">
            <Eye v-if="!showPassword" :size="18" />
            <EyeOff v-else :size="18" />
          </button>
        </div>

        <button class="login-btn" @click="handleLogin" :disabled="isLoading">
          <span v-if="isLoading">登录中...</span>
          <span v-else>登录</span>
        </button>

        <button class="demo-btn" @click="handleDemoLogin">
          👤 使用演示账号登录
        </button>

        <div class="forgot-link">
          <a href="#" @click.prevent="handleForgotPassword">忘记密码？</a>
        </div>

        <div class="register-link">
          <span>还没有账号？</span>
          <a href="/register">立即注册</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background-color: #FFF9F5;
  position: relative;
  display: flex;
  flex-direction: column;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 400px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  border-radius: 0 0 60px 60px;
}

.back-btn {
  position: relative;
  z-index: 10;
  margin: 16px;
  margin-top: calc(16px + env(safe-area-inset-top));
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.login-content {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.logo-title {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.logo-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.form-card {
  width: 100%;
  max-width: 360px;
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(249, 115, 22, 0.2);
}

.input-group {
  position: relative;
  margin-bottom: 20px;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #A8A29E;
}

.input-field {
  width: 100%;
  height: 48px;
  padding: 0 16px 0 48px;
  border: 2px solid #E7E5E4;
  border-radius: 12px;
  font-size: 15px;
  color: #292524;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.input-field:focus {
  border-color: #F97316;
}

.input-field::placeholder {
  color: #A8A29E;
}

.toggle-password {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #A8A29E;
  cursor: pointer;
}

.login-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
  transition: all 0.2s ease;
}

.login-btn:active {
  transform: scale(0.98);
}

.login-btn:disabled {
  opacity: 0.7;
}

.demo-btn {
  width: 100%;
  height: 44px;
  margin-top: 12px;
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-btn:active {
  background: rgba(249, 115, 22, 0.15);
}

.forgot-link {
  text-align: right;
  margin-top: 16px;
}

.forgot-link a {
  font-size: 14px;
  color: #A8A29E;
  text-decoration: none;
}

.register-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #57534E;
}

.register-link a {
  color: #F97316;
  font-weight: 600;
  text-decoration: none;
}
</style>
