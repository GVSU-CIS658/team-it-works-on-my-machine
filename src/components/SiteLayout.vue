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

        <v-menu open-on-hover location="bottom end" offset="8">
          <template #activator="{ props }">
            <div
              class="section-user"
              aria-label="Current user"
              v-bind="props">
              <v-icon icon="mdi-account-circle" aria-hidden="true" />
              <span>{{ auth.displayName }}</span>
            </div>
          </template>

          <v-list class="section-user-dropdown">
            <v-list-item to="/profile" title="Profile" />
          </v-list>
        </v-menu>
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
