<script setup lang="ts">
import { ref, computed } from "vue"
import { X, Camera, Upload, CheckCircle, XCircle, Loader, Star } from "@lucide/vue"

const props = defineProps<{
  actionId: string
  actionTitle: string
  actionPoints: number
  actionEmoji: string
}>()

const emit = defineEmits<{
  close: []
  approved: [actionId: string, title: string, points: number]
}>()

// ── State ────────────────────────────────────────────────────────────────────
type Step = "upload" | "validating" | "approved" | "rejected"
const step = ref<Step>("upload")
const description = ref("")
const imagePreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const validationProgress = ref(0)
const progressInterval = ref<ReturnType<typeof setInterval> | null>(null)

const canSubmit = computed(() => imagePreview.value !== null)

// ── Image handling ────────────────────────────────────────────────────────────
function pickFile() {
  fileInput.value?.click()
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith("image/")) return
  const reader = new FileReader()
  reader.onload = () => {
    imagePreview.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  imagePreview.value = null
  if (fileInput.value) fileInput.value.value = ""
}

// ── Validation flow (mocked) ──────────────────────────────────────────────────
async function submitForValidation() {
  if (!canSubmit.value) return
  step.value = "validating"
  validationProgress.value = 0

  // Simulate progress bar
  progressInterval.value = setInterval(() => {
    validationProgress.value = Math.min(validationProgress.value + Math.random() * 8, 95)
  }, 150)

  // Wait 3–4s to simulate backend AI analysis
  await new Promise(r => setTimeout(r, 3000 + Math.random() * 1000))

  if (progressInterval.value) clearInterval(progressInterval.value)
  validationProgress.value = 100

  await new Promise(r => setTimeout(r, 400))

  // 90% approval rate (fair but not guaranteed)
  const approved = Math.random() < 0.9
  step.value = approved ? "approved" : "rejected"
}

function collectPoints() {
  emit("approved", props.actionId, props.actionTitle, props.actionPoints)
}

function retry() {
  step.value = "upload"
  imagePreview.value = null
  description.value = ""
  validationProgress.value = 0
}
</script>

