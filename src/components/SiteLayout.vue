<script setup>
  import { useAuthStore } from '../stores/auth'
  const auth = useAuthStore()
  auth.hydrate()
</script>

<template>
  <div class="section-shell">
    <header class="section-header">
      <div class="section-header-inner">
        <RouterLink class="section-brand" to="/login">
          <span class="section-brand-mark">SGP</span>
          <span class="section-brand-text">
            <strong>Study Group Portal</strong>
            <small>Student collaboration space</small>
          </span>
        </RouterLink>

        <nav class="section-nav" aria-label="Primary">
          <RouterLink to="/login">Login</RouterLink>
          <RouterLink to="/dashboard">Dashboard</RouterLink>
          <RouterLink to="/groups">Groups</RouterLink>
          <RouterLink to="/sessions">Sessions</RouterLink>
        </nav>

        <div class="section-user" aria-label="Current user">
          <span class="material-symbols-outlined" aria-hidden="true">account_circle</span>
          <span>{{ auth.displayName }}</span>
        </div>
      </div>
    </header>

    <main class="section-main">
      <slot />
    </main>

    <footer class="section-footer">
      <p>Study Group Portal</p>
      <p>Shared academic planning, groups, and sessions.</p>
    </footer>
  </div>
</template>

