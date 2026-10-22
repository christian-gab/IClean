<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/useAuthStore"

const router = useRouter()
const auth = useAuthStore()

const name = ref("")
const email = ref("")
const password = ref("")
const confirmPassword = ref("")
const showPassword = ref(false)
const showConfirm = ref(false)
const error = ref("")
const isLoading = ref(false)

async function handleRegister() {
  error.value = ""

  if (!name.value.trim()) {
    error.value = "Informe seu nome completo."
    return
  }
  if (!email.value.trim()) {
    error.value = "Informe seu e-mail."
    return
  }
  if (!password.value || password.value.length < 6) {
    error.value = "A senha deve ter no mínimo 6 caracteres."
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = "As senhas não coincidem."
    return
  }

  isLoading.value = true
  try {
    await auth.register(name.value.trim(), email.value.trim(), password.value)
    router.push("/")
  } catch (err: unknown) {
    error.value =
      err instanceof Error
        ? err.message
        : "Falha ao criar conta. Verifique se o backend está rodando."
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="reg-root">
    <div class="reg-left" aria-hidden="true">
      <div class="particle" v-for="n in 14" :key="n"
        :style="{
          left: (n * 7.1 % 100) + '%',
          top: (n * 13.3 % 100) + '%',
          width: (n % 3 * 3 + 4) + 'px',
          height: (n % 3 * 3 + 4) + 'px',
          animationDelay: (n * 0.41) + 's',
          animationDuration: (n % 4 * 2 + 9) + 's',
        }"
      />

      <div class="left-content">
        <div class="brand">
          <div class="brand-icon">
            <i class="fa-solid fa-leaf brand-leaf-icon" aria-hidden="true" />
          </div>
          <span class="brand-name">Iclean</span>
        </div>

        <div class="left-hero">
          <h1 class="left-title">
            Comece sua<br />
            <span class="title-accent">jornada verde.</span>
          </h1>
          <p class="left-sub">
            Crie sua conta gratuita e comece a registrar ações sustentáveis que fazem a diferença.
          </p>
        </div>

        <ul class="benefit-list">
          <li class="benefit-item">
            <span class="benefit-icon"><i class="fa-solid fa-seedling" aria-hidden="true" /></span>
            <div>
              <strong>Registre ações sustentáveis</strong>
              <p>Acompanhe seu impacto positivo no planeta</p>
            </div>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon"><i class="fa-solid fa-trophy" aria-hidden="true" /></span>
            <div>
              <strong>Ganhe pontos e conquistas</strong>
              <p>Suba de nível e desbloqueie recompensas</p>
            </div>
          </li>
          <li class="benefit-item">
            <span class="benefit-icon"><i class="fa-solid fa-handshake" aria-hidden="true" /></span>
            <div>
              <strong>Conecte-se com a comunidade</strong>
              <p>Inspire e seja inspirado por outros eco-guerreiros</p>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="reg-right">
      <div class="mobile-brand">
        <div class="brand-icon brand-icon--green">
          <i class="fa-solid fa-leaf brand-leaf-icon" aria-hidden="true" />
        </div>
        <span class="brand-name brand-name--dark">Iclean</span>
      </div>

      <div class="form-container">
        <div class="form-header">
          <h2 class="form-title">Criar conta</h2>
          <p class="form-sub">
            Preencha os dados abaixo para começar sua jornada.
          </p>
        </div>

        <form class="reg-form" @submit.prevent="handleRegister" novalidate>
          <div class="field">
            <label class="field-label" for="reg-name">Nome completo</label>
            <div class="input-wrap">
              <i class="fa-solid fa-user input-icon" aria-hidden="true" />
              <input
                id="reg-name"
                v-model="name"
                type="text"
                class="field-input"
                placeholder="Ex: Ana Oliveira"
                autocomplete="name"
              />
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="reg-email">E-mail</label>
            <div class="input-wrap">
              <i class="fa-solid fa-envelope input-icon" aria-hidden="true" />
              <input
                id="reg-email"
                v-model="email"
                type="email"
                class="field-input"
                placeholder="voce@email.com"
                autocomplete="email"
              />
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="reg-password">Senha</label>
            <div class="input-wrap">
              <i class="fa-solid fa-lock input-icon" aria-hidden="true" />
              <input
                id="reg-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="field-input field-input--pass"
                placeholder="Mínimo 6 caracteres"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="toggle-pw"
                :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                @click="showPassword = !showPassword"
              >
                <i v-if="showPassword" class="fa-solid fa-eye-slash" aria-hidden="true" />
                <i v-else class="fa-solid fa-eye" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="reg-confirm">Confirmar senha</label>
            <div class="input-wrap">
              <i class="fa-solid fa-lock input-icon" aria-hidden="true" />
              <input
                id="reg-confirm"
                v-model="confirmPassword"
                :type="showConfirm ? 'text' : 'password'"
                class="field-input field-input--pass"
                placeholder="Repita a senha"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="toggle-pw"
                :aria-label="showConfirm ? 'Ocultar senha' : 'Mostrar senha'"
                @click="showConfirm = !showConfirm"
              >
                <i v-if="showConfirm" class="fa-solid fa-eye-slash" aria-hidden="true" />
                <i v-else class="fa-solid fa-eye" aria-hidden="true" />
              </button>
            </div>
          </div>

          <transition name="shake">
            <p v-if="error" class="reg-error" role="alert">{{ error }}</p>
          </transition>

          <button type="submit" class="btn-submit" :disabled="isLoading" id="btn-register-submit">
            <span v-if="isLoading" class="spinner" />
            <template v-else>
              <span>Criar conta</span>
              <i class="fa-solid fa-arrow-right btn-arrow" aria-hidden="true" />
            </template>
          </button>
        </form>

        <p class="form-footer">
          Já tem uma conta?
          <router-link to="/login" class="form-link">Entrar</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

* { font-family: 'Inter', system-ui, sans-serif; box-sizing: border-box; }

.reg-root {
  min-height: 100dvh;
  display: flex;
}

.reg-left {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, #052e16 0%, #064e3b 35%, #065f46 65%, #047857 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 3.5rem;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(167, 243, 208, 0.22);
  animation: float linear infinite;
  pointer-events: none;
}

@keyframes float {
  0%   { transform: translateY(0) scale(1); opacity: 0.5; }
  50%  { transform: translateY(-36px) scale(1.15); opacity: 0.9; }
  100% { transform: translateY(0) scale(1); opacity: 0.5; }
}

.left-content {
  position: relative;
  z-index: 1;
  max-width: 420px;
  width: 100%;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 2.5rem;
}

.brand-icon {
  width: 44px; height: 44px;
  background: rgba(255,255,255,0.13);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-icon--green {
  background: linear-gradient(135deg, #16a34a, #059669);
  border: none;
  width: 36px; height: 36px;
  border-radius: 10px;
}

.brand-leaf-icon { color: white; font-size: 1.5rem; }

.brand-name {
  font-size: 1.375rem;
  font-weight: 800;
  color: white;
  letter-spacing: -0.3px;
}

.brand-name--dark { color: #14532d; }

.left-hero { margin-bottom: 2rem; }

.left-title {
  margin: 0 0 0.875rem;
  font-size: 2.625rem;
  font-weight: 900;
  color: white;
  line-height: 1.1;
  letter-spacing: -1.5px;
}

.title-accent {
  background: linear-gradient(90deg, #6ee7b7, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.left-sub {
  margin: 0;
  font-size: 1rem;
  color: rgba(255,255,255,0.6);
  line-height: 1.6;
}

.benefit-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem 1.125rem;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.875rem;
  backdrop-filter: blur(8px);
}

.benefit-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 1px;
}

.benefit-item strong {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.125rem;
}

.benefit-item p {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.52);
  line-height: 1.4;
}

.reg-right {
  width: 480px;
  min-width: 480px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2.5rem;
}

.mobile-brand {
  display: none;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  align-self: flex-start;
}

.form-container {
  width: 100%;
  max-width: 360px;
  animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

.form-header { margin-bottom: 1.75rem; }

.form-title {
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.75px;
}

.form-sub {
  margin: 0;
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.55;
}

.reg-form { display: flex; flex-direction: column; gap: 1rem; }

.field { display: flex; flex-direction: column; gap: 0.375rem; }

.field-label { font-size: 0.875rem; font-weight: 600; color: #374151; }

.input-wrap { position: relative; }

.input-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
  transition: color 0.2s;
}

.input-wrap:focus-within .input-icon { color: #16a34a; }

.field-input {
  width: 100%;
  padding: 0.75rem 0.875rem 0.75rem 2.625rem;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  color: #111827;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.field-input::placeholder { color: #d1d5db; }

.field-input:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
}

.field-input--pass { padding-right: 2.75rem; }

.toggle-pw {
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.2s;
}

.toggle-pw:hover { color: #374151; }

.reg-error {
  margin: 0;
  padding: 0.625rem 0.875rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.625rem;
  font-size: 0.875rem;
  color: #dc2626;
}

.btn-submit {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.9rem;
  margin-top: 0.25rem;
  background: linear-gradient(135deg, #16a34a 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 0.875rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(22, 163, 74, 0.32);
  letter-spacing: 0.01em;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.91;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(22, 163, 74, 0.38);
}

.btn-submit:active:not(:disabled) { transform: translateY(0); }
.btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

.btn-arrow {
  margin-left: auto;
  opacity: 0.7;
  transition: transform 0.2s;
}

.btn-submit:hover:not(:disabled) .btn-arrow {
  transform: translateX(3px);
  opacity: 1;
}

.spinner {
  width: 20px; height: 20px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 9999px;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.form-footer {
  margin: 1.5rem 0 0;
  font-size: 0.9rem;
  color: #6b7280;
  text-align: center;
}

.form-link {
  color: #16a34a;
  font-weight: 700;
  text-decoration: none;
  margin-left: 0.25rem;
  transition: color 0.2s;
}

.form-link:hover { color: #15803d; text-decoration: underline; }

.shake-enter-active { animation: shake 0.35s ease; }

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-5px); }
  75%       { transform: translateX(5px); }
}

@media (max-width: 900px) {
  .reg-left { display: none; }

  .reg-right {
    width: 100%;
    min-width: unset;
    padding: 3rem 1.5rem 3.5rem;
    justify-content: flex-start;
  }

  .mobile-brand { display: flex; }

  .form-container { max-width: 420px; }
}

@media (max-width: 480px) {
  .reg-right { padding: 2rem 1.125rem 2.5rem; }
  .form-title { font-size: 1.5rem; }
}
</style>
