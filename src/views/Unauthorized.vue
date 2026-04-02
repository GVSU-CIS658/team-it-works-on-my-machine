<script setup>
import StatusPage from '../components/StatusPage.vue'

const statusPageData = {
  statusCode: '403',
  statusLabel: 'Unauthorized',
  pageTitle: 'This page is off-limits.',
  pageMessage:
    'Your account signed in successfully, but it does not have permission to open this page. Head back to a safe route and continue from there.',
  helpNotes: [
    { key: 'allowed-route', text: 'switch back to a page your role is allowed to access.' },
    { key: 'ask-admin', text: 'ask an instructor or admin if you expected to see this content.' },
    { key: 'avoid-bookmarks', text: 'avoid using old bookmarks for pages tied to restricted data.' },
  ],
  pageActions: [
    { key: 'login', label: 'Return to login', kind: 'link', to: '/login', styleType: 'primary' },
  ],
  includeBackAction: true,
  backActionMode: 'replace',
  compactSingleAction: true,
}
</script>

<template>
  <StatusPage v-bind="statusPageData" />
</template>
