<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { to: '/', name: 'home', label: 'Feed', icon: 'fa-house' },
  { to: '/explorar', name: 'explore', label: 'Explorar', icon: 'fa-compass' },
  { to: '/pontos', name: 'points', label: 'Pontos', icon: 'fa-trophy' },
  { to: '/perfil', name: 'profile', label: 'Perfil', icon: 'fa-user' },
]
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="bottom-nav-item"
      :class="{ active: route.name === item.name }"
    >
      <i class="fa-solid" :class="item.icon" aria-hidden="true" />
      <span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid var(--color-border);
  display: flex;
  z-index: 30;
  padding-bottom: env(safe-area-inset-bottom);
}

.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.625rem 0.5rem;
  text-decoration: none;
  color: #78716c;
  font-size: 0.6875rem;
  font-weight: 500;
  transition: color 0.15s ease;
}

.bottom-nav-item i { font-size: 1.125rem; }

.bottom-nav-item.active {
  color: var(--color-primary);
  font-weight: 600;
}

@media (min-width: 1024px) {
  .bottom-nav {
    display: none;
  }
}
</style>
