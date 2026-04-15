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
    return 'bg-[rgba(239,68,68,0.14)] border-[rgba(239,68,68,0.24)]'
  }

  if (props.tone === 'success') {
    return 'bg-[rgba(34,197,94,0.14)] border-[rgba(34,197,94,0.24)]'
  }

  return 'bg-white/45 border-white/30'
})
</script>

<template>
  <div
    :class="[
      'backdrop-blur-xl rounded-2xl border px-2.5 py-2.5 shadow-sm min-w-0',
      toneClasses,
    ]"
  >
    <p class="stat-label text-[9px] font-medium uppercase tracking-[0.08em] leading-tight text-[var(--app-muted)]">
      {{ label }}
    </p>

    <p class="stat-value mt-1 text-[13px] font-semibold leading-tight text-[var(--app-text)] break-words">
      {{ value }}
    </p>
  </div>
</template>

<style scoped>
@media (max-width: 449px) {
  .stat-label {
    font-size: 7px;
  }
  .stat-value {
    font-size: 10px;
  }
}
</style>