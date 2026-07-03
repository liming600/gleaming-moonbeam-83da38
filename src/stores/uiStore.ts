import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ToastOptions {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export interface DialogOptions {
  title?: string
  content: string
  showCancel?: boolean
  cancelText?: string
  confirmText?: string
}

export const useUiStore = defineStore('ui', () => {
  const toastVisible = ref(false)
  const toastMessage = ref('')
  const toastType = ref<'success' | 'error' | 'warning' | 'info'>('info')
  const toastDuration = ref(2000)
  // 保存定时器引用，避免连续触发时前一个定时器提前关闭后一个提示
  let toastTimer: ReturnType<typeof setTimeout> | null = null

  const dialogVisible = ref(false)
  const dialogTitle = ref('')
  const dialogContent = ref('')
  const dialogShowCancel = ref(true)
  const dialogCancelText = ref('取消')
  const dialogConfirmText = ref('确定')
  const dialogResolve = ref<((value: boolean) => void) | null>(null)

  const loadingVisible = ref(false)
  const loadingText = ref('加载中...')

  const showToast = (options: ToastOptions) => {
    // 清除前一个定时器，避免连续触发时提前关闭
    if (toastTimer) {
      clearTimeout(toastTimer)
      toastTimer = null
    }
    toastMessage.value = options.message
    toastType.value = options.type || 'info'
    toastDuration.value = options.duration || 2000
    toastVisible.value = true

    toastTimer = setTimeout(() => {
      toastVisible.value = false
      toastTimer = null
    }, toastDuration.value)
  }

  const showSuccessToast = (message: string, duration?: number) => {
    showToast({ message, type: 'success', duration })
  }

  const showErrorToast = (message: string, duration?: number) => {
    showToast({ message, type: 'error', duration })
  }

  const showWarningToast = (message: string, duration?: number) => {
    showToast({ message, type: 'warning', duration })
  }

  const showInfoToast = (message: string, duration?: number) => {
    showToast({ message, type: 'info', duration })
  }

  const hideToast = () => {
    toastVisible.value = false
  }

  const showDialog = (options: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      dialogTitle.value = options.title || ''
      dialogContent.value = options.content
      dialogShowCancel.value = options.showCancel ?? true
      dialogCancelText.value = options.cancelText || '取消'
      dialogConfirmText.value = options.confirmText || '确定'
      dialogResolve.value = resolve
      dialogVisible.value = true
    })
  }

  const confirmDialog = (options: DialogOptions): Promise<boolean> => {
    return showDialog({ ...options, showCancel: true })
  }

  const alertDialog = (options: DialogOptions): Promise<boolean> => {
    return showDialog({ ...options, showCancel: false })
  }

  const closeDialog = (confirmed: boolean) => {
    dialogVisible.value = false
    if (dialogResolve.value) {
      dialogResolve.value(confirmed)
      dialogResolve.value = null
    }
  }

  const showLoading = (text?: string) => {
    loadingText.value = text || '加载中...'
    loadingVisible.value = true
  }

  const hideLoading = () => {
    loadingVisible.value = false
  }

  return {
    toastVisible,
    toastMessage,
    toastType,
    toastDuration,
    dialogVisible,
    dialogTitle,
    dialogContent,
    dialogShowCancel,
    dialogCancelText,
    dialogConfirmText,
    loadingVisible,
    loadingText,
    showToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    hideToast,
    showDialog,
    confirmDialog,
    alertDialog,
    closeDialog,
    showLoading,
    hideLoading
  }
})