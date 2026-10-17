<script setup lang="ts">
import { useProgressStore } from '@/stores/useProgressStore'
import { Star, Award, Shield, ArrowUp, Check } from '@lucide/vue'

const store = useProgressStore()

const iconMap: Record<string, unknown> = {
  Star, Award, Shield, ArrowUp, Check,
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
          <component
            v-if="toast.icon && iconMap[toast.icon]"
            :is="iconMap[toast.icon]"
            :size="16"
          />
          <Check v-else-if="toast.type === 'success'" :size="16" />
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
