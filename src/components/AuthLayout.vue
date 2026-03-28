<script setup>
import Footer from './Footer.vue'
</script>

<template>
  <div class="auth-shell">
    <main class="auth-main">
      <slot />
    </main>

    <slot name="footer">
      <Footer />
    </slot>
  </div>
</template>
