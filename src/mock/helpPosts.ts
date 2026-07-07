export interface Location {
  address: string
  latitude: number | null
  longitude: number | null
}

export interface HelpPost {
  id: string
  authorId?: string
  authorName: string
  authorAvatar: string
  zone: 'experience' | 'question' | 'rescue' | 'mutual'
  zoneLabel: string
  title: string
  content: string
  answers: number
  status: 'open' | 'taken' | 'resolved'
  statusLabel: string
  isUrgent: boolean
  createdAt: string
  acceptedAnswer?: string
  location?: Location | null
}

export const mockHelpPosts: HelpPost[] = [
  {
    id: 'h1',
    zone: 'question',
    zoneLabel: '问答',
    title: '猫咪换粮后软便怎么办？',
    content: '我家猫咪最近换了新粮，开始软便，已经3天了，精神状态还好，食欲也正常，请问该怎么办？',
    authorName: '铲屎官小明',
    authorAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20man%20portrait%20friendly%20smile&image_size=square',
    answers: 12,
    status: 'resolved',
    statusLabel: '已解决',
    isUrgent: false,
    createdAt: '2小时前',
    acceptedAnswer: '建议先停换新粮，喂益生菌调理，慢慢过渡'
  },
  {
    id: 'h2',
    zone: 'rescue',
    zoneLabel: '救助',
    title: '紧急！发现流浪奶猫求领养',
    content: '在小区楼下发现一只被遗弃的奶猫，大概2周大，身体虚弱，急需好心人领养或提供救助建议！',
    authorName: '爱心人士',
    authorAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20woman%20portrait%20kind%20smile&image_size=square',
    answers: 8,
    status: 'open',
    statusLabel: '求助中',
    isUrgent: true,
    createdAt: '10分钟前'
  },
  {
    id: 'h3',
    zone: 'mutual',
    zoneLabel: '互帮',
    title: '出差一周求帮忙喂猫',
    content: '下周要出差一周，求附近的宠友帮忙每天喂一次猫，家里有自动喂食器，主要是换猫砂和陪玩~',
    authorName: '出差达人',
    authorAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=business%20person%20portrait%20professional&image_size=square',
    answers: 5,
    status: 'taken',
    statusLabel: '已接单',
    isUrgent: false,
    createdAt: '5小时前'
  },
  {
    id: 'h4',
    zone: 'experience',
    zoneLabel: '经验',
    title: '分享我家猫咪绝育后的护理心得',
    content: '上周带我家猫咪去做了绝育手术，现在恢复得很好，分享一下术后护理的注意事项...',
    authorName: '资深铲屎官',
    authorAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=middle%20age%20woman%20portrait%20warm%20smile&image_size=square',
    answers: 23,
    status: 'resolved',
    statusLabel: '已采纳',
    isUrgent: false,
    createdAt: '昨天'
  },
  {
    id: 'h5',
    zone: 'question',
    zoneLabel: '问答',
    title: '狗狗老是咬家具怎么办？',
    content: '我家狗狗5个月大，正是磨牙期，家里的沙发和鞋子都遭了殃，请问有什么好办法？',
    authorName: '新手养狗',
    authorAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20couple%20portrait%20happy&image_size=square',
    answers: 15,
    status: 'open',
    statusLabel: '求助中',
    isUrgent: false,
    createdAt: '昨天'
  },
  {
    id: 'h6',
    zone: 'mutual',
    zoneLabel: '互帮',
    title: '周末求遛狗搭子',
    content: '周末想带狗狗去公园玩，有没有附近的宠友一起？可以互相帮忙看狗，交流养宠心得~',
    authorName: '爱狗人士',
    authorAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20man%20with%20dog%20happy&image_size=square',
    answers: 7,
    status: 'open',
    statusLabel: '求助中',
    isUrgent: false,
    createdAt: '3天前'
  },
  {
    id: 'h7',
    zone: 'rescue',
    zoneLabel: '救助',
    title: '流浪狗腿受伤了，求帮助',
    content: '在公园发现一只流浪狗后腿受伤，走路一瘸一拐的，想带它去医院但不知道哪家宠物医院靠谱又不贵...',
    authorName: '路人甲',
    authorAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=student%20portrait%20friendly&image_size=square',
    answers: 10,
    status: 'resolved',
    statusLabel: '已解决',
    isUrgent: true,
    createdAt: '3天前'
  },
  {
    id: 'h8',
    zone: 'experience',
    zoneLabel: '经验',
    title: '猫咪洗澡全攻略',
    content: '分享一下给猫咪洗澡的心得，从准备工作到洗澡过程再到吹干，一步步教你搞定~',
    authorName: '猫奴一枚',
    authorAvatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=woman%20with%20cat%20portrait%20happy&image_size=square',
    answers: 31,
    status: 'resolved',
    statusLabel: '已采纳',
    isUrgent: false,
    createdAt: '4天前'
  }
]

export const zoneConfig = {
  experience: { label: '经验', icon: '📚', color: '#F97316' },
  question: { label: '问答', icon: '❓', color: '#3B82F6' },
  rescue: { label: '救助', icon: '🚑', color: '#EF4444' },
  mutual: { label: '互帮', icon: '🤝', color: '#22C55E' }
}
