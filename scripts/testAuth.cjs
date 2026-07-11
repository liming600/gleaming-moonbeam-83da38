const supabaseUrl = 'https://znjnpbwjdjpqpbtcbpav.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpuam5wYndqZGpwcXBidGNicGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MTQ2MTUsImV4cCI6MjA5ODQ5MDYxNX0.X54FdyHVyc3mQ6kd_I3YMBRx1WBsELTan8aPvVVWLC4'

async function testAuth() {
  console.log('=== 使用 HTTP 直接测试 Supabase ===\n')

  console.log('1. 测试数据库查询...')
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/users?select=id,email,name&limit=3`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    })

    if (!response.ok) {
      console.error('❌ HTTP 请求失败:', response.status, response.statusText)
      const body = await response.text()
      console.error('响应体:', body)
      process.exit(1)
    }

    const data = await response.json()
    console.log('✅ 查询成功')
    console.log('   用户数据:', JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('❌ 查询异常:', e.message)
    process.exit(1)
  }

  console.log('\n2. 测试认证登录...')
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({
        email: 'user1@test.com',
        password: '123456'
      })
    })

    console.log('HTTP 状态:', response.status)
    const body = await response.text()
    console.log('响应体:', body)

    if (response.ok) {
      const data = JSON.parse(body)
      console.log('✅ 登录成功')
      console.log('   access_token:', data.access_token?.substring(0, 20) + '...')
    } else {
      console.error('❌ 登录失败')
    }
  } catch (e) {
    console.error('❌ 登录异常:', e.message)
  }

  console.log('\n=== 测试完成 ===')
}

testAuth()
