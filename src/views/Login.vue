<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import desktopImage from '../assets/images/desktop.png'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const activePanel = ref(null)

function openPanel(panelName) {
  activePanel.value = panelName
}

function closePanel() {
  activePanel.value = null
}

function loginInDevelopmentMode() {
  auth.login({
    displayName: 'Develop Mode',
    firstName: 'Develop',
    lastName: 'Mode',
    email: 'developer@test.com',
  })

  const redirectTarget = typeof route.query.redirect === 'string'
    ? route.query.redirect
    : '/dashboard'

  router.push(redirectTarget)
}

function saveSignupPlaceholder() {
  closePanel()
}
</script>

<template>
  <div class="login-view">
    <section class="login-card login-card--actions" aria-label="Authentication options">
      <span class="section-brand-mark">SGP</span>
      <span class="section-brand-text">
        <strong>Study Group Portal</strong>
        <small>Student collaboration space</small>
      </span>
      <h1>Welcome</h1>
      <div class="login-actions">
        <v-btn class="button-pill login-action-button" variant="flat" @click="openPanel('login')">
          Login
        </v-btn>
        <v-btn class="button-pill login-action-button" variant="flat" @click="openPanel('signup')">
          Signup
        </v-btn>
      </div>
    </section>

    <section
      class="login-stage"
      :class="{
        'login-stage--login': activePanel === 'login',
        'login-stage--signup': activePanel === 'signup',
      }"
      aria-label="Authentication form stage">
      <article class="login-card login-panel login-card--login">
        <h2>Login</h2>
        <v-btn class="button-pill login-action-button" variant="flat" @click="loginInDevelopmentMode">
          Login
        </v-btn>
      </article>

      <article class="login-card login-panel login-card--signup">
        <h2>Signup</h2>
        <v-btn class="button-pill login-action-button" variant="flat" @click="saveSignupPlaceholder">
          Save
        </v-btn>
      </article>

      <section class="login-card login-card--image" aria-label="Application preview">
        <img class="login-image" :src="desktopImage" alt="Application desktop preview" />
      </section>
    </section>
  </div>
</template>

<style scoped lang="sass" src="../styles/pages/login.sass"></style>
