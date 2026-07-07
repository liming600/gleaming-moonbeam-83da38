import { supabase } from '@/supabase/supabaseClient'

export interface LeaderboardUser {
  id: string
  name: string
  avatar: string
  answers: number
  accepted: number
  rank: number
}

export const leaderboardService = {
  async getLeaderboard(): Promise<{ users: LeaderboardUser[]; error: Error | null }> {
    try {
      const { data: answersData, error: answersError } = await supabase
        .from('help_answers')
        .select('author_id, is_accepted')

      if (answersError) {
        return { users: [], error: answersError }
      }

      const userStats: Record<string, { answers: number; accepted: number }> = {}
      ;(answersData || []).forEach((answer: any) => {
        const authorId = answer.author_id
        if (!userStats[authorId]) {
          userStats[authorId] = { answers: 0, accepted: 0 }
        }
        userStats[authorId].answers++
        if (answer.is_accepted) {
          userStats[authorId].accepted++
        }
      })

      const userIds = Object.keys(userStats)
      if (userIds.length === 0) {
        return { users: [], error: null }
      }

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, avatar_url')
        .in('id', userIds)

      if (usersError) {
        return { users: [], error: usersError }
      }

      const users: LeaderboardUser[] = (usersData || [])
        .map((item: any) => ({
          id: item.id,
          name: item.name || '用户',
          avatar: item.avatar_url || '',
          answers: userStats[item.id]?.answers || 0,
          accepted: userStats[item.id]?.accepted || 0,
          rank: 0
        }))
        .sort((a, b) => b.accepted - a.accepted)
        .slice(0, 10)
        .map((user, index) => ({ ...user, rank: index + 1 }))

      return { users, error: null }
    } catch (error) {
      return { users: [], error: error as Error }
    }
  }
}