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
  <div class="glass-panel flex items-center rounded-full px-1.5 py-1.5 shadow-lg whitespace-nowrap">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      @click="emit('change', tab.id)"
      :class="[
        'flex-1 text-center rounded-full px-4 py-2 text-sm font-medium leading-none transition whitespace-nowrap',
        currentTab === tab.id
          ? 'bg-[var(--app-purple)] text-white shadow-md'
          : 'text-[var(--app-purple)] hover:bg-white/60',
        tab.id === 'overview' && currentTab === 'dayTwo' ? '!pr-0' : '',
        tab.id === 'dayTwo' && currentTab === 'overview' ? '!pl-0' : '',
      ]"
    >
      {{ tab.label }}
    </button>
  </div>
</template>