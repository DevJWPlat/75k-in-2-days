<script setup>
import { computed, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import WalkMap from '@/components/WalkMap.vue'
import BottomNav from '@/components/BottomNav.vue'
import StatCard from '@/components/StatCard.vue'
import { routeData } from '@/data/routes'

const donateUrl = 'https://www.justgiving.com/page/75km-in-32hours/'

const currentTab = ref('overview')

const liveCoords = ref(routeData.overview.start.coords)

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

    <section class="grid grid-cols-2 gap-3 px-4 py-4">
      <StatCard
        v-for="card in statCards"
        :key="card.label"
        :label="card.label"
        :value="card.value"
      />
    </section>

    <section class="flex-1 px-4 pb-28">
      <div class="h-[calc(100vh-260px)] min-h-[420px] overflow-hidden rounded-3xl border border-[var(--app-border)] bg-white shadow-sm">
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