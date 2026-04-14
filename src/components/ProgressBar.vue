<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  percent: {
    type: Number,
    required: true,
  },
  remainingKm: {
    type: Number,
    required: true,
  },
  completedKm: {
    type: Number,
    required: true,
  },
  totalKm: {
    type: Number,
    required: true,
  },
  isComplete: {
    type: Boolean,
    default: false,
  },
})

const safePercent = computed(() => {
  return Math.max(0, Math.min(100, props.percent))
})

const barClass = computed(() => {
  return props.isComplete ? 'bg-green-500' : 'bg-[var(--app-purple)]'
})
</script>

<template>
  <section class="glass-panel rounded-2xl px-4 py-3 shadow-sm">
    <div class="mb-2 flex items-center justify-between">
      <p class="text-sm font-semibold text-[var(--app-text)]">
        {{ title }}
      </p>

      <p class="text-xs text-[var(--app-muted)]">
        {{ safePercent.toFixed(0) }}%
      </p>
    </div>

    <div class="h-2 overflow-hidden rounded-full bg-black/10">
      <div
        class="h-full rounded-full transition-all duration-300"
        :class="barClass"
        :style="{ width: `${safePercent}%` }"
      />
    </div>

    <div class="mt-2 flex justify-between text-xs text-[var(--app-muted)]">
      <p>{{ completedKm.toFixed(1) }}km of {{ totalKm.toFixed(1) }}km</p>
      <p>{{ remainingKm.toFixed(1) }}km to go</p>
    </div>
  </section>
</template>