<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProgressStore } from '@/stores/useProgressStore'
import { useAuthStore } from '@/stores/useAuthStore'
import AppSidebar from '@/components/AppSidebar.vue'
import AppBottomNav from '@/components/AppBottomNav.vue'

const route = useRoute()
const progress = useProgressStore()
const auth = useAuthStore()

onMounted(() => {
  if (auth.isAuthenticated) {
    progress.loadAllGamificationData()
  }
})

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    home: 'Feed',
    explore: 'Explorar',
    points: 'Pontos e Conquistas',
    profile: 'Meu Perfil',
  }
  return titles[route.name as string] ?? 'Iclean'
})
</script>

<template>
  <div class="layout">
    <AppSidebar />
    <main class="main-content">
      <header class="page-header">
        <h1>{{ pageTitle }}</h1>
      </header>
      <div class="page-body">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </div>
    </main>
    <AppBottomNav />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100dvh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(250, 250, 249, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
  padding: 0.875rem 1.5rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  letter-spacing: -0.01em;
}

.page-body {
  flex: 1;
  padding: 1.25rem;
  padding-bottom: 5rem;
}

@media (min-width: 768px) {
  .page-body {
    padding-bottom: 1.5rem;
    padding-left: 1.75rem;
    padding-right: 1.75rem;
    max-width: 760px;
  }
}

@media (min-width: 1024px) {
  .main-content {
    margin-left: 260px;
  }
  .page-body {
    padding: 1.75rem 2rem;
    max-width: 720px;
  }
}
</style>
