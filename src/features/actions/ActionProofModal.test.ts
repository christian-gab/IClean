import { mount, flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ActionProofModal from './ActionProofModal.vue'

vi.mock('@/services/validation.service', () => ({
  validationService: { validatePhoto: vi.fn() },
}))

describe('ActionProofModal JPEG selection', () => {
  function mountModal() {
    const wrapper = mount(ActionProofModal, {
      props: {
        actionId: 'action-1',
        actionTitle: 'Separar recicláveis',
        actionDescription: 'Separe os materiais recicláveis',
        actionPoints: 10,
        actionIcon: 'fa-recycle',
      },
      global: { stubs: { Teleport: true } },
    })
    return wrapper
  }

  it('only offers JPEG files and rejects non-JPEG image files', async () => {
    const wrapper = mountModal()
    const fileInput = wrapper.find('input[type="file"]')
    expect(fileInput.attributes('accept')).toBe('image/jpeg,.jpg,.jpeg')

    Object.defineProperty(fileInput.element, 'files', {
      configurable: true,
      value: [new File(['png'], 'foto.png', { type: 'image/png' })],
    })
    await fileInput.trigger('change')
    await new Promise(resolve => setTimeout(resolve, 10))
    await flushPromises()

    expect(wrapper.find('.photo-preview').exists()).toBe(false)
    expect(wrapper.find('[role="alert"]').text()).toContain('Escolha uma imagem JPEG')
  })

  it('loads a selected JPEG for preview', async () => {
    const wrapper = mountModal()
    const fileInput = wrapper.find('input[type="file"]')

    Object.defineProperty(fileInput.element, 'files', {
      configurable: true,
      value: [new File(['jpeg'], 'foto.jpg', { type: 'image/jpeg' })],
    })
    await fileInput.trigger('change')
    await new Promise(resolve => setTimeout(resolve, 10))
    await flushPromises()

    expect(wrapper.find('.photo-preview').exists()).toBe(true)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })
})
