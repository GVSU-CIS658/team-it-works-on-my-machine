<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { STUDY_MAJORS, createEmptyUserProfile } from '../models/user'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const isEditing = ref(false)
const isDeleting = ref(false)
const studyMajorOptions = Object.values(STUDY_MAJORS)

const profile = computed(() => auth.user ?? createEmptyUserProfile())
const draftProfile = reactive(createEmptyUserProfile())

function startEditing() {
  auth.clearError()
  Object.assign(draftProfile, profile.value)
  isDeleting.value = false
  isEditing.value = true
}

async function saveProfile() {
  try {
    await auth.updateUserProfile(draftProfile)
    isEditing.value = false
  } catch {
    // The auth store maps Firebase errors into auth.error for display.
  }
}

function cancelEditing() {
  auth.clearError()
  Object.assign(draftProfile, profile.value)
  isEditing.value = false
}

function startDeleting() {
  auth.clearError()
  isEditing.value = false
  isDeleting.value = true
}

function cancelDeleting() {
  auth.clearError()
  isDeleting.value = false
}

async function confirmDeleteProfile() {
  try {
    await auth.deleteCurrentUser()
    isDeleting.value = false
    router.push('/login')
  } catch {
    // The auth store maps Firebase errors into auth.error for display.
  }
}
</script>

<template>
  <div class="profile-view">
    <section class="profile-hero">
      <h1>{{ profile.username }}</h1>
    </section>

      <div class="profile-card profile-card--identity">
        <h2>Profile</h2>
        <dl v-if="!isDeleting" class="profile-fields">
          <div>
            <dt>Username</dt>
            <dd v-if="!isEditing">{{ profile.username }}</dd>
            <v-text-field v-else v-model="draftProfile.username" variant="outlined" density="comfortable" hide-details />
          </div>
          <div>
            <dt>Email</dt>
            <dd>{{ profile.email }}</dd>
          </div>
          <div>
            <dt>First Name</dt>
            <dd v-if="!isEditing">{{ profile.firstName }}</dd>
            <v-text-field v-else v-model="draftProfile.firstName" variant="outlined" density="comfortable" hide-details />
          </div>
          <div>
            <dt>Last Name</dt>
            <dd v-if="!isEditing">{{ profile.lastName }}</dd>
            <v-text-field v-else v-model="draftProfile.lastName" variant="outlined" density="comfortable" hide-details />
          </div>
          <div>
            <dt>Study Major</dt>
            <dd v-if="!isEditing">{{ profile.studyMajor }}</dd>
            <v-select
              v-else
              v-model="draftProfile.studyMajor"
              :items="studyMajorOptions"
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </div>
          <div>
            <dt>Role</dt>
            <dd>{{ profile.role }}</dd>
          </div>
        </dl>
        <p v-if="auth.error && !isDeleting" class="profile-error-message">
          {{ auth.error }}
        </p>

        <div v-if="isDeleting" class="profile-delete-confirmation">
          <p>
            Are you sure you want to remove yourself?<br />
            There is no going back from this!
          </p>
          <p v-if="auth.error" class="profile-delete-error">
            {{ auth.error }}
          </p>
          <div class="profile-delete-actions">
            <v-btn
              class="button-pill profile-delete-button profile-delete-button--confirm"
              variant="flat"
              :loading="auth.isLoading"
              @click="confirmDeleteProfile">
              Yes, I am Outta here!
            </v-btn>
            <v-btn
              class="button-pill profile-delete-button profile-delete-button--cancel"
              variant="flat"
              :disabled="auth.isLoading"
              @click="cancelDeleting">
              Oh, No!, let's go back!
            </v-btn>
          </div>
        </div>

        <div v-else class="profile-actions">
          <v-btn
            v-if="!isEditing"
            class="button-pill profile-action-button"
            variant="flat"
            :disabled="auth.isLoading"
            @click="startEditing">
            EDIT
          </v-btn>
          <v-btn
            v-if="!isEditing"
            class="button-pill profile-action-button profile-delete-action-button"
            variant="flat"
            aria-label="Delete profile"
            :disabled="auth.isLoading"
            @click="startDeleting">
            <v-icon icon="mdi-trash-can-outline" />
          </v-btn>

          <template v-else>
            <v-btn
              class="button-pill profile-action-button"
              variant="flat"
              :loading="auth.isLoading"
              @click="saveProfile">
              SAVE
            </v-btn>
            <v-btn
              class="button-pill profile-action-button"
              variant="flat"
              :disabled="auth.isLoading"
              @click="cancelEditing">
              CANCEL
            </v-btn>
          </template>
        </div>
      </div>
  </div>
</template>

<style scoped lang="sass" src="../styles/pages/profile.sass"></style>
