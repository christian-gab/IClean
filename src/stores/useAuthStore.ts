import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { storage } from '@/utils/storage'
import { authService } from '@/services'
import { useProgressStore } from './useProgressStore'

const STORAGE_KEY = 'auth'

interface AuthState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const stored = storage.get<AuthState>(STORAGE_KEY, { user: null, token: null, isLoggedIn: false })
  const hasValidSession = Boolean(stored.isLoggedIn && stored.user && stored.token)

  if (stored.isLoggedIn && !hasValidSession) {
    storage.remove(STORAGE_KEY)
  }

  const user = ref<User | null>(hasValidSession ? stored.user : null)
  const token = ref<string | null>(hasValidSession ? stored.token : null)
  const isLoggedIn = ref<boolean>(hasValidSession)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => isLoggedIn.value && user.value !== null && !!token.value)

  function save() {
    storage.set(STORAGE_KEY, {
      user: user.value,
      token: token.value,
      isLoggedIn: isLoggedIn.value,
    })
  }

  async function login(email: string, password: string): Promise<User> {
    isLoading.value = true
    error.value = null
    try {
      const data = await authService.login(email, password)
      user.value = data.user
      token.value = data.token
      isLoggedIn.value = true
      save()
      try {
        const progressStore = useProgressStore()
        progressStore.resetToDefault()
        progressStore.loadAllGamificationData()
      } catch (e) {
        console.warn('Erro ao carregar dados de gamificação:', e)
      }
      return data.user
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao realizar login'
      error.value = msg
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMe(): Promise<User | null> {
    if (!token.value) {
      logout()
      return null
    }
    try {
      const updated = await authService.getMe()
      user.value = updated
      save()
      return updated
    } catch (err: unknown) {
      console.warn('Erro ao atualizar dados do usuário autenticado:', err)
      const msg = err instanceof Error ? err.message.toLowerCase() : ''
      if (msg.includes('autenticado') || msg.includes('401') || msg.includes('unauthorized') || msg.includes('token')) {
        logout()
        return null
      }
      return user.value
    }
  }

  async function register(name: string, email: string, password: string): Promise<User> {
    isLoading.value = true
    error.value = null
    try {
      const data = await authService.register(name, email, password)
      user.value = data.user
      token.value = data.token
      isLoggedIn.value = true
      save()
      try {
        const progressStore = useProgressStore()
        progressStore.resetToDefault()
        progressStore.loadAllGamificationData()
      } catch (e) {
        console.warn('Erro ao carregar dados de gamificação:', e)
      }
      return data.user
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao criar conta'
      error.value = msg
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    isLoggedIn.value = false
    storage.remove(STORAGE_KEY)
    storage.clearAll()
    try {
      const progressStore = useProgressStore()
      progressStore.resetToDefault()
    } catch (e) {
      console.warn('Erro ao limpar dados de gamificação:', e)
    }
  }

  async function updateProfile(updates: { name?: string; bio?: string; avatarUrl?: string }): Promise<User | null> {
    if (!user.value) return null
    isLoading.value = true
    error.value = null
    try {
      const updated = await authService.updateProfile(user.value.id, updates)
      user.value = updated
      save()
      return updated
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao atualizar perfil'
      error.value = msg
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchMe,
    updateProfile,
  }
})
