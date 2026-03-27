<script setup>
import { reactive, ref } from 'vue'

const isEditing = ref(false)

const profile = reactive({
  displayName: 'Guest',
  email: 'guest@example.edu',
  firstName: 'Guest',
  lastName: 'User',
  studyMajor: 'Undeclared',
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
      <h1>{{ profile.displayName }}</h1>
    </section>

      <div class="profile-card profile-card--identity">
        <h2>Profile</h2>
        <dl class="profile-fields">
          <div>
            <dt>Display Name</dt>
            <dd v-if="!isEditing">{{ profile.displayName }}</dd>
            <v-text-field v-else v-model="draftProfile.displayName" variant="outlined" density="comfortable" hide-details />
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
            <v-text-field v-else v-model="draftProfile.studyMajor" variant="outlined" density="comfortable" hide-details />
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
