<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Home, Compass, Trophy, User } from '@lucide/vue'

const route = useRoute()

const navItems = [
  { to: '/', name: 'home', label: 'Feed', icon: Home },
  { to: '/explorar', name: 'explore', label: 'Explorar', icon: Compass },
  { to: '/pontos', name: 'points', label: 'Pontos', icon: Trophy },
  { to: '/perfil', name: 'profile', label: 'Perfil', icon: User },
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
      <component :is="item.icon" :size="22" />
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
  border-top: 1px solid #e7e5e4;
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
  color: #a8a29e;
  font-size: 0.6875rem;
  font-weight: 500;
  transition: color 0.15s ease;
}

.bottom-nav-item.active {
  color: #16a34a;
}

@media (min-width: 1024px) {
  .bottom-nav {
    display: none;
  }
}
</style>
