<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useProgressStore } from '@/stores/useProgressStore'
import { useAuthStore } from '@/stores/useAuthStore'

const route = useRoute()
const router = useRouter()
const store = useProgressStore()
const auth = useAuthStore()

const navItems = [
  { to: '/', name: 'home', label: 'Feed', icon: 'fa-house' },
  { to: '/explorar', name: 'explore', label: 'Explorar', icon: 'fa-compass' },
  { to: '/pontos', name: 'points', label: 'Pontos', icon: 'fa-trophy' },
  { to: '/perfil', name: 'profile', label: 'Perfil', icon: 'fa-user' },
]

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <i class="fa-solid fa-leaf sidebar-logo-icon" aria-hidden="true" />
      <span>Iclean</span>
    </div>

    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: route.name === item.name }"
      >
        <i class="fa-solid" :class="item.icon" aria-hidden="true" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-points card-ds">
      <div class="points-label label-ds">{{ store.currentLevel.name }}</div>
      <div class="points-value">{{ store.progress.totalPoints }} pts</div>
      <div class="progress-bar" style="margin-top: 8px">
        <div class="progress-bar-fill" :style="{ width: store.levelProgress + '%' }" />
      </div>
    </div>

    <div v-if="auth.user" class="sidebar-user card-ds">
      <img :src="auth.user.avatarUrl" :alt="auth.user.name" class="avatar sidebar-avatar" width="36" height="36" />
      <div class="sidebar-user-info">
        <span class="sidebar-user-name">{{ auth.user.name }}</span>
        <span class="sidebar-user-username">{{ auth.user.username }}</span>
      </div>
      <button class="sidebar-logout" title="Sair" @click="logout">
        <i class="fa-solid fa-right-from-bracket" aria-hidden="true" />
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: none;
}

@media (min-width: 1024px) {
  .sidebar {
    display: flex;
    flex-direction: column;
    width: 260px;
    position: fixed;
    top: 0;
    left: 0;
    height: 100dvh;
    background: white;
    border-right: 1px solid var(--color-border);
    padding: 1.5rem 1rem;
    z-index: 20;
  }
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  margin-bottom: 2rem;
}

.sidebar-logo-icon { font-size: 1.5rem; color: var(--color-primary); }

.sidebar-logo span {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.3px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius);
  text-decoration: none;
  color: #57534e;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.15s ease;
  border-left: 2px solid transparent;
}

.nav-item i { width: 18px; text-align: center; font-size: 1rem; }

.nav-item:hover {
  background: #f5f5f4;
  color: #1c1917;
}

.nav-item.active {
  background: #f0fdf4;
  color: var(--color-primary);
  font-weight: 600;
  border-left-color: var(--color-primary);
}

.sidebar-points {
  padding: 0.875rem;
  margin-bottom: 0.75rem;
}

.points-label {
  display: block;
  margin-bottom: 0.25rem;
}

.points-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1c1917;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.75rem;
}

.sidebar-avatar {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
}

.sidebar-user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.sidebar-user-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1c1917;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user-username {
  font-size: 0.6875rem;
  color: #78716c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-logout {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: #a8a29e;
  padding: 0.25rem;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  transition: color 0.15s, background 0.15s;
}
.sidebar-logout:hover {
  color: var(--color-destructive);
  background: #fef2f2;
}
</style>
