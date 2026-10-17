import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserProgress, Level, Achievement, Toast } from '@/types'
import { progressService, actionService } from '@/services'
import { generateId } from '@/utils/date'

const defaultProgress = (): UserProgress => ({
  totalPoints: 0,
  actionsCompleted: 0,
  postsCreated: 0,
  unlockedAchievements: [],
  history: [],
  sessionCompletedActions: [],
})

export const useProgressStore = defineStore('progress', () => {
  const progress = ref<UserProgress>(defaultProgress())
  const levels = ref<Level[]>([])
  const achievements = ref<(Achievement & { unlocked?: boolean })[]>([])
  const toasts = ref<Toast[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // ── Computed ──────────────────────────────────────────────────────────────
  const currentLevel = computed<Level>(() => {
    if (levels.value.length === 0) {
      return { name: 'Semente', minPoints: 0, maxPoints: 99, icon: 'Sprout', color: '#a8a29e' }
    }
    const pts = progress.value.totalPoints
    return levels.value.slice().reverse().find((l) => pts >= l.minPoints) ?? levels.value[0]!
  })

  const nextLevel = computed<Level | null>(() => {
    if (levels.value.length === 0) return null
    const current = currentLevel.value
    const idx = levels.value.findIndex((l) => l.name === current.name)
    return idx >= 0 && idx < levels.value.length - 1 ? (levels.value[idx + 1] ?? null) : null
  })

  const levelProgress = computed<number>(() => {
    const next = nextLevel.value
    const current = currentLevel.value
    if (!next) return 100
    const range = next.minPoints - current.minPoints
    const earned = progress.value.totalPoints - current.minPoints
    return Math.min(100, Math.max(0, Math.round((earned / range) * 100)))
  })

  const unlockedAchievements = computed(() => {
    return achievements.value.filter((a) => progress.value.unlockedAchievements.includes(a.id) || a.unlocked)
  })

  // ── Toast Helper ──────────────────────────────────────────────────────────
  function addToast(toast: Omit<Toast, 'id'>) {
    const id = generateId()
    toasts.value.push({ ...toast, id })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, 3500)
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  async function fetchProgress() {
    isLoading.value = true
    try {
      const data = await progressService.getProgress()
      progress.value = {
        totalPoints: data.totalPoints,
        actionsCompleted: data.actionsCompleted,
        postsCreated: data.postsCreated,
        unlockedAchievements: data.unlockedAchievements || [],
        history: data.history || [],
        sessionCompletedActions: data.sessionCompletedActions || [],
      }
      return progress.value
    } catch (err) {
      console.warn('Erro ao buscar progresso do usuário:', err)
      return progress.value
    } finally {
      isLoading.value = false
    }
  }

  async function fetchLevels() {
    try {
      const data = await progressService.getLevels()
      levels.value = data
      return data
    } catch (err) {
      console.warn('Erro ao buscar níveis:', err)
      return []
    }
  }

  async function fetchAchievements() {
    try {
      const data = await progressService.getAchievements()
      achievements.value = data
      return data
    } catch (err) {
      console.warn('Erro ao buscar conquistas:', err)
      return []
    }
  }

  async function loadAllGamificationData() {
    return Promise.allSettled([fetchProgress(), fetchLevels(), fetchAchievements()])
  }

  async function completeAction(actionId: string, proof?: { photoUrl?: string; description?: string }) {
    isLoading.value = true
    try {
      const result = await actionService.completeAction(actionId, proof)

      // Atualiza progresso reativo
      progress.value = {
        totalPoints: result.progress.totalPoints,
        actionsCompleted: result.progress.actionsCompleted,
        postsCreated: result.progress.postsCreated,
        unlockedAchievements: result.progress.unlockedAchievements || [],
        history: result.progress.history || [],
        sessionCompletedActions: result.progress.sessionCompletedActions || [],
      }

      // Notificações
      if (result.levelUp) {
        addToast({
          message: `Nível alcançado: ${result.currentLevelName}! 🎉`,
          type: 'levelup',
          icon: currentLevel.value.icon,
        })
      } else {
        addToast({
          message: `+${result.pointsEarned} pontos conquistados!`,
          type: 'success',
        })
      }

      if (result.unlockedAchievements?.length) {
        for (const achId of result.unlockedAchievements) {
          const ach = achievements.value.find((a) => a.id === achId)
          if (ach) {
            addToast({
              message: `Conquista desbloqueada: ${ach.title}`,
              type: 'achievement',
              icon: ach.icon,
            })
          }
        }
      }

      await fetchAchievements()
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao validar ação'
      addToast({ message: msg, type: 'default' })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function resetProgress() {
    isLoading.value = true
    try {
      const data = await progressService.resetProgress()
      progress.value = {
        totalPoints: data.totalPoints,
        actionsCompleted: data.actionsCompleted,
        postsCreated: data.postsCreated,
        unlockedAchievements: data.unlockedAchievements || [],
        history: data.history || [],
        sessionCompletedActions: data.sessionCompletedActions || [],
      }
      await fetchAchievements()
      addToast({ message: 'Progresso reiniciado com sucesso.', type: 'default' })
    } catch (err) {
      console.error('Erro ao reiniciar progresso:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    progress,
    levels,
    achievements,
    toasts,
    currentLevel,
    nextLevel,
    levelProgress,
    unlockedAchievements,
    isLoading,
    error,
    fetchProgress,
    fetchLevels,
    fetchAchievements,
    loadAllGamificationData,
    completeAction,
    resetProgress,
    addToast,
  }
})
