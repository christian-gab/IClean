<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue"
import { useFeedStore } from "@/stores/useFeedStore"
import { useProgressStore } from "@/stores/useProgressStore"
import { useAuthStore } from "@/stores/useAuthStore"
import PostCard from "@/features/feed/PostCard.vue"
import { formatDate } from "@/utils/date"
import { getFontAwesomeIcon } from "@/utils/icons"
import { useRouter } from "vue-router"

const feed = useFeedStore()
const progress = useProgressStore()
const auth = useAuthStore()
const router = useRouter()

const user = computed(() => auth.user!)

const userPosts = computed(() =>
  feed.posts.filter(p => p.authorId === user.value?.id)
)

const isEditing = ref(false)
const editName = ref("")
const editBio = ref("")
const editAvatarUrl = ref("")
const avatarInputRef = ref<HTMLInputElement | null>(null)

function startEdit() {
  editName.value = user.value.name
  editBio.value = user.value.bio
  editAvatarUrl.value = user.value.avatarUrl
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
}

async function saveEdit() {
  if (!editName.value.trim()) return
  try {
    await auth.updateProfile({
      name: editName.value.trim(),
      bio: editBio.value.trim(),
      avatarUrl: editAvatarUrl.value.trim() || user.value.avatarUrl,
    })
    await feed.fetchPosts()
    isEditing.value = false
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err)
  }
}

onMounted(() => {
  auth.fetchMe()
  progress.loadAllGamificationData()
  feed.fetchPosts()
})

function onAvatarFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    editAvatarUrl.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

function randomizeAvatar() {
  const seed = encodeURIComponent(editName.value || user.value.name) + Date.now()
  editAvatarUrl.value = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4`
}

watch(editName, (newName) => {
  if (!editAvatarUrl.value.startsWith("data:")) {
    const seed = encodeURIComponent(newName.trim() || "default")
    editAvatarUrl.value = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4`
  }
})

function logout() {
  auth.logout()
  router.push("/login")
}
</script>

