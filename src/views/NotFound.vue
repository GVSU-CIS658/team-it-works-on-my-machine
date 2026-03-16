<script setup>
import StatusPage from '../components/StatusPage.vue'

const statusPageData = {
  statusCode: '404',
  statusLabel: 'Not Found',
  pageTitle: 'Did you lose your place?',
  pageMessage:
    'This route reads like half-finished notes from a lecture you missed. The page may be outdated, mistyped, or it may never have existed at all.',
  helpNotes: [
    { key: 'check-link', text: 'check the url for a typo or a missing route segment.' },
    { key: 'use-nav', text: 'use the main navigation instead of an older saved link.' },
    { key: 'known-page', text: 'return to a known page and navigate from there.' },
  ],
  pageActions: [
    { key: 'login', label: 'Return to login', kind: 'link', to: '/login', styleType: 'primary' },
    { key: 'dashboard', label: 'Open dashboard', kind: 'link', to: '/dashboard', styleType: 'secondary' },
  ],
  includeBackAction: true,
}
</script>

<template>
  <StatusPage v-bind="statusPageData" />
</template>
