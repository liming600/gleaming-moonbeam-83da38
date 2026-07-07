import { logger } from './logger'

export interface ErrorResult {
  success: boolean
  message: string
  code?: string
}

export const handleApiError = (error: Error | null, defaultMessage: string = '操作失败'): ErrorResult => {
  if (!error) {
    return { success: true, message: '操作成功' }
  }

  const errorMessage = error.message || defaultMessage
  logger.error('[API Error]:', errorMessage)

  const supabaseErrorCodes: Record<string, string> = {
    'PGRST116': '资源不存在',
    'PGRST115': '资源已存在',
    'PGRST100': '查询错误',
    '400': '请求参数错误',
    '401': '未授权，请重新登录',
    '403': '无权限访问',
    '404': '资源不存在',
    '500': '服务器内部错误'
  }

  const matchedCode = Object.keys(supabaseErrorCodes).find(code => 
    errorMessage.includes(code) || errorMessage.includes(`Code: ${code}`)
  )

  const userMessage = matchedCode 
    ? supabaseErrorCodes[matchedCode] 
    : errorMessage.length > 50 
      ? defaultMessage 
      : errorMessage

  return {
    success: false,
    message: userMessage,
    code: matchedCode
  }
}

export const handleAuthError = (error: Error | null): ErrorResult => {
  if (!error) {
    return { success: true, message: '认证成功' }
  }

  logger.error('[Auth Error]:', error.message)

  const authErrorMessages: Record<string, string> = {
    'User already registered': '该邮箱已被注册',
    'Email not confirmed': '请先验证邮箱',
    'Invalid login credentials': '邮箱或密码错误',
    'Password must be at least 6 characters': '密码至少需要6位',
    'Rate limit exceeded': '请求过于频繁，请稍后再试',
    'Email rate limit exceeded': '验证码发送过于频繁，请稍后再试'
  }

  const matchedKey = Object.keys(authErrorMessages).find(key => 
    error.message.toLowerCase().includes(key.toLowerCase())
  )

  const userMessage = matchedKey 
    ? authErrorMessages[matchedKey] 
    : error.message.length > 50 
      ? '认证失败，请重试' 
      : error.message

  return {
    success: false,
    message: userMessage
  }
}