<template>
  <div class="profile-page">
    <div class="profile-header eco-card">
      <div class="avatar-wrap">
        <img
          :src="isEditing ? editAvatarUrl : user.avatarUrl"
          :alt="user.name"
          class="avatar profile-avatar"
          width="80"
          height="80"
        />
        <div class="level-badge">
          <i class="fa-solid" :class="getFontAwesomeIcon(progress.currentLevel.icon)" aria-hidden="true" />
        </div>
        <button v-if="isEditing" class="avatar-edit-btn" title="Trocar foto" @click="avatarInputRef?.click()">
          <i class="fa-solid fa-camera" aria-hidden="true" />
        </button>
        <input
          ref="avatarInputRef"
          type="file"
          accept="image/*"
          style="display:none"
          @change="onAvatarFileChange"
        />
      </div>

      <div v-if="!isEditing" class="profile-info">
        <h2 class="profile-name">{{ user.name }}</h2>
        <p class="profile-username">{{ user.username }}</p>
        <p class="profile-bio">{{ user.bio }}</p>
        <p class="profile-joined">Membro desde {{ formatDate(user.joinedAt) }}</p>
        <div class="profile-actions">
          <button class="btn-secondary profile-edit-btn" @click="startEdit">
            <i class="fa-solid fa-pen" aria-hidden="true" /> Editar perfil
          </button>
          <button class="btn-ghost logout-btn" @click="logout">
            <i class="fa-solid fa-right-from-bracket" aria-hidden="true" /> Sair
          </button>
        </div>
      </div>

      <div v-else class="profile-info edit-mode">
        <div class="edit-field">
          <label class="edit-label" for="edit-name">Nome</label>
          <input id="edit-name" v-model="editName" class="edit-input" type="text" placeholder="Seu nome" />
        </div>
        <div class="edit-field">
          <label class="edit-label" for="edit-bio">Bio</label>
          <textarea id="edit-bio" v-model="editBio" class="edit-input edit-textarea" rows="3" placeholder="Fale sobre você..." />
        </div>
        <div class="edit-field">
          <label class="edit-label">Foto</label>
          <div class="avatar-url-row">
            <input v-model="editAvatarUrl" class="edit-input edit-input-sm" type="text" placeholder="URL da imagem" />
            <button class="btn-ghost avatar-rand-btn" title="Gerar avatar aleatório" @click="randomizeAvatar">
              <i class="fa-solid fa-dice" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div class="edit-actions">
          <button class="btn-primary edit-save-btn" :disabled="!editName.trim()" @click="saveEdit">
            <i class="fa-solid fa-check" aria-hidden="true" /> Salvar
          </button>
          <button class="btn-secondary" @click="cancelEdit">
            <i class="fa-solid fa-xmark" aria-hidden="true" /> Cancelar
          </button>
        </div>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card eco-card">
        <i class="fa-solid fa-trophy profile-stat-icon trophy-icon" aria-hidden="true" />
        <div class="stat-value">{{ progress.progress.totalPoints }}</div>
        <div class="stat-label">Pontos</div>
      </div>
      <div class="stat-card eco-card">
        <i class="fa-solid fa-circle-check profile-stat-icon actions-icon" aria-hidden="true" />
        <div class="stat-value">{{ progress.progress.actionsCompleted }}</div>
        <div class="stat-label">Acoes</div>
      </div>
      <div class="stat-card eco-card">
        <i class="fa-solid fa-file-lines profile-stat-icon posts-icon" aria-hidden="true" />
        <div class="stat-value">{{ userPosts.length }}</div>
        <div class="stat-label">Posts</div>
      </div>
      <div class="stat-card eco-card">
        <i class="fa-solid fa-award profile-stat-icon achievement-icon" aria-hidden="true" />
        <div class="stat-value">{{ progress.unlockedAchievements.length }}</div>
        <div class="stat-label">Conquistas</div>
      </div>
    </div>

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

    <section v-if="progress.unlockedAchievements.length" class="section">
      <h2 class="section-title">Conquistas Desbloqueadas</h2>
      <div class="ach-chips">
        <div
          v-for="achievement in progress.unlockedAchievements"
          :key="achievement.id"
          class="ach-chip"
        >
          <i class="fa-solid" :class="getFontAwesomeIcon(achievement.icon, 'fa-trophy')" aria-hidden="true" />
          {{ achievement.title }}
        </div>
      </div>
    </section>

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
.avatar-edit-btn {
  position: absolute; top: -4px; right: -4px;
  width: 26px; height: 26px;
  background: #16a34a; color: white;
  border: 2px solid white; border-radius: 9999px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s;
}
.avatar-edit-btn:hover { background: #15803d; }

.profile-info { flex: 1; min-width: 0; }
.profile-name { margin: 0 0 0.125rem; font-size: 1.25rem; font-weight: 700; color: #1c1917; }
.profile-username { margin: 0 0 0.5rem; font-size: 0.875rem; color: #a8a29e; }
.profile-bio { margin: 0 0 0.5rem; font-size: 0.875rem; color: #57534e; line-height: 1.5; }
.profile-joined { margin: 0 0 0.75rem; font-size: 0.75rem; color: #a8a29e; }

.profile-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.profile-edit-btn { font-size: 0.8125rem; padding: 0.375rem 0.875rem; }
.logout-btn { font-size: 0.8125rem; padding: 0.375rem 0.875rem; color: #dc2626; }
.logout-btn:hover { background: #fef2f2; color: #dc2626; }

.edit-mode { display: flex; flex-direction: column; gap: 0.625rem; }
.edit-field { display: flex; flex-direction: column; gap: 0.25rem; }
.edit-label { font-size: 0.75rem; font-weight: 600; color: #78716c; text-transform: uppercase; letter-spacing: 0.04em; }
.edit-input {
  padding: 0.5rem 0.75rem;
  border: 1.5px solid #e7e5e4;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  color: #1c1917;
  background: #fafaf9;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}
.edit-input:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,.1); background: white; }
.edit-textarea { resize: vertical; min-height: 70px; }
.edit-input-sm { flex: 1; }

.avatar-url-row { display: flex; gap: 0.375rem; align-items: center; }
.avatar-rand-btn { padding: 0.5rem; font-size: 1.125rem; line-height: 1; border-radius: 0.625rem; }

.edit-actions { display: flex; gap: 0.5rem; margin-top: 0.25rem; }
.edit-save-btn { font-size: 0.875rem; padding: 0.5rem 1rem; border-radius: 0.625rem; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.625rem; }
.stat-card { padding: 0.875rem 0.5rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
.profile-stat-icon { font-size: 1.25rem; }
.trophy-icon { color: #f59e0b; }
.actions-icon { color: #22c55e; }
.posts-icon { color: #0ea5e9; }
.achievement-icon { color: #7c3aed; }
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
