import { httpClient } from './httpClient'
import type { UserProgress, Level, Achievement } from '@/types'

export interface ProgressResponse {
  status: string
  data: {
    progress: UserProgress
  }
}

export interface LevelsResponse {
  status: string
  results: number
  data: {
    levels: Level[]
  }
}

export interface AchievementsResponse {
  status: string
  results: number
  data: {
    achievements: (Achievement & { unlocked?: boolean })[]
  }
}

export interface LeaderboardEntry {
  id: string
  name: string
  username: string
  avatarUrl: string
  totalPoints: number
  rank: number
}

export interface LeaderboardResponse {
  status: string
  results: number
  data: {
    leaderboard: LeaderboardEntry[]
  }
}

export const progressService = {
  async getProgress(): Promise<UserProgress> {
    const { data } = await httpClient.get<ProgressResponse>('/progress')
    return data.data.progress
  },

  async getLevels(): Promise<Level[]> {
    const { data } = await httpClient.get<LevelsResponse>('/levels')
    return data.data.levels
  },

  async getAchievements(): Promise<(Achievement & { unlocked?: boolean })[]> {
    const { data } = await httpClient.get<AchievementsResponse>('/achievements')
    return data.data.achievements
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const { data } = await httpClient.get<LeaderboardResponse>('/progress/leaderboard')
    return data.data.leaderboard
  },

}
