<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PostCategory } from '@/types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types'
import { useProgressStore } from '@/stores/useProgressStore'
import { sustainableActions } from '@/mocks/actions'
import { Check, Star } from '@lucide/vue'

const store = useProgressStore()
const activeFilter = ref<PostCategory | 'all'>('all')

const categories = [
  ['all', 'Todas'] as const,
  ...Object.entries(CATEGORY_LABELS) as [PostCategory, string][],
]

const filteredActions = computed(() =>
  activeFilter.value === 'all'
    ? sustainableActions
    : sustainableActions.filter(a => a.category === activeFilter.value)
)

function isCompleted(actionId: string) {
  return store.progress.sessionCompletedActions.includes(actionId)
}

function complete(actionId: string, title: string, points: number) {
  store.completeAction(actionId, title, points)
}
</script>

<template>
  <div class="explore-page">
    <div class="explore-header">
      <p class="explore-desc">
        Escolha acoes sustentaveis para realizar e ganhe pontos. Cada pequena acao faz diferenca!
      </p>
    </div>

    <!-- Filter -->
    <div class="filter-chips" style="margin-bottom:1.25rem;display:flex;gap:.375rem;flex-wrap:wrap">
      <button
        v-for="[val, label] in categories"
        :key="val"
        class="chip"
        :class="{ active: activeFilter === val }"
        @click="activeFilter = val"
        :id="`explore-filter-${val}`"
      >
        {{ label }}
      </button>
    </div>

    <!-- Actions grid -->
    <div class="actions-grid">
      <div
        v-for="action in filteredActions"
        :key="action.id"
        class="eco-card action-card"
        :class="{ completed: isCompleted(action.id) }"
      >
        <div class="action-icon" :style="{ background: CATEGORY_COLORS[action.category] + '18', color: CATEGORY_COLORS[action.category] }">
          {{ action.icon === 'Recycle' ? '♻️' :
             action.icon === 'GlassWater' ? '💧' :
             action.icon === 'ShoppingBag' ? '🛍️' :
             action.icon === 'Droplets' ? '🚿' :
             action.icon === 'Droplet' ? '💦' :
             action.icon === 'RefreshCcw' ? '🔄' :
             action.icon === 'MapPin' ? '📍' :
             action.icon === 'Sprout' ? '🌱' :
             action.icon === 'Bike' ? '🚲' :
             action.icon === 'Leaf' ? '🍃' : '🌿' }}
        </div>

        <div class="action-content">
          <h3 class="action-title">{{ action.title }}</h3>
          <p class="action-desc">{{ action.description }}</p>
          <div class="action-footer">
            <span class="points-badge">
              <Star :size="12" /> +{{ action.points }} pts
            </span>
            <button
              v-if="!isCompleted(action.id)"
              class="btn-primary"
              style="font-size:0.8125rem;padding:0.375rem 1rem"
              @click="complete(action.id, action.title, action.points)"
              :id="`complete-${action.id}`"
            >
              Concluir
            </button>
            <span v-else class="done-badge">
              <Check :size="14" /> Feito hoje
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.explore-page { max-width: 720px; margin: 0 auto; }

.explore-desc {
  color: #57534e; font-size: 0.9375rem; line-height: 1.6; margin: 0 0 1.25rem;
}

.chip {
  padding: 0.375rem 0.875rem; border-radius: 9999px;
  border: 1.5px solid #e7e5e4; background: white;
  font-size: 0.8125rem; font-weight: 500; color: #78716c;
  cursor: pointer; transition: all 0.15s ease;
}

.chip:hover { border-color: #86efac; color: #16a34a; }
.chip.active { background: #dcfce7; border-color: #86efac; color: #15803d; font-weight: 600; }

.actions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.875rem;
}

@media (min-width: 600px) {
  .actions-grid { grid-template-columns: 1fr 1fr; }
}

.action-card {
  display: flex; gap: 1rem; padding: 1.125rem;
  transition: all 0.2s ease;
}

.action-card.completed {
  opacity: 0.6;
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.action-icon {
  width: 48px; height: 48px; border-radius: 0.75rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; flex-shrink: 0;
}

.action-content { flex: 1; display: flex; flex-direction: column; gap: 0.375rem; }

.action-title { margin: 0; font-size: 0.9375rem; font-weight: 600; color: #1c1917; }
.action-desc { margin: 0; font-size: 0.8125rem; color: #78716c; line-height: 1.5; }

.action-footer {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 0.5rem;
}

.points-badge {
  display: flex; align-items: center; gap: 0.25rem;
  font-size: 0.8125rem; font-weight: 700; color: #16a34a;
}

.done-badge {
  display: flex; align-items: center; gap: 0.25rem;
  font-size: 0.8125rem; font-weight: 600; color: #16a34a;
  background: #dcfce7; padding: 0.25rem 0.625rem; border-radius: 9999px;
}
</style>
