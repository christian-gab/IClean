<script setup lang="ts">
import { ref, computed } from "vue"

const props = defineProps<{
  actionId: string
  actionTitle: string
  actionPoints: number
  actionIcon: string
}>()

const emit = defineEmits<{
  close: []
  approved: [actionId: string, title: string, points: number, proof?: { photoUrl?: string; description?: string }]
}>()

type Step = "upload" | "validating" | "approved" | "rejected"
const step = ref<Step>("upload")
const description = ref("")
const imagePreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const validationProgress = ref(0)
const progressInterval = ref<ReturnType<typeof setInterval> | null>(null)

const canSubmit = computed(() => imagePreview.value !== null)

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

async function submitForValidation() {
  if (!canSubmit.value) return
  step.value = "validating"
  validationProgress.value = 0

  progressInterval.value = setInterval(() => {
    validationProgress.value = Math.min(validationProgress.value + Math.random() * 8, 95)
  }, 150)

  await new Promise(r => setTimeout(r, 3000 + Math.random() * 1000))

  if (progressInterval.value) clearInterval(progressInterval.value)
  validationProgress.value = 100

  await new Promise(r => setTimeout(r, 400))

  const approved = Math.random() < 0.9
  step.value = approved ? "approved" : "rejected"
}

function collectPoints() {
  emit("approved", props.actionId, props.actionTitle, props.actionPoints, {
    photoUrl: imagePreview.value || undefined,
    description: description.value || undefined,
  })
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
        <div class="modal card-ds">

          <div class="modal-header">
            <div class="header-title">
              <span class="action-icon">
                <i class="fa-solid" :class="actionIcon" aria-hidden="true" />
              </span>
              <div>
                <h2>{{ actionTitle }}</h2>
                <span class="points-chip"><i class="fa-solid fa-star" aria-hidden="true" /> +{{ actionPoints }} pts</span>
              </div>
            </div>
            <button class="btn-ghost icon-btn" @click="emit('close')" aria-label="Fechar">
              <i class="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>

          <div v-if="step === 'upload'" class="modal-body">
            <p class="step-desc">
              Para garantir a autenticidade das ações e evitar pontos indevidos,
              <strong>envie uma foto comprovando que realizou a ação.</strong>
              A descrição é opcional.
            </p>

            <div
              class="photo-zone"
              :class="{ 'has-image': imagePreview }"
              @click="!imagePreview && pickFile()"
            >
              <img v-if="imagePreview" :src="imagePreview" alt="Foto da ação" class="photo-preview" />
              <div v-else class="photo-placeholder">
                <i class="fa-solid fa-camera photo-camera-icon" aria-hidden="true" />
                <p>Toque para tirar ou enviar uma foto</p>
                <span class="photo-hint">JPG, PNG, WEBP — máx 10 MB</span>
              </div>
              <button v-if="imagePreview" class="remove-photo" @click.stop="removeImage" aria-label="Remover foto">
                <i class="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>

            <button v-if="!imagePreview" class="upload-btn btn-secondary" @click="pickFile">
              <i class="fa-solid fa-upload" aria-hidden="true" /> Escolher arquivo
            </button>

            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              capture="environment"
              style="display:none"
              @change="onFileChange"
            />

            <div class="field">
              <label class="field-label label-ds" for="proof-desc">Descrição (opcional)</label>
              <textarea
                id="proof-desc"
                v-model="description"
                class="field-textarea"
                placeholder="Conte brevemente como foi realizar essa ação..."
                rows="3"
                maxlength="300"
              />
            </div>

            <div class="modal-footer">
              <button class="btn-secondary" @click="emit('close')">Cancelar</button>
              <button
                class="btn-primary submit-btn"
                :disabled="!canSubmit"
                @click="submitForValidation"
              >
                <i class="fa-solid fa-paper-plane" aria-hidden="true" />
                Validar e ganhar pontos
              </button>
            </div>
          </div>

          <div v-else-if="step === 'validating'" class="modal-body validating-body">
            <div class="validate-anim">
              <i class="fa-solid fa-spinner spin-icon" aria-hidden="true" />
            </div>
            <h3 class="validate-title">Validando sua comprovação...</h3>
            <p class="validate-sub">
              Nossa verificação inteligente está analisando a foto e os dados da ação.
            </p>

            <div class="val-progress-wrap">
              <div class="val-progress-bar">
                <div class="val-progress-fill" :style="{ width: validationProgress + '%' }" />
              </div>
              <span class="val-progress-pct">{{ Math.round(validationProgress) }}%</span>
            </div>

            <ul class="val-steps">
              <li :class="{ done: validationProgress > 15 }">
                <i class="fa-solid" :class="validationProgress > 15 ? 'fa-check' : 'fa-circle-notch'" aria-hidden="true" /> Verificando resolução da imagem
              </li>
              <li :class="{ done: validationProgress > 45 }">
                <i class="fa-solid" :class="validationProgress > 45 ? 'fa-check' : 'fa-circle-notch'" aria-hidden="true" /> Identificando elementos da ação
              </li>
              <li :class="{ done: validationProgress > 75 }">
                <i class="fa-solid" :class="validationProgress > 75 ? 'fa-check' : 'fa-circle-notch'" aria-hidden="true" /> Checando duplicidade
              </li>
              <li :class="{ done: validationProgress >= 99 }">
                <i class="fa-solid" :class="validationProgress >= 99 ? 'fa-check' : 'fa-circle-notch'" aria-hidden="true" /> Atribuindo pontuação
              </li>
            </ul>
          </div>

          <div v-else-if="step === 'approved'" class="modal-body result-body">
            <div class="result-icon approved-icon">
              <i class="fa-solid fa-circle-check" aria-hidden="true" />
            </div>
            <h3 class="result-title">Ação validada com sucesso!</h3>
            <p class="result-sub">
              Parabéns! Sua ação foi confirmada e você ganhou
              <strong>+{{ actionPoints }} pontos</strong>.
            </p>
            <button class="btn-primary collect-btn" @click="collectPoints">
              <i class="fa-solid fa-trophy" aria-hidden="true" /> Resgatar meus pontos
            </button>
          </div>

          <div v-else-if="step === 'rejected'" class="modal-body result-body">
            <div class="result-icon rejected-icon">
              <i class="fa-solid fa-circle-xmark" aria-hidden="true" />
            </div>
            <h3 class="result-title">Não foi possível validar</h3>
            <p class="result-sub">
              A imagem enviada não parece comprovar a realização desta ação específica.
            </p>
            <div class="rejected-tips">
              <p>Dicas para aprovação:</p>
              <ul>
                <li>Envie uma foto nítida e bem iluminada</li>
                <li>Mostre claramente a ação sendo realizada</li>
                <li>Evite capturas de tela ou fotos de internet</li>
              </ul>
            </div>
            <div class="result-actions">
              <button class="btn-secondary" @click="emit('close')">Cancelar</button>
              <button class="btn-primary" @click="retry">
                <i class="fa-solid fa-arrow-rotate-left" aria-hidden="true" /> Tentar novamente
              </button>
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
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 1rem;
}

