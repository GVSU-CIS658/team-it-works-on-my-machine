<template>
  <v-app>
    <SiteLayout>
      <router-view />
    </SiteLayout>
  </v-app>
</template>

<script setup>
import SiteLayout from './components/SiteLayout.vue'
</script>
