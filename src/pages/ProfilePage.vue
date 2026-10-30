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
    <div class="profile-header card-ds">
      <div class="avatar-wrap">
        <img
          :src="isEditing ? editAvatarUrl : user.avatarUrl"
          :alt="user.name"
          class="avatar profile-avatar"
          width="72"
          height="72"
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
          <label class="edit-label label-ds" for="edit-name">Nome</label>
          <input id="edit-name" v-model="editName" class="edit-input" type="text" placeholder="Seu nome" />
        </div>
        <div class="edit-field">
          <label class="edit-label label-ds" for="edit-bio">Bio</label>
          <textarea id="edit-bio" v-model="editBio" class="edit-input edit-textarea" rows="3" placeholder="Fale sobre você..." />
        </div>
        <div class="edit-field">
          <label class="edit-label label-ds">Foto</label>
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
      <div class="stat-card card-ds">
        <i class="fa-solid fa-trophy profile-stat-icon trophy-icon" aria-hidden="true" />
        <div class="stat-value">{{ progress.progress.totalPoints }}</div>
        <div class="stat-label label-ds">Pontos</div>
      </div>
      <div class="stat-card card-ds">
        <i class="fa-solid fa-circle-check profile-stat-icon actions-icon" aria-hidden="true" />
        <div class="stat-value">{{ progress.progress.actionsCompleted }}</div>
        <div class="stat-label label-ds">Ações</div>
      </div>
      <div class="stat-card card-ds">
        <i class="fa-solid fa-file-lines profile-stat-icon posts-icon" aria-hidden="true" />
        <div class="stat-value">{{ userPosts.length }}</div>
        <div class="stat-label label-ds">Posts</div>
      </div>
      <div class="stat-card card-ds">
        <i class="fa-solid fa-award profile-stat-icon achievement-icon" aria-hidden="true" />
        <div class="stat-value">{{ progress.unlockedAchievements.length }}</div>
        <div class="stat-label label-ds">Conquistas</div>
      </div>
    </div>

    <div class="card-ds level-section">
      <div class="level-top">
        <span class="level-tag">{{ progress.currentLevel.name }}</span>
        <span v-if="progress.nextLevel" class="next-level">Próximo: {{ progress.nextLevel.name }}</span>
      </div>
      <div class="progress-bar" style="margin-top:0.75rem">
        <div class="progress-bar-fill" :style="{ width: progress.levelProgress + '%' }" />
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:.375rem">
        <span style="font-size:.75rem;color:#78716c">{{ progress.progress.totalPoints }} pts</span>
        <span v-if="progress.nextLevel" style="font-size:.75rem;color:#78716c">
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
      <h2 class="section-title">Minhas Publicações</h2>
      <div v-if="userPosts.length">
        <PostCard v-for="post in userPosts" :key="post.id" :post="post" />
      </div>
      <div v-else class="empty-state card-ds">
        <p>Você ainda não publicou nada. Compartilhe sua primeira ação sustentável!</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.profile-page { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; }

.profile-header { padding: 1.25rem; display: flex; gap: 1rem; align-items: flex-start; }

.avatar-wrap { position: relative; flex-shrink: 0; }
.profile-avatar { width: 72px; height: 72px; border: 1px solid var(--color-border); }
.level-badge {
  position: absolute; bottom: -2px; right: -2px;
  background: white; border: 1px solid var(--color-border);
  border-radius: var(--radius); font-size: 0.875rem;
  width: 24px; height: 24px; color: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
}
.avatar-edit-btn {
  position: absolute; top: -2px; right: -2px;
  width: 24px; height: 24px;
  background: var(--color-primary); color: white;
  border: 1px solid white; border-radius: var(--radius);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s; font-size: 0.75rem;
}
.avatar-edit-btn:hover { background: var(--color-primary-hover); }

.profile-info { flex: 1; min-width: 0; }
.profile-name { margin: 0 0 0.125rem; font-size: 1.125rem; font-weight: 600; color: #111827; }
.profile-username { margin: 0 0 0.375rem; font-size: 0.8125rem; color: #78716c; }
.profile-bio { margin: 0 0 0.375rem; font-size: 0.8125rem; color: #57534e; line-height: 1.5; }
.profile-joined { margin: 0 0 0.625rem; font-size: 0.75rem; color: #78716c; }

.profile-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.profile-edit-btn { font-size: 0.75rem; padding: 0.35rem 0.75rem; }
.logout-btn { font-size: 0.75rem; padding: 0.35rem 0.75rem; color: var(--color-destructive); }
.logout-btn:hover { background: #fef2f2; color: var(--color-destructive); }

.edit-mode { display: flex; flex-direction: column; gap: 0.5rem; }
.edit-field { display: flex; flex-direction: column; gap: 0.2rem; }
.edit-label { margin-bottom: 0.125rem; }
.edit-input {
  padding: 0.45rem 0.625rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 0.8125rem;
  color: #111827;
  background: white;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}
.edit-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 1px var(--color-primary); }
.edit-textarea { resize: vertical; min-height: 60px; }
.edit-input-sm { flex: 1; }

.avatar-url-row { display: flex; gap: 0.375rem; align-items: center; }
.avatar-rand-btn { padding: 0.45rem; font-size: 1rem; line-height: 1; }

.edit-actions { display: flex; gap: 0.5rem; margin-top: 0.25rem; }
.edit-save-btn { font-size: 0.8125rem; padding: 0.45rem 0.875rem; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
.stat-card { padding: 0.75rem 0.375rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
.profile-stat-icon { font-size: 1.125rem; }
.trophy-icon { color: #d97706; }
.actions-icon { color: var(--color-primary); }
.posts-icon { color: #0284c7; }
.achievement-icon { color: #6d28d9; }
.stat-value { font-size: 1.25rem; font-weight: 700; color: #111827; }
.stat-label { margin-top: 0.125rem; font-size: 10px; }

.level-section { padding: 1rem; }
.level-top { display: flex; justify-content: space-between; align-items: center; }
.level-tag { font-size: 0.875rem; font-weight: 600; color: var(--color-primary); }
.next-level { font-size: 0.75rem; color: #78716c; }

.section { margin-top: 0.25rem; }
.section-title { font-size: 0.9375rem; font-weight: 600; color: #111827; margin: 0 0 0.625rem; }

.ach-chips { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.ach-chip {
  padding: 0.25rem 0.625rem; background: #f0fdf4; border: 1px solid #bbf7d0;
  border-radius: var(--radius); font-size: 0.75rem; font-weight: 500; color: var(--color-primary);
  display: inline-flex; align-items: center; gap: 0.375rem;
}

.empty-state { color: #78716c; font-size: 0.875rem; text-align: center; padding: 1.75rem; }
</style>
