import { defineStore } from 'pinia'
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'

import { auth as firebaseAuth, db, functions } from '../services/firebase'
import { DEFAULT_ROLE, createUserProfileFromFirebaseUser } from '../models/user'

let authStatePromise = null
let unsubscribeAuthState = null
const googleProvider = new GoogleAuthProvider()
const createUserProfileFunction = httpsCallable(functions, 'createUserProfile')
const updateUserProfileFunction = httpsCallable(functions, 'updateUserProfile')
const deleteUserProfileFunction = httpsCallable(functions, 'deleteUserProfile')

function getAuthErrorMessage(error) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/invalid-email':
      return 'Enter a valid email address.'
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email or password is incorrect.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/requires-recent-login':
      return 'Please log out and log back in before deleting your account.'
    default:
      return error?.message ?? 'Authentication failed. Please try again.'
  }
}

async function createBackendUserProfile(username) {
  const response = await createUserProfileFunction({ username })
  return response.data
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    role: DEFAULT_ROLE,
    isHydrated: false,
    isLoading: false,
    error: '',
    message: '',
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.user),
    username: (state) => state.user?.username ?? 'Guest',
    emailAddress: (state) => state.user?.email ?? '',
  },

  actions: {
    // Subscribes once to Firebase Auth and hydrates Pinia after page refresh.
    initializeAuth() {
      if (this.isHydrated) {
        return Promise.resolve(this.user)
      }

      if (authStatePromise) {
        return authStatePromise
      }

      this.isLoading = true
      this.error = ''

      authStatePromise = new Promise((resolve) => {
        unsubscribeAuthState = onAuthStateChanged(
          firebaseAuth,
          async (firebaseUser) => {
            try {
              if (firebaseUser) {
                await this.loadUserProfile(firebaseUser)
              } else {
                this.user = null
                this.role = DEFAULT_ROLE
              }
            } catch (error) {
              this.user = null
              this.role = DEFAULT_ROLE
              this.error = getAuthErrorMessage(error)
            }

            this.isHydrated = true
            this.isLoading = false
            resolve(this.user)
          },
          (error) => {
            this.user = null
            this.role = DEFAULT_ROLE
            this.error = error.message
            this.isHydrated = true
            this.isLoading = false
            resolve(null)
          },
        )
      })

      return authStatePromise
    },

    // Backward-compatible wrapper for current route/layout callers.
    hydrate() {
      return this.initializeAuth()
    },

    // Clears the last auth error before a new login/signup attempt.
    clearError() {
      this.error = ''
      this.message = ''
    },

    // Loads or creates the Firestore profile for the signed-in Firebase user.
    async loadUserProfile(firebaseUser) {
      if (!firebaseUser) {
        this.user = null
        this.role = DEFAULT_ROLE
        return null
      }

      const userRef = doc(db, 'users', firebaseUser.uid)
      const userSnapshot = await getDoc(userRef)
      const profile = userSnapshot.exists()
        ? createUserProfileFromFirebaseUser(firebaseUser, userSnapshot.data())
        : await createBackendUserProfile()

      this.user = profile
      this.role = profile.role
      this.isHydrated = true
      this.error = ''

      return profile
    },

    // Creates the Firebase Auth account, then asks the backend to create the app profile.
    async signup({ username, email, password }) {
      this.isLoading = true
      this.error = ''

      try {
        await createUserWithEmailAndPassword(firebaseAuth, email, password)
        const profile = await createBackendUserProfile(username)

        this.user = profile
        this.role = profile.role
        this.isHydrated = true

        return profile
      } catch (error) {
        this.error = getAuthErrorMessage(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Sets browser persistence based on Remember Me, then signs in with Firebase Auth.
    async login({ email, password, rememberMe = true }) {
      this.isLoading = true
      this.error = ''

      try {
        await setPersistence(
          firebaseAuth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence,
        )

        const credential = await signInWithEmailAndPassword(firebaseAuth, email, password)
        return await this.loadUserProfile(credential.user)
      } catch (error) {
        this.error = getAuthErrorMessage(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Sends a Firebase password reset email without revealing whether the email exists.
    async sendPasswordReset(email) {
      this.isLoading = true
      this.error = ''
      this.message = ''

      try {
        await sendPasswordResetEmail(firebaseAuth, email)
        this.message = 'If an account exists for that email, a reset link has been sent.'
      } catch (error) {
        this.error = getAuthErrorMessage(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Signs in with Google, then loads or creates the app-specific Firestore profile.
    async loginWithGoogle() {
      this.isLoading = true
      this.error = ''
      this.message = ''

      try {
        const credential = await signInWithPopup(firebaseAuth, googleProvider)
        return await this.loadUserProfile(credential.user)
      } catch (error) {
        this.error = getAuthErrorMessage(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Asks the backend to update editable profile fields and refreshes the Pinia snapshot.
    async updateUserProfile(profileUpdates) {
      if (!this.user?.uid) {
        this.error = 'You must be signed in to update your profile.'
        throw new Error(this.error)
      }

      this.isLoading = true
      this.error = ''

      try {
        const response = await updateUserProfileFunction(profileUpdates)
        const updatedProfile = response.data

        this.user = updatedProfile
        this.role = updatedProfile.role

        return updatedProfile
      } catch (error) {
        this.error = error?.message ?? 'Profile update failed. Please try again.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Fully removes the Firestore profile and the signed-in Firebase Auth account.
    async deleteCurrentUser() {
      const currentUser = firebaseAuth.currentUser

      if (!this.user?.uid || !currentUser) {
        this.error = 'You must be signed in to delete your account.'
        throw new Error(this.error)
      }

      this.isLoading = true
      this.error = ''

      try {
        await deleteUserProfileFunction()
        await deleteUser(currentUser)

        this.user = null
        this.role = DEFAULT_ROLE
        this.isHydrated = true
      } catch (error) {
        this.error = getAuthErrorMessage(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Signs out of Firebase Auth and clears the local Pinia auth snapshot.
    async logout() {
      this.isLoading = true
      this.error = ''

      try {
        await signOut(firebaseAuth)
      } finally {
        this.user = null
        this.role = DEFAULT_ROLE
        this.isHydrated = true
        this.isLoading = false
        authStatePromise = null

        if (unsubscribeAuthState) {
          unsubscribeAuthState()
          unsubscribeAuthState = null
        }
      }
    },
  },
})
