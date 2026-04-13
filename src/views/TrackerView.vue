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
        Keep this page open during the walk, then open the live map in a new tab.
      </p>
    </div>

    <div class="space-y-4">
      <div class="rounded-3xl border border-[var(--app-border)] bg-white p-5 shadow-sm">
        <p class="text-sm font-semibold">Status</p>
        <p class="mt-2 text-sm text-[var(--app-muted)]">
          {{ statusText }}
        </p>
      </div>

      <div class="rounded-3xl border border-[var(--app-border)] bg-white p-5 shadow-sm">
        <p class="text-sm font-semibold">Current coordinates</p>
        <p class="mt-2 break-all text-base">
          {{ formattedCoords }}
        </p>
      </div>

      <div class="rounded-3xl border border-[var(--app-border)] bg-white p-5 shadow-sm">
        <p class="text-sm font-semibold">Last updated</p>
        <p class="mt-2 text-base">
          {{ formattedUpdated }}
        </p>
      </div>

      <button
        v-if="!trackingActive"
        type="button"
        class="block w-full rounded-2xl bg-[var(--app-purple)] px-4 py-4 text-center text-sm font-semibold text-white shadow-sm"
        @click="startTracking"
      >
        Start tracking
      </button>

      <button
        v-else
        type="button"
        class="block w-full rounded-2xl bg-red-600 px-4 py-4 text-center text-sm font-semibold text-white shadow-sm"
        @click="stopTracking"
      >
        Stop tracking
      </button>

      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        class="block w-full rounded-2xl border border-[var(--app-border)] bg-white px-4 py-4 text-center text-sm font-semibold text-[var(--app-text)] shadow-sm"
      >
        Open live map
      </a>
    </div>
  </main>
</template>