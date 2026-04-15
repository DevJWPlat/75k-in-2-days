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
  isSatellite: {
    type: Boolean,
    default: false,
  },
})

const safePercent = computed(() => {
  return Math.max(0, Math.min(100, props.percent))
})

const completeStyle = computed(() => {
  if (!props.isComplete) return {}

  return {
    background: 'rgba(34, 197, 94, 0.18)',
    border: '1px solid rgba(34, 197, 94, 0.35)',
    backdropFilter: props.isSatellite ? 'blur(18px)' : 'blur(10px)',
  }
})

const textClass = computed(() => {
  return props.isSatellite
    ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
    : 'text-[var(--app-text)]'
})

const mutedTextClass = computed(() => {
  return props.isSatellite
    ? 'text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
    : 'text-[var(--app-muted)]'
})
</script>

<template>
  <section
    class="glass-panel rounded-2xl px-4 py-3 shadow-sm"
    :style="completeStyle"
  >
    <div class="mb-2 flex items-center justify-between">
      <p :class="['text-sm font-semibold', textClass]">
        {{ title }}
      </p>

      <p :class="['text-xs', mutedTextClass]">
        {{ safePercent.toFixed(0) }}%
      </p>
    </div>

    <div class="h-2 overflow-hidden rounded-full bg-black/10">
      <div
        class="h-full rounded-full bg-[var(--app-purple)] transition-all duration-500 ease-out"
        :style="{ width: `${safePercent}%` }"
      />
    </div>

    <div class="mt-2 flex justify-between text-xs">
      <p :class="mutedTextClass">
        {{ completedKm.toFixed(1) }}km of {{ totalKm.toFixed(1) }}km
      </p>

      <p :class="mutedTextClass">
        {{ remainingKm.toFixed(1) }}km to go
      </p>
    </div>
  </section>
</template>