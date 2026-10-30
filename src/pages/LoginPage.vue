<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/useAuthStore"

const router = useRouter()
const auth = useAuthStore()

const email = ref("")
const password = ref("")
const showPassword = ref(false)
const error = ref("")
const isLoading = ref(false)

async function handleLogin() {
  error.value = ""
  if (!email.value.trim()) {
    error.value = "Informe seu e-mail."
    return
  }
  if (!password.value) {
    error.value = "Informe sua senha."
    return
  }
  isLoading.value = true
  try {
    await auth.login(email.value.trim(), password.value)
    router.push("/")
  } catch (err: unknown) {
    error.value =
      err instanceof Error
        ? err.message
        : "Falha ao conectar. Verifique se o backend está rodando."
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-root">
    <div class="login-left" aria-hidden="true">
      <div class="left-content">
        <div class="brand">
          <div class="brand-icon">
            <i class="fa-solid fa-leaf brand-leaf-icon" aria-hidden="true" />
          </div>
          <span class="brand-name">Iclean</span>
        </div>

        <div class="left-hero">
          <h1 class="left-title">
            Pequenas ações,<br />
            <span class="title-accent">grande impacto.</span>
          </h1>
          <p class="left-sub">
            Junte-se a milhares de pessoas comprometidas com um futuro mais sustentável.
          </p>
        </div>
      </div>
    </div>

    <div class="login-right">
      <div class="mobile-brand">
        <div class="brand-icon brand-icon--green">
          <i class="fa-solid fa-leaf brand-leaf-icon" aria-hidden="true" />
        </div>
        <span class="brand-name brand-name--dark">Iclean</span>
      </div>

      <div class="form-container">
        <div class="form-header">
          <h2 class="form-title">Entrar na sua conta</h2>
          <p class="form-sub">
            Acesse sua conta para continuar sua jornada sustentável.
          </p>
        </div>

        <form class="login-form" @submit.prevent="handleLogin" novalidate>
          <div class="field">
            <label class="field-label" for="login-email">E-mail</label>
            <div class="input-wrap">
              <i class="fa-solid fa-envelope input-icon" aria-hidden="true" />
              <input
                id="login-email"
                v-model="email"
                type="email"
                class="field-input"
                placeholder="voce@email.com"
                autocomplete="email"
              />
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="login-password">Senha</label>
            <div class="input-wrap">
              <i class="fa-solid fa-lock input-icon" aria-hidden="true" />
              <input
                id="login-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="field-input field-input--pass"
                placeholder="••••••••"
                autocomplete="current-password"
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

          <transition name="shake">
            <p v-if="error" class="login-error" role="alert">{{ error }}</p>
          </transition>

          <button type="submit" class="btn-submit" :disabled="isLoading" id="btn-login-submit">
            <span v-if="isLoading" class="spinner" />
            <template v-else>
              <i class="fa-solid fa-right-to-bracket" aria-hidden="true" />
              <span>Entrar</span>
              <i class="fa-solid fa-arrow-right btn-arrow" aria-hidden="true" />
            </template>
          </button>
        </form>

        <p class="form-footer">
          Não tem conta?
          <router-link to="/cadastro" class="form-link">Crie uma</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-root {
  min-height: 100dvh;
  display: flex;
}

.login-left {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #052e16 0%, #064e3b 55%, #065f46 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 3.5rem;
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
  margin-bottom: 2.75rem;
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-icon--green {
  background: #15803d;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
}

.brand-leaf-icon { color: white; font-size: 1.25rem; }

.brand-name {
  font-size: 1.375rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.3px;
}

.brand-name--dark { color: #15803d; }

.left-hero { margin-bottom: 2.25rem; }

.left-title {
  margin: 0 0 0.875rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.title-accent {
  color: #86efac;
}

.left-sub {
  margin: 0;
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
  max-width: 340px;
}

.login-right {
  width: 480px;
  min-width: 480px;
  background: var(--color-background);
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
  margin-bottom: 2.25rem;
  align-self: flex-start;
}

.form-container {
  width: 100%;
  max-width: 360px;
}

.form-header { margin-bottom: 1.75rem; }

.form-title {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  letter-spacing: -0.02em;
}

.form-sub {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

.login-form { display: flex; flex-direction: column; gap: 1rem; }

.field { display: flex; flex-direction: column; gap: 0.375rem; }

.field-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}

.input-wrap { position: relative; }

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
  transition: color 0.15s ease;
  font-size: 0.875rem;
}

.input-wrap:focus-within .input-icon { color: #15803d; }

.field-input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.25rem;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 0.875rem;
  color: #111827;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-sizing: border-box;
}

.field-input::placeholder { color: #9ca3af; }

.field-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.field-input--pass { padding-right: 2.5rem; }

.toggle-pw {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.15s ease;
}

.toggle-pw:hover { color: #374151; }

.login-error {
  margin: 0;
  padding: 0.5rem 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius);
  font-size: 0.8125rem;
  color: var(--color-destructive);
}

.btn-submit {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  margin-top: 0.25rem;
  background: var(--color-primary);
  color: white;
  border: 1px solid transparent;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-submit:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-submit:active:not(:disabled) { opacity: 0.95; }

.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-arrow {
  margin-left: auto;
  opacity: 0.8;
  font-size: 0.8125rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 9999px;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.form-footer {
  margin: 1.5rem 0 0;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}

.form-link {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.25rem;
}

.form-link:hover {
  text-decoration: underline;
  color: var(--color-primary-hover);
}

.shake-enter-active { animation: shake 0.3s ease; }

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-4px); }
  75%       { transform: translateX(4px); }
}

@media (max-width: 900px) {
  .login-left { display: none; }
  .login-right {
    width: 100%;
    min-width: unset;
    padding: 3rem 1.5rem;
    justify-content: flex-start;
  }
  .mobile-brand { display: flex; }
  .form-container { max-width: 400px; }
}
</style>
