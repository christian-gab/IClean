import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SustainableAction, PostCategory } from '@/types'
import { actionService } from '@/services'

export const useActionStore = defineStore('action', () => {
  const actions = ref<SustainableAction[]>([])
  const isLoading = ref(false)
  const activeCategory = ref<PostCategory | 'all'>('all')
  const error = ref<string | null>(null)

  async function fetchActions(category?: PostCategory | 'all') {
    isLoading.value = true
    error.value = null
    try {
      if (category !== undefined) {
        activeCategory.value = category
      }
      const data = await actionService.getActions(activeCategory.value)
      actions.value = data
      return data
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao buscar ações'
      error.value = msg
      console.error('Falha ao carregar ações:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  function setCategory(cat: PostCategory | 'all') {
    activeCategory.value = cat
    return fetchActions(cat)
  }

  return {
    actions,
    isLoading,
    activeCategory,
    error,
    fetchActions,
    setCategory,
  }
})
