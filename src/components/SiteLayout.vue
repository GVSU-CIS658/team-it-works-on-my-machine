<script setup>
  import { useRouter } from 'vue-router'

  import Footer from './Footer.vue'
  import { useAuthStore } from '../stores/auth'

  const auth = useAuthStore()
  const router = useRouter()

  async function logout() {
    await auth.logout()
    router.push('/login')
  }
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
              <span>{{ auth.username }}</span>
            </div>
          </template>

          <v-list class="section-user-dropdown">
            <v-list-item to="/profile" title="Profile" />
            <v-divider />
            <v-list-item to="/help" title="Help" />
            <v-list-item title="Logout" @click="logout" />
          </v-list>
        </v-menu>
      </div>
    </header>

    <main class="section-main">
      <slot />
    </main>

    <Footer />
  </div>
</template>
