import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import { generatePetAvatar, generateUserAvatar } from '../src/utils/avatarGenerator'

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

const testUsers = [
  { email: 'user1@test.com', password: '123456', name: '铲屎官小明', bio: '热爱猫咪，家有两只橘猫' },
  { email: 'user2@test.com', password: '123456', name: '狗狗达人', bio: '金毛铲屎官，分享养宠经验' },
  { email: 'user3@test.com', password: '123456', name: '兔兔爱好者', bio: '养兔新手，学习中' },
  { email: 'user4@test.com', password: '123456', name: '宠物医生小李', bio: '执业兽医，免费解答宠物健康问题' },
  { email: 'user5@test.com', password: '123456', name: '流浪动物救助者', bio: '关注流浪动物，希望每个毛孩子都有家' },
  { email: 'user6@test.com', password: '123456', name: '仓鼠养殖专家', bio: '养仓鼠多年，有丰富经验' },
  { email: 'user7@test.com', password: '123456', name: '鹦鹉训练师', bio: '擅长训练鹦鹉说话和技能' },
  { email: 'user8@test.com', password: '123456', name: '金鱼爱好者', bio: '喜欢养金鱼，研究水族箱' },
  { email: 'user9@test.com', password: '123456', name: '爬宠玩家', bio: '饲养蜥蜴和蛇，爬行动物爱好者' },
  { email: 'user10@test.com', password: '123456', name: '鸟类保护者', bio: '关注鸟类保护，救助受伤鸟类' }
]

const petNames = {
  cat: ['橘子', '咪咪', '雪球', '煤球', '布丁', '年糕', '芝麻', '奥利奥'],
  dog: ['旺财', '豆豆', '乐乐', '多多', '欢欢', '球球', '毛毛', '熊熊'],
  other: ['棉花糖', '小团子', '可可', '啾啾', '布丁', '糖糖']
}

const petBreeds = {
  cat: ['橘猫', '英短', '布偶', '暹罗', '美短', '波斯猫', '田园猫'],
  dog: ['金毛', '柯基', '柴犬', '哈士奇', '泰迪', '法斗', '边牧'],
  other: ['垂耳兔', '仓鼠', '鹦鹉', '荷兰猪', '刺猬', '金鱼']
}

const postContents = [
  '今天拆家被铲屎官抓包了，假装无辜中... 🐾',
  '今天去公园玩嗨了！跑了好几公里，回家累趴了 🦴',
  '朕的御用睡榻，舒服~ 😴',
  '胡萝卜是世界上最好吃的东西！🥕',
  '看什么看？没见过帅哥吗？😎',
  '今天学会了新技能！握手~ 快夸夸我！🐾',
  '我会吹口哨啦！🎶',
  '今天囤了好多粮食，安全感满满！🌻',
  '今天有小鱼干吃，开心到模糊~ 🐟',
  '晒太阳真舒服~ ☀️',
  '第一次见到雪，好兴奋！❄️',
  '和小伙伴一起玩耍真开心！🐾',
  '今天去洗澡了，香喷喷~ 🛁',
  '铲屎官给我买了新玩具，开心！🎾',
  '发呆中...思考喵生 🐱'
]

const postTags = [
  ['#调皮', '#萌宠', '#日常'],
  ['#开心', '#户外', '#运动'],
  ['#慵懒', '#睡觉', '#萌宠'],
  ['#吃货', '#可爱', '#兔子'],
  ['#高冷', '#帅气', '#萌宠'],
  ['#聪明', '#技能', '#可爱'],
  ['#才艺', '#鹦鹉', '#可爱'],
  ['#吃货', '#仓鼠', '#可爱'],
  ['#吃货', '#开心', '#萌宠'],
  ['#慵懒', '#阳光', '#日常']
]

const moods = ['happy', 'love', 'sad', 'lazy', 'angry', 'cool']

const helpTitles = [
  '猫咪最近总是呕吐，怎么办？',
  '狗狗不吃东西，精神也不好',
  '求助！捡到一只受伤的流浪猫',
  '新手养猫需要准备什么？',
  '狗狗一直叫，怎么训练？',
  '猫咪掉毛严重，有什么办法？',
  '宠物疫苗什么时候打？',
  '家里来了新猫，原住民不接受怎么办？'
]

