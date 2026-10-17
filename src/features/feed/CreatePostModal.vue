<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PostCategory } from '@/types'
import { CATEGORY_LABELS } from '@/types'
import { useFeedStore } from '@/stores/useFeedStore'
import { useProgressStore } from '@/stores/useProgressStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { X, Image, Eye, Edit3 } from '@lucide/vue'

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
  await new Promise(r => setTimeout(r, 300)) // simulated delay
  feed.createPost({
    text: text.value.trim(),
    category: category.value,
    imageUrl: imageUrl.value.trim() || undefined,
  })
  progress.recordPost()
  progress.addToast({ message: 'Publicacao criada com sucesso!', type: 'success' })
  isPosting.value = false
  closeModal()
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="closeModal" role="dialog" aria-modal="true" aria-label="Criar publicacao">
      <Transition name="scale">
        <div class="modal-box">
          <div class="modal-header">
            <h2>Nova Publicacao</h2>
            <button class="btn-ghost" @click="closeModal" id="close-modal" aria-label="Fechar">
              <X :size="20" />
            </button>
          </div>

          <!-- Tabs -->
          <div class="modal-tabs">
            <button
              class="tab-btn"
              :class="{ active: !showPreview }"
              @click="showPreview = false"
              id="tab-edit"
            >
              <Edit3 :size="14" /> Editar
            </button>
            <button
              class="tab-btn"
              :class="{ active: showPreview }"
              @click="showPreview = true"
              id="tab-preview"
            >
              <Eye :size="14" /> Pre-visualizar
            </button>
          </div>

          <!-- Edit mode -->
          <div v-if="!showPreview" class="modal-form">
            <div class="user-row">
              <img :src="auth.user?.avatarUrl" :alt="auth.user?.name" class="avatar" width="40" height="40" />
              <span class="user-name">{{ auth.user?.name }}</span>
            </div>

            <textarea
              v-model="text"
              placeholder="Compartilhe uma acao, dica ou experiencia sustentavel..."
              class="post-textarea"
              id="post-text"
              maxlength="1000"
              rows="5"
            />
            <div class="char-count">{{ text.length }}/1000</div>

            <div class="form-row">
              <label class="form-label">Categoria</label>
              <select v-model="category" class="form-select" id="post-category">
                <option v-for="[val, label] in categories" :key="val" :value="val">{{ label }}</option>
              </select>
            </div>

            <div class="form-row">
              <label class="form-label">
                <Image :size="14" /> URL de imagem (opcional)
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

          <!-- Preview mode -->
          <div v-else class="modal-preview">
            <div class="preview-card">
              <div class="post-header">
                <img :src="auth.user?.avatarUrl" :alt="auth.user?.name" class="avatar" width="40" height="40" />
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
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 1rem;
}

.modal-box {
  background: white;
  border-radius: 1.25rem;
  width: 100%; max-width: 560px;
  max-height: 90dvh;
  overflow-y: auto;
  box-shadow: 0 24px 48px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e7e5e4;
}

.modal-header h2 {
  margin: 0; font-size: 1.0625rem; font-weight: 700; color: #1c1917;
}

.modal-tabs {
  display: flex; gap: 0; padding: 0.75rem 1.5rem 0;
}

.tab-btn {
  display: flex; align-items: center; gap: 0.375rem;
  padding: 0.5rem 1rem; background: none; border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.875rem; font-weight: 500; color: #a8a29e;
  cursor: pointer; transition: all 0.15s ease;
}

.tab-btn.active { color: #16a34a; border-bottom-color: #16a34a; }

.modal-form, .modal-preview {
  padding: 1.25rem 1.5rem;
  display: flex; flex-direction: column; gap: 1rem;
}

.user-row {
  display: flex; align-items: center; gap: 0.75rem;
}

.user-name { font-weight: 600; font-size: 0.9375rem; color: #1c1917; }

.post-textarea {
  width: 100%; resize: vertical;
  padding: 0.75rem; border: 1.5px solid #e7e5e4;
  border-radius: 0.75rem; font-size: 0.9375rem;
  color: #1c1917; line-height: 1.6; background: #fafaf9;
  transition: border-color 0.15s ease;
}

.post-textarea:focus { border-color: #22c55e; background: white; }

.char-count { font-size: 0.75rem; color: #a8a29e; text-align: right; margin-top: -0.5rem; }

.form-label {
  display: flex; align-items: center; gap: 0.375rem;
  font-size: 0.8125rem; font-weight: 600; color: #57534e; margin-bottom: 0.375rem;
}

.form-select, .form-input {
  width: 100%; padding: 0.5rem 0.75rem;
  border: 1.5px solid #e7e5e4; border-radius: 0.625rem;
  font-size: 0.875rem; color: #1c1917; background: #fafaf9;
  transition: border-color 0.15s ease;
}

.form-select:focus, .form-input:focus { border-color: #22c55e; background: white; }

.preview-card {
  background: #f5f5f4; border-radius: 0.75rem; padding: 1rem;
}

.post-header { display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.75rem; }
.author-name { font-size: 0.9375rem; font-weight: 600; color: #1c1917; }
.post-time { font-size: 0.75rem; color: #a8a29e; }
.preview-text { margin: 0; font-size: 0.9375rem; line-height: 1.6; color: #292524; }
.preview-empty { margin: 0; color: #a8a29e; font-style: italic; font-size: 0.875rem; }
.preview-image { width: 100%; border-radius: 0.5rem; margin-top: 0.75rem; object-fit: cover; max-height: 280px; }

.modal-footer {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e7e5e4;
}
</style>
