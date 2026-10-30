import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/useAuthStore'

describe('Auth storage and logout lifecycle', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('clears legacy ecosocial and auth keys on logout', () => {
    // Simulate legacy storage from previous app versions
    localStorage.setItem(
      'ecosocial:auth',
      JSON.stringify({
        user: { id: 'user-1', name: 'Legacy User', email: 'legacy@test.com' },
        token: 'legacy-token',
        isLoggedIn: true,
      })
    )
    localStorage.setItem(
      'auth',
      JSON.stringify({
        user: { id: 'user-1', name: 'Plain User', email: 'plain@test.com' },
        token: 'plain-token',
        isLoggedIn: true,
      })
    )

    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(true)

    // User logs out
    auth.logout()

    // Everything must be cleared from storage
    expect(localStorage.getItem('iclean:auth')).toBeNull()
    expect(localStorage.getItem('ecosocial:auth')).toBeNull()
    expect(localStorage.getItem('auth')).toBeNull()

    // Re-initialize store (simulating F5 page reload)
    setActivePinia(createPinia())
    const reloadedAuth = useAuthStore()

    expect(reloadedAuth.isLoggedIn).toBe(false)
    expect(reloadedAuth.user).toBeNull()
    expect(reloadedAuth.token).toBeNull()
    expect(reloadedAuth.isAuthenticated).toBe(false)
  })

  it('is NOT authenticated if token is missing even if user and isLoggedIn are present', () => {
    // Old mock data or corrupted storage without JWT token
    localStorage.setItem(
      'iclean:auth',
      JSON.stringify({
        user: { id: 'user-1', name: 'Mock User', email: 'mock@test.com' },
        token: null,
        isLoggedIn: true,
      })
    )

    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.isLoggedIn).toBe(false)
    expect(auth.token).toBeNull()
    expect(auth.user).toBeNull()

    // It should have cleaned the corrupted storage
    expect(localStorage.getItem('iclean:auth')).toBeNull()
  })

  it('logs out and clears storage if fetchMe fails with unauthorized', async () => {
    localStorage.setItem(
      'iclean:auth',
      JSON.stringify({
        user: { id: 'user-1', name: 'Valid User', email: 'valid@test.com' },
        token: 'invalid-token',
        isLoggedIn: true,
      })
    )

    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(true)

    // Simulate fetchMe failing with 401
    const { authService } = await import('@/services')
    const originalGetMe = authService.getMe
    authService.getMe = async () => {
      throw new Error('Não autenticado')
    }

    try {
      const res = await auth.fetchMe()
      expect(res).toBeNull()
      expect(auth.isAuthenticated).toBe(false)
      expect(auth.isLoggedIn).toBe(false)
      expect(auth.user).toBeNull()
      expect(auth.token).toBeNull()
      expect(localStorage.getItem('iclean:auth')).toBeNull()
    } finally {
      authService.getMe = originalGetMe
    }
  })
})
