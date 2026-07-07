const catPrompts = {
  default: [
    'cute cartoon cat portrait, chibi style, colorful, playful expression',
    'kawaii anime cat portrait, big eyes, fluffy, pastel colors',
    'cute comic style cat, happy expression',
    'cartoon kitten avatar, round face, adorable, vibrant colors'
  ],
  orange: [
    'cute cartoon orange tabby cat portrait, chibi style, playful',
    'kawaii anime ginger cat, orange fur, big eyes',
    'cute comic style orange cat, happy expression',
    'cartoon orange kitten, round face, adorable'
  ],
  british: [
    'cute cartoon british shorthair cat, blue gray fur, chibi style',
    'kawaii anime british shorthair, round face, blue fur',
    'cute comic style british shorthair, gray coat',
    'cartoon british shorthair kitten, chibi style'
  ],
  ragdoll: [
    'cute cartoon ragdoll cat, fluffy white and blue, chibi style',
    'kawaii anime ragdoll cat, blue eyes, gentle',
    'cute comic style ragdoll, fluffy, blue eyes',
    'cartoon ragdoll kitten, white fur, blue eyes'
  ],
  siamese: [
    'cute cartoon siamese cat, blue eyes, cream and brown, chibi style',
    'kawaii anime siamese cat, point coloration, elegant',
    'cute comic style siamese cat, blue eyes',
    'cartoon siamese kitten, sleek body'
  ],
  persian: [
    'cute cartoon persian cat, fluffy long hair, chibi style',
    'kawaii anime persian cat, luxurious fur, elegant',
    'cute comic style persian cat, long fluffy hair',
    'cartoon persian kitten, round face'
  ],
  sphinx: [
    'cute cartoon sphinx cat, hairless, big ears, chibi style',
    'kawaii anime sphinx cat, naked, expressive',
    'cute comic style sphinx cat, hairless',
    'cartoon sphinx kitten, pink skin'
  ]
}

const dogPrompts = {
  default: [
    'cute cartoon puppy portrait, chibi style, friendly smile',
    'kawaii anime dog, big eyes, fluffy, happy',
    'cute comic style dog, playful expression',
    'cartoon dog avatar, round face, adorable'
  ],
  golden: [
    'cute cartoon golden retriever puppy, golden fur, chibi style',
    'kawaii anime golden retriever, friendly smile',
    'cute comic style golden retriever, fluffy',
    'cartoon golden retriever puppy, happy'
  ],
  husky: [
    'cute cartoon husky puppy, blue eyes, black and white, chibi style',
    'kawaii anime husky, blue eyes, playful',
    'cute comic style husky, striking eyes',
    'cartoon husky puppy, energetic'
  ],
  corgi: [
    'cute cartoon corgi puppy, short legs, fluffy butt, chibi style',
    'kawaii anime corgi, short legs, happy',
    'cute comic style corgi, adorable short legs',
    'cartoon corgi puppy, fluffy'
  ],
  shiba: [
    'cute cartoon shiba inu puppy, smiling, chibi style',
    'kawaii anime shiba inu, doge expression',
    'cute comic style shiba inu, fox-like',
    'cartoon shiba inu puppy, orange and white'
  ],
  poodle: [
    'cute cartoon poodle puppy, curly hair, elegant, chibi style',
    'kawaii anime poodle, curly fur, fancy',
    'cute comic style poodle, curly coat',
    'cartoon poodle puppy, fluffy curls'
  ],
  teddy: [
    'cute cartoon teddy bear dog (bichon frise), fluffy white, chibi style',
    'kawaii anime teddy dog, round face, white fur',
    'cute comic style teddy dog, fluffy',
    'cartoon teddy dog puppy, adorable'
  ]
}

const rabbitPrompts = [
  'cute cartoon rabbit, fluffy white, long ears, chibi style',
  'kawaii anime rabbit, floppy ears, pink nose',
  'cute comic style bunny, hopping, adorable',
  'cartoon rabbit avatar, round face, fluffy tail'
]

const hamsterPrompts = [
  'cute cartoon hamster, golden fluffy, round, chibi style',
  'kawaii anime hamster, tiny, eating sunflower seed',
  'cute comic style hamster, fluffy cheeks',
  'cartoon hamster avatar, round body'
]

const birdPrompts = [
  'cute cartoon parrot, colorful feathers, talking, chibi style',
  'kawaii anime bird, vibrant colors, singing',
  'cute comic style parakeet, green feathers',
  'cartoon bird avatar, perching on branch'
]

const fishPrompts = [
  'cute cartoon goldfish, orange, big eyes, chibi style',
  'kawaii anime betta fish, colorful flowing fins',
  'cute comic style fish, swimming',
  'cartoon fish avatar, in aquarium'
]

const turtlePrompts = [
  'cute cartoon turtle, green shell, funny expression, chibi style',
  'kawaii anime turtle, slow and steady',
  'cute comic style turtle, wearing tiny hat',
  'cartoon turtle avatar, round shell'
]

