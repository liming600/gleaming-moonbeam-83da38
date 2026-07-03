import { supabase } from '@/supabase/supabaseClient'

export interface HelpPostLocation {
  address: string
  latitude: number | null
  longitude: number | null
}

export interface HelpPost {
  id: string
  author_id: string
  author_name: string
  author_avatar: string
  zone: 'experience' | 'question' | 'rescue' | 'mutual'
  zoneLabel: string
  title: string
  content: string
  answers_count: number
  status: 'open' | 'taken' | 'resolved'
  statusLabel: string
  is_urgent: boolean
  location?: HelpPostLocation | null
  created_at: string
}

export interface HelpAnswer {
  id: string
  help_post_id: string
  author_id: string
  author_name: string
  author_avatar: string
  content: string
  is_accepted: boolean
  created_at: string
}

const zoneLabels: Record<string, string> = {
  experience: '经验分享',
  question: '问答求助',
  rescue: '紧急救助',
  mutual: '宠友互帮'
}

const statusLabels: Record<string, string> = {
  open: '待处理',
  taken: '处理中',
  resolved: '已解决'
}

export const helpService = {
  async getHelpPosts(zone?: string): Promise<{ posts: HelpPost[]; error: Error | null }> {
    try {
      let query = supabase
        .from('help_posts')
        .select(`
          *,
          users(name, avatar_url)
        `)
        .order('is_urgent', { ascending: false })
        .order('created_at', { ascending: false })

      if (zone) {
        query = query.eq('zone', zone)
      }

      const { data, error } = await query

      if (error) {
        return { posts: [], error }
      }

      const posts: HelpPost[] = (data || []).map((item: any) => ({
        id: item.id,
        author_id: item.author_id,
        author_name: item.users?.name || '',
        author_avatar: item.users?.avatar_url || '',
        zone: item.zone as 'experience' | 'question' | 'rescue' | 'mutual',
        zoneLabel: zoneLabels[item.zone] || '',
        title: item.title,
        content: item.content,
        answers_count: item.answers_count || 0,
        status: item.status as 'open' | 'taken' | 'resolved',
        statusLabel: statusLabels[item.status] || '',
        is_urgent: item.is_urgent || false,
        location: item.location_address
          ? {
              address: item.location_address,
              latitude: item.location_latitude || null,
              longitude: item.location_longitude || null
            }
          : null,
        created_at: item.created_at
      }))

      return { posts, error: null }
    } catch (error) {
      return { posts: [], error: error as Error }
    }
  },

  async getHelpPostById(postId: string): Promise<{ post: HelpPost | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('help_posts')
        .select(`
          *,
          users(name, avatar_url)
        `)
        .eq('id', postId)
        .single()

      if (error) {
        return { post: null, error }
      }

      if (!data) {
        return { post: null, error: null }
      }

      const post: HelpPost = {
        id: data.id,
        author_id: data.author_id,
        author_name: data.users?.name || '',
        author_avatar: data.users?.avatar_url || '',
        zone: data.zone as 'experience' | 'question' | 'rescue' | 'mutual',
        zoneLabel: zoneLabels[data.zone] || '',
        title: data.title,
        content: data.content,
        answers_count: data.answers_count || 0,
        status: data.status as 'open' | 'taken' | 'resolved',
        statusLabel: statusLabels[data.status] || '',
        is_urgent: data.is_urgent || false,
        location: data.location_address
          ? {
              address: data.location_address,
              latitude: data.location_latitude || null,
              longitude: data.location_longitude || null
            }
          : null,
        created_at: data.created_at
      }

      return { post, error: null }
    } catch (error) {
      return { post: null, error: error as Error }
    }
  },

  async createHelpPost(post: Omit<HelpPost, 'id' | 'answers_count' | 'created_at' | 'author_name' | 'author_avatar' | 'zoneLabel' | 'statusLabel'>): Promise<{ post: HelpPost | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('help_posts')
        .insert({
          author_id: post.author_id,
          zone: post.zone,
          title: post.title,
          content: post.content,
          status: post.status,
          is_urgent: post.is_urgent,
          location_address: post.location?.address,
          location_latitude: post.location?.latitude,
          location_longitude: post.location?.longitude
        })
        .select(`
          *,
          users(name, avatar_url)
        `)
        .single()

      if (error) {
        return { post: null, error }
      }

      if (!data) {
        return { post: null, error: null }
      }

      const createdPost: HelpPost = {
        id: data.id,
        author_id: data.author_id,
        author_name: data.users?.name || '',
        author_avatar: data.users?.avatar_url || '',
        zone: data.zone as 'experience' | 'question' | 'rescue' | 'mutual',
        zoneLabel: zoneLabels[data.zone] || '',
        title: data.title,
        content: data.content,
        answers_count: data.answers_count || 0,
        status: data.status as 'open' | 'taken' | 'resolved',
        statusLabel: statusLabels[data.status] || '',
        is_urgent: data.is_urgent || false,
        location: data.location_address
          ? {
              address: data.location_address,
              latitude: data.location_latitude || null,
              longitude: data.location_longitude || null
            }
          : null,
        created_at: data.created_at
      }

      return { post: createdPost, error: null }
    } catch (error) {
      return { post: null, error: error as Error }
    }
  },

  async updateHelpPostStatus(postId: string, status: 'open' | 'taken' | 'resolved'): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('help_posts')
        .update({ status })
        .eq('id', postId)

      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  },

  async getAnswers(postId: string): Promise<{ answers: HelpAnswer[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('help_answers')
        .select(`
          *,
          users(name, avatar_url)
        `)
        .eq('help_post_id', postId)
        .order('created_at', { ascending: true })

      if (error) {
        return { answers: [], error }
      }

      const answers: HelpAnswer[] = (data || []).map((item: any) => ({
        id: item.id,
        help_post_id: item.help_post_id,
        author_id: item.author_id,
        author_name: item.users?.name || '',
        author_avatar: item.users?.avatar_url || '',
        content: item.content,
        is_accepted: item.is_accepted || false,
        created_at: item.created_at
      }))

      return { answers, error: null }
    } catch (error) {
      return { answers: [], error: error as Error }
    }
  },

  async createAnswer(postId: string, authorId: string, content: string): Promise<{ answer: HelpAnswer | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('help_answers')
        .insert({ help_post_id: postId, author_id: authorId, content })
        .select(`
          *,
          users(name, avatar_url)
        `)
        .single()

      if (error) {
        return { answer: null, error }
      }

      if (!data) {
        return { answer: null, error: null }
      }

      const { data: helpPost } = await supabase
        .from('help_posts')
        .select('answers_count')
        .eq('id', postId)
        .single()

      if (helpPost) {
        await supabase
          .from('help_posts')
          .update({ answers_count: helpPost.answers_count + 1 })
          .eq('id', postId)
      }

      const answer: HelpAnswer = {
        id: data.id,
        help_post_id: data.help_post_id,
        author_id: data.author_id,
        author_name: data.users?.name || '',
        author_avatar: data.users?.avatar_url || '',
        content: data.content,
        is_accepted: data.is_accepted || false,
        created_at: data.created_at
      }

      return { answer, error: null }
    } catch (error) {
      return { answer: null, error: error as Error }
    }
  },

  async acceptAnswer(postId: string, answerId: string): Promise<{ error: Error | null }> {
    try {
      await supabase
        .from('help_answers')
        .update({ is_accepted: true })
        .eq('id', answerId)

      await supabase
        .from('help_posts')
        .update({ status: 'resolved' })
        .eq('id', postId)

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }
}