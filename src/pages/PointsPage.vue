<script setup lang="ts">
import { computed } from 'vue'
import { useProgressStore } from '@/stores/useProgressStore'
import { allAchievements } from '@/mocks/achievements'
import { levels } from '@/mocks/levels'
import { formatDate } from '@/utils/date'
import { Trophy, Star, Lock } from '@lucide/vue'

const store = useProgressStore()

const achievementsWithStatus = computed(() =>
  allAchievements.map(a => ({
    ...a,
    unlocked: store.progress.unlockedAchievements.includes(a.id),
  }))
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
  <div class="points-page">
    <!-- Level card -->
    <div class="level-card eco-card">
      <div class="level-header">
        <div class="level-icon">{{ emojiForLevel(store.currentLevel.icon) }}</div>
        <div>
          <div class="level-name">{{ store.currentLevel.name }}</div>
          <div class="level-pts">{{ store.progress.totalPoints }} pontos</div>
        </div>
        <Trophy :size="24" color="#f59e0b" />
      </div>

      <div v-if="store.nextLevel" class="level-progress-info">
        <div style="display:flex;justify-content:space-between;margin-bottom:.5rem">
          <span class="progress-label">Progresso para {{ store.nextLevel.name }}</span>
          <span class="progress-pct">{{ store.levelProgress }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill" :style="{ width: store.levelProgress + '%' }" />
        </div>
        <div class="pts-to-next">
          Faltam {{ store.nextLevel.minPoints - store.progress.totalPoints }} pts
        </div>
      </div>
      <div v-else class="max-level">
        🎉 Voce atingiu o nivel maximo!
      </div>
    </div>

    <!-- Stats row -->
    <div class="stats-row">
      <div class="stat-card eco-card">
        <div class="stat-value">{{ store.progress.actionsCompleted }}</div>
        <div class="stat-label">Acoes concluidas</div>
      </div>
      <div class="stat-card eco-card">
        <div class="stat-value">{{ store.progress.postsCreated }}</div>
        <div class="stat-label">Publicacoes</div>
      </div>
      <div class="stat-card eco-card">
        <div class="stat-value">{{ store.unlockedAchievements.length }}</div>
        <div class="stat-label">Conquistas</div>
      </div>
    </div>

    <!-- Levels -->
    <section class="section">
      <h2 class="section-title">Niveis</h2>
      <div class="levels-list">
        <div
          v-for="level in levels"
          :key="level.name"
          class="level-item"
          :class="{ current: level.name === store.currentLevel.name }"
        >
          <span class="level-emoji">{{ emojiForLevel(level.icon) }}</span>
          <div class="level-info">
            <span class="level-item-name">{{ level.name }}</span>
            <span class="level-item-range">{{ level.minPoints }}–{{ level.maxPoints === 99999 ? '+' : level.maxPoints }} pts</span>
          </div>
          <Star v-if="level.name === store.currentLevel.name" :size="16" color="#f59e0b" />
        </div>
      </div>
    </section>

    <!-- Achievements -->
    <section class="section">
      <h2 class="section-title">Conquistas</h2>
      <div class="achievements-grid">
        <div
          v-for="ach in achievementsWithStatus"
          :key="ach.id"
          class="ach-card eco-card"
          :class="{ locked: !ach.unlocked }"
        >
          <div class="ach-icon">
            <span v-if="ach.unlocked">{{ emojiForAch(ach.icon) }}</span>
            <Lock v-else :size="20" color="#a8a29e" />
          </div>
          <div class="ach-info">
            <div class="ach-title">{{ ach.title }}</div>
            <div class="ach-desc">{{ ach.description }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- History -->
    <section class="section">
      <h2 class="section-title">Historico</h2>
      <div v-if="store.progress.history.length" class="history-list">
        <div v-for="item in store.progress.history" :key="item.id" class="history-item">
          <div class="history-dot" />
          <div class="history-content">
            <span class="history-action">{{ item.actionTitle }}</span>
            <span class="history-date">{{ formatDate(item.completedAt) }}</span>
          </div>
          <span class="history-pts">+{{ item.points }}</span>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>Nenhuma acao registrada ainda. Explore e comece a acumular pontos!</p>
      </div>
    </section>

    <!-- Reset (demo only) -->
    <div style="text-align:center;padding-bottom:1rem">
      <button class="btn-ghost" style="font-size:0.8125rem;color:#a8a29e" @click="store.resetProgress()" id="reset-progress">
        Reiniciar progresso demonstrativo
      </button>
    </div>
  </div>
</template>

<style scoped>
.points-page { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem; }

.level-card { padding: 1.5rem; }

.level-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; }
.level-icon { font-size: 2.5rem; }
.level-name { font-size: 1.125rem; font-weight: 700; color: #1c1917; }
.level-pts { font-size: 0.875rem; color: #78716c; }

.progress-label { font-size: 0.8125rem; color: #57534e; }
.progress-pct { font-size: 0.8125rem; font-weight: 700; color: #16a34a; }
.pts-to-next { font-size: 0.8125rem; color: #a8a29e; margin-top: 0.5rem; text-align: right; }
.max-level { color: #16a34a; font-weight: 600; font-size: 0.9375rem; }

.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
.stat-card { padding: 1rem; text-align: center; }
.stat-value { font-size: 1.75rem; font-weight: 800; color: #1c1917; }
.stat-label { font-size: 0.75rem; color: #78716c; margin-top: 0.25rem; }

.section { }
.section-title { font-size: 1rem; font-weight: 700; color: #1c1917; margin: 0 0 0.875rem; }

.levels-list { display: flex; flex-direction: column; gap: 0.5rem; }
.level-item {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 1rem; background: white; border-radius: 0.75rem;
  border: 1.5px solid #e7e5e4;
}
.level-item.current { border-color: #86efac; background: #f0fdf4; }
.level-emoji { font-size: 1.375rem; }
.level-info { flex: 1; }
.level-item-name { font-size: 0.9375rem; font-weight: 600; color: #1c1917; display: block; }
.level-item-range { font-size: 0.75rem; color: #a8a29e; }

.achievements-grid { display: grid; grid-template-columns: 1fr; gap: 0.75rem; }
@media (min-width: 480px) { .achievements-grid { grid-template-columns: 1fr 1fr; } }

.ach-card { display: flex; align-items: center; gap: 0.875rem; padding: 1rem; }
.ach-card.locked { opacity: 0.5; }
.ach-icon { width: 44px; height: 44px; border-radius: 0.75rem; background: #f5f5f4; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
.ach-title { font-size: 0.875rem; font-weight: 600; color: #1c1917; }
.ach-desc { font-size: 0.75rem; color: #78716c; margin-top: 0.125rem; }

.history-list { display: flex; flex-direction: column; gap: 0; background: white; border-radius: 1rem; border: 1px solid #e7e5e4; overflow: hidden; }
.history-item {
  display: flex; align-items: center; gap: 0.875rem;
  padding: 0.875rem 1.25rem; border-bottom: 1px solid #f5f5f4;
}
.history-item:last-child { border-bottom: none; }
.history-dot { width: 8px; height: 8px; border-radius: 9999px; background: #22c55e; flex-shrink: 0; }
.history-content { flex: 1; }
.history-action { font-size: 0.875rem; font-weight: 500; color: #1c1917; display: block; }
.history-date { font-size: 0.75rem; color: #a8a29e; }
.history-pts { font-size: 0.875rem; font-weight: 700; color: #16a34a; }

.empty-state { color: #78716c; font-size: 0.9375rem; text-align: center; padding: 2rem; background: white; border-radius: 1rem; border: 1px solid #e7e5e4; }
</style>
