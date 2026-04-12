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
  <nav class="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--app-border)] bg-white">
    <div class="mx-auto grid max-w-md grid-cols-3 gap-2 px-3 py-3">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        @click="emit('change', tab.id)"
        :class="[
          'rounded-2xl px-3 py-3 text-sm font-semibold transition',
          currentTab === tab.id
            ? 'bg-[var(--app-purple)] text-white'
            : 'bg-[var(--app-purple-soft)] text-[var(--app-purple)]'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>
  </nav>
</template>