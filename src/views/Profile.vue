<script setup>
import { reactive, ref } from 'vue'

import { DEFAULT_ROLE, STUDY_MAJORS, USER_ROLES } from '../models/user'

const isEditing = ref(false)
const roleOptions = Object.values(USER_ROLES)
const studyMajorOptions = Object.values(STUDY_MAJORS)

const profile = reactive({
  username: 'Guest',
  email: 'guest@example.edu',
  firstName: 'Guest',
  lastName: 'User',
  role: DEFAULT_ROLE,
  studyMajor: STUDY_MAJORS.UNDECLARED,
})

const draftProfile = reactive({ ...profile })

function startEditing() {
  Object.assign(draftProfile, profile)
  isEditing.value = true
}

function saveProfile() {
  Object.assign(profile, draftProfile)
  isEditing.value = false
}

function cancelEditing() {
  Object.assign(draftProfile, profile)
  isEditing.value = false
}
</script>

<template>
  <div class="profile-view">
    <section class="profile-hero">
      <h1>{{ profile.username }}</h1>
    </section>

      <div class="profile-card profile-card--identity">
        <h2>Profile</h2>
        <dl class="profile-fields">
          <div>
            <dt>Username</dt>
            <dd v-if="!isEditing">{{ profile.username }}</dd>
            <v-text-field v-else v-model="draftProfile.username" variant="outlined" density="comfortable" hide-details />
          </div>
          <div>
            <dt>Email</dt>
            <dd v-if="!isEditing">{{ profile.email }}</dd>
            <v-text-field v-else v-model="draftProfile.email" variant="outlined" density="comfortable" hide-details />
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
            <dd v-if="!isEditing">{{ profile.role }}</dd>
            <v-select
              v-else
              v-model="draftProfile.role"
              :items="roleOptions"
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </div>
        </dl>

        <div class="profile-actions">
          <v-btn
            v-if="!isEditing"
            class="button-pill profile-action-button"
            variant="flat"
            @click="startEditing">
            EDIT
          </v-btn>

          <template v-else>
            <v-btn
              class="button-pill profile-action-button"
              variant="flat"
              @click="saveProfile">
              SAVE
            </v-btn>
            <v-btn
              class="button-pill profile-action-button"
              variant="flat"
              @click="cancelEditing">
              CANCEL
            </v-btn>
          </template>
        </div>
      </div>
  </div>
</template>

<style scoped lang="sass" src="../styles/pages/profile.sass"></style>
