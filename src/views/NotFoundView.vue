<template>
    <main class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--app-bg)] px-4">
      <div class="glass-panel w-full max-w-lg rounded-3xl px-6 py-8 text-center shadow-xl">
        <p class="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--app-purple)]">
          Wrong path
        </p>
  
        <h1 class="mt-3 text-4xl font-bold text-[var(--app-text)]">
          404
        </h1>
  
        <p class="mt-4 text-lg font-semibold text-[var(--app-text)]">
          That’s definitely the wrong path.
        </p>
  
        <p class="mt-2 text-sm text-[var(--app-muted)]">
          Looks like you’ve wandered off route. Let’s get you back on track.
        </p>
  
        <RouterLink
          to="/"
          class="mt-6 inline-flex rounded-full bg-[var(--app-purple)] px-5 py-3 text-sm font-semibold text-white shadow-md"
        >
          Get back on track
        </RouterLink>
      </div>
    </main>
</template>