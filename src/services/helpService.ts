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
  accepted_answer?: string         // the accepted answer's content text (synced by DB trigger)
  accepted_answer_id?: string      // UUID of the accepted answer
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
  open: '求助中',
  taken: '求助中',
  resolved: '已解决'
}

/** Build a common HelpPost object from raw DB row data */
function buildHelpPost(item: any, answersCount: number): HelpPost {
  // DB trigger sync_help_post_on_answer_accepted ensures:
  //   status='resolved' AND accepted_answer=<content> when accepted_answer_id is set
  // Use DB status and accepted_answer as source of truth (no fragile joins needed)
  const status = (item.status as 'open' | 'taken' | 'resolved') || 'open'

  return {
    id: item.id,
    author_id: item.author_id,
    author_name: item.users?.name || '',
    author_avatar: item.users?.avatar_url || '',
    zone: item.zone as 'experience' | 'question' | 'rescue' | 'mutual',
    zoneLabel: zoneLabels[item.zone] || '',
    title: item.title,
    content: item.content,
    answers_count: answersCount,
    status,
    statusLabel: statusLabels[status] || '',
    is_urgent: item.is_urgent || false,
    accepted_answer: item.accepted_answer || undefined,
    accepted_answer_id: item.accepted_answer_id || undefined,
    location: item.location_address
      ? {
          address: item.location_address,
          latitude: item.location_latitude || null,
          longitude: item.location_longitude || null
        }
      : null,
    created_at: item.created_at
  }
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

      // Batch count answers: one query instead of N
      const postIds = (data || []).map((p: any) => p.id)
      let answerCountMap: Record<string, number> = {}

      if (postIds.length > 0) {
        const { data: countData, error: countError } = await supabase
          .from('help_answers')
          .select('help_post_id')
          .in('help_post_id', postIds)

        if (!countError && countData) {
          for (const row of countData) {
            answerCountMap[row.help_post_id] = (answerCountMap[row.help_post_id] || 0) + 1
          }
        }
      }

      const posts: HelpPost[] = (data || []).map((item: any) =>
        buildHelpPost(item, answerCountMap[item.id] || 0)
      )

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

      const { count } = await supabase
        .from('help_answers')
        .select('id', { count: 'exact' })
        .eq('help_post_id', postId)

      return { post: buildHelpPost(data, count || 0), error: null }
    } catch (error) {
      return { post: null, error: error as Error }
    }
  },

  async createHelpPost(post: Omit<HelpPost, 'id' | 'answers_count' | 'created_at' | 'author_name' | 'author_avatar' | 'zoneLabel' | 'statusLabel' | 'accepted_answer_id'>): Promise<{ post: HelpPost | null; error: Error | null }> {
    try {
      const { data: authData } = await supabase.auth.getUser()
      console.log('[HelpService] createHelpPost - Supabase auth user:', authData?.user?.id, 'Author ID:', post.author_id)

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
        console.error('[HelpService] createHelpPost error:', error)
        console.error('[HelpService] createHelpPost error code:', (error as any)?.code)
        console.error('[HelpService] createHelpPost error details:', (error as any)?.details)
        return { post: null, error }
      }

      console.log('[HelpService] createHelpPost success:', data?.id)
      return { post: buildHelpPost(data, 0), error: null }
    } catch (error) {
      console.error('[HelpService] createHelpPost exception:', error)
      console.error('[HelpService] createHelpPost exception stack:', (error as Error).stack)
      return { post: null, error: error as Error }
    }
  },

  async updateHelpPostStatus(postId: string, status: 'open' | 'taken' | 'resolved'): Promise<{ error: Error | null }> {
    try {
      // When reopening/resetting, also unlink any accepted answer
      const updates: Record<string, any> = { status }
      if (status !== 'resolved') {
        updates.accepted_answer_id = null

        // Also unset is_accepted on the previously accepted answer
        const { data: prevAccepted } = await supabase
          .from('help_posts')
          .select('accepted_answer_id')
          .eq('id', postId)
          .single()

        if (prevAccepted?.accepted_answer_id) {
          await supabase
            .from('help_answers')
            .update({ is_accepted: false })
            .eq('id', prevAccepted.accepted_answer_id)
        }
      }

      const { error } = await supabase
        .from('help_posts')
        .update(updates)
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
      const { data: authData } = await supabase.auth.getUser()
      console.log('[HelpService] createAnswer - Supabase auth user:', authData?.user?.id, 'Author ID:', authorId)

      const { data, error } = await supabase
        .from('help_answers')
        .insert({ help_post_id: postId, author_id: authorId, content })
        .select(`
          *,
          users(name, avatar_url)
        `)
        .single()

      if (error) {
        console.error('[HelpService] createAnswer error:', error)
        console.error('[HelpService] createAnswer error code:', (error as any)?.code)
        console.error('[HelpService] createAnswer error details:', (error as any)?.details)
        return { answer: null, error }
      }

      console.log('[HelpService] createAnswer success:', data?.id)

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
      console.error('[HelpService] createAnswer exception:', error)
      console.error('[HelpService] createAnswer exception stack:', (error as Error).stack)
      return { answer: null, error: error as Error }
    }
  },

  async acceptAnswer(postId: string, answerId: string): Promise<{ acceptedAnswer?: string; error: Error | null }> {
    try {
      // Step 1: Unset any previously accepted answer for this post
      const { data: prevAccepted } = await supabase
        .from('help_answers')
        .select('id')
        .eq('help_post_id', postId)
        .eq('is_accepted', true)
        .limit(1)

      if (prevAccepted && prevAccepted.length > 0 && prevAccepted[0].id !== answerId) {
        await supabase
          .from('help_answers')
          .update({ is_accepted: false })
          .eq('id', prevAccepted[0].id)
      }

      // Step 2: Mark the new answer as accepted
      // The DB trigger sync_help_post_on_answer_accepted will:
      //   - Set help_posts.status = 'resolved'
      //   - Set help_posts.accepted_answer_id = answerId
      const { error: updateAnswerError } = await supabase
        .from('help_answers')
        .update({ is_accepted: true })
        .eq('id', answerId)

      if (updateAnswerError) {
        return { error: updateAnswerError }
      }

      // Step 3: Read back the answer content for the store update
      const { data: answerData } = await supabase
        .from('help_answers')
        .select('content')
        .eq('id', answerId)
        .single()

      return { acceptedAnswer: answerData?.content || '', error: null }
    } catch (error) {
      console.error('acceptAnswer error:', error)
      return { error: error as Error }
    }
  },

  async deleteAnswer(answerId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error: deleteError } = await supabase
        .from('help_answers')
        .delete()
        .eq('id', answerId)

      if (deleteError) {
        return { success: false, error: deleteError }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  },

  async deleteHelpPost(postId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('help_posts')
        .delete()
        .eq('id', postId)

      if (error) {
        return { success: false, error }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error as Error }
    }
  },

  async updateHelpPost(postId: string, postData: Partial<Omit<HelpPost, 'id' | 'author_id' | 'author_name' | 'author_avatar' | 'answers_count' | 'created_at' | 'zoneLabel' | 'statusLabel'>>): Promise<{ post: HelpPost | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('help_posts')
        .update({
          zone: postData.zone,
          title: postData.title,
          content: postData.content,
          status: postData.status,
          is_urgent: postData.is_urgent,
          location_address: postData.location?.address,
          location_latitude: postData.location?.latitude,
          location_longitude: postData.location?.longitude
        })
        .eq('id', postId)
        .select(`
          *,
          users(name, avatar_url)
        `)
        .single()

      if (error) {
        return { post: null, error }
      }

      const { count } = await supabase
        .from('help_answers')
        .select('id', { count: 'exact' })
        .eq('help_post_id', postId)

      return { post: buildHelpPost(data, count || 0), error: null }
    } catch (error) {
      return { post: null, error: error as Error }
    }
  }
}
