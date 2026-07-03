// 商家类型定义
export interface Business {
  id: string
  name: string
  logo: string
  cover: string
  type: 'hospital' | 'shop' | 'grooming' | 'boarding' | 'training'
  typeName: string
  typeIcon: string
  rating: number
  reviewCount: number
  distance: string
  address: string
  promotion: string
  isVerified: boolean
  tags: string[]
}

// 博主/达人类型定义
export interface Blogger {
  id: string
  name: string
  avatar: string
  bio: string
  followers: number
  posts: number
  isVerified: boolean
  specialty: string
  latestPost: {
    title: string
    cover: string
    likes: number
    isAd: boolean
  }
}

// 商家快捷入口
export const businessCategories = [
  { key: 'hospital', label: '宠物医院', icon: '🏥', color: '#EF4444' },
  { key: 'shop', label: '宠物用品', icon: '🛒', color: '#F97316' },
  { key: 'grooming', label: '宠物美容', icon: '✂️', color: '#8B5CF6' },
  { key: 'boarding', label: '宠物寄养', icon: '🏠', color: '#3B82F6' },
  { key: 'training', label: '宠物训练', icon: '🎓', color: '#10B981' }
]

// 精选商家推荐
export const mockBusinesses: Business[] = [
  {
    id: 'biz1',
    name: '萌宠健康宠物医院',
    logo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20hospital%20logo%20clean%20modern%20veterinary&image_size=square',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20hospital%20interior%20bright%20clean&image_size=landscape_16_9',
    type: 'hospital',
    typeName: '宠物医院',
    typeIcon: '🏥',
    rating: 4.8,
    reviewCount: 326,
    distance: '1.2km',
    address: '朝阳区宠物大道88号',
    promotion: '首单体检8折',
    isVerified: true,
    tags: ['疫苗', '体检', '急诊']
  },
  {
    id: 'biz2',
    name: '爪爪优选生活馆',
    logo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20shop%20logo%20cute%20paw%20store&image_size=square',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20supplies%20store%20colorful%20products&image_size=landscape_16_9',
    type: 'shop',
    typeName: '宠物用品',
    typeIcon: '🛒',
    rating: 4.9,
    reviewCount: 512,
    distance: '0.8km',
    address: '海淀区萌宠街66号',
    promotion: '满199减50',
    isVerified: true,
    tags: ['主粮', '零食', '玩具']
  },
  {
    id: 'biz3',
    name: '丝丝宠物美容SPA',
    logo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20grooming%20salon%20logo%20elegant&image_size=square',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20grooming%20salon%20interior%20modern&image_size=landscape_16_9',
    type: 'grooming',
    typeName: '宠物美容',
    typeIcon: '✂️',
    rating: 4.7,
    reviewCount: 189,
    distance: '2.1km',
    address: '西城区宠爱路33号',
    promotion: '洗澡+修剪套餐立减30',
    isVerified: true,
    tags: ['洗澡', '修剪', 'SPA']
  },
  {
    id: 'biz4',
    name: '安心宠寄养中心',
    logo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20boarding%20center%20logo%20warm%20home&image_size=square',
    cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20boarding%20facility%20clean%20comfortable&image_size=landscape_16_9',
    type: 'boarding',
    typeName: '宠物寄养',
    typeIcon: '🏠',
    rating: 4.6,
    reviewCount: 98,
    distance: '3.5km',
    address: '丰台区宠物乐园12号',
    promotion: '寄养3天送1天',
    isVerified: true,
    tags: ['日托', '长期寄养', '上门喂养']
  }
]

// 达人博主
export const mockBloggers: Blogger[] = [
  {
    id: 'blogger1',
    name: '猫咪营养师小林',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20nutritionist%20female%20professional%20portrait&image_size=square',
    bio: '专注宠物营养5年 | 科学喂养倡导者',
    followers: 12800,
    posts: 236,
    isVerified: true,
    specialty: '营养饮食',
    latestPost: {
      title: '【好物推荐】我家猫咪吃了半年的主食罐头，毛色亮了不是一点半点',
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cat%20food%20cans%20product%20photography&image_size=landscape_4_3',
      likes: 3420,
      isAd: true
    }
  },
  {
    id: 'blogger2',
    name: '训犬师老王',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dog%20trainer%20male%20professional%20portrait&image_size=square',
    bio: '从业10年 | 解决1000+行为问题',
    followers: 25600,
    posts: 412,
    isVerified: true,
    specialty: '行为训练',
    latestPost: {
      title: '狗狗总乱拉怎么办？3步教会定点大小便，亲测有效',
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dog%20training%20positive%20reinforcement&image_size=landscape_4_3',
      likes: 5610,
      isAd: false
    }
  },
  {
    id: 'blogger3',
    name: '布偶猫日常',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ragdoll%20cat%20blogger%20cute%20portrait&image_size=square',
    bio: '两只布偶的铲屎官 | 记录主子每一天',
    followers: 8900,
    posts: 568,
    isVerified: false,
    specialty: '萌宠日常',
    latestPost: {
      title: '今天给主子买了新窝，结果它只喜欢箱子...😂',
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cat%20in%20cardboard%20box%20funny%20cute&image_size=landscape_4_3',
      likes: 2890,
      isAd: false
    }
  }
]
