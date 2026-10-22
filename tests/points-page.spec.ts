import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PointsPage from '@/pages/PointsPage.vue'
import { useProgressStore } from '@/stores/useProgressStore'
import { progressService } from '@/services/progress.service'

describe('PointsPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('does not expose the demo progress reset action', () => {
    const store = useProgressStore()
    vi.spyOn(store, 'loadAllGamificationData').mockResolvedValue([])

    const wrapper = mount(PointsPage)

    expect(wrapper.text()).not.toContain('Reiniciar progresso demonstrativo')
    expect(wrapper.find('#reset-progress').exists()).toBe(false)
  })

  it('does not expose a frontend progress reset API', () => {
    expect('resetProgress' in progressService).toBe(false)
    expect('resetProgress' in useProgressStore()).toBe(false)
  })
})
