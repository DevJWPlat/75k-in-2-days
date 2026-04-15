<script setup>
import { computed, onMounted } from 'vue'
import { useTracking } from '@/composables/useTracking'
import { useRouter } from 'vue-router'

const {
  liveCoords,
  trackingActive,
  trackingError,
  lastUpdated,
  pointerVisible,
  startTracking,
  stopTracking,
  fetchServerLocationState,
  setPointerVisibility,
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

async function hidePointer() {
  await setPointerVisibility(false)
}

async function showPointer() {
  await setPointerVisibility(true)
}

onMounted(async () => {
  try {
    await fetchServerLocationState()
  } catch (error) {
    console.error(error)
  }
})



const router = useRouter()

function logout() {
  localStorage.removeItem('tracker-auth')
  router.push('/tracker-login')
}
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

      <div class="rounded-3xl border border-[var(--app-border)] bg-white p-5 shadow-sm">
        <p class="text-sm font-semibold">Map pointer</p>
        <p class="mt-2 text-sm text-[var(--app-muted)]">
          {{ pointerVisible ? 'Visible on public map' : 'Hidden on public map' }}
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

      <button
        v-if="pointerVisible"
        type="button"
        class="block w-full rounded-2xl border border-[var(--app-border)] bg-white px-4 py-4 text-center text-sm font-semibold text-[var(--app-text)] shadow-sm"
        @click="hidePointer"
      >
        Hide map pointer
      </button>

      <button
        v-else
        type="button"
        class="block w-full rounded-2xl border border-[var(--app-border)] bg-white px-4 py-4 text-center text-sm font-semibold text-[var(--app-text)] shadow-sm"
        @click="showPointer"
      >
        Show map pointer
      </button>

      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        class="block rounded-2xl border border-[var(--app-border)] bg-white px-4 py-4 text-center text-sm font-semibold text-[var(--app-text)] shadow-sm"
      >
        Open live map
      </a>
      <button
        type="button"
        class="block w-full rounded-2xl border border-[var(--app-border)] bg-white px-4 py-4 text-center text-sm font-semibold text-[var(--app-text)] shadow-sm"
        @click="logout"
      >
        Log out
</button>
    </div>
  </main>
</template>