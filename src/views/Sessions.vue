git checkout -b feat/amine-sessions<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useGroupsStore } from '../stores/groups'
import { useSessionsStore } from '../stores/sessions'

// ── Stores ─────────────────────────────────────────────────────────────────
const auth = useAuthStore()
auth.hydrate()

const groupsStore = useGroupsStore()
const sessionsStore = useSessionsStore()

// ── Current user ───────────────────────────────────────────────────────────
const currentUserId = computed(() => auth.user?.uid ?? '')

// ── Group selector ─────────────────────────────────────────────────────────
const selectedGroupId = ref<string>('')

// When group changes, re-init the sessions store listener
watch(selectedGroupId, (groupId) => {
  if (groupId) sessionsStore.init(groupId)
})

// ── Sessions from store ────────────────────────────────────────────────────
const groupSessions = computed(() => sessionsStore.upcomingSessions)

const selectedGroupTitle = computed(() => {
  const g = groupsStore.userGroups.find((g) => g.id === selectedGroupId.value)
  return g ? g.name : ''
})

// ── Dialog state ───────────────────────────────────────────────────────────
const showDialog = ref(false)
const formError = ref('')

const newSession = ref({
  title: '',
  date: '',
  time: '',
  locationOrLink: '',
})

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Build ISO string from local date + time inputs (avoids UTC date-shift bug)
function toLocalISOString(date: string, time: string): string {
  return `${date}T${time}:00`
}

// ── Actions ────────────────────────────────────────────────────────────────
function openDialog() {
  newSession.value = { title: '', date: '', time: '', locationOrLink: '' }
  formError.value = ''
  showDialog.value = true
}

async function createSession() {
  if (!newSession.value.title || !newSession.value.date || !newSession.value.time) {
    formError.value = 'Please fill in title, date, and time.'
    return
  }

  formError.value = ''

  try {
    await sessionsStore.addSession({
      title: newSession.value.title,
      startsAt: toLocalISOString(newSession.value.date, newSession.value.time),
      locationOrLink: newSession.value.locationOrLink,
    })
    showDialog.value = false
  } catch {
    formError.value = sessionsStore.error || 'Failed to create session.'
  }
}

async function deleteSession(sessionId: string) {
  try {
    await sessionsStore.deleteSession(sessionId)
  } catch {
    // error already set in store
  }
}

// ── Cleanup ────────────────────────────────────────────────────────────────
onUnmounted(() => sessionsStore.cleanup())
</script>

<template>
  <div class="sessions-view">

    <!-- Header -->
    <div class="sessions-header">
      <p>Sessions</p>
      <h1>Plan and manage shared study sessions.</h1>
      <p>Select a group to view upcoming sessions, create new ones, or remove ones you created.</p>
    </div>

    <!-- Store-level error banner -->
    <v-alert
      v-if="sessionsStore.error"
      type="error"
      density="compact"
      class="sessions-store-error"
    >
      {{ sessionsStore.error }}
    </v-alert>

    <!-- Group Selector -->
    <div class="sessions-controls">
      <v-select
        v-model="selectedGroupId"
        :items="groupsStore.userGroups"
        item-title="name"
        item-value="id"
        label="Select a group"
        variant="outlined"
        density="comfortable"
        class="sessions-group-select"
      />

      <v-btn
        v-if="selectedGroupId"
        class="button-pill"
        variant="flat"
        :disabled="sessionsStore.isLoading"
        @click="openDialog"
      >
        + NEW SESSION
      </v-btn>
    </div>

    <!-- Loading spinner -->
    <div v-if="sessionsStore.isLoading" class="sessions-loading">
      <v-progress-circular indeterminate />
    </div>

    <!-- Session List -->
    <div v-else-if="selectedGroupId" class="sessions-list-section">
      <h2>{{ selectedGroupTitle }} — Upcoming Sessions</h2>

      <p v-if="groupSessions.length === 0" class="sessions-empty">
        No sessions yet. Create one above.
      </p>

      <ul v-else class="sessions-list">
        <li
          v-for="session in groupSessions"
          :key="session.id"
          class="session-card"
        >
          <div class="session-card__info">
            <h3 class="session-card__title">{{ session.title }}</h3>
            <p class="session-card__date">
              {{ formatDate(session.startsAt) }} at {{ formatTime(session.startsAt) }}
            </p>
            <p class="session-card__location">
              <span v-if="session.locationOrLink.startsWith('http')">
                <a :href="session.locationOrLink" target="_blank" rel="noopener">Join link</a>
              </span>
              <span v-else>{{ session.locationOrLink || 'No location set' }}</span>
            </p>
          </div>

          <div class="session-card__actions">
            <v-btn
              v-if="session.createdBy === currentUserId"
              class="button-pill"
              variant="flat"
              :disabled="sessionsStore.isLoading"
              @click="deleteSession(session.id)"
            >
              DELETE
            </v-btn>
          </div>
        </li>
      </ul>
    </div>

    <!-- Placeholder when no group selected -->
    <div v-else class="sessions-placeholder">
      <p>Select a group above to see its sessions.</p>
    </div>

    <!-- Create Session Dialog -->
    <v-dialog v-model="showDialog" max-width="520">
      <v-card class="sessions-dialog">
        <v-card-title>New Session</v-card-title>
        <v-card-text>

          <v-alert
            v-if="formError"
            type="error"
            density="compact"
            class="sessions-dialog__error"
          >
            {{ formError }}
          </v-alert>

          <v-text-field
            v-model="newSession.title"
            label="Session title"
            variant="outlined"
            density="comfortable"
            hide-details
            class="sessions-dialog__field"
          />

          <v-text-field
            v-model="newSession.date"
            label="Date"
            type="date"
            variant="outlined"
            density="comfortable"
            hide-details
            class="sessions-dialog__field"
          />

          <v-text-field
            v-model="newSession.time"
            label="Time"
            type="time"
            variant="outlined"
            density="comfortable"
            hide-details
            class="sessions-dialog__field"
          />

          <v-text-field
            v-model="newSession.locationOrLink"
            label="Location or meeting link (optional)"
            variant="outlined"
            density="comfortable"
            hide-details
            class="sessions-dialog__field"
          />

        </v-card-text>

        <v-card-actions class="sessions-dialog__actions">
          <v-btn
            class="button-pill"
            variant="flat"
            :disabled="sessionsStore.isLoading"
            @click="createSession"
          >
            CREATE
          </v-btn>
          <v-btn
            class="button-pill"
            variant="flat"
            @click="showDialog = false"
          >
            CANCEL
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<style scoped lang="sass" src="../styles/pages/sessions.sass"></style>
