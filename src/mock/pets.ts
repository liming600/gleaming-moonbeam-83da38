export interface Pet {
  id: string
  name: string
  breed: string
  age: string
  avatar: string
  avatar_url?: string
  coverImage: string
  description: string
  posts: number
  likes: number
  followers: number
  createdAt: string
  created_at?: string
  ownerId: string
  owner_id?: string
  ownerName: string
  ownerAvatar: string
  personality?: string
  milestones: Milestone[]
}

export interface Milestone {
  id: string
  title: string
  description: string
  date: string
  icon: string
}

export const mockPets: Pet[] = [
  {
    id: '1',
    name: '橘猫球球',
    breed: '橘猫',
    age: '2岁',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20orange%20tabby%20cat%20portrait%20fluffy%20warm%20lighting&image_size=square',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=orange%20tabby%20cat%20playing%20with%20yarn%20ball%20cozy%20room&image_size=landscape_16_9',
    description: '一只超级可爱的橘猫，每天除了吃就是睡，偶尔拆家~',
    posts: 28,
    likes: 156,
    followers: 89,
    createdAt: '2024-06-15',
    ownerId: 'demo1',
    ownerName: '铲屎官小明',
    ownerAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20man%20portrait%20friendly%20smile&image_size=square',
    milestones: [
      { id: 'm1', title: '第一次发帖', description: '发布了第一张照片', date: '2024-06-15', icon: '📝' },
      { id: 'm2', title: '社区明星', description: '获得100+获赞', date: '2024-07-20', icon: '⭐' },
      { id: 'm3', title: '人气爆棚', description: '获得500+获赞', date: '2024-09-10', icon: '🔥' },
      { id: 'm4', title: '一周年纪念', description: '加入宠友圈一周年', date: '2025-06-15', icon: '🎂' }
    ]
  },
  {
    id: '2',
    name: '金毛旺财',
    breed: '金毛寻回犬',
    age: '3岁',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=golden%20retriever%20dog%20portrait%20friendly%20smile&image_size=square',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=golden%20retriever%20playing%20in%20park%20sunny%20day&image_size=landscape_16_9',
    description: '温顺听话的大暖男，喜欢游泳和捡球~',
    posts: 45,
    likes: 234,
    followers: 156,
    createdAt: '2023-08-20',
    ownerId: 'demo1',
    ownerName: '铲屎官小明',
    ownerAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20man%20portrait%20friendly%20smile&image_size=square',
    milestones: [
      { id: 'm5', title: '第一次发帖', description: '发布了第一张照片', date: '2023-08-20', icon: '📝' },
      { id: 'm6', title: '社区明星', description: '获得100+获赞', date: '2023-10-01', icon: '⭐' },
      { id: 'm7', title: '人气爆棚', description: '获得500+获赞', date: '2024-01-15', icon: '🔥' }
    ]
  },
  {
    id: '3',
    name: '兔兔棉花糖',
    breed: '垂耳兔',
    age: '1岁',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20lop%20eared%20rabbit%20white%20fluffy&image_size=square',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=white%20rabbit%20eating%20carrots%20garden&image_size=landscape_16_9',
    description: '软萌可爱的垂耳兔，爱吃胡萝卜~',
    posts: 15,
    likes: 89,
    followers: 42,
    createdAt: '2025-03-10',
    ownerId: 'demo2',
    ownerName: '爱宠达人小红',
    ownerAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20woman%20portrait%20friendly%20smile&image_size=square',
    milestones: [
      { id: 'm8', title: '第一次发帖', description: '发布了第一张照片', date: '2025-03-10', icon: '📝' }
    ]
  },
  {
    id: '4',
    name: '仓鼠小团子',
    breed: '金丝熊',
    age: '8个月',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20hamster%20golden%20syrian%20fluffy%20cute&image_size=square',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hamster%20eating%20sunflower%20seed%20cage&image_size=landscape_16_9',
    description: '圆滚滚的金丝熊，爱囤粮~',
    posts: 12,
    likes: 67,
    followers: 28,
    createdAt: '2025-11-01',
    ownerId: 'demo3',
    ownerName: '宠物爱好者小刚',
    ownerAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20man%20portrait%20glasses%20friendly&image_size=square',
    milestones: [
      { id: 'm9', title: '第一次发帖', description: '发布了第一张照片', date: '2025-11-01', icon: '📝' }
    ]
  },
  {
    id: '5',
    name: '鹦鹉可可',
    breed: '玄凤鹦鹉',
    age: '1岁半',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cockatiel%20parrot%20yellow%20crest%20friendly&image_size=square',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cockatiel%20parrot%20standing%20on%20perch%20sunshine&image_size=landscape_16_9',
    description: '会吹口哨的小鹦鹉，超级粘人~',
    posts: 20,
    likes: 112,
    followers: 65,
    createdAt: '2025-01-15',
    ownerId: 'demo2',
    ownerName: '爱宠达人小红',
    ownerAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20woman%20portrait%20friendly%20smile&image_size=square',
    milestones: [
      { id: 'm10', title: '第一次发帖', description: '发布了第一张照片', date: '2025-01-15', icon: '📝' },
      { id: 'm11', title: '社区明星', description: '获得100+获赞', date: '2025-04-01', icon: '⭐' }
    ]
  },
  {
    id: '6',
    name: '蓝猫蓝蓝',
    breed: '英国短毛猫',
    age: '2岁',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=british%20shorthair%20cat%20blue%20grey%20chubby&image_size=square',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=british%20shorthair%20cat%20sleeping%20on%20sofa&image_size=landscape_16_9',
    description: '高冷傲娇的蓝胖子，其实很粘人~',
    posts: 32,
    likes: 189,
    followers: 112,
    createdAt: '2024-05-20',
    ownerId: 'demo4',
    ownerName: '猫奴阿强',
    ownerAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20man%20portrait%20casual%20style&image_size=square',
    milestones: [
      { id: 'm12', title: '第一次发帖', description: '发布了第一张照片', date: '2024-05-20', icon: '📝' },
      { id: 'm13', title: '社区明星', description: '获得100+获赞', date: '2024-07-01', icon: '⭐' },
      { id: 'm14', title: '人气爆棚', description: '获得500+获赞', date: '2024-10-15', icon: '🔥' }
    ]
  }
]

export const currentUserPets = mockPets.slice(0, 2)
