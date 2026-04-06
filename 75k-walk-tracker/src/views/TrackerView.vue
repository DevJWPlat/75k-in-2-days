<script setup>
import { computed } from 'vue'
import { useTracking } from '@/composables/useTracking'

const {
  liveCoords,
  trackingActive,
  trackingError,
  lastUpdated,
  startTracking,
  stopTracking,
} = useTracking()

const statusText = computed(() => {
  if (trackingError.value) return trackingError.value
  if (trackingActive.value) return 'Tracking is active'
  return 'Tracking is stopped'
})

const formattedCoords = computed(() => {
  if (!liveCoords.value?.length) return 'No location yet'

  return `${liveCoords.value[1].toFixed(6)}, ${liveCoords.value[0].toFixed(6)}`
})

const formattedUpdated = computed(() => {
  if (!lastUpdated.value) return 'Not updated yet'

  return lastUpdated.value.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
})
</script>

<template>
  <main class="mx-auto min-h-screen max-w-md bg-[var(--app-bg)] px-4 py-6">
    <div class="mb-4">
      <h1 class="text-2xl font-bold">Tracker</h1>
      <p class="mt-1 text-sm text-[var(--app-muted)]">
        Use this page on your phone during the walk.
      </p>
    </div>

    <div class="space-y-4">
      <div class="rounded-3xl border border-[var(--app-border)] bg-white p-5 shadow-sm">
        <p class="text-sm font-semibold">Status</p>
        <p class="mt-2 text-sm text-[var(--app-muted)]">{{ statusText }}</p>
      </div>

      <div class="rounded-3xl border border-[var(--app-border)] bg-white p-5 shadow-sm">
        <p class="text-sm font-semibold">Current coordinates</p>
        <p class="mt-2 break-all text-base">{{ formattedCoords }}</p>
      </div>

      <div class="rounded-3xl border border-[var(--app-border)] bg-white p-5 shadow-sm">
        <p class="text-sm font-semibold">Last updated</p>
        <p class="mt-2 text-base">{{ formattedUpdated }}</p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          class="rounded-2xl bg-[var(--app-purple)] px-4 py-4 text-sm font-semibold text-white"
          @click="startTracking"
        >
          Start tracking
        </button>

        <button
          type="button"
          class="rounded-2xl border border-[var(--app-border)] bg-white px-4 py-4 text-sm font-semibold text-[var(--app-text)]"
          @click="stopTracking"
        >
          Stop tracking
        </button>
      </div>

      <RouterLink
        to="/"
        class="block rounded-2xl border border-[var(--app-border)] bg-white px-4 py-4 text-center text-sm font-semibold text-[var(--app-text)] shadow-sm"
      >
        Back to map
      </RouterLink>
    </div>
  </main>
</template>