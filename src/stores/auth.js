import { defineStore } from 'pinia'

const AUTH_STORAGE_KEY = 'cis658.auth'

function readStoredSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession)
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

function writeStoredSession(session) {
  if (typeof window === 'undefined') {
    return
  }

  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    role: null,
    isHydrated: false,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.user),
    displayName: (state) => state.user?.displayName ?? 'Guest',
    emailAddress: (state) => state.user?.email ?? '',
  },

  actions: {
    hydrate() {
      if (this.isHydrated) {
        return
      }

      const session = readStoredSession()

      if (session) {
        this.user = session.user ?? null
        this.role = session.role ?? null
      }

      this.isHydrated = true
    },

    login({ displayName, email, role = 'student' }) {
      const normalizedUser = {
        displayName: displayName?.trim() || email,
        email: email?.trim() || '',
      }

      this.user = normalizedUser
      this.role = role
      this.isHydrated = true

      writeStoredSession({
        user: this.user,
        role: this.role,
      })
    },

    logout() {
      this.user = null
      this.role = null
      this.isHydrated = true

      writeStoredSession(null)
    },
  },
})