<template>
  <Teleport to="body">
    <div class="overlay" @click.self="emit('close')" role="dialog" aria-modal="true">
      <Transition name="scale">
        <div class="modal">

          <!-- Header -->
          <div class="modal-header">
            <div class="header-title">
              <span class="action-emoji">{{ actionEmoji }}</span>
              <div>
                <h2>{{ actionTitle }}</h2>
                <span class="points-chip"><Star :size="12" /> +{{ actionPoints }} pts</span>
              </div>
            </div>
            <button class="btn-ghost icon-btn" @click="emit('close')" aria-label="Fechar">
              <X :size="20" />
            </button>
          </div>

          <!-- ── Step: Upload ── -->
          <div v-if="step === 'upload'" class="modal-body">
            <p class="step-desc">
              Para garantir a autenticidade das acoes e evitar pontos indevidos,
              <strong>envie uma foto comprovando que realizou a acao.</strong>
              A descricao e opcional.
            </p>

            <!-- Photo zone -->
            <div
              class="photo-zone"
              :class="{ 'has-image': imagePreview }"
              @click="!imagePreview && pickFile()"
            >
              <img v-if="imagePreview" :src="imagePreview" alt="Foto da acao" class="photo-preview" />
              <div v-else class="photo-placeholder">
                <Camera :size="32" color="#a8a29e" />
                <p>Toque para tirar ou enviar uma foto</p>
                <span class="photo-hint">JPG, PNG, WEBP — max 10 MB</span>
              </div>
              <button v-if="imagePreview" class="remove-photo" @click.stop="removeImage" aria-label="Remover foto">
                <X :size="14" />
              </button>
            </div>

            <button v-if="!imagePreview" class="upload-btn" @click="pickFile">
              <Upload :size="16" /> Escolher arquivo
            </button>

            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              capture="environment"
              style="display:none"
              @change="onFileChange"
            />

            <!-- Description -->
            <div class="field">
              <label class="field-label" for="proof-desc">Descricao (opcional)</label>
              <textarea
                id="proof-desc"
                v-model="description"
                class="field-textarea"
                rows="3"
                placeholder="Conte um pouco sobre como realizou a acao..."
              />
            </div>

            <div class="modal-footer">
              <button class="btn-secondary" @click="emit('close')">Cancelar</button>
              <button
                class="btn-primary submit-btn"
                :disabled="!canSubmit"
                @click="submitForValidation"
              >
                Enviar para validacao
              </button>
            </div>
          </div>

          <!-- ── Step: Validating ── -->
          <div v-else-if="step === 'validating'" class="modal-body validating-body">
            <div class="validate-anim">
              <Loader :size="40" color="#16a34a" class="spin-icon" />
            </div>
            <h3 class="validate-title">Validando sua acao...</h3>
            <p class="validate-sub">Nossa IA esta analisando a foto para confirmar a acao sustentavel.</p>
            <div class="val-progress-wrap">
              <div class="val-progress-bar">
                <div class="val-progress-fill" :style="{ width: validationProgress + '%' }" />
              </div>
              <span class="val-progress-pct">{{ Math.round(validationProgress) }}%</span>
            </div>
            <ul class="val-steps">
              <li :class="{ done: validationProgress > 20 }">✓ Verificando qualidade da imagem</li>
              <li :class="{ done: validationProgress > 50 }">✓ Identificando a acao realizada</li>
              <li :class="{ done: validationProgress > 80 }">✓ Confirmando autenticidade</li>
            </ul>
          </div>

          <!-- ── Step: Approved ── -->
          <div v-else-if="step === 'approved'" class="modal-body result-body">
            <div class="result-icon approved-icon">
              <CheckCircle :size="48" color="#16a34a" />
            </div>
            <h3 class="result-title">Acao Validada! 🎉</h3>
            <p class="result-sub">
              Sua foto foi analisada e a acao foi confirmada como autentica.
              Voce ganhou <strong>+{{ actionPoints }} pontos</strong>!
            </p>
            <button class="btn-primary collect-btn" @click="collectPoints">
              <Star :size="16" /> Coletar +{{ actionPoints }} pts
            </button>
          </div>

          <!-- ── Step: Rejected ── -->
          <div v-else-if="step === 'rejected'" class="modal-body result-body">
            <div class="result-icon rejected-icon">
              <XCircle :size="48" color="#dc2626" />
            </div>
            <h3 class="result-title">Nao foi possivel validar</h3>
            <p class="result-sub">
              Nao conseguimos confirmar a acao com a foto enviada.
              Certifique-se de que a foto mostra claramente a acao realizada e tente novamente.
            </p>
            <div class="rejected-tips">
              <p><strong>Dicas:</strong></p>
              <ul>
                <li>A foto deve mostrar a acao claramente</li>
                <li>Evite fotos muito escuras ou borradas</li>
                <li>Certifique-se de que o contexto esta visivel</li>
              </ul>
            </div>
            <div class="result-actions">
              <button class="btn-secondary" @click="emit('close')">Fechar</button>
              <button class="btn-primary" @click="retry">Tentar novamente</button>
            </div>
          </div>

        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: 1rem;
}

.modal {
  background: white;
  border-radius: 1.25rem;
  width: 100%; max-width: 480px;
  max-height: 90dvh;
  overflow-y: auto;
  box-shadow: 0 24px 64px rgba(0,0,0,.22);
}

/* Header */
.modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e7e5e4;
  gap: 0.75rem;
}
.header-title {
  display: flex; align-items: center; gap: 0.75rem;
}
.action-emoji { font-size: 2rem; line-height: 1; flex-shrink: 0; }
.header-title h2 {
  margin: 0 0 0.25rem;
  font-size: 1rem; font-weight: 700; color: #1c1917;
  line-height: 1.3;
}
.points-chip {
  display: inline-flex; align-items: center; gap: 0.25rem;
  font-size: 0.8125rem; font-weight: 700; color: #16a34a;
  background: #f0fdf4; padding: 0.125rem 0.5rem;
  border-radius: 9999px; border: 1px solid #bbf7d0;
}
.icon-btn { padding: 0.375rem; flex-shrink: 0; }

/* Body */
.modal-body { padding: 1.375rem 1.5rem; display: flex; flex-direction: column; gap: 1.125rem; }

