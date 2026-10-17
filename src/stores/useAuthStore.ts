import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { storage } from '@/utils/storage'
import { authService } from '@/services'

const STORAGE_KEY = 'auth'

interface AuthState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const stored = storage.get<AuthState>(STORAGE_KEY, { user: null, token: null, isLoggedIn: false })

  const user = ref<User | null>(stored.user)
  const token = ref<string | null>(stored.token)
  const isLoggedIn = ref<boolean>(stored.isLoggedIn)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => isLoggedIn.value && user.value !== null)

  function save() {
    storage.set(STORAGE_KEY, {
      user: user.value,
      token: token.value,
      isLoggedIn: isLoggedIn.value,
    })
  }

  async function login(name: string, username: string): Promise<User> {
    isLoading.value = true
    error.value = null
    try {
      const data = await authService.login(name, username)
      user.value = data.user
      token.value = data.token
      isLoggedIn.value = true
      save()
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
    if (!user.value?.id) return null
    try {
      const updated = await authService.getMe()
      user.value = updated
      save()
      return updated
    } catch (err) {
      console.warn('Erro ao atualizar dados do usuário autenticado:', err)
      return user.value
    }
  }

  function logout() {
    user.value = null
    token.value = null
    isLoggedIn.value = false
    storage.clearAll()
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
    logout,
    fetchMe,
    updateProfile,
  }
})
