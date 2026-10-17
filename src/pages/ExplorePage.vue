<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { PostCategory, SustainableAction } from '@/types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types'
import { useProgressStore } from '@/stores/useProgressStore'
import { useActionStore } from '@/stores/useActionStore'
import { Check, Star, ShieldCheck, Loader } from '@lucide/vue'
import ActionProofModal from '@/features/actions/ActionProofModal.vue'

const progressStore = useProgressStore()
const actionStore = useActionStore()
const activeFilter = ref<PostCategory | 'all'>('all')

// Modal state
const proofModal = ref<{
  action: SustainableAction
  emoji: string
} | null>(null)

const categories = [
  ['all', 'Todas'] as const,
  ...Object.entries(CATEGORY_LABELS) as [PostCategory, string][],
]

const filteredActions = computed(() =>
  activeFilter.value === 'all'
    ? actionStore.actions
    : actionStore.actions.filter(a => a.category === activeFilter.value)
)

function isCompleted(actionId: string) {
  return progressStore.progress.sessionCompletedActions.includes(actionId)
}

function getEmoji(icon: string) {
  const map: Record<string, string> = {
    Recycle: '♻️', GlassWater: '💧', ShoppingBag: '🛍️',
    Droplets: '🚿', Droplet: '💦', RefreshCcw: '🔄',
    MapPin: '📍', Sprout: '🌱', Bike: '🚲', Leaf: '🍃',
  }
  return map[icon] ?? '🌿'
}

function openProof(action: SustainableAction) {
  if (isCompleted(action.id)) return
  proofModal.value = { action, emoji: getEmoji(action.icon) }
}

async function onApproved(actionId: string, _title: string, _points: number, proof?: { photoUrl?: string; description?: string }) {
  try {
    await progressStore.completeAction(actionId, proof)
  } catch (e) {
    console.error('Erro ao completar ação:', e)
  }
  proofModal.value = null
}

function setFilter(val: PostCategory | 'all') {
  activeFilter.value = val
  actionStore.setCategory(val)
}

onMounted(() => {
  actionStore.fetchActions()
  progressStore.fetchProgress()
})
</script>

<template>
  <div class="explore-page">
    <div class="explore-header">
      <p class="explore-desc">
        Escolha acoes sustentaveis para realizar e ganhe pontos. Cada pequena acao faz diferenca!
      </p>
      <div class="validation-notice">
        <ShieldCheck :size="15" color="#16a34a" />
        <span>Todas as acoes passam por validacao com foto para garantir autenticidade.</span>
      </div>
    </div>

    <!-- Filter -->
    <div class="filter-chips" style="margin-bottom:1.25rem;display:flex;gap:.375rem;flex-wrap:wrap">
      <button
        v-for="[val, label] in categories"
        :key="val"
        class="chip"
        :class="{ active: activeFilter === val }"
        @click="setFilter(val)"
        :id="`explore-filter-${val}`"
      >
        {{ label }}
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="actionStore.isLoading" class="loading-state">
      <Loader :size="28" class="spin" color="#16a34a" />
      <p>Carregando ações sustentáveis...</p>
    </div>

    <!-- Actions grid -->
    <div v-else class="actions-grid">
      <div
        v-for="action in filteredActions"
        :key="action.id"
        class="eco-card action-card"
        :class="{ completed: isCompleted(action.id) }"
      >
        <div class="action-icon" :style="{ background: CATEGORY_COLORS[action.category] + '18', color: CATEGORY_COLORS[action.category] }">
          {{ getEmoji(action.icon) }}
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
              @click="openProof(action)"
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

    <!-- Proof Modal -->
    <Transition name="fade">
      <ActionProofModal
        v-if="proofModal"
        :action-id="proofModal.action.id"
        :action-title="proofModal.action.title"
        :action-points="proofModal.action.points"
        :action-emoji="proofModal.emoji"
        @close="proofModal = null"
        @approved="onApproved"
      />
    </Transition>
  </div>
</template>

<style scoped>
.explore-page { max-width: 720px; margin: 0 auto; }

.explore-desc {
  color: #57534e; font-size: 0.9375rem; line-height: 1.6; margin: 0 0 0.75rem;
}

.validation-notice {
  display: flex; align-items: center; gap: 0.5rem;
  background: #f0fdf4; border: 1px solid #bbf7d0;
  border-radius: 0.625rem; padding: 0.5rem 0.875rem;
  font-size: 0.8125rem; color: #15803d; font-weight: 500;
  margin-bottom: 1.25rem;
}

.chip {
  padding: 0.375rem 0.875rem; border-radius: 9999px;
  border: 1.5px solid #e7e5e4; background: white;
  font-size: 0.8125rem; font-weight: 500; color: #78716c;
  cursor: pointer; transition: all 0.15s ease;
}

.chip:hover { border-color: #86efac; color: #16a34a; }
.chip.active { background: #dcfce7; border-color: #86efac; color: #15803d; font-weight: 600; }

.loading-state {
  text-align: center; padding: 3rem 1rem;
  color: #78716c; font-size: 0.9375rem;
  display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
}

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

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