const otherPetPrompts = [
  'cute cartoon guinea pig, fluffy, chibi style',
  'kawaii anime hedgehog, spiky but adorable',
  'cute comic style ferret, playful',
  'cartoon chinchilla, fluffy gray',
  'cute cartoon squirrel, bushy tail',
  'kawaii anime sugar glider, flying',
  'cute comic style lizard, colorful',
  'cartoon snake, friendly expression'
]

const avatarBaseUrl = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image'

const getRandomItem = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)]
}

const getCatPrompt = (breed: string): string => {
  if (breed.includes('橘') || breed.includes('橙')) {
    return getRandomItem(catPrompts.orange)
  }
  if (breed.includes('英短') || breed.includes('英国短毛')) {
    return getRandomItem(catPrompts.british)
  }
  if (breed.includes('布偶')) {
    return getRandomItem(catPrompts.ragdoll)
  }
  if (breed.includes('暹罗')) {
    return getRandomItem(catPrompts.siamese)
  }
  if (breed.includes('波斯')) {
    return getRandomItem(catPrompts.persian)
  }
  if (breed.includes('无毛') || breed.includes('德文')) {
    return getRandomItem(catPrompts.sphinx)
  }
  return getRandomItem(catPrompts.default)
}

const getDogPrompt = (breed: string): string => {
  if (breed.includes('金毛')) {
    return getRandomItem(dogPrompts.golden)
  }
  if (breed.includes('哈士奇') || breed.includes('二哈')) {
    return getRandomItem(dogPrompts.husky)
  }
  if (breed.includes('柯基')) {
    return getRandomItem(dogPrompts.corgi)
  }
  if (breed.includes('柴犬')) {
    return getRandomItem(dogPrompts.shiba)
  }
  if (breed.includes('贵宾') || breed.includes('泰迪')) {
    return getRandomItem(dogPrompts.teddy)
  }
  if (breed.includes('比熊') || breed.includes('poodle')) {
    return getRandomItem(dogPrompts.poodle)
  }
  return getRandomItem(dogPrompts.default)
}

export type AvatarType = 'cat' | 'dog' | 'rabbit' | 'hamster' | 'bird' | 'fish' | 'turtle' | 'other'

export const generateAvatar = (type: AvatarType): string => {
  let prompt: string

  switch (type) {
    case 'cat':
      prompt = getRandomItem(catPrompts.default)
      break
    case 'dog':
      prompt = getRandomItem(dogPrompts.default)
      break
    case 'rabbit':
      prompt = getRandomItem(rabbitPrompts)
      break
    case 'hamster':
      prompt = getRandomItem(hamsterPrompts)
      break
    case 'bird':
      prompt = getRandomItem(birdPrompts)
      break
    case 'fish':
      prompt = getRandomItem(fishPrompts)
      break
    case 'turtle':
      prompt = getRandomItem(turtlePrompts)
      break
    case 'other':
    default:
      prompt = getRandomItem(otherPetPrompts)
      break
  }

  return `${avatarBaseUrl}?prompt=${encodeURIComponent(prompt)}&image_size=square`
}

export const generatePetAvatar = (breed: string): string => {
  const lowerBreed = breed.toLowerCase()
  
  if (lowerBreed.includes('猫')) {
    return `${avatarBaseUrl}?prompt=${encodeURIComponent(getCatPrompt(breed))}&image_size=square`
  }
  
  if (lowerBreed.includes('狗')) {
    return `${avatarBaseUrl}?prompt=${encodeURIComponent(getDogPrompt(breed))}&image_size=square`
  }
  
  if (lowerBreed.includes('兔')) {
    return `${avatarBaseUrl}?prompt=${encodeURIComponent(getRandomItem(rabbitPrompts))}&image_size=square`
  }
  
  if (lowerBreed.includes('仓鼠')) {
    return `${avatarBaseUrl}?prompt=${encodeURIComponent(getRandomItem(hamsterPrompts))}&image_size=square`
  }
  
  if (lowerBreed.includes('鸟') || lowerBreed.includes('鹦鹉')) {
    return `${avatarBaseUrl}?prompt=${encodeURIComponent(getRandomItem(birdPrompts))}&image_size=square`
  }
  
  if (lowerBreed.includes('鱼')) {
    return `${avatarBaseUrl}?prompt=${encodeURIComponent(getRandomItem(fishPrompts))}&image_size=square`
  }
  
  if (lowerBreed.includes('龟')) {
    return `${avatarBaseUrl}?prompt=${encodeURIComponent(getRandomItem(turtlePrompts))}&image_size=square`
  }
  
  return `${avatarBaseUrl}?prompt=${encodeURIComponent(getRandomItem(otherPetPrompts))}&image_size=square`
}

export const generateMultipleAvatars = (type: AvatarType, count: number = 6): string[] => {
  const avatars: string[] = []
  for (let i = 0; i < count; i++) {
    avatars.push(generateAvatar(type))
  }
  return avatars
}
