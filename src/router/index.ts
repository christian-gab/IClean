import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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

export default router
