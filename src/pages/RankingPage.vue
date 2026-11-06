<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { progressService } from '@/services/progress.service'
import type { LeaderboardEntry } from '@/services/progress.service'

const leaderboard = ref<LeaderboardEntry[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const podium = computed(() => {
  const [first, second, third] = leaderboard.value
  return [second, first, third].filter((user): user is LeaderboardEntry => Boolean(user))
})

const remainingUsers = computed(() => leaderboard.value.slice(3))

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join('')
    .toLocaleUpperCase()
}

onMounted(async () => {
  try {
    leaderboard.value = await progressService.getLeaderboard()
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível carregar o ranking.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="ranking-page">
    <header class="ranking-header">
      <div class="ranking-kicker">Comunidade Iclean</div>
      <h2 class="ranking-title">Ranking de pontos</h2>
      <p class="ranking-subtitle">Quem está fazendo a diferença com pequenas atitudes?</p>
    </header>

    <div v-if="isLoading" class="ranking-message card-ds" role="status">
      Carregando ranking...
    </div>
    <div v-else-if="errorMessage" class="ranking-message ranking-error card-ds" role="alert">
      {{ errorMessage }}
    </div>
    <div v-else-if="leaderboard.length === 0" class="ranking-message card-ds">
      Ainda não há usuários no ranking.
    </div>

    <template v-else>
      <section class="ranking-podium" aria-label="Top 3 usuários">
        <article
          v-for="user in podium"
          :key="user.id"
          class="podium-card card-ds"
          :class="`place-${user.rank}`"
        >
          <span class="podium-medal" :aria-label="`${user.rank}º lugar`">{{ user.rank }}</span>
          <img
            v-if="user.avatarUrl"
            :src="user.avatarUrl"
            :alt="`Avatar de ${user.name}`"
            class="podium-avatar avatar"
            :class="`place-${user.rank}-avatar`"
          >
          <span v-else class="podium-avatar avatar avatar-fallback" :class="`place-${user.rank}-avatar`">
            {{ initials(user.name) }}
          </span>
          <div class="podium-name">{{ user.name }}</div>
          <div class="podium-username">{{ user.username }}</div>
          <div class="podium-points">{{ user.totalPoints }} <small>pts</small></div>
        </article>
      </section>

      <section v-if="remainingUsers.length" class="ranking-list" aria-label="Demais posições">
        <div class="ranking-list-heading">
          <span>#</span>
          <span>Usuário</span>
          <span class="ranking-points-heading">Pontos</span>
        </div>
        <div v-for="user in remainingUsers" :key="user.id" class="ranking-row">
          <span class="ranking-position">{{ user.rank }}</span>
          <div class="ranking-person">
            <img
              v-if="user.avatarUrl"
              :src="user.avatarUrl"
              :alt="`Avatar de ${user.name}`"
              class="ranking-avatar avatar"
            >
            <span v-else class="ranking-avatar avatar avatar-fallback">{{ initials(user.name) }}</span>
            <span class="ranking-person-info">
              <span class="ranking-person-name">{{ user.name }}</span>
              <span class="ranking-person-username">{{ user.username }}</span>
            </span>
          </div>
          <span class="ranking-score">{{ user.totalPoints }} <small>pts</small></span>
        </div>
      </section>
      <p class="ranking-note">Pontuação total acumulada pelos usuários</p>
    </template>
  </div>
</template>

<style scoped>
.ranking-page { max-width: 640px; margin: 0 auto; }
.ranking-header { margin-bottom: 1.5rem; }
.ranking-kicker { color: var(--color-primary); font-size: 0.6875rem; letter-spacing: 0.12em; font-weight: 700; text-transform: uppercase; }
.ranking-title { margin: 0.4375rem 0 0.3125rem; font-size: 1.5rem; letter-spacing: -0.04em; }
.ranking-subtitle { margin: 0; color: var(--color-muted); font-size: 0.875rem; }
.ranking-message { padding: 1rem; color: #57534e; font-size: 0.875rem; }
.ranking-error { color: var(--color-destructive); }
.ranking-podium { display: grid; grid-template-columns: 1fr 1.08fr 1fr; align-items: end; gap: 0.75rem; margin: 2rem auto 1.5rem; }
.podium-card { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 1.125rem 0.625rem; }
.podium-card.place-1 { padding-top: 1.5625rem; padding-bottom: 1.5rem; border-color: #f5d276; background: linear-gradient(180deg, #fffbeb, #fff 68%); }
.podium-medal { position: absolute; top: -0.8125rem; left: 50%; display: grid; place-items: center; width: 1.75rem; height: 1.75rem; transform: translateX(-50%); border: 2px solid #fff; border-radius: 50%; background: #fbbf24; color: #713f12; font-size: 0.75rem; font-weight: 800; box-shadow: 0 1px 5px #0002; }
.place-2 .podium-medal { background: #cbd5e1; color: #334155; }
.place-3 .podium-medal { background: #d6a77a; color: #713f12; }
.podium-avatar { display: grid; place-items: center; width: 3.625rem; height: 3.625rem; margin-bottom: 0.625rem; border: 3px solid #fff; box-shadow: 0 0 0 1px var(--color-border); }
.place-1-avatar { width: 4.375rem; height: 4.375rem; box-shadow: 0 0 0 2px #fbbf24; }
.avatar-fallback { background: #dcfce7; color: var(--color-primary); font-size: 0.875rem; font-weight: 700; }
.place-1-avatar.avatar-fallback { font-size: 1.125rem; }
.podium-name { max-width: 100%; overflow-wrap: anywhere; font-size: 0.8125rem; font-weight: 700; }
.podium-username { max-width: 100%; overflow-wrap: anywhere; margin-top: 0.1875rem; color: var(--color-muted); font-size: 0.6875rem; }
.podium-points { margin-top: 0.625rem; font-size: 1.125rem; font-weight: 800; }
.podium-points small, .ranking-score small { color: var(--color-muted); font-size: 0.625rem; font-weight: 550; }
.ranking-list { overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius); background: #fff; }
.ranking-list-heading, .ranking-row { display: grid; grid-template-columns: 2.5rem minmax(0, 1fr) 5rem; align-items: center; gap: 0.75rem; }
.ranking-list-heading { padding: 0.6875rem 1rem; color: var(--color-muted); background: #fafaf9; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.ranking-points-heading { text-align: right; }
.ranking-row { min-height: 4.0625rem; padding: 0.5625rem 1rem; border-top: 1px solid #f0eeec; }
.ranking-position { color: var(--color-muted); text-align: center; font-size: 0.8125rem; font-weight: 650; }
.ranking-person { display: flex; align-items: center; gap: 0.625rem; min-width: 0; }
.ranking-avatar { width: 2.375rem; height: 2.375rem; }
.ranking-person-info { display: flex; flex-direction: column; min-width: 0; }
.ranking-person-name { overflow: hidden; color: #1c1917; font-size: 0.75rem; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.ranking-person-username { overflow: hidden; margin-top: 0.125rem; color: var(--color-muted); font-size: 0.625rem; text-overflow: ellipsis; white-space: nowrap; }
.ranking-score { text-align: right; white-space: nowrap; font-size: 0.8125rem; font-weight: 750; }
.ranking-note { margin: 0.8125rem 0 0; color: var(--color-muted); font-size: 0.6875rem; text-align: center; }
@media (max-width: 420px) {
  .ranking-podium { gap: 0.4375rem; }
  .podium-card { padding-left: 0.3125rem; padding-right: 0.3125rem; }
  .podium-avatar { width: 3rem; height: 3rem; }
  .place-1-avatar { width: 3.625rem; height: 3.625rem; }
  .podium-name { font-size: 0.6875rem; }
  .podium-points { font-size: 0.9375rem; }
  .ranking-list-heading, .ranking-row { grid-template-columns: 1.75rem minmax(0, 1fr) 3.75rem; gap: 0.4375rem; padding-left: 0.5625rem; padding-right: 0.5625rem; }
}
</style>
