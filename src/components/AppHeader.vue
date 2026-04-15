<script setup>
import logoUrl from '@/assets/images/logo.png'

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
    <img
      :src="logoUrl"
      alt="75k in 2 days"
      class="h-8 w-auto max-w-[min(100%,20rem)] shrink-0 sm:h-10"
    />

    <div class="flex items-center gap-2">
      <a
        :href="donateUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="rounded-full bg-[var(--app-purple)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Donate
      </a>
      <button
        type="button"
        class="hamburger flex h-11 w-11 items-center justify-center rounded-full bg-white/60 text-[var(--app-text)]"
        :class="{ open: menuOpen }"
        :aria-expanded="menuOpen"
        aria-controls="site-nav"
        aria-label="Toggle menu"
        @click="$emit('toggle-menu')"
      >
        <span class="hamburger-box">
          <span class="bar" />
          <span class="bar" />
          <span class="bar" />
        </span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.hamburger-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 1rem;
}

.bar {
  display: block;
  width: 100%;
  height: 2px;
  border-radius: 9999px;
  background-color: currentColor;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
  transform-origin: center;
}

.hamburger.open .bar:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.hamburger.open .bar:nth-child(2) {
  opacity: 0;
}

.hamburger.open .bar:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}
</style>