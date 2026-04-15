<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import WalkMap from '@/components/WalkMap.vue'
import BottomNav from '@/components/BottomNav.vue'
import StatCard from '@/components/StatCard.vue'
import poweredByUrl from '@/assets/images/powered-by.png'
import poweredByWhiteUrl from '@/assets/images/powered-by-white.png'
import platformLogoUrl from '@/assets/images/platform.png'
import starbucksLogoUrl from '@/assets/images/starbucks .png'
import queenswayLogoUrl from '@/assets/images/queensway.png'
import { API_BASE_URL } from '@/config'
import { loadRouteData } from '@/utils/loadRouteData'
import { clampPercent, getNearestPointInfo } from '@/utils/routeMath'

const donateUrl = 'https://www.justgiving.com/page/75km-in-32hours/'

const STEPS_PER_KM = 1400
const ESTIMATED_SPEED_KMH = 5
const ESTIMATED_PACE_MIN_PER_KM = 60 / ESTIMATED_SPEED_KMH

const currentTab = ref('overview')
const routeData = ref(null)
const liveCoords = ref(null)
const trackingStatus = ref('Waiting for live location...')
const routeError = ref('')
const pointerVisible = ref(true)

const menuOpen = ref(false)
const showOverview = ref(true)
const showProgressCard = ref(false)
const showRemainingCard = ref(false)
const showRouteStatusCard = ref(false)
const showOffRouteCard = ref(false)
const showStepsCard = ref(false)
const showAveragePaceCard = ref(false)
const showEtrCard = ref(false)
const showEtaCard = ref(false)
const useSatelliteMap = ref(false)

let pollTimer = null

const activeTabData = computed(() => {
  if (!routeData.value) return null
  return routeData.value[currentTab.value]
})

const safeLiveCoords = computed(() => {
  if (!activeTabData.value) return null

  if (!pointerVisible.value) {
    return routeData.value?.overview?.start?.coords || activeTabData.value.start.coords
  }

  return liveCoords.value || activeTabData.value.start.coords
})

function formatDuration(totalHours) {
  const safeHours = Math.max(0, totalHours)
  const hours = Math.floor(safeHours)
  const minutes = Math.round((safeHours - hours) * 60)

  if (hours <= 0) {
    return `${minutes}m`
  }

  if (minutes === 60) {
    return `${hours + 1}h 0m`
  }

  return `${hours}h ${minutes}m`
}

