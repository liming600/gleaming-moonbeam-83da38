import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const isDev = import.meta.env.DEV

console.log('[Supabase Config] Environment:', isDev ? 'Development' : 'Production')
console.log('[Supabase Config] URL:', supabaseUrl ? 'OK' : 'NOT SET')
console.log('[Supabase Config] Anon Key:', supabaseAnonKey ? 'OK (length: ' + supabaseAnonKey.length + ')' : 'NOT SET')

const customFetch: typeof fetch = async (url, options) => {
  let originalUrl: string
  if (typeof url === 'string') {
    originalUrl = url
  } else if ('href' in url) {
    originalUrl = url.href
  } else {
    originalUrl = url.url
  }
  
  let targetUrl = originalUrl
  
  if (isDev && originalUrl.startsWith('https://znjnpbwjdjpqpbtcbpav.supabase.co')) {
    targetUrl = '/api' + originalUrl.replace('https://znjnpbwjdjpqpbtcbpav.supabase.co', '')
    console.log('[Supabase Proxy] Rewriting:', originalUrl, '->', targetUrl)
  }
  
  const response = await fetch(targetUrl, options)
  
  console.log('[Supabase Proxy] Response:', response.status, response.statusText)
  
  return response
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

export default supabase