import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Post } from '@/types'
import type { PublicUser } from '@/services/user.service'
import { userService } from '@/services/user.service'

export const useUserProfileStore = defineStore('userProfile', () => {
  const profile = ref<PublicUser | null>(null)
  const posts = ref<Post[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentUserId = ref<string | null>(null)

  async function loadProfile(userId: string) {
    if (currentUserId.value === userId && profile.value) return

    isLoading.value = true
    error.value = null
    currentUserId.value = userId

    try {
      const result = await userService.getProfileWithPosts(userId)
      profile.value = result
      posts.value = result.posts
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar perfil'
      profile.value = null
      posts.value = []
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    profile.value = null
    posts.value = []
    error.value = null
    currentUserId.value = null
    isLoading.value = false
  }

  return {
    profile,
    posts,
    isLoading,
    error,
    currentUserId,
    loadProfile,
    reset,
  }
})

