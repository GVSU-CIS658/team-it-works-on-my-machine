<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <p>Study Group Portal</p>
    <p>🦍 Great Gorge Global University</p>
    <p>Created by: Lloyd, Lilly, Amine, Chris</p>
    <p>&copy; {{ currentYear }}</p>
  </footer>
</template>

<style scoped lang="sass" src="../styles/pages/footer.sass"></style>
