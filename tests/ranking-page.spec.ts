import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RankingPage from '../src/pages/RankingPage.vue'

const { getLeaderboard } = vi.hoisted(() => ({
  getLeaderboard: vi.fn(),
}))

vi.mock('@/services/progress.service', () => ({
  progressService: { getLeaderboard },
}))

describe('RankingPage', () => {
  beforeEach(() => {
    getLeaderboard.mockReset()
    getLeaderboard.mockResolvedValue([
      { id: 'user-1', name: 'Caio Lima', username: '@caio', avatarUrl: '/caio.png', totalPoints: 1540, rank: 1 },
      { id: 'user-2', name: 'Marina Alves', username: '@marina', avatarUrl: '/marina.png', totalPoints: 1280, rank: 2 },
      { id: 'user-3', name: 'Joana Santos', username: '@joana', avatarUrl: '/joana.png', totalPoints: 1050, rank: 3 },
      { id: 'user-4', name: 'Pedro Rocha', username: '@pedro', avatarUrl: '/pedro.png', totalPoints: 920, rank: 4 },
    ])
  })

  it('highlights the top three and lists remaining users with their points', async () => {
    const wrapper = mount(RankingPage)
    await flushPromises()

    const podium = wrapper.find('[aria-label="Top 3 usuários"]')
    expect(podium.text()).toContain('Caio Lima')
    expect(podium.text()).toContain('Marina Alves')
    expect(podium.text()).toContain('Joana Santos')
    expect(podium.findAll('img')).toHaveLength(3)
    expect(wrapper.find('[aria-label="Demais posições"]').text()).toContain('Pedro Rocha')
    expect(wrapper.find('[aria-label="Demais posições"]').text()).toContain('920')
  })

  it('shows an explicit message when loading the leaderboard fails', async () => {
    getLeaderboard.mockRejectedValue(new Error('Falha ao carregar o ranking'))
    const wrapper = mount(RankingPage)
    await flushPromises()

    expect(wrapper.text()).toContain('Falha ao carregar o ranking')
  })
})
