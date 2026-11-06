import { mount } from '@vue/test-utils'
import { beforeEach, expect, test, vi } from 'vitest'
import RegisterPage from './RegisterPage.vue'

const { registerMock } = vi.hoisted(() => ({
  registerMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/stores/useAuthStore', () => ({
  useAuthStore: () => ({ register: registerMock }),
}))

beforeEach(() => {
  registerMock.mockReset()
})

test('does not submit a registration with a seven-character password', async () => {
  const wrapper = mount(RegisterPage, {
    global: { stubs: { RouterLink: true } },
  })
  await wrapper.find('#reg-name').setValue('Maria Silva')
  await wrapper.find('#reg-email').setValue('maria@example.test')
  await wrapper.find('#reg-password').setValue('1234567')
  await wrapper.find('#reg-confirm').setValue('1234567')

  await wrapper.find('form').trigger('submit')

  expect(registerMock).not.toHaveBeenCalled()
  expect(wrapper.text()).toContain('A senha deve ter no mínimo 8 caracteres.')
})
