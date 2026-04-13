<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import desktopImage from '../assets/images/desktop.png'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const activePanel = ref(null)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const signupUsername = ref('')
const signupPassword = ref('')
const signupEmail = ref('')
const signupEmailError = ref('')
const showSignupPassword = ref(false)

function isValidEmailAddress(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function openPanel(panelName) {
  activePanel.value = panelName
}

function closePanel() {
  activePanel.value = null
}

function loginInDevelopmentMode() {
  auth.login({
    username: 'Develop Mode',
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
  const normalizedEmail = signupEmail.value.trim()

  if (!normalizedEmail) {
    signupEmailError.value = 'Email is required.'
    return
  }

  if (!isValidEmailAddress(normalizedEmail)) {
    signupEmailError.value = 'Enter a valid email address.'
    return
  }

  signupEmail.value = normalizedEmail
  signupEmailError.value = ''
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
      <div class="login-card login-panel login-card--login">
        <h2>Login</h2>
        <div class="login-fields">
          <div class="login-field">
            <span class="login-field-label">Email</span>
            <v-text-field
              v-model="email"
              class="login-input"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-email-outline"
              hide-details
            />
          </div>
          <div class="login-field">
            <span class="login-field-label">Password</span>
            <v-text-field
              v-model="password"
              class="login-input"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              hide-details
              @click:append-inner="showPassword = !showPassword"
            />
          </div>
        </div>
        <div class="login-utility-row">
          <v-checkbox
            v-model="rememberMe"
            class="login-remember"
            label="Remember me"
            density="comfortable"
            hide-details
          />
          <v-btn class="login-forgot-button" variant="text">
            Forgot Password
          </v-btn>
        </div>
        <div class="login-primary-actions">
          <v-btn class="button-pill login-action-button login-primary-action-button" variant="flat" @click="loginInDevelopmentMode">
            Login
          </v-btn>
          <v-btn class="button-pill login-action-button login-primary-action-button" variant="flat" @click="closePanel">
            Cancel
          </v-btn>
        </div>
        <div class="login-divider" aria-hidden="true">
          <span>OR CONTINUE WITH</span>
        </div>
        <div class="login-social-row" aria-label="Social login options">
          <v-btn class="login-social-button" icon variant="text" aria-label="Facebook">
            <v-icon icon="mdi-facebook" />
          </v-btn>
          <v-btn class="login-social-button" icon variant="text" aria-label="Twitter">
            <v-icon icon="mdi-twitter" />
          </v-btn>
          <v-btn class="login-social-button" icon variant="text" aria-label="Instagram">
            <v-icon icon="mdi-instagram" />
          </v-btn>
          <v-btn class="login-social-button" icon variant="text" aria-label="Google">
            <v-icon icon="mdi-google" />
          </v-btn>
        </div>
      </div>

      <div class="login-card login-panel login-card--signup">
        <h2>Sign-up</h2>
        <div class="login-fields">
          <div class="login-field">
            <span class="login-field-label">Username</span>
            <v-text-field
              v-model="signupUsername"
              class="login-input"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account-circle"
              hide-details
            />
          </div>
          <div class="login-field">
            <span class="login-field-label">Password</span>
            <v-text-field
              v-model="signupPassword"
              class="login-input"
              :type="showSignupPassword ? 'text' : 'password'"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showSignupPassword ? 'mdi-eye-off' : 'mdi-eye'"
              hide-details
              @click:append-inner="showSignupPassword = !showSignupPassword"
            />
          </div>
          <div class="login-field">
            <span class="login-field-label">Email</span>
            <v-text-field
              v-model="signupEmail"
              class="login-input"
              type="email"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-email-outline"
              :error-messages="signupEmailError"
              hide-details="auto"
              @update:model-value="signupEmailError = ''"
            />
          </div>
        </div>
        <div class="signup-actions">
          <v-btn class="button-pill login-action-button signup-action-button" variant="flat" @click="saveSignupPlaceholder">
            Save
          </v-btn>
          <v-btn class="button-pill login-action-button signup-action-button" variant="flat" @click="closePanel">
            Cancel
          </v-btn>
        </div>
      </div>

      <section class="login-card login-card--image" aria-label="Application preview">
        <img class="login-image" :src="desktopImage" alt="Application desktop preview" />
      </section>
    </section>
  </div>
</template>

<style scoped lang="sass" src="../styles/pages/login.sass"></style>