function formatEta(totalHours) {
  const etaDate = new Date(Date.now() + Math.max(0, totalHours) * 60 * 60 * 1000)

  return etaDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPace(minsPerKm) {
  const totalMinutes = Math.max(0, minsPerKm)
  const mins = Math.floor(totalMinutes)
  const secs = Math.round((totalMinutes - mins) * 60)

  if (secs === 60) {
    return `${mins + 1}:00/km`
  }

  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}/km`
}

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
      isComplete: false,
    }
  }

  const totalKm = tab.totalKm || 0

  if (!pointerVisible.value) {
    return {
      percent: 0,
      completedKm: 0,
      remainingKm: totalKm,
      totalKm,
      offRouteDistanceKm: 0,
      routeStatus: 'On track',
      isComplete: false,
    }
  }

  if (!liveCoords.value || !tab.path?.length || !tab.cumulativeDistances?.length) {
    return {
      percent: 0,
      completedKm: 0,
      remainingKm: totalKm,
      totalKm,
      offRouteDistanceKm: 0,
      routeStatus: 'Waiting for live location',
      isComplete: false,
    }
  }

  const nearest = getNearestPointInfo(tab.path, liveCoords.value)
  const completedKm = Math.min(tab.cumulativeDistances[nearest.index] || 0, totalKm)
  const remainingKm = Math.max(0, totalKm - completedKm)
  const percent = totalKm > 0 ? clampPercent((completedKm / totalKm) * 100) : 0

  const isComplete = percent >= 100

  if (isComplete) {
    return {
      percent: 100,
      completedKm: totalKm,
      remainingKm: 0,
      totalKm,
      offRouteDistanceKm: 0,
      routeStatus: 'Complete',
      isComplete: true,
    }
  }

  let routeStatus = 'On track'

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
    isComplete: false,
  }
})

const stepsValue = computed(() => {
  return `~${Math.round(progressData.value.completedKm * STEPS_PER_KM).toLocaleString()}`
})

const averagePaceValue = computed(() => {
  return formatPace(ESTIMATED_PACE_MIN_PER_KM)
})

const etrValue = computed(() => {
  if (progressData.value.isComplete) return '0m'
  return formatDuration(progressData.value.remainingKm / ESTIMATED_SPEED_KMH)
})

const etaValue = computed(() => {
  if (progressData.value.isComplete) return 'Complete'
  return formatEta(progressData.value.remainingKm / ESTIMATED_SPEED_KMH)
})

const allStatCards = computed(() => {
  const progress = progressData.value
  const completeTone = progress.isComplete ? 'success' : 'default'

  return [
    {
      key: 'progress',
      label: 'Progress',
      value: `${progress.percent.toFixed(1)}%`,
      tone: completeTone,
      visible: showProgressCard.value,
    },
    {
      key: 'remaining',
      label: 'Remaining',
      value: `${progress.remainingKm.toFixed(1)}km`,
      tone: completeTone,
      visible: showRemainingCard.value,
    },
    {
      key: 'routeStatus',
      label: 'Route status',
      value: progress.routeStatus,
      tone: progress.isComplete
        ? 'success'
        : progress.routeStatus === 'Off route'
          ? 'danger'
          : progress.routeStatus === 'On track'
            ? 'success'
            : 'default',
      visible: showRouteStatusCard.value,
    },
    {
      key: 'offRoute',
      label: 'From route',
      value: `${(progress.offRouteDistanceKm * 1000).toFixed(0)}m`,
      tone: completeTone,
      visible: showOffRouteCard.value,
    },
    {
      key: 'steps',
      label: 'Steps',
      value: stepsValue.value,
      tone: completeTone,
      visible: showStepsCard.value,
    },
    {
      key: 'etr',
      label: 'ETR',
      value: etrValue.value,
      tone: completeTone,
      visible: showEtrCard.value,
    },
    {
      key: 'eta',
      label: 'ETA',
      value: etaValue.value,
      tone: completeTone,
      visible: showEtaCard.value,
    },
  ]
})

const visibleStatCards = computed(() => {
  return allStatCards.value.filter((card) => card.visible)
})

const statsGridStyle = computed(() => {
  const count = Math.min(4, Math.max(1, visibleStatCards.value.length))

  return {
    gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
  }
})

const selectedMapStyle = computed(() => {
  return useSatelliteMap.value ? 'satellite' : 'roads'
})

const menuOptions = computed(() => [
  {
    key: 'overview',
    label: 'Show Overview',
    value: showOverview.value,
    toggle: () => {
      showOverview.value = !showOverview.value
    },
  },
  {
    key: 'progress',
    label: 'Show Progress',
    value: showProgressCard.value,
    toggle: () => {
      showProgressCard.value = !showProgressCard.value
    },
  },
  {
    key: 'remaining',
    label: 'Show Remaining KM',
    value: showRemainingCard.value,
    toggle: () => {
      showRemainingCard.value = !showRemainingCard.value
    },
  },
  {
    key: 'status',
    label: 'Show route status',
    value: showRouteStatusCard.value,
    toggle: () => {
      showRouteStatusCard.value = !showRouteStatusCard.value
    },
  },
  {
    key: 'offroute',
    label: 'Show how far off route they are',
    value: showOffRouteCard.value,
    toggle: () => {
      showOffRouteCard.value = !showOffRouteCard.value
    },
  },
  {
    key: 'steps',
    label: 'Show Steps',
    value: showStepsCard.value,
    toggle: () => {
      showStepsCard.value = !showStepsCard.value
    },
  },
  {
    key: 'etr',
    label: 'Show Estimated time remaining',
    value: showEtrCard.value,
    toggle: () => {
      showEtrCard.value = !showEtrCard.value
    },
  },
  {
    key: 'eta',
    label: 'Show ETA',
    value: showEtaCard.value,
    toggle: () => {
      showEtaCard.value = !showEtaCard.value
    },
  },
])

const menuOptionsLeft = computed(() => menuOptions.value.slice(0, 4))
const menuOptionsRight = computed(() => menuOptions.value.slice(4))

function handleTabChange(tabId) {
  currentTab.value = tabId
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function toggleMenuOption(option) {
  option.toggle()
}

async function fetchLatestLocation() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/location/latest`)
    const data = await response.json()

    if (data?.location) {
      pointerVisible.value = Boolean(data.location.is_visible)

      if (
        typeof data.location.longitude === 'number' &&
        typeof data.location.latitude === 'number'
      ) {
        liveCoords.value = [
          data.location.longitude,
          data.location.latitude,
        ]
      }

      const updatedAt = new Date(data.location.updated_at)

      if (!pointerVisible.value) {
        trackingStatus.value = 'Live pointer hidden'
      } else {
        trackingStatus.value = `Live location updated at ${updatedAt.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`
      }
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

const poweredBySrc = computed(() => {
  return useSatelliteMap.value ? poweredByWhiteUrl : poweredByUrl
})

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
        :live-coords="safeLiveCoords"
        :live-visible="true"
        :map-style="selectedMapStyle"
      />

      <div class="pointer-events-none absolute inset-0 z-20">
        <div class="pointer-events-none relative mx-auto h-full w-full max-w-[1440px]">
          <div class="pointer-events-auto absolute left-3 right-3 top-3 z-30">
            <AppHeader
              :donate-url="donateUrl"
              :menu-open="menuOpen"
              @toggle-menu="toggleMenu"
            />
          </div>

          <div
            class="absolute left-3 right-3 top-24 z-20 flex flex-col gap-3 min-[767px]:right-auto min-[767px]:w-full min-[767px]:max-w-[300px]"
          >
            <ProgressBar
              v-if="showOverview"
              :title="activeTabData.label"
              :percent="progressData.percent"
              :remaining-km="progressData.remainingKm"
              :completed-km="progressData.completedKm"
              :total-km="progressData.totalKm"
              :is-complete="progressData.percent >= 100"
              :is-satellite="useSatelliteMap"
            />

            <section v-if="visibleStatCards.length" class="w-full shrink-0">
              <div
                class="grid gap-3 lg:!grid-cols-1"
                :style="statsGridStyle"
              >
                <StatCard
                  v-for="card in visibleStatCards"
                  :key="card.key"
                  :label="card.label"
                  :value="card.value"
                  :tone="card.tone"
                  :is-satellite="useSatelliteMap"
                />
              </div>
            </section>
          </div>

          <transition name="fade">
            <aside
              id="site-nav"
              v-if="menuOpen"
              class="pointer-events-auto overflow-hidden absolute right-3 top-24 z-50 w-full max-w-[calc(100%-24px)] rounded-2xl border border-white/20 bg-[rgba(124,58,237,0.92)] p-4 text-white shadow-xl backdrop-blur-xl lg:max-w-sm"
              @click.stop
            >
              <p class="text-sm font-semibold uppercase tracking-[0.12em] text-white/80">
                Display options
              </p>

              <div class="mt-4 rounded-2xl bg-white/12 p-3">
                <div class="grid grid-cols-2 gap-x-4">
                  <div class="flex flex-col gap-2">
                    <button
                      v-for="option in menuOptionsLeft"
                      :key="option.key"
                      type="button"
                      class="flex w-full items-start gap-2 text-left"
                      @click="toggleMenuOption(option)"
                    >
                      <span
                        class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition"
                        :class="option.value ? 'border-white bg-white' : 'border-white/40 bg-white/10'"
                      >
                        <svg
                          v-if="option.value"
                          class="h-3 w-3 text-[var(--app-purple)]"
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

                      <span class="text-xs font-medium leading-snug text-white">
                        {{ option.label }}
                      </span>
                    </button>
                  </div>

                  <div class="flex flex-col gap-2">
                    <button
                      v-for="option in menuOptionsRight"
                      :key="option.key"
                      type="button"
                      class="flex w-full items-start gap-2 text-left"
                      @click="toggleMenuOption(option)"
                    >
                      <span
                        class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition"
                        :class="option.value ? 'border-white bg-white' : 'border-white/40 bg-white/10'"
                      >
                        <svg
                          v-if="option.value"
                          class="h-3 w-3 text-[var(--app-purple)]"
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

                      <span class="text-xs font-medium leading-snug text-white">
                        {{ option.label }}
                      </span>
                    </button>
                  </div>
                </div>

                <div class="mt-3 border-t border-white/20 pt-3">
                  <button
                    type="button"
                    class="flex w-full items-center gap-2 text-left"
                    @click="useSatelliteMap = !useSatelliteMap"
                  >
                    <span
                      class="flex h-5 w-5 shrink-0 items-center justify-center rounded border transition"
                      :class="useSatelliteMap ? 'border-white bg-white' : 'border-white/40 bg-white/10'"
                    >
                      <svg
                        v-if="useSatelliteMap"
                        class="h-3 w-3 text-[var(--app-purple)]"
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

                    <span class="text-xs font-medium text-white">
                      Use satellite map
                    </span>
                  </button>
                </div>

                <div class="divider h-6"></div>

                <p class="text-sm font-semibold uppercase tracking-[0.12em] text-white/80 mt-6">
                  Supported by
                </p>

                <div class="border-t border-white/20 pt-3 mt-3">
                  <div class="sponsor-logos flex max-w-[280px] items-center gap-4">
                    <a
                      href="https://www.platform.team/"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="shrink-0"
                    >
                      <img
                        :src="platformLogoUrl"
                        alt="Platform"
                        class="h-5 w-auto"
                      />
                    </a>

                    <img
                      :src="starbucksLogoUrl"
                      alt="Starbucks"
                      class="starbucks-logo h-6 w-auto shrink-0"
                    />

                    <img
                      :src="queenswayLogoUrl"
                      alt="Queensway"
                      class="h-5 w-auto shrink-0"
                    />
                  </div>
                </div>
              </div>
            </aside>
          </transition>

          <div
            v-if="pointerVisible"
            class="absolute bottom-[165px] left-1/2 z-20 -translate-x-1/2"
          >
            <div
              :class="[
                'glass-panel rounded-xl px-3 py-2 text-center text-[11px] leading-none shadow-sm whitespace-nowrap',
                useSatelliteMap
                  ? 'text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
                  : 'text-[var(--app-muted)]'
              ]"
            >
              {{ routeError || trackingStatus }}
            </div>
          </div>

          <div class="pointer-events-auto absolute bottom-28 left-1/2 z-30 -translate-x-1/2">
            <BottomNav
              :current-tab="currentTab"
              @change="handleTabChange"
            />
          </div>

          <a
            href="https://www.platform.team/"
            target="_blank"
            rel="noopener noreferrer"
            class="pointer-events-auto absolute bottom-16 left-1/2 z-40 -translate-x-1/2"
          >
            <img
              :src="poweredBySrc"
              alt="Powered by"
              class="mx-auto block h-auto max-h-7 w-auto max-w-[200px] object-contain sm:max-h-10"
            />
          </a>
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

<style scoped>
@media (max-width: 449px) {
  .sponsor-logos {
    gap: 8px;
  }

  .sponsor-logos img {
    height: 14px;
  }

  .sponsor-logos .starbucks-logo {
    height: 18px;
  }
}
</style>