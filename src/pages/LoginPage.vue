<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/useAuthStore"
import { Leaf, User, AtSign, LogIn, Sprout } from "@lucide/vue"

const router = useRouter()
const auth = useAuthStore()

const name = ref("")
const username = ref("")
const error = ref("")
const isLoading = ref(false)

async function handleLogin() {
  error.value = ""
  if (!name.value.trim()) {
    error.value = "Por favor, informe seu nome."
    return
  }
  if (!username.value.trim()) {
    error.value = "Por favor, informe seu usuario."
    return
  }
  isLoading.value = true
  await new Promise(r => setTimeout(r, 600))
  auth.login(name.value, username.value)
  router.push("/")
}
</script>

<template>
  <div class="login-bg">
    <div class="login-glow login-glow-1" />
    <div class="login-glow login-glow-2" />

    <div class="login-card">
      <!-- Logo -->
      <div class="login-logo">
        <div class="logo-icon">
          <Leaf :size="32" color="white" />
        </div>
        <span class="logo-text">EcoSocial</span>
      </div>

      <!-- Hero copy -->
      <div class="login-hero">
        <h1 class="login-title">Bem-vindo(a) de volta!</h1>
        <p class="login-sub">Junte-se a milhares de pessoas comprometidas com um futuro mais sustentavel.</p>
      </div>

      <!-- Badges -->
      <div class="login-badges">
        <span class="badge badge-green"><Sprout :size="13" /> Acao Sustentavel</span>
        <span class="badge badge-blue">🌊 Economia de Agua</span>
        <span class="badge badge-purple">♻️ Reciclagem</span>
      </div>

      <!-- Form -->
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="field">
          <label class="field-label" for="login-name">Nome completo</label>
          <div class="input-wrap">
            <User :size="16" class="input-icon" />
            <input
              id="login-name"
              v-model="name"
              type="text"
              class="field-input"
              placeholder="Ex: Ana Oliveira"
              autocomplete="name"
            />
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="login-username">Nome de usuario</label>
          <div class="input-wrap">
            <AtSign :size="16" class="input-icon" />
            <input
              id="login-username"
              v-model="username"
              type="text"
              class="field-input"
              placeholder="Ex: ana.eco"
              autocomplete="username"
            />
          </div>
        </div>

        <p v-if="error" class="login-error">{{ error }}</p>

        <button type="submit" class="btn-primary login-btn" :disabled="isLoading">
          <span v-if="isLoading" class="spinner" />
          <LogIn v-else :size="18" />
          {{ isLoading ? "Entrando..." : "Entrar no EcoSocial" }}
        </button>
      </form>

      <p class="login-note">Seus dados ficam apenas neste dispositivo. Nenhum servidor externo.</p>
    </div>
  </div>
</template>

<style scoped>
.login-bg {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #052e16 0%, #14532d 40%, #166534 70%, #15803d 100%);
  position: relative;
  overflow: hidden;
  padding: 1.5rem;
}

.login-glow {
  position: absolute;
  border-radius: 9999px;
  filter: blur(80px);
  pointer-events: none;
}
.login-glow-1 {
  width: 500px; height: 500px;
  background: rgba(34,197,94,.18);
  top: -120px; left: -100px;
}
.login-glow-2 {
  width: 400px; height: 400px;
  background: rgba(16,185,129,.15);
  bottom: -80px; right: -80px;
}

.login-card {
  background: rgba(255,255,255,0.97);
  border-radius: 1.5rem;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 32px 64px rgba(0,0,0,.25), 0 0 0 1px rgba(255,255,255,.1);
  position: relative;
  z-index: 1;
  animation: card-in 0.5s cubic-bezier(0.16,1,0.3,1);
}

@keyframes card-in {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}

.login-logo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 1.75rem;
}
.logo-icon {
  width: 48px; height: 48px;
  background: linear-gradient(135deg, #16a34a, #059669);
  border-radius: 0.875rem;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(22,163,74,.35);
}
.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  color: #14532d;
  letter-spacing: -0.5px;
}

.login-hero { margin-bottom: 1.25rem; }
.login-title {
  margin: 0 0 0.375rem;
  font-size: 1.5rem;
  font-weight: 800;
  color: #1c1917;
  line-height: 1.2;
}
.login-sub {
  margin: 0;
  font-size: 0.9375rem;
  color: #78716c;
  line-height: 1.5;
}

.login-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.75rem;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge-green { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.badge-blue  { background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd; }
.badge-purple{ background: #faf5ff; color: #7c3aed; border: 1px solid #e9d5ff; }

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field { display: flex; flex-direction: column; gap: 0.375rem; }
.field-label { font-size: 0.875rem; font-weight: 600; color: #44403c; }
.input-wrap { position: relative; }
.input-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a8a29e;
  pointer-events: none;
}
.field-input {
  width: 100%;
  padding: 0.75rem 0.875rem 0.75rem 2.5rem;
  border: 1.5px solid #e7e5e4;
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  color: #1c1917;
  background: #fafaf9;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
  outline: none;
}
.field-input:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22,163,74,.12);
  background: white;
}
.field-input::placeholder { color: #d6d3d1; }

.login-error {
  margin: 0;
  font-size: 0.875rem;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
}

.login-btn {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  border-radius: 0.875rem;
  justify-content: center;
  margin-top: 0.25rem;
}

.spinner {
  width: 18px; height: 18px;
  border: 2.5px solid rgba(255,255,255,.4);
  border-top-color: white;
  border-radius: 9999px;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

.login-note {
  margin: 1.25rem 0 0;
  font-size: 0.75rem;
  color: #a8a29e;
  text-align: center;
  line-height: 1.5;
}
</style>
