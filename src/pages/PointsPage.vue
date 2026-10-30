<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useProgressStore } from '@/stores/useProgressStore'
import { allAchievements as fallbackAchievements } from '@/mocks/achievements'
import { levels as fallbackLevels } from '@/mocks/levels'
import { formatDate } from '@/utils/date'
import { getFontAwesomeIcon } from '@/utils/icons'

const store = useProgressStore()

const displayLevels = computed(() =>
  store.levels.length > 0 ? store.levels : fallbackLevels
)

const achievementsWithStatus = computed(() => {
  const source = store.achievements.length > 0 ? store.achievements : fallbackAchievements
  return source.map(a => ({
    ...a,
    unlocked: store.progress.unlockedAchievements.includes(a.id) || Boolean('unlocked' in a && (a as { unlocked?: boolean }).unlocked),
  }))
})

onMounted(() => {
  store.loadAllGamificationData()
})

</script>

<template>
  <div class="points-page">
    <div class="level-card card-ds">
      <div class="level-header">
        <div class="level-icon">
          <i class="fa-solid" :class="getFontAwesomeIcon(store.currentLevel.icon)" aria-hidden="true" />
        </div>
        <div>
          <div class="level-name">{{ store.currentLevel.name }}</div>
          <div class="level-pts">{{ store.progress.totalPoints }} pontos</div>
        </div>
        <i class="fa-solid fa-trophy level-trophy" aria-hidden="true" />
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
        <i class="fa-solid fa-circle-check" aria-hidden="true" />
        Você atingiu o nível máximo!
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card card-ds">
        <div class="stat-value">{{ store.progress.actionsCompleted }}</div>
        <div class="stat-label label-ds">Ações concluídas</div>
      </div>
      <div class="stat-card card-ds">
        <div class="stat-value">{{ store.progress.postsCreated }}</div>
        <div class="stat-label label-ds">Publicações</div>
      </div>
      <div class="stat-card card-ds">
        <div class="stat-value">{{ store.unlockedAchievements.length }}</div>
        <div class="stat-label label-ds">Conquistas</div>
      </div>
    </div>

    <section class="section">
      <h2 class="section-title">Níveis</h2>
      <div class="levels-list">
        <div
          v-for="level in displayLevels"
          :key="level.name"
          class="level-item card-ds"
          :class="{ current: level.name === store.currentLevel.name }"
        >
          <span class="level-icon-small">
            <i class="fa-solid" :class="getFontAwesomeIcon(level.icon)" aria-hidden="true" />
          </span>
          <div class="level-info">
            <span class="level-item-name">{{ level.name }}</span>
            <span class="level-item-range">{{ level.minPoints }}–{{ level.maxPoints === 99999 ? '+' : level.maxPoints }} pts</span>
          </div>
          <i v-if="level.name === store.currentLevel.name" class="fa-solid fa-star current-level-star" aria-hidden="true" />
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Conquistas</h2>
      <div class="achievements-grid">
        <div
          v-for="ach in achievementsWithStatus"
          :key="ach.id"
          class="ach-card card-ds"
          :class="{ locked: !ach.unlocked }"
        >
          <div class="ach-icon">
            <i v-if="ach.unlocked" class="fa-solid" :class="getFontAwesomeIcon(ach.icon, 'fa-trophy')" aria-hidden="true" />
            <i v-else class="fa-solid fa-lock locked-icon" aria-hidden="true" />
          </div>
          <div class="ach-info">
            <div class="ach-title">{{ ach.title }}</div>
            <div class="ach-desc">{{ ach.description }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Histórico</h2>
      <div v-if="store.progress.history.length" class="history-list card-ds">
        <div v-for="item in store.progress.history" :key="item.id" class="history-item">
          <div class="history-dot" />
          <div class="history-content">
            <span class="history-action">{{ item.actionTitle }}</span>
            <span class="history-date">{{ formatDate(item.completedAt) }}</span>
          </div>
          <span class="history-pts">+{{ item.points }}</span>
        </div>
      </div>
      <div v-else class="empty-state card-ds">
        <p>Nenhuma ação registrada ainda. Explore e comece a acumular pontos!</p>
      </div>
    </section>

  </div>
</template>

<style scoped>
.points-page { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; }

.level-card { padding: 1.25rem; }

.level-header { display: flex; align-items: center; gap: 0.875rem; margin-bottom: 1rem; }
.level-icon { font-size: 2rem; color: var(--color-primary); }
.level-trophy { color: #d97706; font-size: 1.25rem; margin-left: auto; }
.level-icon-small { width: 1.75rem; text-align: center; color: var(--color-primary); font-size: 1rem; }
.current-level-star { color: #d97706; font-size: 0.875rem; }
.locked-icon { color: #a8a29e; font-size: 1rem; }
.level-name { font-size: 1rem; font-weight: 600; color: #111827; }
.level-pts { font-size: 0.8125rem; color: #78716c; }

.progress-label { font-size: 0.75rem; color: #57534e; }
.progress-pct { font-size: 0.75rem; font-weight: 600; color: var(--color-primary); }
.pts-to-next { font-size: 0.75rem; color: #78716c; margin-top: 0.375rem; text-align: right; }
.max-level { color: var(--color-primary); font-weight: 500; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; }

.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.625rem; }
.stat-card { padding: 0.875rem 0.5rem; text-align: center; }
.stat-value { font-size: 1.5rem; font-weight: 700; color: #111827; }
.stat-label { margin-top: 0.25rem; font-size: 10px; }

.section { margin-top: 0.25rem; }
.section-title { font-size: 0.9375rem; font-weight: 600; color: #111827; margin: 0 0 0.625rem; }

.levels-list { display: flex; flex-direction: column; gap: 0.375rem; }
.level-item {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.625rem 0.875rem;
}
.level-item.current { border-color: var(--color-primary); background: #f0fdf4; }
.level-info { flex: 1; }
.level-item-name { font-size: 0.875rem; font-weight: 600; color: #111827; display: block; }
.level-item-range { font-size: 0.75rem; color: #78716c; }

.achievements-grid { display: grid; grid-template-columns: 1fr; gap: 0.625rem; }
@media (min-width: 480px) { .achievements-grid { grid-template-columns: 1fr 1fr; } }

.ach-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem; }
.ach-card.locked { opacity: 0.55; }
.ach-icon { width: 38px; height: 38px; border-radius: var(--radius); background: #f5f5f4; display: flex; align-items: center; justify-content: center; font-size: 1.125rem; color: var(--color-primary); flex-shrink: 0; }
.ach-title { font-size: 0.8125rem; font-weight: 600; color: #111827; }
.ach-desc { font-size: 0.75rem; color: #78716c; margin-top: 0.125rem; }

.history-list { display: flex; flex-direction: column; gap: 0; overflow: hidden; }
.history-item {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 1rem; border-bottom: 1px solid var(--color-border);
}
.history-item:last-child { border-bottom: none; }
.history-dot { width: 6px; height: 6px; border-radius: var(--radius); background: var(--color-primary); flex-shrink: 0; }
.history-content { flex: 1; }
.history-action { font-size: 0.8125rem; font-weight: 500; color: #111827; display: block; }
.history-date { font-size: 0.6875rem; color: #78716c; }
.history-pts { font-size: 0.8125rem; font-weight: 600; color: var(--color-primary); }

.empty-state { color: #78716c; font-size: 0.875rem; text-align: center; padding: 1.75rem; }
</style>
