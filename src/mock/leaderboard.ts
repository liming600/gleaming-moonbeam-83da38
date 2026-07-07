export interface LeaderboardUser {
  id: string
  name: string
  avatar: string
  answers: number
  accepted: number
  rank: number
}

export const mockLeaderboard: LeaderboardUser[] = [
  {
    id: 'user1',
    name: '兽医小王',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20vet%20doctor%20portrait%20professional&image_size=square',
    answers: 156,
    accepted: 89,
    rank: 1
  },
  {
    id: 'user2',
    name: '养宠达人',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20lover%20woman%20portrait%20warm&image_size=square',
    answers: 128,
    accepted: 76,
    rank: 2
  },
  {
    id: 'user3',
    name: '喵星人守护',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cat%20lover%20young%20man%20friendly&image_size=square',
    answers: 98,
    accepted: 54,
    rank: 3
  },
  {
    id: 'user4',
    name: '汪星人专家',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dog%20trainer%20professional%20portrait&image_size=square',
    answers: 76,
    accepted: 42,
    rank: 4
  },
  {
    id: 'user5',
    name: '仓鼠爱好者',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hamster%20enthusiast%20cute%20portrait&image_size=square',
    answers: 54,
    accepted: 31,
    rank: 5
  },
  {
    id: 'user6',
    name: '宠物营养师',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=nurse%20professional%20smile%20portrait&image_size=square',
    answers: 45,
    accepted: 28,
    rank: 6
  },
  {
    id: 'user7',
    name: '新手铲屎官',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20owner%20young%20person%20happy&image_size=square',
    answers: 32,
    accepted: 18,
    rank: 7
  },
  {
    id: 'user8',
    name: '流浪猫救助站',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animal%20rescue%20volunteer%20portrait&image_size=square',
    answers: 28,
    accepted: 15,
    rank: 8
  },
  {
    id: 'user9',
    name: '鹦鹉小窝',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bird%20lover%20portrait%20colorful&image_size=square',
    answers: 24,
    accepted: 12,
    rank: 9
  },
  {
    id: 'user10',
    name: '兔兔之家',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rabbit%20owner%20cute%20portrait&image_size=square',
    answers: 18,
    accepted: 8,
    rank: 10
  }
]