const helpContents = [
  '我家猫咪最近一周总是呕吐，吐的是没消化的猫粮，精神还可以，食欲也正常。请问这是什么原因？需要去医院吗？',
  '狗狗两天没吃东西了，精神很差，总是趴着睡觉。之前一切正常，没有吃错东西。求助！',
  '今天在小区楼下捡到一只受伤的流浪猫，后腿好像骨折了，一直叫。请问附近有宠物医院推荐吗？或者我现在应该怎么做？',
  '准备养猫了，新手小白一枚。请问需要准备哪些东西？猫粮、猫砂怎么选？有没有推荐的品牌？',
  '我家狗狗晚上总是叫，吵得邻居都有意见了。试过很多方法都没用，有没有大神教教我怎么训练？',
  '一到换季猫咪掉毛就特别严重，家里到处都是毛。有没有什么好办法减少掉毛？或者推荐好用的梳毛工具？',
  '家里刚抱回来一只两个月的小狗，请问疫苗什么时候打？打什么疫苗？需要注意什么？',
  '昨天带回来一只新猫咪，家里的原住民一直哈它，还想打架。怎么让它们和平相处？'
]

const commentContents = [
  '太可爱了！🥰',
  '哈哈，同款拆家猫',
  '好可爱啊！',
  '学到了！',
  '我家的也是这样',
  '太萌了！',
  '好厉害！',
  '哈哈哈，笑死',
  '可爱到犯规！',
  '羡慕有宠物的人',
  '请问这是什么品种？',
  '好治愈！',
  '养得真好！',
  '求教程！',
  '点赞！'
]

async function createExecFunction() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        function_name: 'execute_sql',
        args: { sql: 'SELECT 1' }
      })
    })
    if (!response.ok) {
      const result = await response.json()
      if (result.code === 'PGRST202') {
        const createFuncResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            query: `CREATE OR REPLACE FUNCTION execute_sql(sql TEXT) RETURNS VOID AS $$ BEGIN EXECUTE sql; END; $$ LANGUAGE plpgsql SECURITY DEFINER;`
          })
        })
        console.log('创建execute_sql函数:', createFuncResponse.status)
      }
    }
  } catch (e) {
    console.log('创建函数失败:', e)
  }
}

async function initDatabase() {
  console.log('初始化数据库表结构...')

  const alterQueries = [
    'ALTER TABLE IF EXISTS users ALTER COLUMN name DROP NOT NULL',
    'ALTER TABLE IF EXISTS users ALTER COLUMN email DROP NOT NULL',
    'ALTER TABLE IF EXISTS users ALTER COLUMN avatar_url DROP NOT NULL'
  ]

  for (const query of alterQueries) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          query
        })
      })
      console.log('执行SQL:', query.substring(0, 50), '...', response.status)
    } catch (e) {
      console.log('执行SQL失败:', query.substring(0, 50), '...', e)
    }
  }

  console.log('数据库初始化完成')
}

