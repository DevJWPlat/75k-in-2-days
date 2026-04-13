<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import WalkMap from '@/components/WalkMap.vue'
import BottomNav from '@/components/BottomNav.vue'
import StatCard from '@/components/StatCard.vue'
import { API_BASE_URL } from '@/config'
import { loadRouteData } from '@/utils/loadRouteData'
import { clampPercent, getNearestPointInfo } from '@/utils/routeMath'

const donateUrl = 'https://www.justgiving.com/page/75km-in-32hours/'
const currentTab = ref('overview')
const routeData = ref(null)
const liveCoords = ref(null)
const trackingStatus = ref('Waiting for live location...')
const routeError = ref('')
let pollTimer = null

const activeTabData = computed(() => {
  if (!routeData.value) return null
  return routeData.value[currentTab.value]
})

const progressData = computed(() => {
  const tab = activeTabData.value

  if (!tab) {
    return {
      percent: 0,
      completedKm: 0,
      remainingKm: 0,
      totalKm: 0,
      offRouteDistanceKm: 0,
      routeStatus: 'No route loaded',
    }
  }

  const totalKm = tab.totalKm || 0

  if (!liveCoords.value || !tab.path?.length || !tab.cumulativeDistances?.length) {
    return {
      percent: 0,
      completedKm: 0,
      remainingKm: totalKm,
      totalKm,
      offRouteDistanceKm: 0,
      routeStatus: 'Waiting for live location',
    }
  }

  const nearest = getNearestPointInfo(tab.path, liveCoords.value)
  const completedKm = Math.min(tab.cumulativeDistances[nearest.index] || 0, totalKm)
  const remainingKm = Math.max(0, totalKm - completedKm)
  const percent = totalKm > 0 ? clampPercent((completedKm / totalKm) * 100) : 0

  let routeStatus = 'On route'

  if (nearest.distanceKm > 0.3) {
    routeStatus = 'Off route'
  } else if (nearest.distanceKm > 0.1) {
    routeStatus = 'Slightly off route'
  }

  return {
    percent,
    completedKm,
    remainingKm,
    totalKm,
    offRouteDistanceKm: nearest.distanceKm,
    routeStatus,
  }
})

const statCards = computed(() => {
  const progress = progressData.value

  return [
    {
      label: 'Progress',
      value: `${progress.percent.toFixed(1)}% complete`,
    },
    {
      label: 'Remaining',
      value: `${progress.remainingKm.toFixed(1)}km to go`,
    },
    {
      label: 'Route status',
      value: progress.routeStatus,
    },
    {
      label: 'Distance from route',
      value: `${(progress.offRouteDistanceKm * 1000).toFixed(0)}m`,
    },
  ]
})

function handleTabChange(tabId) {
  currentTab.value = tabId
}

async function fetchLatestLocation() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/location/latest`)
    const data = await response.json()

    if (data?.location) {
      liveCoords.value = [
        data.location.longitude,
        data.location.latitude,
      ]

      const updatedAt = new Date(data.location.updated_at)
      trackingStatus.value = `Live location updated at ${updatedAt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    } else {
      trackingStatus.value = 'No live location yet'
    }
  } catch {
    trackingStatus.value = 'Failed to fetch live location'
  }
}

async function initialiseRoute() {
  try {
    const loadedRouteData = await loadRouteData()
    routeData.value = loadedRouteData
    liveCoords.value = loadedRouteData.overview.start.coords
  } catch (error) {
    routeError.value = 'Failed to load route'
    console.error(error)
  }
}

onMounted(async () => {
  await initialiseRoute()
  await fetchLatestLocation()
  pollTimer = window.setInterval(fetchLatestLocation, 10000)
})

onBeforeUnmount(() => {
  if (pollTimer) {
    window.clearInterval(pollTimer)
    pollTimer = null
  }
})
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-md flex-col bg-[var(--app-bg)]">
    <AppHeader :donate-url="donateUrl" />

    <template v-if="activeTabData">
      <ProgressBar
        :title="activeTabData.label"
        :percent="progressData.percent"
        :remaining-km="progressData.remainingKm"
        :completed-km="progressData.completedKm"
        :total-km="progressData.totalKm"
      />

      <section class="px-4 pt-4">
        <div class="rounded-2xl border border-[var(--app-border)] bg-white px-4 py-3 text-sm text-[var(--app-muted)] shadow-sm">
          {{ routeError || trackingStatus }}
        </div>
      </section>

      <section class="grid grid-cols-2 gap-3 px-4 py-4">
        <StatCard
          v-for="card in statCards"
          :key="card.label"
          :label="card.label"
          :value="card.value"
        />
      </section>

      <section class="flex-1 px-4 pb-28">
        <div class="h-[calc(100vh-310px)] min-h-[420px] overflow-hidden rounded-3xl border border-[var(--app-border)] bg-white shadow-sm">
          <WalkMap
            :tab-data="activeTabData"
            :live-coords="liveCoords || activeTabData.start.coords"
          />
        </div>
      </section>

      <BottomNav
        :current-tab="currentTab"
        @change="handleTabChange"
      />
    </template>

    <template v-else>
      <section class="px-4 pt-6">
        <div class="rounded-2xl border border-[var(--app-border)] bg-white px-4 py-6 text-sm text-[var(--app-muted)] shadow-sm">
          Loading route...
        </div>
      </section>
    </template>
  </main>
</template>