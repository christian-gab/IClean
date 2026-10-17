import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserProgress, Achievement, Toast } from '@/types'
import { storage } from '@/utils/storage'
import { nowISO, generateId } from '@/utils/date'
import { allAchievements } from '@/mocks/achievements'
import { getLevelForPoints, getNextLevel, getLevelProgress } from '@/mocks/levels'

const STORAGE_KEY = 'user-progress'

const defaultProgress = (): UserProgress => ({
  totalPoints: 0,
  actionsCompleted: 0,
  postsCreated: 0,
  unlockedAchievements: [],
  history: [],
  sessionCompletedActions: [],
})

export const useProgressStore = defineStore('progress', () => {
  const progress = ref<UserProgress>(storage.get(STORAGE_KEY, defaultProgress()))
  const toasts = ref<Toast[]>([])

  // ── Computed ──────────────────────────────────────────────────────────────
  const currentLevel = computed(() => getLevelForPoints(progress.value.totalPoints))
  const nextLevel = computed(() => getNextLevel(progress.value.totalPoints))
  const levelProgress = computed(() => getLevelProgress(progress.value.totalPoints))

  const unlockedAchievements = computed((): Achievement[] =>
    allAchievements.filter(a => progress.value.unlockedAchievements.includes(a.id))
  )

  // ── Helpers ───────────────────────────────────────────────────────────────
  function save() {
    storage.set(STORAGE_KEY, progress.value)
  }

  function addToast(toast: Omit<Toast, 'id'>) {
    const id = generateId()
    toasts.value.push({ ...toast, id })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 3500)
  }

  function checkAchievements() {
    const p = progress.value
    const toUnlock: string[] = []

    if (p.actionsCompleted >= 1) toUnlock.push('ach-first-action')
    if (p.actionsCompleted >= 5) toUnlock.push('ach-5-actions')
    if (p.actionsCompleted >= 10) toUnlock.push('ach-10-actions')
    if (p.postsCreated >= 1) toUnlock.push('ach-first-post')
    if (p.postsCreated >= 5) toUnlock.push('ach-5-posts')

    for (const id of toUnlock) {
      if (!p.unlockedAchievements.includes(id)) {
        p.unlockedAchievements.push(id)
        const ach = allAchievements.find(a => a.id === id)
        if (ach) {
          addToast({
            message: `Conquista desbloqueada: ${ach.title}`,
            type: 'achievement',
            icon: ach.icon,
          })
        }
      }
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  function completeAction(actionId: string, actionTitle: string, points: number): boolean {
    /**
     * NOTE: This deduplication is SESSION-ONLY and purely demonstrative.
     * In production, the backend must enforce action frequency rules.
     */
    if (progress.value.sessionCompletedActions.includes(actionId)) {
      addToast({ message: 'Acao ja registrada nesta sessao.', type: 'default' })
      return false
    }

    const prevLevel = getLevelForPoints(progress.value.totalPoints)
    progress.value.totalPoints += points
    progress.value.actionsCompleted += 1
    progress.value.sessionCompletedActions.push(actionId)
    progress.value.history.unshift({
      id: generateId(),
      actionId,
      actionTitle,
      points,
      completedAt: nowISO(),
    })

    const newLevel = getLevelForPoints(progress.value.totalPoints)
    if (newLevel.name !== prevLevel.name) {
      addToast({ message: `Nivel alcancado: ${newLevel.name}!`, type: 'levelup', icon: newLevel.icon })
    } else {
      addToast({ message: `+${points} pontos — ${actionTitle}`, type: 'success' })
    }

    checkAchievements()
    save()
    return true
  }

  function recordPost() {
    progress.value.postsCreated += 1
    checkAchievements()
    save()
  }

  function resetProgress() {
    progress.value = defaultProgress()
    storage.remove(STORAGE_KEY)
    addToast({ message: 'Progresso reiniciado com sucesso.', type: 'default' })
  }

  return {
    progress,
    toasts,
    currentLevel,
    nextLevel,
    levelProgress,
    unlockedAchievements,
    completeAction,
    recordPost,
    resetProgress,
    addToast,
  }
})