async function main() {
  console.log('开始创建测试数据...')

  await initDatabase()

  const createdUsers: { id: string; name: string }[] = []

  for (const userData of testUsers) {
    try {
      const avatarUrl = generateUserAvatar()
      
      const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            name: userData.name,
            avatar_url: avatarUrl
          }
        })
      })

      const authResult = await authResponse.json()

      if (authResponse.ok && authResult.id) {
        await supabase
          .from('users')
          .upsert({
            id: authResult.id,
            email: userData.email,
            name: userData.name,
            bio: userData.bio,
            avatar_url: avatarUrl
          })

        createdUsers.push({ id: authResult.id, name: userData.name })
        console.log(`创建用户成功: ${userData.name}`)
      } else {
        console.log(`创建用户 ${userData.email} 失败:`, JSON.stringify(authResult))
      }
    } catch (err: any) {
      console.log(`创建用户 ${userData.email} 失败:`, err.message)
    }
  }

  console.log(`\n共创建 ${createdUsers.length} 个用户`)

  if (createdUsers.length === 0) {
    console.error('未创建任何用户，退出脚本')
    process.exit(1)
  }

  const createdPets: { id: string; ownerId: string; name: string }[] = []

  for (const user of createdUsers) {
    const petCount = Math.floor(Math.random() * 3) + 1

    for (let i = 0; i < petCount; i++) {
      const petTypes: Array<'cat' | 'dog' | 'other'> = ['cat', 'dog', 'other']
      const petType = petTypes[Math.floor(Math.random() * petTypes.length)]
      const breed = petBreeds[petType][Math.floor(Math.random() * petBreeds[petType].length)]

      const { data, error } = await supabase.from('pets').insert({
        owner_id: user.id,
        name: petNames[petType][Math.floor(Math.random() * petNames[petType].length)],
        avatar_url: generatePetAvatar(breed),
        breed,
        gender: ['male', 'female', 'unknown'][Math.floor(Math.random() * 3)] as any,
        birth_date: new Date(Date.now() - Math.floor(Math.random() * 365 * 3) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        weight: Math.random() * 10 + 1,
        color: ['橘色', '黑色', '白色', '灰色', '花色', '棕色'][Math.floor(Math.random() * 6)],
        personality: ['活泼', '安静', '粘人', '高冷', '调皮'][Math.floor(Math.random() * 5)]
      }).select().single()

      if (!error && data) {
        createdPets.push({ id: data.id, ownerId: user.id, name: data.name })
        console.log(`创建宠物成功: ${data.name} (${breed})`)
      }
    }
  }

  console.log(`\n共创建 ${createdPets.length} 个宠物`)

  const createdPosts: { id: string; petId: string; ownerId: string }[] = []

  for (const pet of createdPets) {
    const postCount = Math.floor(Math.random() * 4) + 1

    for (let i = 0; i < postCount; i++) {
      const content = postContents[Math.floor(Math.random() * postContents.length)]
      const tags = postTags[Math.floor(Math.random() * postTags.length)]

      const { data, error } = await supabase.from('posts').insert({
        pet_id: pet.id,
        content,
        images: Math.random() > 0.3 ? [generatePetAvatar()] : [],
        tags,
        post_type: ['public', 'public', 'public', 'diary'][Math.floor(Math.random() * 4)] as any,
        mood: moods[Math.floor(Math.random() * moods.length)] as any,
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }).select().single()

      if (!error && data) {
        createdPosts.push({ id: data.id, petId: pet.id, ownerId: pet.ownerId })
        console.log(`创建帖子成功: ${content.slice(0, 20)}...`)
      }
    }
  }

  console.log(`\n共创建 ${createdPosts.length} 个帖子`)

  for (const post of createdPosts) {
    const likeCount = Math.floor(Math.random() * 10)

    for (let i = 0; i < likeCount; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)]
      if (randomUser.id !== post.ownerId) {
        await supabase.from('likes').insert({
          post_id: post.id,
          user_id: randomUser.id
        })
      }
    }

    const commentCount = Math.floor(Math.random() * 5)

    for (let i = 0; i < commentCount; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)]
      if (randomUser.id !== post.ownerId) {
        await supabase.from('comments').insert({
          post_id: post.id,
          user_id: randomUser.id,
          content: commentContents[Math.floor(Math.random() * commentContents.length)]
        })
      }
    }
  }

  console.log('\n已为帖子添加点赞和评论')

  for (let i = 0; i < createdUsers.length; i++) {
    for (let j = 0; j < createdUsers.length; j++) {
      if (i !== j && Math.random() > 0.5) {
        await supabase.from('follows').insert({
          follower_id: createdUsers[i].id,
          following_id: createdUsers[j].id
        })
      }
    }
  }

  console.log('\n已创建关注关系')

  for (let i = 0; i < 4; i++) {
    const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)]
    const { data, error } = await supabase.from('help_posts').insert({
      author_id: randomUser.id,
      zone: ['experience', 'help', 'rescue'][Math.floor(Math.random() * 3)] as any,
      title: helpTitles[i],
      content: helpContents[i],
      is_urgent: Math.random() > 0.7
    }).select().single()

    if (!error && data) {
      const answerCount = Math.floor(Math.random() * 3) + 1

      for (let j = 0; j < answerCount; j++) {
        const answerUser = createdUsers[Math.floor(Math.random() * createdUsers.length)]
        if (answerUser.id !== randomUser.id) {
          await supabase.from('help_answers').insert({
            help_post_id: data.id,
            author_id: answerUser.id,
            content: '这个问题我有经验！' + commentContents[Math.floor(Math.random() * commentContents.length)],
            is_accepted: j === 0 && Math.random() > 0.5
          })
        }
      }
    }
  }

  console.log('\n已创建互助帖子和回答')

  for (let i = 0; i < createdUsers.length; i++) {
    for (let j = 0; j < createdUsers.length; j++) {
      if (i !== j && Math.random() > 0.7) {
        const messageCount = Math.floor(Math.random() * 5) + 1

        for (let k = 0; k < messageCount; k++) {
          await supabase.from('messages').insert({
            sender_id: createdUsers[i].id,
            receiver_id: createdUsers[j].id,
            content: commentContents[Math.floor(Math.random() * commentContents.length)],
            read: Math.random() > 0.3
          })
        }
      }
    }
  }

  console.log('\n已创建私信消息')

  console.log('\n🎉 测试数据创建完成！')
  console.log('用户列表:')
  testUsers.forEach(user => {
    console.log(`  - ${user.name}: ${user.email} / ${user.password}`)
  })
}

main().catch(err => {
  console.error('创建测试数据失败:', err)
  process.exit(1)
})