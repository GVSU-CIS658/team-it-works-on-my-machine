import { defineStore } from 'pinia'
import {
  collection,
  onSnapshot,
  query,
  where,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'

import { db, functions } from '../services/firebase'

// ── Types ──────────────────────────────────────────────────────────────────
type Session = {
  id: string
  groupId: string
  title: string
  startsAt: Date
  locationOrLink: string
  createdBy: string
  createdAt?: string
  updatedAt?: string
}

type SessionPayload = {
  groupId: string
  title: string
  startsAt: string
  locationOrLink: string
  createdBy: string
  createdAt?: string
  updatedAt?: string
}

type SessionUpdates = {
  title?: string
  startsAt?: string
  locationOrLink?: string
}

// ── Firebase callables (mirror tasks.ts pattern) ───────────────────────────
const createSessionFunction = httpsCallable(functions, 'createSession')
const updateSessionFunction = httpsCallable(functions, 'updateSession')
const deleteSessionFunction = httpsCallable(functions, 'deleteSession')

// ── Converter ─────────────────────────────────────────────────────────────
function toSession(document: QueryDocumentSnapshot): Session {
  const data = document.data() as SessionPayload

  // Use local time — avoids the UTC date-shift bug found in tasks
  const startsAt = data.startsAt ? new Date(data.startsAt) : new Date()

  return {
    id: document.id,
    groupId: data.groupId,
    title: data.title,
    startsAt,
    locationOrLink: data.locationOrLink ?? '',
    createdBy: data.createdBy,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}

// ── Store ──────────────────────────────────────────────────────────────────
export const useSessionsStore = defineStore('sessions', {
  state: () => ({
    groupId: '',
    sessions: [] as Session[],
    isLoading: false,
    error: '',
    unsubscribe: null as null | (() => void),
  }),

  getters: {
    // Sessions sorted soonest first
    upcomingSessions: (state): Session[] =>
      [...state.sessions].sort(
        (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
      ),
  },

  actions: {
    // Subscribe to real-time Firestore updates for a group
    init(groupId: string) {
      if (!groupId) return

      // Already listening to this group — do nothing
      if (this.groupId === groupId && this.unsubscribe) return

      // Unsubscribe from previous group
      if (this.unsubscribe) {
        this.unsubscribe()
        this.unsubscribe = null
      }

      this.groupId = groupId
      this.isLoading = true
      this.error = ''

      const sessionQuery = query(
        collection(db, 'sessions'),
        where('groupId', '==', groupId),
      )

      this.unsubscribe = onSnapshot(
        sessionQuery,
        (snapshot) => {
          this.sessions = snapshot.docs.map(toSession)
          this.isLoading = false
        },
        (error) => {
          this.error = error.message
          this.sessions = []
          this.isLoading = false
          this.unsubscribe = null
        },
      )
    },

    // Stop listening when component unmounts
    cleanup() {
      if (this.unsubscribe) {
        this.unsubscribe()
        this.unsubscribe = null
      }
      this.sessions = []
      this.groupId = ''
      this.error = ''
    },

    // Create a new session
    async addSession(data: {
      title: string
      startsAt: string
      locationOrLink: string
    }) {
      if (!data.title.trim() || !data.startsAt) return

      this.isLoading = true
      this.error = ''

      try {
        await createSessionFunction({
          groupId: this.groupId,
          title: data.title.trim(),
          startsAt: data.startsAt,
          locationOrLink: data.locationOrLink.trim(),
        })
      } catch (error: any) {
        this.error = error?.message ?? 'Failed to create session. Please try again.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Edit an existing session
    async updateSession(sessionId: string, updates: SessionUpdates) {
      if (!sessionId) return

      this.isLoading = true
      this.error = ''

      try {
        await updateSessionFunction({ sessionId, ...updates })
      } catch (error: any) {
        this.error = error?.message ?? 'Failed to update session. Please try again.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Delete a session
    async deleteSession(sessionId: string) {
      if (!sessionId) return

      this.isLoading = true
      this.error = ''

      try {
        await deleteSessionFunction({ sessionId })
      } catch (error: any) {
        this.error = error?.message ?? 'Failed to delete session. Please try again.'
        throw error
      } finally {
        this.isLoading = false
      }
    },
  },
})

export type { Session, SessionUpdates }
