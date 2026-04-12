<script setup>
defineProps({
  donateUrl: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-[var(--app-border)] bg-white/90 backdrop-blur">
    <div class="mx-auto flex max-w-md items-center justify-between px-4 py-3">
      <div class="min-w-0">
        <p class="truncate text-base font-semibold">75k in 2 days</p>
      </div>

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