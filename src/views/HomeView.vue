<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import WalkMap from '@/components/WalkMap.vue'
import BottomNav from '@/components/BottomNav.vue'
import StatCard from '@/components/StatCard.vue'
import { routeData } from '@/data/routes'
import { API_BASE_URL } from '@/config'

const donateUrl = 'https://www.justgiving.com/page/75km-in-32hours/'
const currentTab = ref('overview')
const liveCoords = ref(routeData.overview.start.coords)
const trackingStatus = ref('Waiting for live location...')
let pollTimer = null

const activeTabData = computed(() => routeData[currentTab.value])

const statCards = computed(() => {
  const data = activeTabData.value

  return [
    {
      label: 'Progress',
      value: `${data.percent}% complete`,
    },
    {
      label: 'Remaining',
      value: `${data.remainingKm.toFixed(1)}km to go`,
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
  } catch (error) {
    trackingStatus.value = 'Failed to fetch live location'
  }
}

onMounted(() => {
  fetchLatestLocation()
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

    <ProgressBar
      :title="activeTabData.label"
      :percent="activeTabData.percent"
      :remaining-km="activeTabData.remainingKm"
      :completed-km="activeTabData.completedKm"
      :total-km="activeTabData.totalKm"
    />

    <section class="px-4 pt-4">
      <div class="rounded-2xl border border-[var(--app-border)] bg-white px-4 py-3 text-sm text-[var(--app-muted)] shadow-sm">
        {{ trackingStatus }}
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
          :live-coords="liveCoords"
        />
      </div>
    </section>

    <BottomNav
      :current-tab="currentTab"
      @change="handleTabChange"
    />
  </main>
</template>