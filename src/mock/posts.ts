export interface Location {
  address: string
  latitude: number | null
  longitude: number | null
}

export interface Post {
  id: string
  petId: string
  petName: string
  petAvatar: string
  content: string
  images: string[]
  likes: number
  comments: number
  tags: string[]
  createdAt: string
  date: string
  isLiked?: boolean
  isDiary?: boolean
  isPublic?: boolean
  mood?: string
  location?: Location | null
}

export const mockPosts: Post[] = [
  {
    id: '1',
    petId: '1',
    petName: '橘猫球球',
    petAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20orange%20tabby%20cat%20portrait%20fluffy%20warm%20lighting&image_size=square',
    content: '今天拆家被铲屎官抓包了，假装无辜中... 🐾',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=orange%20tabby%20cat%20knocking%20over%20vase%20guilty%20face&image_size=landscape_4_3'],
    likes: 28,
    comments: 5,
    tags: ['#调皮', '#萌宠', '#日常'],
    createdAt: '3小时前',
    date: '2025-06-15',
    isLiked: false,
    isDiary: false,
    isPublic: true
  },
  {
    id: '2',
    petId: '2',
    petName: '金毛旺财',
    petAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=golden%20retriever%20dog%20portrait%20friendly%20smile&image_size=square',
    content: '今天去公园玩嗨了！跑了好几公里，回家累趴了 🦴',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=golden%20retriever%20running%20in%20park%20happy&image_size=landscape_4_3'],
    likes: 45,
    comments: 12,
    tags: ['#开心', '#户外', '#运动'],
    createdAt: '1小时前',
    date: '2025-06-15',
    isLiked: true,
    isDiary: false,
    isPublic: true
  },
  {
    id: '3',
    petId: '1',
    petName: '橘猫球球',
    petAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20orange%20tabby%20cat%20portrait%20fluffy%20warm%20lighting&image_size=square',
    content: '朕的御用睡榻，舒服~ 😴',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=orange%20tabby%20cat%20sleeping%20on%20soft%20blanket&image_size=landscape_4_3'],
    likes: 32,
    comments: 8,
    tags: ['#慵懒', '#睡觉', '#萌宠'],
    createdAt: '5小时前',
    date: '2025-06-14',
    isLiked: false,
    isDiary: false,
    isPublic: true
  },
  {
    id: '4',
    petId: '3',
    petName: '兔兔棉花糖',
    petAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20lop%20eared%20rabbit%20white%20fluffy&image_size=square',
    content: '胡萝卜是世界上最好吃的东西！🥕',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=white%20rabbit%20eating%20carrot%20happy&image_size=landscape_4_3'],
    likes: 21,
    comments: 4,
    tags: ['#吃货', '#可爱', '#兔子'],
    createdAt: '6小时前',
    date: '2025-06-14',
    isLiked: false,
    isDiary: false,
    isPublic: true
  },
  {
    id: '5',
    petId: '6',
    petName: '蓝猫蓝蓝',
    petAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=british%20shorthair%20cat%20blue%20grey%20chubby&image_size=square',
    content: '看什么看？没见过帅哥吗？😎',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=british%20shorthair%20cat%20posing%20handsome&image_size=landscape_4_3'],
    likes: 56,
    comments: 15,
    tags: ['#高冷', '#帅气', '#萌宠'],
    createdAt: '8小时前',
    date: '2025-06-13',
    isLiked: true,
    isDiary: false,
    isPublic: true
  },
  {
    id: '6',
    petId: '2',
    petName: '金毛旺财',
    petAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=golden%20retriever%20dog%20portrait%20friendly%20smile&image_size=square',
    content: '今天学会了新技能！握手~ 快夸夸我！🐾',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=golden%20retriever%20dog%20shaking%20hands%20proud&image_size=landscape_4_3'],
    likes: 67,
    comments: 18,
    tags: ['#聪明', '#技能', '#可爱'],
    createdAt: '昨天',
    date: '2025-06-12',
    isLiked: false,
    isDiary: false,
    isPublic: true
  },
  {
    id: '7',
    petId: '5',
    petName: '鹦鹉可可',
    petAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cockatiel%20parrot%20yellow%20crest%20friendly&image_size=square',
    content: '我会吹口哨啦！🎶',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cockatiel%20parrot%20singing%20happy&image_size=landscape_4_3'],
    likes: 38,
    comments: 11,
    tags: ['#才艺', '#鹦鹉', '#可爱'],
    createdAt: '昨天',
    date: '2025-06-12',
    isLiked: false,
    isDiary: false,
    isPublic: true
  },
  {
    id: '8',
    petId: '4',
    petName: '仓鼠小团子',
    petAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20hamster%20golden%20syrian%20fluffy%20cute&image_size=square',
    content: '今天囤了好多粮食，安全感满满！🌻',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hamster%20storing%20food%20cheeks%20full&image_size=landscape_4_3'],
    likes: 25,
    comments: 7,
    tags: ['#吃货', '#仓鼠', '#可爱'],
    createdAt: '昨天',
    date: '2025-06-11',
    isLiked: false,
    isDiary: false,
    isPublic: true
  },
  {
    id: '9',
    petId: '6',
    petName: '蓝猫蓝蓝',
    petAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=british%20shorthair%20cat%20blue%20grey%20chubby&image_size=square',
    content: '今天有小鱼干吃，开心到模糊~ 🐟',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=british%20shorthair%20cat%20eating%20fish%20treat%20happy&image_size=landscape_4_3'],
    likes: 42,
    comments: 9,
    tags: ['#吃货', '#开心', '#萌宠'],
    createdAt: '2天前',
    date: '2025-06-10',
    isLiked: false,
    isDiary: false,
    isPublic: true
  },
  {
    id: '10',
    petId: '1',
    petName: '橘猫球球',
    petAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20orange%20tabby%20cat%20portrait%20fluffy%20warm%20lighting&image_size=square',
    content: '晒太阳真舒服~ ☀️',
    images: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=orange%20tabby%20cat%20sunbathing%20relaxed&image_size=landscape_4_3'],
    likes: 35,
    comments: 6,
    tags: ['#慵懒', '#阳光', '#日常'],
    createdAt: '2天前',
    date: '2025-06-08',
    isLiked: true,
    isDiary: false,
    isPublic: true
  }
]

export const dailyQuotes = [
  '今天也是爱毛孩子的一天！🐾',
  '宠物是人类最好的朋友~ 🐱🐶',
  '每一个毛孩子都是天使！👼',
  '养宠是一场温柔的修行~ 💖',
  '今天也要对毛孩子好一点！🥰'
]
