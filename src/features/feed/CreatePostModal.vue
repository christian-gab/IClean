<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PostCategory } from '@/types'
import { CATEGORY_LABELS } from '@/types'
import { useFeedStore } from '@/stores/useFeedStore'
import { useProgressStore } from '@/stores/useProgressStore'
import { useAuthStore } from '@/stores/useAuthStore'

const auth = useAuthStore()

const emit = defineEmits<{ close: [] }>()

const feed = useFeedStore()
const progress = useProgressStore()

const text = ref('')
const category = ref<PostCategory>('other')
const imageUrl = ref('')
const showPreview = ref(false)
const isPosting = ref(false)

const categories = Object.entries(CATEGORY_LABELS) as [PostCategory, string][]

const canSubmit = computed(() => text.value.trim().length >= 10)

function closeModal() {
  emit('close')
}

async function submitPost() {
  if (!canSubmit.value) return
  isPosting.value = true
  try {
    const result = await feed.createPost({
      text: text.value.trim(),
      category: category.value,
      imageUrl: imageUrl.value.trim() || undefined,
    })
    await progress.fetchProgress()
    progress.addToast({ message: 'Publicação criada com sucesso!', type: 'success' })

    if (result.unlockedAchievements?.length) {
      await progress.fetchAchievements()
    }
    closeModal()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao publicar'
    progress.addToast({ message: msg, type: 'default' })
  } finally {
    isPosting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="closeModal" role="dialog" aria-modal="true" aria-label="Criar publicação">
      <Transition name="scale">
        <div class="modal-box card-ds">
          <div class="modal-header">
            <h2>Nova Publicação</h2>
            <button class="btn-ghost" @click="closeModal" id="close-modal" aria-label="Fechar">
              <i class="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>

          <div class="modal-tabs">
            <button
              class="tab-btn"
              :class="{ active: !showPreview }"
              @click="showPreview = false"
              id="tab-edit"
            >
              <i class="fa-solid fa-pen-to-square" aria-hidden="true" /> Editar
            </button>
            <button
              class="tab-btn"
              :class="{ active: showPreview }"
              @click="showPreview = true"
              id="tab-preview"
            >
              <i class="fa-solid fa-eye" aria-hidden="true" /> Pré-visualizar
            </button>
          </div>

          <div v-if="!showPreview" class="modal-form">
            <div class="user-row">
              <img :src="auth.user?.avatarUrl" :alt="auth.user?.name" class="avatar" width="36" height="36" />
              <span class="user-name">{{ auth.user?.name }}</span>
            </div>

            <textarea
              v-model="text"
              placeholder="Compartilhe uma ação, dica ou experiência sustentável..."
              class="post-textarea"
              id="post-text"
              maxlength="1000"
              rows="5"
            />
            <div class="char-count">{{ text.length }}/1000</div>

            <div class="form-row">
              <label class="form-label label-ds">Categoria</label>
              <select v-model="category" class="form-select" id="post-category">
                <option v-for="[val, label] in categories" :key="val" :value="val">{{ label }}</option>
              </select>
            </div>

            <div class="form-row">
              <label class="form-label label-ds">
                <i class="fa-solid fa-image" aria-hidden="true" /> URL de imagem (opcional)
              </label>
              <input
                v-model="imageUrl"
                type="url"
                placeholder="https://..."
                class="form-input"
                id="post-image-url"
              />
            </div>
          </div>

          <div v-else class="modal-preview">
            <div class="preview-card card-ds">
              <div class="post-header">
                <img :src="auth.user?.avatarUrl" :alt="auth.user?.name" class="avatar" width="36" height="36" />
                <div>
                  <div class="author-name">{{ auth.user?.name }}</div>
                  <div class="post-time">agora mesmo</div>
                </div>
              </div>
              <p v-if="text" class="preview-text">{{ text }}</p>
              <p v-else class="preview-empty">Nenhum texto ainda...</p>
              <img v-if="imageUrl" :src="imageUrl" alt="Preview" class="preview-image" @error="imageUrl = ''" />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="closeModal" id="cancel-post">Cancelar</button>
            <button
              class="btn-primary"
              :disabled="!canSubmit || isPosting"
              @click="submitPost"
              id="submit-post"
            >
              {{ isPosting ? 'Publicando...' : 'Publicar' }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 1rem;
}

.modal-box {
  background: white;
  border-radius: var(--radius);
  width: 100%; max-width: 540px;
  max-height: 90dvh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0; font-size: 1rem; font-weight: 600; color: #111827;
}

.modal-tabs {
  display: flex; gap: 0; padding: 0.5rem 1.25rem 0;
  border-bottom: 1px solid var(--color-border);
}

.tab-btn {
  display: flex; align-items: center; gap: 0.375rem;
  padding: 0.5rem 0.875rem; background: none; border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.8125rem; font-weight: 500; color: #78716c;
  cursor: pointer; transition: all 0.15s ease;
}

.tab-btn.active { color: var(--color-primary); border-bottom-color: var(--color-primary); font-weight: 600; }

.modal-form, .modal-preview {
  padding: 1.25rem;
  display: flex; flex-direction: column; gap: 0.875rem;
}

.user-row {
  display: flex; align-items: center; gap: 0.625rem;
}

.user-name { font-weight: 600; font-size: 0.875rem; color: #111827; }

.post-textarea {
  width: 100%; resize: vertical;
  padding: 0.625rem 0.75rem; border: 1px solid var(--color-border);
  border-radius: var(--radius); font-size: 0.875rem;
  color: #111827; line-height: 1.5; background: white;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.post-textarea:focus { border-color: var(--color-primary); box-shadow: 0 0 0 1px var(--color-primary); }

.char-count { font-size: 0.75rem; color: #78716c; text-align: right; margin-top: -0.375rem; }

.form-row { display: flex; flex-direction: column; gap: 0.25rem; }

.form-label {
  display: flex; align-items: center; gap: 0.375rem;
  margin-bottom: 0.125rem;
}

.form-select, .form-input {
  width: 100%; padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border); border-radius: var(--radius);
  font-size: 0.875rem; color: #111827; background: white;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.form-select:focus, .form-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 1px var(--color-primary); }

.preview-card {
  padding: 0.875rem 1rem;
}

.post-header { display: flex; gap: 0.625rem; align-items: center; margin-bottom: 0.625rem; }
.author-name { font-size: 0.875rem; font-weight: 600; color: #111827; }
.post-time { font-size: 0.75rem; color: #78716c; }
.preview-text { margin: 0; font-size: 0.875rem; line-height: 1.5; color: #292524; }
.preview-empty { margin: 0; color: #78716c; font-style: italic; font-size: 0.8125rem; }
.preview-image { width: 100%; border-radius: var(--radius); margin-top: 0.625rem; object-fit: cover; max-height: 260px; border: 1px solid var(--color-border); }

.modal-footer {
  display: flex; justify-content: flex-end; gap: 0.625rem;
  padding: 0.875rem 1.25rem;
  border-top: 1px solid var(--color-border);
}
</style>
