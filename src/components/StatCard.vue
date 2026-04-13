<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  tone: {
    type: String,
    default: 'default',
  },
})

const toneClasses = computed(() => {
  if (props.tone === 'danger') {
    return 'bg-[rgba(239,68,68,0.16)] border-[rgba(239,68,68,0.28)]'
  }

  if (props.tone === 'success') {
    return 'bg-[rgba(34,197,94,0.16)] border-[rgba(34,197,94,0.28)]'
  }

  return 'bg-white/45 border-white/30'
})
</script>

<template>
  <div
    :class="[
      'backdrop-blur-xl rounded-2xl border px-4 py-4 shadow-sm',
      toneClasses,
    ]"
  >
    <p class="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--app-muted)]">
      {{ label }}
    </p>

    <p class="mt-2 text-xl font-semibold leading-tight text-[var(--app-text)]">
      {{ value }}
    </p>
  </div>
</template>