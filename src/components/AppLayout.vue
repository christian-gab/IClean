<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AppBottomNav from '@/components/AppBottomNav.vue'

const route = useRoute()
const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    home: 'Feed',
    explore: 'Explorar',
    points: 'Pontos e Conquistas',
    profile: 'Meu Perfil',
  }
  return titles[route.name as string] ?? 'EcoSocial'
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
  background: rgba(250, 250, 249, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e7e5e4;
  padding: 1rem 1.5rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1c1917;
}

.page-body {
  flex: 1;
  padding: 1.5rem;
  padding-bottom: 5rem;
}

@media (min-width: 768px) {
  .page-body {
    padding-bottom: 1.5rem;
    padding-left: 2rem;
    padding-right: 2rem;
    max-width: 760px;
  }
}

@media (min-width: 1024px) {
  .main-content {
    margin-left: 260px;
  }
  .page-body {
    padding: 2rem;
    max-width: 720px;
  }
}
</style>
