import type { PostLocation } from '@/services/postService'

export interface ApiPost {
  id: string
  pet_id: string
  content: string
  images: string[]
  tags: string[]
  likes_count: number
  comments_count: number
  post_type: string
  mood?: string
  location_address?: string
  location_latitude?: number
  location_longitude?: number
  created_at: string
  date: string
  pets?: { name: string; avatar_url: string; owner_id: string }
}

export interface FrontendPost {
  id: string
  petId: string
  petName: string
  petAvatar: string
  ownerId: string
  content: string
  images: string[]
  tags: string[]
  likes: number
  comments: number
  isPublic: boolean
  isDiary: boolean
  mood?: string
  location?: PostLocation | null
  createdAt: string
  date: string
  isLiked?: boolean
}

export const mapApiPostToPost = (apiPost: ApiPost): FrontendPost => {
  const postType = apiPost.post_type || 'public'
  
  return {
    id: apiPost.id,
    petId: apiPost.pet_id,
    petName: apiPost.pets?.name || '',
    petAvatar: apiPost.pets?.avatar_url || '',
    ownerId: apiPost.pets?.owner_id || '',
    content: apiPost.content,
    images: apiPost.images || [],
    tags: apiPost.tags || [],
    likes: apiPost.likes_count || 0,
    comments: apiPost.comments_count || 0,
    isPublic: postType === 'public',
    isDiary: postType === 'diary',
    mood: apiPost.mood,
    location: apiPost.location_address
      ? {
          address: apiPost.location_address,
          latitude: apiPost.location_latitude || null,
          longitude: apiPost.location_longitude || null
        }
      : null,
    createdAt: apiPost.created_at,
    date: apiPost.date
  }
}

export interface ApiPet {
  id: string
  owner_id: string
  name: string
  avatar_url: string
  breed: string
  gender: string
  birth_date: string
  weight: number
  color: string
  personality: string
  posts: number
  likes: number
  followers: number
  created_at: string
  updated_at: string
}

export interface FrontendPet {
  id: string
  ownerId: string
  name: string
  avatar: string
  breed: string
  gender: string
  birthDate: string
  weight: number
  color: string
  personality: string
  posts: number
  likes: number
  followers: number
  createdAt: string
  updatedAt: string
}

export const mapApiPetToPet = (apiPet: ApiPet): FrontendPet => ({
  id: apiPet.id,
  ownerId: apiPet.owner_id,
  name: apiPet.name,
  avatar: apiPet.avatar_url || '',
  breed: apiPet.breed || '',
  gender: apiPet.gender || 'unknown',
  birthDate: apiPet.birth_date || '',
  weight: apiPet.weight || 0,
  color: apiPet.color || '',
  personality: apiPet.personality || '',
  posts: apiPet.posts || 0,
  likes: apiPet.likes || 0,
  followers: apiPet.followers || 0,
  createdAt: apiPet.created_at,
  updatedAt: apiPet.updated_at
})

export interface ApiComment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  users?: { name: string; avatar_url: string }
}

export interface FrontendComment {
  id: string
  post_id: string
  user_id: string
  user_name: string
  user_avatar: string
  content: string
  created_at: string
}

export const mapApiCommentToComment = (apiComment: ApiComment): FrontendComment => ({
  id: apiComment.id,
  post_id: apiComment.post_id,
  user_id: apiComment.user_id,
  user_name: apiComment.users?.name || '',
  user_avatar: apiComment.users?.avatar_url || '',
  content: apiComment.content,
  created_at: apiComment.created_at
})