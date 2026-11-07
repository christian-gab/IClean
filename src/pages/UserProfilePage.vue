<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserProfileStore } from '@/stores/useUserProfileStore'
import { useAuthStore } from '@/stores/useAuthStore'
import PostCard from '@/features/feed/PostCard.vue'
import { formatDate } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const profileStore = useUserProfileStore()
const auth = useAuthStore()

function loadUser(id: string) {
  profileStore.reset()
  profileStore.loadProfile(id)
}

onMounted(() => {
  const id = String(route.params.userId)
  // If viewing own profile, redirect to /perfil
  if (auth.user && id === auth.user.id) {
    router.replace({ name: 'profile' })
    return
  }
  loadUser(id)
})

watch(
  () => route.params.userId,
  (newId) => {
    if (!newId) return
    const id = String(newId)
    if (auth.user && id === auth.user.id) {
      router.replace({ name: 'profile' })
      return
    }
    loadUser(id)
  }
)
</script>

<template>
  <div class="user-profile-page">

    <!-- Loading -->
    <div v-if="profileStore.isLoading" class="loading-state">
      <i class="fa-solid fa-spinner spin" style="color:var(--color-primary)" aria-hidden="true" />
      <p>Carregando perfil...</p>
    </div>

    <!-- Error -->
    <div v-else-if="profileStore.error" class="error-state card-ds">
      <i class="fa-solid fa-circle-exclamation" style="font-size:2rem;color:#dc2626" aria-hidden="true" />
      <p>{{ profileStore.error }}</p>
      <button class="btn-secondary" @click="router.back()">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" /> Voltar
      </button>
    </div>

    <!-- Profile content -->
    <template v-else-if="profileStore.profile">
      <!-- Back button -->
      <button class="back-btn" @click="router.back()">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
        <span>Voltar</span>
      </button>

      <!-- Header Card (inspired by X/Twitter) -->
      <div class="profile-header card-ds">
        <!-- Banner area -->
        <div class="profile-banner">
          <div class="banner-gradient" />
        </div>

        <!-- Avatar overlapping the banner -->
        <div class="profile-top-row">
          <div class="avatar-wrap">
            <img
              :src="profileStore.profile.avatarUrl"
              :alt="profileStore.profile.name"
              class="avatar profile-avatar"
              width="80"
              height="80"
            />
          </div>
        </div>

        <div class="profile-info">
          <h1 class="profile-name">{{ profileStore.profile.name }}</h1>
          <p class="profile-username">{{ profileStore.profile.username }}</p>

          <p v-if="profileStore.profile.bio" class="profile-bio">
            {{ profileStore.profile.bio }}
          </p>

          <div class="profile-meta">
            <span class="meta-item">
              <i class="fa-regular fa-calendar" aria-hidden="true" />
              Membro desde {{ formatDate(profileStore.profile.joinedAt) }}
            </span>
          </div>

          <div class="profile-stats">
            <div class="profile-stat">
              <span class="stat-num">{{ profileStore.posts.length }}</span>
              <span class="stat-label">Publicações</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Posts Section -->
      <section class="posts-section">
        <div class="section-header">
          <i class="fa-solid fa-newspaper" aria-hidden="true" />
          <h2 class="section-title">Publicações</h2>
        </div>

        <div v-if="profileStore.posts.length" class="posts-list">
          <TransitionGroup name="slide-up">
            <PostCard
              v-for="post in profileStore.posts"
              :key="post.id"
              :post="post"
            />
          </TransitionGroup>
        </div>

        <div v-else class="empty-state card-ds">
          <i class="fa-solid fa-seedling" style="font-size:2rem;color:var(--color-primary)" aria-hidden="true" />
          <p>Nenhuma publicação ainda.</p>
        </div>
      </section>
    </template>

  </div>
</template>

<style scoped>
.user-profile-page {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Back button */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: #57534e;
  cursor: pointer;
  padding: 0.375rem 0.25rem;
  border-radius: var(--radius);
  transition: color 0.15s;
  align-self: flex-start;
}
.back-btn:hover { color: var(--color-primary); }

/* Header */
.profile-header {
  overflow: hidden;
  padding: 0 0 1.25rem;
}

.profile-banner {
  height: 90px;
  position: relative;
}

.banner-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #15803d 0%, #0ea5e9 50%, #7c3aed 100%);
  opacity: 0.85;
}

.profile-top-row {
  padding: 0 1.25rem;
  margin-top: -40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 0.75rem;
}

.avatar-wrap {
  position: relative;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  background: #f5f5f4;
  object-fit: cover;
}

.profile-info {
  padding: 0 1.25rem;
}

.profile-name {
  margin: 0 0 0.125rem;
  font-size: 1.1875rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}

.profile-username {
  margin: 0 0 0.625rem;
  font-size: 0.875rem;
  color: #78716c;
}

.profile-bio {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  color: #44403c;
  line-height: 1.6;
}

.profile-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.875rem;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8125rem;
  color: #78716c;
}

.profile-stats {
  display: flex;
  gap: 1.25rem;
}

.profile-stat {
  display: flex;
  gap: 0.3rem;
  align-items: baseline;
}

.stat-num {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  font-size: 0.8125rem;
  color: #78716c;
}

/* Posts section */
.posts-section { display: flex; flex-direction: column; gap: 0.75rem; }

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 2px solid var(--color-primary);
  color: var(--color-primary);
}

.section-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
}

.posts-list { display: flex; flex-direction: column; }

/* Loading / Error / Empty */
.loading-state, .error-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #78716c;
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.error-state { border-radius: var(--radius); }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2.5rem 1rem;
  text-align: center;
  color: #78716c;
  font-size: 0.875rem;
}

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>