.step-desc {
  margin: 0; font-size: 0.9rem; color: #57534e; line-height: 1.6;
}
.step-desc strong { color: #1c1917; }

/* Photo zone */
.photo-zone {
  border: 2px dashed #d6d3d1;
  border-radius: 1rem;
  min-height: 160px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  position: relative;
  overflow: hidden;
}
.photo-zone:hover:not(.has-image) {
  border-color: #86efac;
  background: #f0fdf4;
}
.photo-zone.has-image { cursor: default; border-style: solid; border-color: #bbf7d0; }

.photo-placeholder {
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  padding: 2rem 1rem; text-align: center;
}
.photo-placeholder p { margin: 0; font-size: 0.9375rem; color: #78716c; font-weight: 500; }
.photo-hint { font-size: 0.75rem; color: #a8a29e; }

.photo-preview {
  width: 100%; max-height: 240px;
  object-fit: cover; display: block;
}

.remove-photo {
  position: absolute; top: 8px; right: 8px;
  background: rgba(0,0,0,.55); color: white;
  border: none; border-radius: 9999px;
  width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s;
}
.remove-photo:hover { background: #dc2626; }

.upload-btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 1rem; background: #f5f5f4; color: #44403c;
  border: 1.5px solid #d6d3d1; border-radius: 0.625rem;
  font-size: 0.875rem; font-weight: 500;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
  align-self: flex-start;
}
.upload-btn:hover { background: #e7e5e4; border-color: #a8a29e; }

/* Field */
.field { display: flex; flex-direction: column; gap: 0.375rem; }
.field-label { font-size: 0.8125rem; font-weight: 600; color: #57534e; }
.field-textarea {
  padding: 0.625rem 0.75rem;
  border: 1.5px solid #e7e5e4; border-radius: 0.625rem;
  font-size: 0.875rem; color: #1c1917; background: #fafaf9;
  resize: vertical; min-height: 72px; font-family: inherit;
  outline: none; transition: border-color 0.15s, box-shadow 0.15s;
}
.field-textarea:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22,163,74,.1);
  background: white;
}

/* Footer */
.modal-footer {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding-top: 0.25rem;
}
.submit-btn:disabled { opacity: .45; cursor: not-allowed; }

/* Validating */
.validating-body { align-items: center; text-align: center; padding: 2rem 1.5rem; }
.validate-anim { margin-bottom: 0.5rem; }
.spin-icon { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.validate-title { margin: 0 0 0.375rem; font-size: 1.125rem; font-weight: 700; color: #1c1917; }
.validate-sub { margin: 0; font-size: 0.9rem; color: #78716c; line-height: 1.5; }

.val-progress-wrap {
  display: flex; align-items: center; gap: 0.75rem;
  width: 100%; margin-top: 0.75rem;
}
.val-progress-bar {
  flex: 1; height: 8px; background: #e7e5e4; border-radius: 9999px; overflow: hidden;
}
.val-progress-fill {
  height: 100%; background: linear-gradient(90deg, #22c55e, #4ade80);
  border-radius: 9999px;
  transition: width 0.2s ease;
}
.val-progress-pct { font-size: 0.8125rem; font-weight: 600; color: #16a34a; min-width: 36px; text-align: right; }

.val-steps {
  list-style: none; margin: 0.5rem 0 0; padding: 0;
  display: flex; flex-direction: column; gap: 0.375rem;
  width: 100%; text-align: left;
}
.val-steps li {
  font-size: 0.8125rem; color: #d6d3d1;
  transition: color 0.3s;
  padding: 0.25rem 0;
}
.val-steps li.done { color: #16a34a; font-weight: 500; }

/* Results */
.result-body { align-items: center; text-align: center; padding: 2rem 1.5rem; }
.result-icon { margin-bottom: 0.75rem; }
.approved-icon { animation: pop 0.4s cubic-bezier(0.34,1.56,0.64,1); }
.rejected-icon { animation: pop 0.4s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes pop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.result-title { margin: 0 0 0.5rem; font-size: 1.25rem; font-weight: 800; color: #1c1917; }
.result-sub { margin: 0; font-size: 0.9375rem; color: #57534e; line-height: 1.6; max-width: 320px; }
.result-sub strong { color: #16a34a; }

.collect-btn { margin-top: 0.5rem; font-size: 1rem; padding: 0.75rem 1.75rem; }

.rejected-tips {
  background: #fef2f2; border: 1px solid #fecaca;
  border-radius: 0.75rem; padding: 1rem;
  text-align: left; width: 100%; max-width: 320px;
  margin-top: 0.25rem;
}
.rejected-tips p { margin: 0 0 0.375rem; font-size: 0.875rem; font-weight: 600; color: #dc2626; }
.rejected-tips ul { margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.25rem; }
.rejected-tips li { font-size: 0.8125rem; color: #78716c; }

.result-actions { display: flex; gap: 0.75rem; margin-top: 0.25rem; }
</style>
