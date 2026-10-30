<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { PostCategory, SustainableAction } from '@/types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types'
import { useProgressStore } from '@/stores/useProgressStore'
import { useActionStore } from '@/stores/useActionStore'
import ActionProofModal from '@/features/actions/ActionProofModal.vue'
import { getFontAwesomeIcon } from '@/utils/icons'

const progressStore = useProgressStore()
const actionStore = useActionStore()
const activeFilter = ref<PostCategory | 'all'>('all')

const proofModal = ref<{
  action: SustainableAction
  icon: string
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

function openProof(action: SustainableAction) {
  if (isCompleted(action.id)) return
  proofModal.value = { action, icon: getFontAwesomeIcon(action.icon) }
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
        Escolha ações sustentáveis para realizar e ganhe pontos. Cada pequena ação faz diferença!
      </p>
      <div class="validation-notice">
        <i class="fa-solid fa-shield-halved" style="color:var(--color-primary)" aria-hidden="true" />
        <span>Todas as ações passam por validação com foto para garantir autenticidade.</span>
      </div>
    </div>

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

    <div v-if="actionStore.isLoading" class="loading-state">
      <i class="fa-solid fa-spinner spin" style="color:var(--color-primary)" aria-hidden="true" />
      <p>Carregando ações sustentáveis...</p>
    </div>

    <div v-else class="actions-grid">
      <div
        v-for="action in filteredActions"
        :key="action.id"
        class="card-ds action-card"
        :class="{ completed: isCompleted(action.id) }"
      >
        <div class="action-icon" :style="{ background: CATEGORY_COLORS[action.category] + '15', color: CATEGORY_COLORS[action.category] }">
          <i class="fa-solid" :class="getFontAwesomeIcon(action.icon)" aria-hidden="true" />
        </div>

        <div class="action-content">
          <h3 class="action-title">{{ action.title }}</h3>
          <p class="action-desc">{{ action.description }}</p>
          <div class="action-footer">
            <span class="points-badge">
              <i class="fa-solid fa-star" aria-hidden="true" /> +{{ action.points }} pts
            </span>
            <button
              v-if="!isCompleted(action.id)"
              class="btn-primary"
              style="font-size:0.75rem;padding:0.35rem 0.875rem"
              @click="openProof(action)"
              :id="`complete-${action.id}`"
            >
              Concluir
            </button>
            <span v-else class="done-badge">
              <i class="fa-solid fa-check" aria-hidden="true" /> Feito hoje
            </span>
          </div>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <ActionProofModal
        v-if="proofModal"
        :action-id="proofModal.action.id"
        :action-title="proofModal.action.title"
        :action-points="proofModal.action.points"
        :action-icon="proofModal.icon"
        @close="proofModal = null"
        @approved="onApproved"
      />
    </Transition>
  </div>
</template>

<style scoped>
.explore-page { max-width: 720px; margin: 0 auto; }

.explore-desc {
  color: #57534e; font-size: 0.875rem; line-height: 1.6; margin: 0 0 0.75rem;
}

.validation-notice {
  display: flex; align-items: center; gap: 0.5rem;
  background: #f0fdf4; border: 1px solid #bbf7d0;
  border-radius: var(--radius); padding: 0.5rem 0.75rem;
  font-size: 0.8125rem; color: var(--color-primary); font-weight: 500;
  margin-bottom: 1.25rem;
}

.chip {
  padding: 0.3125rem 0.75rem; border-radius: var(--radius);
  border: 1px solid var(--color-border); background: white;
  font-size: 0.75rem; font-weight: 500; color: #57534e;
  cursor: pointer; transition: all 0.15s ease;
}

.chip:hover { border-color: #a8a29e; color: #1c1917; }
.chip.active { background: var(--color-primary); border-color: var(--color-primary); color: white; font-weight: 500; }

.loading-state {
  text-align: center; padding: 3rem 1rem;
  color: #78716c; font-size: 0.875rem;
  display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
}

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.actions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 600px) {
  .actions-grid { grid-template-columns: 1fr 1fr; }
}

.action-card {
  display: flex; gap: 0.875rem; padding: 1rem;
  transition: all 0.15s ease;
}

.action-card.completed {
  opacity: 0.65;
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.action-icon {
  width: 42px; height: 42px; border-radius: var(--radius);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.25rem; flex-shrink: 0;
}

.action-content { flex: 1; display: flex; flex-direction: column; gap: 0.3125rem; }

.action-title { margin: 0; font-size: 0.875rem; font-weight: 600; color: #1c1917; }
.action-desc { margin: 0; font-size: 0.75rem; color: #78716c; line-height: 1.5; }

.action-footer {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 0.375rem;
}

.points-badge {
  display: flex; align-items: center; gap: 0.25rem;
  font-size: 0.75rem; font-weight: 600; color: var(--color-primary);
}

.done-badge {
  display: flex; align-items: center; gap: 0.25rem;
  font-size: 0.75rem; font-weight: 500; color: var(--color-primary);
  background: #dcfce7; padding: 0.2rem 0.5rem; border-radius: var(--radius);
}
</style>