.modal {
  background: white;
  border-radius: var(--radius);
  width: 100%; max-width: 520px;
  max-height: 90dvh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  gap: 0.75rem;
}

.header-title {
  display: flex; align-items: center; gap: 0.625rem;
}

.action-icon { color: var(--color-primary); font-size: 1.5rem; line-height: 1; flex-shrink: 0; }

.header-title h2 {
  margin: 0 0 0.125rem;
  font-size: 0.9375rem; font-weight: 600; color: #111827;
  line-height: 1.3;
}

.points-chip {
  display: inline-flex; align-items: center; gap: 0.25rem;
  font-size: 0.75rem; font-weight: 600; color: var(--color-primary);
  background: #f0fdf4; padding: 0.1rem 0.375rem;
  border-radius: var(--radius); border: 1px solid #bbf7d0;
}

.icon-btn { padding: 0.375rem; flex-shrink: 0; }

.modal-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.875rem; }

.step-desc {
  margin: 0; font-size: 0.8125rem; color: #57534e; line-height: 1.5;
}
.step-desc strong { color: #111827; }

.photo-zone {
  border: 1.5px dashed #d6d3d1;
  border-radius: var(--radius);
  min-height: 140px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  position: relative;
  overflow: hidden;
}
.photo-zone:hover:not(.has-image) {
  border-color: var(--color-primary);
  background: #f0fdf4;
}
.photo-zone.has-image { cursor: default; border-style: solid; border-color: var(--color-border); }

.photo-placeholder {
  display: flex; flex-direction: column; align-items: center; gap: 0.375rem;
  padding: 1.5rem 1rem; text-align: center;
}
.photo-camera-icon { color: #a8a29e; font-size: 1.5rem; }
.photo-placeholder p { margin: 0; font-size: 0.8125rem; color: #57534e; font-weight: 500; }
.photo-hint { font-size: 0.6875rem; color: #78716c; }

.photo-preview {
  width: 100%; max-height: 220px;
  object-fit: cover; display: block;
}

.remove-photo {
  position: absolute; top: 8px; right: 8px;
  background: rgba(0, 0, 0, 0.65); color: white;
  border: none; border-radius: var(--radius);
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s;
}
.remove-photo:hover { background: var(--color-destructive); }

.upload-btn { align-self: flex-start; font-size: 0.8125rem; }

.field { display: flex; flex-direction: column; gap: 0.25rem; }

.field-textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border); border-radius: var(--radius);
  font-size: 0.8125rem; color: #111827; background: white;
  resize: vertical; min-height: 64px; font-family: inherit;
  outline: none; transition: border-color 0.15s, box-shadow 0.15s;
}
.field-textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.modal-footer {
  display: flex; justify-content: flex-end; gap: 0.625rem;
  padding-top: 0.25rem;
}

.validating-body { align-items: center; text-align: center; padding: 2rem 1.25rem; }
.validate-anim { margin-bottom: 0.5rem; }
.spin-icon { color: var(--color-primary); font-size: 2rem; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.validate-title { margin: 0 0 0.25rem; font-size: 1rem; font-weight: 600; color: #111827; }
.validate-sub { margin: 0; font-size: 0.8125rem; color: #78716c; line-height: 1.5; }

.val-progress-wrap {
  display: flex; align-items: center; gap: 0.75rem;
  width: 100%; margin-top: 0.75rem;
}
.val-progress-bar {
  flex: 1; height: 6px; background: #e7e5e4; border-radius: var(--radius); overflow: hidden;
}
.val-progress-fill {
  height: 100%; background: var(--color-primary);
  border-radius: var(--radius);
  transition: width 0.2s ease;
}
.val-progress-pct { font-size: 0.75rem; font-weight: 600; color: var(--color-primary); min-width: 32px; text-align: right; }

.val-steps {
  list-style: none; margin: 0.5rem 0 0; padding: 0;
  display: flex; flex-direction: column; gap: 0.25rem;
  width: 100%; text-align: left;
}
.val-steps li {
  font-size: 0.75rem; color: #a8a29e;
  transition: color 0.2s;
  padding: 0.2rem 0;
}
.val-steps li.done { color: var(--color-primary); font-weight: 500; }

.result-body { align-items: center; text-align: center; padding: 2rem 1.25rem; }
.result-icon { margin-bottom: 0.5rem; font-size: 2.5rem; }
.approved-icon { color: var(--color-primary); }
.rejected-icon { color: var(--color-destructive); }

.result-title { margin: 0 0 0.375rem; font-size: 1.125rem; font-weight: 600; color: #111827; }
.result-sub { margin: 0; font-size: 0.8125rem; color: #57534e; line-height: 1.5; max-width: 320px; }
.result-sub strong { color: var(--color-primary); }

.collect-btn { margin-top: 0.5rem; font-size: 0.875rem; }

.rejected-tips {
  background: #fef2f2; border: 1px solid #fecaca;
  border-radius: var(--radius); padding: 0.75rem 1rem;
  text-align: left; width: 100%; max-width: 320px;
  margin-top: 0.25rem;
}
.rejected-tips p { margin: 0 0 0.25rem; font-size: 0.8125rem; font-weight: 600; color: var(--color-destructive); }
.rejected-tips ul { margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.25rem; }
.rejected-tips li { font-size: 0.75rem; color: #78716c; }

.result-actions { display: flex; gap: 0.625rem; margin-top: 0.25rem; }
</style>
