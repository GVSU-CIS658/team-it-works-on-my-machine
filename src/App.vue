<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AuthLayout from './components/AuthLayout.vue'
import SiteLayout from './components/SiteLayout.vue'

const route = useRoute();
const activeLayout = computed(() => route.meta.layout ?? 'site');
</script>

<template>
  <v-app>
    <SiteLayout v-if="activeLayout === 'site'">
      <router-view />
    </SiteLayout>
    <AuthLayout v-else-if="activeLayout === 'auth'">
      <router-view />
    </AuthLayout>
    <router-view v-else />
  </v-app>
</template>
