import { httpClient } from './httpClient'
import type { SustainableAction, PostCategory, UserProgress, CompletedAction } from '@/types'

export interface ActionsResponse {
  status: string
  results: number
  data: {
    actions: SustainableAction[]
  }
}

export interface CompleteActionResponse {
  status: string
  message: string
  data: {
    approved: boolean
    message: string
    action: SustainableAction
    completedAction: CompletedAction
    pointsEarned: number
    newTotalPoints: number
    unlockedAchievements: string[]
    levelUp: boolean
    currentLevelName: string
    progress: UserProgress
  }
}

export const actionService = {
  async getActions(category?: PostCategory | 'all' | null): Promise<SustainableAction[]> {
    const params = category && category !== 'all' ? { category } : {}
    const { data } = await httpClient.get<ActionsResponse>('/actions', { params })
    return data.data.actions
  },

  async completeAction(actionId: string, proof?: { photoUrl?: string; description?: string }): Promise<CompleteActionResponse['data']> {
    const { data } = await httpClient.post<CompleteActionResponse>(`/actions/${actionId}/complete`, proof || {})
    return data.data
  },
}
