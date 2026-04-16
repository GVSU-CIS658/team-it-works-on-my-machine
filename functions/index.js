const { onCall, HttpsError } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')

admin.initializeApp()

const db = admin.firestore()

const DEFAULT_ROLE = '<undefined>'
const DEFAULT_STUDY_MAJOR = 'undeclared'
const CALLABLE_OPTIONS = {
  cors: [
    'http://localhost:4800',
    'https://finalproject-2cac4.firebaseapp.com',
    'https://finalproject-2cac4.web.app',
  ],
  invoker: 'public',
}

function createProfileFromRequest(request) {
  const uid = request.auth.uid
  const email = request.auth.token.email ?? ''
  const username = request.data?.username?.trim() || email
  const now = new Date().toISOString()

  return {
    uid,
    username,
    email,
    firstName: '',
    lastName: '',
    studyMajor: DEFAULT_STUDY_MAJOR,
    groups: [],
    role: DEFAULT_ROLE,
    createdAt: now,
    updatedAt: now,
  }
}

// Creates users/{uid} on first sign-in and returns the existing profile after that.
exports.createUserProfile = onCall(CALLABLE_OPTIONS, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.')
  }

  const userRef = db.collection('users').doc(request.auth.uid)
  const userSnapshot = await userRef.get()

  if (userSnapshot.exists) {
    return userSnapshot.data()
  }

  const profile = createProfileFromRequest(request)

  await userRef.set(profile)

  return profile
})

// Updates editable profile fields while preserving identity and role values.
exports.updateUserProfile = onCall(CALLABLE_OPTIONS, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.')
  }

  const uid = request.auth.uid
  const userRef = db.collection('users').doc(uid)
  const userSnapshot = await userRef.get()

  if (!userSnapshot.exists) {
    throw new HttpsError('not-found', 'User profile was not found.')
  }

  const currentProfile = userSnapshot.data()
  const data = request.data ?? {}
  const updatedProfile = {
    ...currentProfile,
    username: typeof data.username === 'string' ? data.username.trim() : currentProfile.username,
    firstName: typeof data.firstName === 'string' ? data.firstName.trim() : currentProfile.firstName,
    lastName: typeof data.lastName === 'string' ? data.lastName.trim() : currentProfile.lastName,
    studyMajor: typeof data.studyMajor === 'string' ? data.studyMajor : currentProfile.studyMajor,
    uid,
    email: request.auth.token.email ?? currentProfile.email ?? '',
    role: currentProfile.role ?? DEFAULT_ROLE,
    updatedAt: new Date().toISOString(),
  }

  await userRef.set(updatedProfile, { merge: true })

  return updatedProfile
})

// Deletes the signed-in user's Firestore profile. Firebase Auth deletion remains client-side.
exports.deleteUserProfile = onCall(CALLABLE_OPTIONS, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.')
  }

  const uid = request.auth.uid

  await db.collection('users').doc(uid).delete()

  return {
    ok: true,
    uid,
  }
})
