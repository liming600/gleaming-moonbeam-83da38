import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  realtime: {
    enabled: false,
    transport: ws
  }
})

const tablesToTruncate = [
  'likes',
  'comments',
  'posts',
  'help_answers',
  'help_posts',
  'messages',
  'follows',
  'notifications',
  'pets',
  'users'
]

const testEmails = [
  'user1@test.com',
  'user2@test.com',
  'user3@test.com',
  'user4@test.com',
  'user5@test.com',
  'user6@test.com',
  'user7@test.com',
  'user8@test.com',
  'user9@test.com',
  'user10@test.com'
]

async function deleteAuthUsers() {
  console.log('删除认证用户...')
  for (const email of testEmails) {
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      })
      const users = await response.json()
      const user = users.find((u: any) => u.email === email)
      if (user) {
        await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        })
        console.log(`删除用户: ${email}`)
      }
    } catch (error) {
      console.log(`删除用户 ${email} 失败:`, error)
    }
  }
}

async function truncateTables() {
  console.log('清理数据库表...')
  for (const table of tablesToTruncate) {
    try {
      await supabase.from(table).delete().neq('id', '0')
      console.log(`清理表: ${table}`)
    } catch (error) {
      console.log(`清理表 ${table} 失败:`, error)
    }
  }
}

async function main() {
  console.log('开始清理测试数据...')
  
  await deleteAuthUsers()
  await truncateTables()
  
  console.log('🎉 清理完成！')
}

main().catch(err => {
  console.error('清理失败:', err)
  process.exit(1)
})
