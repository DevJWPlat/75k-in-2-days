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
})

const safePercent = computed(() => {
  return Math.max(0, Math.min(100, props.percent))
})
</script>

<template>
  <section class="glass-panel rounded-2xl px-4 py-4 shadow-sm">
    <div class="mb-3 flex items-center justify-between gap-3">
      <p class="text-base font-semibold text-[var(--app-text)]">
        {{ title }}
      </p>

      <p class="text-sm font-medium text-[var(--app-muted)]">
        {{ safePercent.toFixed(0) }}%
      </p>
    </div>

    <div class="h-3 overflow-hidden rounded-full bg-black/10">
      <div
        class="h-full rounded-full bg-[var(--app-purple)] transition-all duration-300"
        :style="{ width: `${safePercent}%` }"
      />
    </div>

    <div class="mt-3 flex items-center justify-between gap-4 text-sm text-[var(--app-muted)]">
      <p>{{ completedKm.toFixed(1) }}km of {{ totalKm.toFixed(1) }}km</p>
      <p>{{ remainingKm.toFixed(1) }}km to go</p>
    </div>
  </section>
</template>