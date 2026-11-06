import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CreatePostModal from './CreatePostModal.vue'

const { createPost, fetchProgress, addToast, fetchAchievements } = vi.hoisted(() => ({
  createPost: vi.fn(),
  fetchProgress: vi.fn(),
  addToast: vi.fn(),
  fetchAchievements: vi.fn(),
}))

vi.mock('@/stores/useFeedStore', () => ({
  useFeedStore: () => ({ createPost }),
}))

vi.mock('@/stores/useProgressStore', () => ({
  useProgressStore: () => ({ fetchProgress, addToast, fetchAchievements }),
}))

vi.mock('@/stores/useAuthStore', () => ({
  useAuthStore: () => ({ user: { name: 'Pessoa', avatarUrl: '/avatar.png' } }),
}))

describe('CreatePostModal image selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createPost.mockResolvedValue({ unlockedAchievements: [] })
  })

  it('lets the user select an image file and includes it in the post', async () => {
    const wrapper = mount(CreatePostModal, { global: { stubs: { Teleport: true } } })

    await wrapper.find('#post-text').setValue('Uma publicação sobre sustentabilidade')

    const imageInput = wrapper.find('#post-image-file')
    expect(imageInput.attributes('type')).toBe('file')
    expect(imageInput.attributes('accept')).toBe('image/*')

    Object.defineProperty(imageInput.element, 'files', {
      configurable: true,
      value: [new File(['imagem'], 'foto.png', { type: 'image/png' })],
    })
    await imageInput.trigger('change')
    await new Promise(resolve => setTimeout(resolve, 10))
    await flushPromises()

    const preview = wrapper.find('.selected-image-preview')
    expect(preview.exists()).toBe(true)
    expect(preview.attributes('src')).toMatch(/^data:image\/png;base64,/)

    await wrapper.find('#submit-post').trigger('click')
    await flushPromises()

    expect(createPost).toHaveBeenCalledWith(expect.objectContaining({
      imageUrl: expect.stringMatching(/^data:image\/png;base64,/),
    }))
  })
})
