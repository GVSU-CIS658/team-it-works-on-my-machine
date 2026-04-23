import { defineStore } from 'pinia'
import { collection, onSnapshot, query, where, type QueryDocumentSnapshot } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'

import { db, functions } from '../services/firebase'

type SessionPayload = {
  groupId: string
  title: string
  startsAt: string
  locationOrLink?: string
  createdBy: string
  createdAt?: string
  updatedAt?: string
}

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

type SessionUpdates = {
  title: string
  startsAt: string
  locationOrLink?: string
}

const createSessionFunction = httpsCallable(functions, 'createSession')
const updateSessionFunction = httpsCallable(functions, 'updateSession')
const deleteSessionFunction = httpsCallable(functions, 'deleteSession')

function toSession(document: QueryDocumentSnapshot): Session {
  const data = document.data() as SessionPayload

  return {
    id: document.id,
    groupId: data.groupId,
    title: data.title,
    startsAt: new Date(data.startsAt),
    locationOrLink: data.locationOrLink ?? '',
    createdBy: data.createdBy,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}

export const useSessionsStore = defineStore('sessions', {
  state: () => ({
    ownerId: '',
    activeGroupId: '',
    sessions: [] as Session[],
    isLoading: false,
    error: '',
    unsubscribe: null as null | (() => void),
  }),

  actions: {
    clearError() {
      this.error = ''
    },

    init(ownerId: string) {
      if (!ownerId) {
        this.reset()
        return
      }

      if (this.ownerId === ownerId) {
        if (this.activeGroupId && !this.unsubscribe) {
          this.syncSessions()
        }

        return
      }

      this.resetListener()
      this.ownerId = ownerId
      this.error = ''

      if (this.activeGroupId) {
        this.syncSessions()
      }
    },

    resetListener() {
      if (typeof this.unsubscribe === 'function') {
        this.unsubscribe()
      }

      this.unsubscribe = null
    },

    reset() {
      this.resetListener()
      this.ownerId = ''
      this.activeGroupId = ''
      this.sessions = []
      this.isLoading = false
      this.error = ''
    },
    cleanup() {
      this.reset()
    },

    setActiveGroup(groupId: string) {
      this.activeGroupId = groupId
      this.error = ''
      this.syncSessions()
    },

    syncSessions() {
      this.resetListener()

      if (!this.activeGroupId) {
        this.sessions = []
        this.isLoading = false
        return
      }

      this.isLoading = true

      const sessionsQuery = query(
        collection(db, 'sessions'),
        where('groupId', '==', this.activeGroupId),
      )

      this.unsubscribe = onSnapshot(
        sessionsQuery,
        (snapshot) => {
          this.sessions = snapshot.docs
            .map(toSession)
            .sort((left, right) => left.startsAt.getTime() - right.startsAt.getTime())
          this.isLoading = false
        },
        (error) => {
          console.error(error)
          this.error = 'Unable to load sessions right now.'
          this.sessions = []
          this.isLoading = false
          this.unsubscribe = null
        },
      )
    },

    async createSession(sessionDetails: SessionUpdates & { groupId: string }) {
      this.error = ''

      try {
        const response = await createSessionFunction(sessionDetails)
        return response.data as SessionPayload & { id: string }
      } catch (error: any) {
        console.error(error)
        this.error = error?.message || 'Unable to create the session.'
        throw error
      }
    },

    async updateSession(sessionId: string, sessionDetails: SessionUpdates) {
      this.error = ''

      try {
        const response = await updateSessionFunction({
          sessionId,
          ...sessionDetails,
        })

        return response.data as SessionPayload & { id: string }
      } catch (error: any) {
        console.error(error)
        this.error = error?.message || 'Unable to update the session.'
        throw error
      }
    },

    async deleteSession(sessionId: string) {
      this.error = ''

      try {
        await deleteSessionFunction({ sessionId })
      } catch (error: any) {
        console.error(error)
        this.error = error?.message || 'Unable to delete the session.'
        throw error
      }
    },
  },
})

export type { Session, SessionUpdates }
