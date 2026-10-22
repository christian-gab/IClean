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
      <div class="particle" v-for="n in 14" :key="n"
        :style="{
          left: (n * 7.1 % 100) + '%',
          top: (n * 13.3 % 100) + '%',
          width: (n % 3 * 3 + 4) + 'px',
          height: (n % 3 * 3 + 4) + 'px',
          animationDelay: (n * 0.37) + 's',
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
            Pequenas ações,<br />
            <span class="title-accent">grande impacto.</span>
          </h1>
          <p class="left-sub">
            Junte-se a milhares de pessoas comprometidas com um futuro mais sustentável.
          </p>
        </div>

        <div class="left-stats">
          <div class="stat">
            <span class="stat-num">12k+</span>
            <span class="stat-label">Membros ativos</span>
          </div>
          <div class="stat-divider" />
          <div class="stat">
            <span class="stat-num">48k</span>
            <span class="stat-label">Ações registradas</span>
          </div>
          <div class="stat-divider" />
          <div class="stat">
            <span class="stat-num">3,2t</span>
            <span class="stat-label">CO₂ evitado</span>
          </div>
        </div>

        <div class="left-badges">
          <span class="eco-badge"><i class="fa-solid fa-recycle" aria-hidden="true" /> Reciclagem</span>
          <span class="eco-badge"><i class="fa-solid fa-droplet" aria-hidden="true" /> Água</span>
          <span class="eco-badge"><i class="fa-solid fa-seedling" aria-hidden="true" /> Plantio</span>
          <span class="eco-badge"><i class="fa-solid fa-person-biking" aria-hidden="true" /> Mobilidade</span>
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

* { font-family: 'Inter', system-ui, sans-serif; box-sizing: border-box; }

.login-root {
  min-height: 100dvh;
  display: flex;
}

.login-left {
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
  margin-bottom: 2.75rem;
}

.brand-icon {
  width: 44px;
  height: 44px;
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
  width: 36px;
  height: 36px;
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

.left-hero { margin-bottom: 2.25rem; }

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
  max-width: 340px;
}

.left-stats {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.75rem;
  padding: 1.125rem 1.375rem;
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.11);
  border-radius: 1rem;
}

.stat { display: flex; flex-direction: column; }
.stat-num { font-size: 1.25rem; font-weight: 800; color: white; letter-spacing: -0.5px; }
.stat-label { font-size: 0.7rem; color: rgba(255,255,255,0.48); margin-top: 1px; }
.stat-divider { width: 1px; height: 32px; background: rgba(255,255,255,0.14); }

.left-badges { display: flex; flex-wrap: wrap; gap: 0.5rem; }

.eco-badge {
  padding: 0.35rem 0.8rem;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.13);
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  color: rgba(255,255,255,0.75);
  backdrop-filter: blur(8px);
  transition: background 0.2s;
}

.eco-badge:hover { background: rgba(255,255,255,0.14); }

.login-right {
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
  margin-bottom: 2.25rem;
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

.form-header { margin-bottom: 1.875rem; }

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

.login-form { display: flex; flex-direction: column; gap: 1.125rem; }

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
  padding: 0.8125rem 0.875rem 0.8125rem 2.625rem;
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

.login-error {
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
  padding: 0.9375rem;
  margin-top: 0.375rem;
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
  margin: 1.625rem 0 0;
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
  .login-left { display: none; }

  .login-right {
    width: 100%;
    min-width: unset;
    padding: 2.5rem 1.5rem 3rem;
    justify-content: flex-start;
    padding-top: 3.5rem;
  }

  .mobile-brand { display: flex; }

  .form-container { max-width: 420px; }
}

@media (max-width: 480px) {
  .login-right { padding: 2rem 1.125rem 2.5rem; }

  .form-title { font-size: 1.5rem; }
}
</style>
