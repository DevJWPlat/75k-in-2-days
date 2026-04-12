<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="rounded-2xl border border-[var(--app-border)] bg-white p-4 shadow-sm">
    <p class="text-xs font-medium uppercase tracking-wide text-[var(--app-muted)]">
      {{ label }}
    </p>
    <p class="mt-2 text-lg font-semibold">
      {{ value }}
    </p>
  </div>
</template>