<script setup>
defineProps({
  donateUrl: {
    type: String,
    required: true,
  },
  menuOpen: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['toggle-menu'])
</script>

<template>
  <header class="glass-panel flex items-center justify-between rounded-2xl px-4 py-3 shadow-sm">
    <p class="truncate text-base font-semibold">75k in 2 days</p>

    <div class="flex items-center gap-2">
      <button
        type="button"
        class="flex h-11 w-11 items-center justify-center rounded-full bg-white/60 text-xl text-[var(--app-text)]"
        @click="$emit('toggle-menu')"
      >
        ☰
      </button>

      <a
        :href="donateUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="rounded-full bg-[var(--app-purple)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Donate
      </a>
    </div>
  </header>
</template>