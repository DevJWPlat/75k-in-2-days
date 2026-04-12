<script setup>
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

const safePercent = Math.max(0, Math.min(100, props.percent))
</script>

<template>
  <section class="border-b border-[var(--app-border)] bg-white">
    <div class="mx-auto max-w-md px-4 py-4">
      <div class="mb-2 flex items-center justify-between gap-3">
        <p class="text-sm font-semibold">{{ title }}</p>
        <p class="text-sm text-[var(--app-muted)]">{{ safePercent }}%</p>
      </div>

      <div class="h-3 overflow-hidden rounded-full bg-[var(--app-purple-soft)]">
        <div
          class="h-full rounded-full bg-[var(--app-purple)] transition-all duration-300"
          :style="{ width: `${safePercent}%` }"
        />
      </div>

      <div class="mt-3 flex items-center justify-between gap-4 text-sm text-[var(--app-muted)]">
        <p>{{ completedKm.toFixed(1) }}km of {{ totalKm.toFixed(1) }}km</p>
        <p>{{ remainingKm.toFixed(1) }}km to go</p>
      </div>
    </div>
  </section>
</template>