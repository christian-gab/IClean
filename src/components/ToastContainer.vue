<script setup lang="ts">
import { useProgressStore } from '@/stores/useProgressStore'

const store = useProgressStore()

const iconMap: Record<string, string> = {
  Star: 'fa-star',
  Award: 'fa-award',
  Shield: 'fa-shield-halved',
  ArrowUp: 'fa-arrow-up',
  Check: 'fa-check',
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite">
      <TransitionGroup name="slide-up">
        <div
          v-for="toast in store.toasts"
          :key="toast.id"
          class="toast"
          :class="toast.type"
        >
          <i
            v-if="toast.icon && iconMap[toast.icon]"
            class="fa-solid"
            :class="iconMap[toast.icon]"
            aria-hidden="true"
          />
          <i v-else-if="toast.type === 'success'" class="fa-solid fa-check" aria-hidden="true" />
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
