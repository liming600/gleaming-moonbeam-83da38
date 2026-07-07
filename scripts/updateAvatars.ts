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

const oldUrl = 'https://neeko-copilot.bytedance.net/api/text2image'
const newUrl = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image'

async function updatePetsAvatars() {
  console.log('更新宠物头像...')
  const { data: pets, error } = await supabase.from('pets').select('id, avatar_url')
  
  if (error) {
    console.log('获取宠物失败:', error)
    return
  }
  
  let updated = 0
  for (const pet of pets) {
    if (pet.avatar_url && pet.avatar_url.includes(oldUrl)) {
      const newAvatarUrl = pet.avatar_url.replace(oldUrl, newUrl)
      await supabase.from('pets').update({ avatar_url: newAvatarUrl }).eq('id', pet.id)
      updated++
    }
  }
  
  console.log(`已更新 ${updated} 个宠物头像`)
}

async function updateUsersAvatars() {
  console.log('更新用户头像...')
  const { data: users, error } = await supabase.from('users').select('id, avatar_url')
  
  if (error) {
    console.log('获取用户失败:', error)
    return
  }
  
  let updated = 0
  for (const user of users) {
    if (user.avatar_url && user.avatar_url.includes(oldUrl)) {
      const newAvatarUrl = user.avatar_url.replace(oldUrl, newUrl)
      await supabase.from('users').update({ avatar_url: newAvatarUrl }).eq('id', user.id)
      updated++
    }
  }
  
  console.log(`已更新 ${updated} 个用户头像`)
}

async function updatePostsImages() {
  console.log('更新帖子图片...')
  const { data: posts, error } = await supabase.from('posts').select('id, images')
  
  if (error) {
    console.log('获取帖子失败:', error)
    return
  }
  
  let updated = 0
  for (const post of posts) {
    if (post.images && Array.isArray(post.images)) {
      const updatedImages = post.images.map(img => 
        img.includes(oldUrl) ? img.replace(oldUrl, newUrl) : img
      )
      const needsUpdate = updatedImages.some((img, i) => img !== post.images[i])
      if (needsUpdate) {
        await supabase.from('posts').update({ images: updatedImages }).eq('id', post.id)
        updated++
      }
    }
  }
  
  console.log(`已更新 ${updated} 个帖子图片`)
}

async function main() {
  console.log('开始更新头像 URL...')
  
  await updatePetsAvatars()
  await updateUsersAvatars()
  await updatePostsImages()
  
  console.log('🎉 更新完成！')
}

main().catch(err => {
  console.error('更新失败:', err)
  process.exit(1)
})
