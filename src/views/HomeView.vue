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
const showStats = ref(false)
const menuOpen = ref(false)

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
      tone: 'default',
    },
    {
      label: 'Remaining',
      value: `${progress.remainingKm.toFixed(1)}km to go`,
      tone: 'default',
    },
    {
      label: 'Route status',
      value: progress.routeStatus,
      tone:
        progress.routeStatus === 'Off route'
          ? 'danger'
          : progress.routeStatus === 'On route'
            ? 'success'
            : 'default',
    },
    {
      label: 'Distance from route',
      value: `${(progress.offRouteDistanceKm * 1000).toFixed(0)}m`,
      tone: 'default',
    },
  ]
})

const statsTopClass = computed(() => {
  if (menuOpen.value) {
    return 'top-[360px] sm:top-[260px]'
  }

  return 'top-[210px] sm:top-[210px]'
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
  <main class="relative h-screen w-full overflow-hidden bg-[var(--app-bg)]">
    <template v-if="activeTabData">
      <WalkMap
        :tab-data="activeTabData"
        :live-coords="liveCoords || activeTabData.start.coords"
      />

      <div class="pointer-events-none absolute inset-0 z-20">
        <div class="pointer-events-auto absolute left-3 right-3 top-3">
          <AppHeader
            :donate-url="donateUrl"
            :menu-open="menuOpen"
            @toggle-menu="menuOpen = !menuOpen"
          />
        </div>

        <div class="pointer-events-auto absolute left-3 right-3 top-24 flex flex-col gap-3 md:right-[280px]">
          <ProgressBar
            :title="activeTabData.label"
            :percent="progressData.percent"
            :remaining-km="progressData.remainingKm"
            :completed-km="progressData.completedKm"
            :total-km="progressData.totalKm"
          />

          <div class="glass-panel rounded-2xl px-4 py-3 text-sm text-[var(--app-muted)] shadow-sm">
            {{ routeError || trackingStatus }}
          </div>
        </div>

        <transition name="fade">
          <aside
            v-if="menuOpen"
            class="pointer-events-auto absolute right-3 top-24 w-[280px] max-w-[calc(100%-24px)] rounded-3xl border border-white/20 bg-[rgba(124,58,237,0.82)] p-4 text-white shadow-xl backdrop-blur-xl"
          >
            <p class="text-sm font-semibold uppercase tracking-[0.12em] text-white/80">
              Display options
            </p>

            <div class="mt-4 rounded-2xl bg-white/12 p-3">
              <label class="flex cursor-pointer items-center gap-3">
                <input
                  v-model="showStats"
                  type="checkbox"
                  class="peer sr-only"
                />

                <span
                  class="flex h-6 w-6 items-center justify-center rounded-md border border-white/40 bg-white/10 transition peer-checked:border-white peer-checked:bg-white peer-checked:text-[var(--app-purple)]"
                >
                  <svg
                    class="h-4 w-4 opacity-0 transition peer-checked:opacity-100"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.704 5.29a1 1 0 010 1.42l-7.2 7.2a1 1 0 01-1.415 0l-3.6-3.6a1 1 0 111.414-1.42l2.893 2.894 6.493-6.494a1 1 0 011.415 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>

                <span class="text-base font-medium text-white">
                  Show tracker stats
                </span>
              </label>
            </div>
          </aside>
        </transition>

        <section
          v-if="showStats"
          :class="[
            'pointer-events-auto absolute right-3 z-20 flex w-[180px] flex-col gap-3 sm:w-[220px] md:w-[240px]',
            statsTopClass,
          ]"
        >
          <StatCard
            v-for="card in statCards"
            :key="card.label"
            :label="card.label"
            :value="card.value"
            :tone="card.tone"
          />
        </section>

        <div class="pointer-events-auto absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
          <BottomNav
            :current-tab="currentTab"
            @change="handleTabChange"
          />
        </div>
      </div>
    </template>

    <template v-else>
      <section class="flex h-full items-center justify-center px-4">
        <div class="glass-panel rounded-2xl px-4 py-6 text-sm text-[var(--app-muted)] shadow-sm">
          Loading route...
        </div>
      </section>
    </template>
  </main>
</template>