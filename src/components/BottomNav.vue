<script setup>
defineProps({
  currentTab: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['change'])

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'dayOne', label: 'Day One' },
  { id: 'dayTwo', label: 'Day Two' },
]
</script>

<template>
  <nav class="glass-panel flex items-center gap-2 rounded-full p-2 shadow-lg">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      @click="emit('change', tab.id)"
      :class="[
        'rounded-full px-4 py-3 text-sm font-semibold transition min-w-[110px]',
        currentTab === tab.id
          ? 'bg-[var(--app-purple)] text-white'
          : 'bg-white/50 text-[var(--app-purple)]'
      ]"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>