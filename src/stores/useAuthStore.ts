import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { storage } from '@/utils/storage'
import { nowISO } from '@/utils/date'

const STORAGE_KEY = 'auth'

interface AuthState {
  user: User | null
  isLoggedIn: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const stored = storage.get<AuthState>(STORAGE_KEY, { user: null, isLoggedIn: false })

  const user = ref<User | null>(stored.user)
  const isLoggedIn = ref<boolean>(stored.isLoggedIn)

  const isAuthenticated = computed(() => isLoggedIn.value && user.value !== null)

  function save() {
    storage.set(STORAGE_KEY, { user: user.value, isLoggedIn: isLoggedIn.value })
  }

  function login(name: string, username: string) {
    const avatarSeed = encodeURIComponent(name.trim())
    user.value = {
      id: 'user-1',
      name: name.trim(),
      username: username.trim().startsWith('@') ? username.trim() : `@${username.trim()}`,
      bio: 'Apaixonado(a) por natureza e sustentabilidade. Acredito que pequenas acoes fazem grande diferenca.',
      avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=b6e3f4`,
      joinedAt: nowISO(),
    }
    isLoggedIn.value = true
    save()
  }

  function logout() {
    user.value = null
    isLoggedIn.value = false
    storage.clearAll()
  }

  function updateProfile(updates: { name?: string; bio?: string; avatarUrl?: string }) {
    if (!user.value) return
    if (updates.name !== undefined) user.value.name = updates.name
    if (updates.bio !== undefined) user.value.bio = updates.bio
    if (updates.avatarUrl !== undefined) user.value.avatarUrl = updates.avatarUrl
    save()
  }

  return {
    user,
    isLoggedIn,
    isAuthenticated,
    login,
    logout,
    updateProfile,
  }
})
