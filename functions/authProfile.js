const { onCall, HttpsError } = require('firebase-functions/v2/https')

const {
  CALLABLE_OPTIONS,
  DEFAULT_ROLE,
  createProfileFromRequest,
  db,
} = require('./shared')

// Creates users/{uid} on first sign-in and returns the existing profile after that.
const createUserProfile = onCall(CALLABLE_OPTIONS, async (request) => {
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
const updateUserProfile = onCall(CALLABLE_OPTIONS, async (request) => {
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
const deleteUserProfile = onCall(CALLABLE_OPTIONS, async (request) => {
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

module.exports = {
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
}
