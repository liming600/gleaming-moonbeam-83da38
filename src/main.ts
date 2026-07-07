import { createApp } from 'vue'
import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'
import router from './router'
import './style.scss'
import App from './App.vue'
import vLazy from './directives/vLazy'
import { logger } from './utils/logger'

window.onerror = function(message, source, lineno, colno, error) {
  logger.error('全局错误:', { message, source, lineno, colno, error })
  const appEl = document.getElementById('app')
  if (appEl) {
    appEl.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif; font-size: 14px; background: #fefefe;">
      <h2>应用启动失败</h2>
      <p><strong>错误信息:</strong> ${message}</p>
      <p><strong>来源:</strong> ${source}</p>
      <p><strong>行号:</strong> ${lineno}:${colno}</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">${error?.stack || '无堆栈信息'}</pre>
    </div>`
  }
}

window.addEventListener('unhandledrejection', function(event) {
  logger.error('未处理的 Promise 拒绝:', event.reason)
  const appEl = document.getElementById('app')
  if (appEl) {
    appEl.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif; font-size: 14px; background: #fefefe;">
      <h2>应用启动失败</h2>
      <p><strong>未处理的 Promise 拒绝:</strong></p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">${event.reason?.stack || event.reason || '未知错误'}</pre>
    </div>`
  }
})

const app = createApp(App)
const pinia = createPinia()

pinia.use(persist)

app.use(pinia)
app.use(router)
app.directive('lazy', vLazy)

app.config.errorHandler = function(err, _instance, info) {
  logger.error('Vue 组件错误:', err, info)
}

app.mount('#app')
