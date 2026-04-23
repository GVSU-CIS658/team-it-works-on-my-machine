<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'

import { useAuthStore } from '../stores/auth'
import { useGroupsStore } from '../stores/groups'
import { useSessionsStore, type Session } from '../stores/sessions'

const auth = useAuthStore()
const groupsStore = useGroupsStore()
const sessionsStore = useSessionsStore()

const currentUserId = computed(() => auth.user?.uid || '')
const selectedGroupId = ref('')
const showDialog = ref(false)
const errorMessage = ref('')
const isCreatingSession = ref(false)
const pendingDeleteId = ref('')
const editingSessionId = ref('')

const newSession = ref({
  title: '',
  date: '',
  time: '',
  locationOrLink: '',
})

const groups = computed(() => groupsStore.userGroups.map((group) => ({
  id: group.id,
  title: group.name,
})))

const groupSessions = computed(() => sessionsStore.sessions)
const selectedGroup = computed(() => (
  groupsStore.userGroups.find((group) => group.id === selectedGroupId.value) ?? null
))
const selectedGroupTitle = computed(() => selectedGroup.value?.name ?? '')
const sessionsError = computed(() => sessionsStore.error)

function applySelectedGroup(groupId: string) {
  if (!groupId) {
    selectedGroupId.value = ''
    sessionsStore.setActiveGroup('')
    return
  }

  if (selectedGroupId.value !== groupId) {
    selectedGroupId.value = groupId
  }

  sessionsStore.setActiveGroup(groupId)
}

watch(
  () => auth.user?.uid ?? '',
  (ownerId) => {
    groupsStore.init(ownerId)
    sessionsStore.init(ownerId)

    if (ownerId && selectedGroupId.value) {
      applySelectedGroup(selectedGroupId.value)
    }
  },
  { immediate: true },
)

watch(
  () => groupsStore.userGroups,
  (availableGroups) => {
    if (!availableGroups.length) {
      applySelectedGroup('')
      return
    }

    if (!availableGroups.some((group) => group.id === selectedGroupId.value)) {
      applySelectedGroup(availableGroups[0].id)
      return
    }

    if (selectedGroupId.value) {
      applySelectedGroup(selectedGroupId.value)
    }
  },
  { immediate: true, deep: true },
)

watch(
  selectedGroupId,
  (groupId) => {
    if (!groupId) {
      sessionsStore.setActiveGroup('')
      return
    }

    if (sessionsStore.activeGroupId !== groupId || !sessionsStore.sessions.length) {
      sessionsStore.setActiveGroup(groupId)
    }
  },
  { immediate: true },
)

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

function canManageSession(session: Session) {
  return Boolean(
    currentUserId.value
    && (session.createdBy === currentUserId.value || selectedGroup.value?.ownerId === currentUserId.value),
  )
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function toTimeInputValue(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

function openDialog() {
  editingSessionId.value = ''
  newSession.value = { title: '', date: '', time: '', locationOrLink: '' }
  errorMessage.value = ''
  sessionsStore.clearError()
  showDialog.value = true
}

function openEditDialog(session: Session) {
  editingSessionId.value = session.id
  newSession.value = {
    title: session.title,
    date: toDateInputValue(session.startsAt),
    time: toTimeInputValue(session.startsAt),
    locationOrLink: session.locationOrLink,
  }
  errorMessage.value = ''
  sessionsStore.clearError()
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  editingSessionId.value = ''
  errorMessage.value = ''
}

async function saveSession() {
  if (!newSession.value.title || !newSession.value.date || !newSession.value.time || !selectedGroupId.value) {
    errorMessage.value = 'Please fill in title, date, and time.'
    return
  }

  errorMessage.value = ''
  sessionsStore.clearError()
  isCreatingSession.value = true

  try {
    const startsAt = new Date(`${newSession.value.date}T${newSession.value.time}:00`).toISOString()

    if (editingSessionId.value) {
      await sessionsStore.updateSession(editingSessionId.value, {
        title: newSession.value.title.trim(),
        startsAt,
        locationOrLink: newSession.value.locationOrLink.trim(),
      })
    } else {
      await sessionsStore.createSession({
        groupId: selectedGroupId.value,
        title: newSession.value.title.trim(),
        startsAt,
        locationOrLink: newSession.value.locationOrLink.trim(),
      })
    }

    closeDialog()
  } catch {
    errorMessage.value = sessionsStore.error || `Unable to ${editingSessionId.value ? 'update' : 'create'} the session.`
  } finally {
    isCreatingSession.value = false
  }
}

async function deleteSession(sessionId: string) {
  if (!sessionId || pendingDeleteId.value === sessionId) {
    return
  }

  sessionsStore.clearError()
  pendingDeleteId.value = sessionId

  try {
    await sessionsStore.deleteSession(sessionId)
  } finally {
    pendingDeleteId.value = ''
  }
}

onUnmounted(() => {
  sessionsStore.cleanup()
})
</script>

<template>
  <div class="sessions-view">
    <div v-if="sessionsError" class="groups-error-message">
      {{ sessionsError }}
    </div>

    <div class="sessions-header page-hero">
      <h1>Sessions</h1>
      <h2>Plan and manage shared study sessions.</h2>
      <p>Select a group to view upcoming sessions, create new ones, or remove ones you created.</p>
      <p class="sessions-visibility-note">Sessions are visible to members of the selected group.</p>
    </div>

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
        class="sessions-new-session-button"
        color="primary"
        variant="flat"
        @click="openDialog"
      >
        + NEW SESSION
      </v-btn>
    </div>

    <div v-if="selectedGroupId" class="sessions-list-section">
      <h2>{{ selectedGroupTitle }} - Upcoming Sessions</h2>

      <p v-if="sessionsStore.isLoading" class="sessions-empty">
        Loading sessions...
      </p>

      <p v-else-if="groupSessions.length === 0" class="sessions-empty">
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
              v-if="canManageSession(session)"
              icon="mdi-pencil"
              variant="text"
              color="grey-darken-2"
              aria-label="Edit session"
              :disabled="pendingDeleteId === session.id"
              @click="openEditDialog(session)"
            />
            <v-btn
              v-if="canManageSession(session)"
              icon="mdi-trash-can"
              variant="text"
              color="grey-darken-2"
              aria-label="Delete session"
              :loading="pendingDeleteId === session.id"
              :disabled="pendingDeleteId === session.id"
              @click="deleteSession(session.id)"
            />
          </div>
        </li>
      </ul>
    </div>

    <div v-else class="sessions-placeholder">
      <p>Select a group above to see its sessions.</p>
    </div>

    <v-dialog v-model="showDialog" max-width="450">
      <v-card class="sessions-dialog">
        <v-card-title>{{ editingSessionId ? 'Edit Session' : 'New Session' }}</v-card-title>
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
            placeholder="Date"
            type="date"
            variant="outlined"
            density="comfortable"
            hide-details
            class="sessions-dialog__field"
          />

          <v-text-field
            v-model="newSession.time"
            placeholder="Time"
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
            class="sessions-dialog-button"
            color="primary"
            variant="flat"
            :loading="isCreatingSession"
            :disabled="isCreatingSession"
            @click="saveSession"
          >
            {{ editingSessionId ? 'SAVE' : 'CREATE' }}
          </v-btn>
          <v-btn
            class="sessions-dialog-button"
            color="primary"
            variant="flat"
            :disabled="isCreatingSession"
            @click="closeDialog"
          >
            CANCEL
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped lang="sass" src="../styles/pages/sessions.sass"></style>
