import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { public: true },
    },
    {
      path: '/cadastro',
      name: 'register',
      component: () => import('@/pages/RegisterPage.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: () => import('@/components/AppLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/pages/FeedPage.vue'),
        },
        {
          path: 'explorar',
          name: 'explore',
          component: () => import('@/pages/ExplorePage.vue'),
        },
        {
          path: 'pontos',
          name: 'points',
          component: () => import('@/pages/PointsPage.vue'),
        },
        {
          path: 'perfil',
          name: 'profile',
          component: () => import('@/pages/ProfilePage.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const { useAuthStore } = await import('@/stores/useAuthStore')
  const { getActivePinia } = await import('pinia')

  const pinia = getActivePinia()
  if (!pinia) return true

  const auth = useAuthStore()

  const isPublic = to.meta.public === true

  if (!auth.isAuthenticated && !isPublic) {
    return { name: 'login' }
  }

  if (auth.isAuthenticated && (to.name === 'login' || to.name === 'register')) {
    return { name: 'home' }
  }

  return true
})

export default router
