<script setup lang="ts">
import { computed } from 'vue'
import { useFeedStore } from '@/stores/useFeedStore'
import { useProgressStore } from '@/stores/useProgressStore'
import { currentUser } from '@/mocks/user'
import PostCard from '@/features/feed/PostCard.vue'
import { formatDate } from '@/utils/date'
import { Trophy, FileText, CheckCircle, Award } from '@lucide/vue'

const feed = useFeedStore()
const progress = useProgressStore()

const userPosts = computed(() =>
  feed.posts.filter(p => p.authorId === currentUser.id)
)

const emojiForLevel = (icon: string) =>
  icon === 'Sprout' ? '🌱' :
  icon === 'Leaf' ? '🍃' :
  icon === 'Trees' ? '🌳' :
  icon === 'Globe' ? '🌍' : '🌿'

const emojiForAch = (icon: string) =>
  icon === 'Star' ? '⭐' :
  icon === 'Award' ? '🏅' :
  icon === 'Shield' ? '🛡️' :
  icon === 'MessageSquare' ? '💬' :
  icon === 'Megaphone' ? '📣' : '🏆'
</script>

<template>
  <div class="profile-page">
    <!-- Profile header -->
    <div class="profile-header eco-card">
      <div class="avatar-wrap">
        <img :src="currentUser.avatarUrl" :alt="currentUser.name" class="avatar profile-avatar" width="80" height="80" />
        <div class="level-badge">{{ emojiForLevel(progress.currentLevel.icon) }}</div>
      </div>
      <div class="profile-info">
        <h2 class="profile-name">{{ currentUser.name }}</h2>
        <p class="profile-username">{{ currentUser.username }}</p>
        <p class="profile-bio">{{ currentUser.bio }}</p>
        <p class="profile-joined">Membro desde {{ formatDate(currentUser.joinedAt) }}</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card eco-card">
        <Trophy :size="20" color="#f59e0b" />
        <div class="stat-value">{{ progress.progress.totalPoints }}</div>
        <div class="stat-label">Pontos</div>
      </div>
      <div class="stat-card eco-card">
        <CheckCircle :size="20" color="#22c55e" />
        <div class="stat-value">{{ progress.progress.actionsCompleted }}</div>
        <div class="stat-label">Acoes</div>
      </div>
      <div class="stat-card eco-card">
        <FileText :size="20" color="#0ea5e9" />
        <div class="stat-value">{{ userPosts.length }}</div>
        <div class="stat-label">Posts</div>
      </div>
      <div class="stat-card eco-card">
        <Award :size="20" color="#7c3aed" />
        <div class="stat-value">{{ progress.unlockedAchievements.length }}</div>
        <div class="stat-label">Conquistas</div>
      </div>
    </div>

    <!-- Level progress -->
    <div class="eco-card level-section">
      <div class="level-top">
        <span class="level-tag">{{ progress.currentLevel.name }}</span>
        <span v-if="progress.nextLevel" class="next-level">Proximo: {{ progress.nextLevel.name }}</span>
      </div>
      <div class="progress-bar" style="margin-top:0.75rem">
        <div class="progress-bar-fill" :style="{ width: progress.levelProgress + '%' }" />
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:.375rem">
        <span style="font-size:.75rem;color:#a8a29e">{{ progress.progress.totalPoints }} pts</span>
        <span v-if="progress.nextLevel" style="font-size:.75rem;color:#a8a29e">
          {{ progress.nextLevel.minPoints }} pts
        </span>
      </div>
    </div>

    <!-- Achievements unlocked -->
    <section v-if="progress.unlockedAchievements.length" class="section">
      <h2 class="section-title">Conquistas Desbloqueadas</h2>
      <div class="ach-chips">
        <div
          v-for="achievement in progress.unlockedAchievements"
          :key="achievement.id"
          class="ach-chip"
        >
          {{ emojiForAch(achievement.icon) }} {{ achievement.title }}
        </div>
      </div>
    </section>

    <!-- My posts -->
    <section class="section">
      <h2 class="section-title">Minhas Publicacoes</h2>
      <div v-if="userPosts.length">
        <PostCard v-for="post in userPosts" :key="post.id" :post="post" />
      </div>
      <div v-else class="empty-state">
        <p>Voce ainda nao publicou nada. Compartilhe sua primeira acao sustentavel!</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.profile-page { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem; }

.profile-header { padding: 1.5rem; display: flex; gap: 1.25rem; align-items: flex-start; }

.avatar-wrap { position: relative; flex-shrink: 0; }
.profile-avatar { width: 80px; height: 80px; }
.level-badge {
  position: absolute; bottom: -4px; right: -4px;
  background: white; border: 2px solid white;
  border-radius: 9999px; font-size: 1.125rem;
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
}

.profile-info { flex: 1; }
.profile-name { margin: 0 0 0.125rem; font-size: 1.25rem; font-weight: 700; color: #1c1917; }
.profile-username { margin: 0 0 0.5rem; font-size: 0.875rem; color: #a8a29e; }
.profile-bio { margin: 0 0 0.5rem; font-size: 0.875rem; color: #57534e; line-height: 1.5; }
.profile-joined { margin: 0; font-size: 0.75rem; color: #a8a29e; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.625rem; }
.stat-card { padding: 0.875rem 0.5rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
.stat-value { font-size: 1.375rem; font-weight: 800; color: #1c1917; }
.stat-label { font-size: 0.6875rem; color: #78716c; }

.level-section { padding: 1.25rem; }
.level-top { display: flex; justify-content: space-between; align-items: center; }
.level-tag { font-size: 0.9375rem; font-weight: 700; color: #15803d; }
.next-level { font-size: 0.8125rem; color: #a8a29e; }

.section { }
.section-title { font-size: 1rem; font-weight: 700; color: #1c1917; margin: 0 0 0.875rem; }

.ach-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.ach-chip {
  padding: 0.375rem 0.875rem; background: #f0fdf4; border: 1px solid #bbf7d0;
  border-radius: 9999px; font-size: 0.8125rem; font-weight: 500; color: #15803d;
}

.empty-state { color: #78716c; font-size: 0.9375rem; text-align: center; padding: 2rem; background: white; border-radius: 1rem; border: 1px solid #e7e5e4; }
</style>
