import { ref } from 'vue'

export interface AsyncActionResult<T = any> {
  success: boolean
  message: string
  data?: T
}

export const useAsyncAction = () => {
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async <T>(
    action: () => Promise<AsyncActionResult<T>>
  ): Promise<AsyncActionResult<T>> => {
    isLoading.value = true
    error.value = null

    try {
      const result = await action()
      return result
    } catch (err) {
      error.value = err as Error
      return {
        success: false,
        message: (err as Error).message || '操作失败'
      }
    } finally {
      isLoading.value = false
    }
  }

  const wrap = <T>(
    fn: (...args: any[]) => Promise<AsyncActionResult<T>>
  ): ((...args: any[]) => Promise<AsyncActionResult<T>>) => {
    return async (...args: any[]) => {
      isLoading.value = true
      error.value = null

      try {
        return await fn(...args)
      } catch (err) {
        error.value = err as Error
        return {
          success: false,
          message: (err as Error).message || '操作失败'
        }
      } finally {
        isLoading.value = false
      }
    }
  }

  return {
    isLoading,
    error,
    execute,
    wrap
  }
}

export const useAsyncLoading = (loadingRef: { value: boolean }) => {
  const wrap = <T>(
    fn: (...args: any[]) => Promise<T>
  ): ((...args: any[]) => Promise<T>) => {
    return async (...args: any[]) => {
      loadingRef.value = true
      try {
        return await fn(...args)
      } finally {
        loadingRef.value = false
      }
    }
  }

  return { wrap }
}