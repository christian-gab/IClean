<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useProgressStore } from '@/stores/useProgressStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Home, Compass, Trophy, User, Leaf } from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const store = useProgressStore()
const auth = useAuthStore()

const navItems = [
  { to: '/', name: 'home', label: 'Feed', icon: Home },
  { to: '/explorar', name: 'explore', label: 'Explorar', icon: Compass },
  { to: '/pontos', name: 'points', label: 'Pontos', icon: Trophy },
  { to: '/perfil', name: 'profile', label: 'Perfil', icon: User },
]

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <Leaf :size="28" color="#16a34a" />
      <span>EcoSocial</span>
    </div>

    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: route.name === item.name }"
      >
        <component :is="item.icon" :size="20" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-points">
      <div class="points-label">{{ store.currentLevel.name }}</div>
      <div class="points-value">{{ store.progress.totalPoints }} pts</div>
      <div class="progress-bar" style="margin-top:8px">
        <div class="progress-bar-fill" :style="{ width: store.levelProgress + '%' }" />
      </div>
    </div>

    <!-- User info + logout -->
    <div v-if="auth.user" class="sidebar-user">
      <img :src="auth.user.avatarUrl" :alt="auth.user.name" class="avatar sidebar-avatar" width="36" height="36" />
      <div class="sidebar-user-info">
        <span class="sidebar-user-name">{{ auth.user.name }}</span>
        <span class="sidebar-user-username">{{ auth.user.username }}</span>
      </div>
      <button class="sidebar-logout" title="Sair" @click="logout">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
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
    border-right: 1px solid #e7e5e4;
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

.sidebar-logo span {
  font-size: 1.25rem;
  font-weight: 800;
  color: #15803d;
  letter-spacing: -0.5px;
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
  padding: 0.75rem;
  border-radius: 0.75rem;
  text-decoration: none;
  color: #78716c;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: all 0.15s ease;
}

.nav-item:hover {
  background: #f0fdf4;
  color: #16a34a;
}

.nav-item.active {
  background: #dcfce7;
  color: #15803d;
  font-weight: 600;
}

.sidebar-points {
  background: #f0fdf4;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #bbf7d0;
  margin-bottom: 0.75rem;
}

.points-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #16a34a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.points-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1c1917;
  margin-top: 0.25rem;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid #e7e5e4;
  background: #fafaf9;
}

.sidebar-avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.sidebar-user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.sidebar-user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1c1917;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user-username {
  font-size: 0.75rem;
  color: #a8a29e;
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
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  transition: color 0.15s, background 0.15s;
}
.sidebar-logout:hover {
  color: #dc2626;
  background: #fef2f2;
}
</style>

