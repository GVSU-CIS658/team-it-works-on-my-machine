<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import desktopImage from '../assets/images/desktop.png'
import googleIcon from '../assets/images/google-g.svg'
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
  auth.clearError()
  activePanel.value = panelName
}

function closePanel() {
  auth.clearError()
  activePanel.value = null
}

function getRedirectTarget() {
  return typeof route.query.redirect === 'string'
    ? route.query.redirect
    : '/dashboard'
}

async function loginWithEmail() {
  auth.clearError()

  if (!email.value.trim() || !password.value) {
    auth.error = 'Email and password are required.'
    return
  }

  try {
    await auth.login({
      email: email.value.trim(),
      password: password.value,
      rememberMe: rememberMe.value,
    })

    router.push(getRedirectTarget())
  } catch {
    // The auth store maps Firebase errors into auth.error for display.
  }
}

async function sendPasswordReset() {
  auth.clearError()
  const normalizedEmail = email.value.trim()

  if (!normalizedEmail) {
    auth.error = 'Enter your email first.'
    return
  }

  if (!isValidEmailAddress(normalizedEmail)) {
    auth.error = 'Enter a valid email address.'
    return
  }

  try {
    await auth.sendPasswordReset(normalizedEmail)
  } catch {
    // The auth store maps Firebase errors into auth.error for display.
  }
}

async function loginWithGoogle() {
  auth.clearError()

  try {
    await auth.loginWithGoogle()
    router.push(getRedirectTarget())
  } catch {
    // The auth store maps Firebase errors into auth.error for display.
  }
}

async function signupWithEmail() {
  auth.clearError()
  const normalizedEmail = signupEmail.value.trim()
  const normalizedUsername = signupUsername.value.trim()

  if (!normalizedUsername) {
    auth.error = 'Username is required.'
    return
  }

  if (!signupPassword.value) {
    auth.error = 'Password is required.'
    return
  }

  if (signupPassword.value.length < 6) {
    auth.error = 'Password should be at least 6 characters.'
    return
  }

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

  try {
    await auth.signup({
      username: normalizedUsername,
      email: normalizedEmail,
      password: signupPassword.value,
    })

    router.push(getRedirectTarget())
  } catch {
    // The auth store maps Firebase errors into auth.error for display.
  }
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
        <v-btn class="button-pill login-action-button" variant="flat" :disabled="auth.isLoading" @click="openPanel('login')">
          Login
        </v-btn>
        <v-btn class="button-pill login-action-button" variant="flat" :disabled="auth.isLoading" @click="openPanel('signup')">
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
          <v-btn
            class="login-forgot-button"
            variant="text"
            :disabled="auth.isLoading"
            @click="sendPasswordReset">
            Forgot Password
          </v-btn>
        </div>
        <p v-if="auth.error && activePanel === 'login'" class="login-error-message">
          {{ auth.error }}
        </p>
        <p v-if="auth.message && activePanel === 'login'" class="login-success-message">
          {{ auth.message }}
        </p>
        <div class="login-primary-actions">
          <v-btn
            class="button-pill login-action-button login-primary-action-button"
            variant="flat"
            :loading="auth.isLoading"
            @click="loginWithEmail">
            Login
          </v-btn>
          <v-btn class="button-pill login-action-button login-primary-action-button" variant="flat" :disabled="auth.isLoading" @click="closePanel">
            Cancel
          </v-btn>
        </div>
        <div class="login-divider" aria-hidden="true">
          <span>OR CONTINUE WITH</span>
        </div>
        <div class="login-social-row" aria-label="Social login options">
          <v-btn
            class="button-pill login-google-button"
            variant="flat"
            aria-label="Continue with Google"
            :loading="auth.isLoading"
            @click="loginWithGoogle">
            <img class="login-provider-icon" :src="googleIcon" alt="Continue with Google" />
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
          <v-btn
            class="button-pill login-action-button signup-action-button"
            variant="flat"
            :loading="auth.isLoading"
            @click="signupWithEmail">
            Save
          </v-btn>
          <v-btn class="button-pill login-action-button signup-action-button" variant="flat" :disabled="auth.isLoading" @click="closePanel">
            Cancel
          </v-btn>
        </div>
        <p v-if="auth.error && activePanel === 'signup'" class="login-error-message">
          {{ auth.error }}
        </p>
      </div>

      <section class="login-card login-card--image" aria-label="Application preview">
        <img class="login-image" :src="desktopImage" alt="Application desktop preview" />
      </section>
    </section>
  </div>
</template>

<style scoped lang="sass" src="../styles/pages/login.sass"></style>
