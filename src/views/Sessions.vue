<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
auth.hydrate()

const currentUserId = computed(() => auth.user?.uid || '')

// ── Types ──────────────────────────────────────────────────────────────────
type Group = {
  id: string
  title: string
}

type Session = {
  id: string
  groupId: string
  title: string
  startsAt: Date
  locationOrLink: string
  createdBy: string
}

// ── Mock data (replace with Firestore/API calls) ───────────────────────────
const groups = ref<Group[]>([
  { id: 'g1', title: 'Math Study Group' },
  { id: 'g2', title: 'Science Team' },
  { id: 'g3', title: 'CIS 658 Project' },
])

const allSessions = ref<Session[]>([
  {
    id: 's1',
    groupId: 'g1',
    title: 'Midterm Review',
    startsAt: new Date('2025-04-10T14:00:00'),
    locationOrLink: 'Library Room 204',
    createdBy: 'mock-user-id',
  },
  {
    id: 's2',
    groupId: 'g1',
    title: 'Final Prep',
    startsAt: new Date('2025-04-20T10:00:00'),
    locationOrLink: 'https://meet.google.com/abc-defg-hij',
    createdBy: 'other-user-id',
  },
  {
    id: 's3',
    groupId: 'g3',
    title: 'Sprint Planning',
    startsAt: new Date('2025-04-08T09:00:00'),
    locationOrLink: 'https://zoom.us/j/123456789',
    createdBy: 'mock-user-id',
  },
])

// ── State ──────────────────────────────────────────────────────────────────
const selectedGroupId = ref<string>('')
const showDialog = ref(false)
const errorMessage = ref('')

const newSession = ref({
  title: '',
  date: '',
  time: '',
  locationOrLink: '',
})

// ── Computed ───────────────────────────────────────────────────────────────
const groupSessions = computed(() => {
  if (!selectedGroupId.value) return []
  return allSessions.value
    .filter(s => s.groupId === selectedGroupId.value)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
})

const selectedGroupTitle = computed(() => {
  const g = groups.value.find(g => g.id === selectedGroupId.value)
  return g ? g.title : ''
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

// ── Actions ────────────────────────────────────────────────────────────────
function openDialog() {
  newSession.value = { title: '', date: '', time: '', locationOrLink: '' }
  errorMessage.value = ''
  showDialog.value = true
}

function createSession() {
  if (!newSession.value.title || !newSession.value.date || !newSession.value.time) {
    errorMessage.value = 'Please fill in title, date, and time.'
    return
  }

  const startsAt = new Date(`${newSession.value.date}T${newSession.value.time}:00`)

  const session: Session = {
    id: 's' + Date.now(),
    groupId: selectedGroupId.value,
    title: newSession.value.title,
    startsAt,
    locationOrLink: newSession.value.locationOrLink,
    createdBy: currentUserId.value || 'mock-user-id',
  }

  allSessions.value.push(session)
  showDialog.value = false
}

function deleteSession(id: string) {
  allSessions.value = allSessions.value.filter(s => s.id !== id)
}
</script>

<template>
  <div class="sessions-view">

    <!-- Header -->
    <div class="sessions-header">
      <p>Sessions</p>
      <h1>Plan and manage shared study sessions.</h1>
      <p>Select a group to view upcoming sessions, create new ones, or remove ones you created.</p>
    </div>

    <!-- Group Selector -->
    <div class="sessions-controls">
      <v-select
        v-model="selectedGroupId"
        :items="groups"
        item-title="title"
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
        @click="openDialog"
      >
        + NEW SESSION
      </v-btn>
    </div>

    <!-- Session List -->
    <div v-if="selectedGroupId" class="sessions-list-section">
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
              v-if="session.createdBy === (currentUserId || 'mock-user-id')"
              class="button-pill"
              variant="flat"
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
            v-if="errorMessage"
            type="error"
            density="compact"
            class="sessions-dialog__error"
          >
            {{ errorMessage }}
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
          <v-btn class="button-pill" variant="flat" @click="createSession">CREATE</v-btn>
          <v-btn class="button-pill" variant="flat" @click="showDialog = false">CANCEL</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<style scoped lang="sass" src="../styles/pages/sessions.sass"></style>
