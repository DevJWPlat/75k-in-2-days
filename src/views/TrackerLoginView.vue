<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')

function handleLogin() {
  error.value = ''

  if (username.value === 'admin' && password.value === 'WaJ6utN3ic7M8A') {
    localStorage.setItem('tracker-auth', 'true')
    router.push('/tracker')
    return
  }

  error.value = 'Incorrect username or password'
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-4">
    <div class="glass-panel w-full max-w-md rounded-3xl p-6 shadow-xl">
      <p class="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--app-purple)]">
        Tracker access
      </p>

      <h1 class="mt-3 text-3xl font-bold text-[var(--app-text)]">
        Sign in
      </h1>

      <p class="mt-2 text-sm text-[var(--app-muted)]">
        This page is only for the person running live tracking.
      </p>

      <form class="mt-6 space-y-4" @submit.prevent="handleLogin">
        <div>
          <label class="mb-2 block text-sm font-medium text-[var(--app-text)]">
            Username
          </label>
          <input
            v-model="username"
            type="text"
            class="w-full rounded-2xl border border-[var(--app-border)] bg-white px-4 py-3 text-sm outline-none"
            autocomplete="username"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-[var(--app-text)]">
            Password
          </label>
          <input
            v-model="password"
            type="password"
            class="w-full rounded-2xl border border-[var(--app-border)] bg-white px-4 py-3 text-sm outline-none"
            autocomplete="current-password"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">
          {{ error }}
        </p>

        <button
          type="submit"
          class="w-full rounded-2xl bg-[var(--app-purple)] px-4 py-3 text-sm font-semibold text-white shadow-sm"
        >
          Enter tracker
        </button>
      </form>
    </div>
  </main>
</template>