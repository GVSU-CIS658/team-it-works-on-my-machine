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

function requireAuth(request) {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.')
  }

  return request.auth.uid
}

function normalizeTaskUpdates(data, currentTask = {}) {
  const updates = {}

  if (typeof data.description === 'string') {
    const description = data.description.trim()

    if (!description) {
      throw new HttpsError('invalid-argument', 'Task description is required.')
    }

    updates.description = description
  }

  if (typeof data.dueAt === 'string') {
    const dueAt = new Date(data.dueAt)

    if (Number.isNaN(dueAt.getTime())) {
      throw new HttpsError('invalid-argument', 'Task date is invalid.')
    }

    updates.dueAt = dueAt.toISOString()
  }

  if (typeof data.isCompleted === 'boolean') {
    updates.isCompleted = data.isCompleted
  }

  if (typeof data.isHidden === 'boolean') {
    updates.isHidden = data.isHidden
  }

  return {
    ...currentTask,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
}

// Creates a task owned by the signed-in user.
exports.createTask = onCall(CALLABLE_OPTIONS, async (request) => {
  const ownerId = requireAuth(request)
  const data = request.data ?? {}
  const now = new Date().toISOString()
  const task = normalizeTaskUpdates(
    {
      description: data.description,
      dueAt: data.dueAt ?? now,
      isCompleted: false,
      isHidden: false,
    },
    {
      ownerId,
      createdAt: now,
    },
  )
  const taskRef = await db.collection('Tasks').add(task)

  return {
    id: taskRef.id,
    ...task,
  }
})

// Updates a task only when it belongs to the signed-in user.
exports.updateTask = onCall(CALLABLE_OPTIONS, async (request) => {
  const ownerId = requireAuth(request)
  const taskId = request.data?.taskId

  if (typeof taskId !== 'string' || !taskId) {
    throw new HttpsError('invalid-argument', 'Task id is required.')
  }

  const taskRef = db.collection('Tasks').doc(taskId)
  const taskSnapshot = await taskRef.get()

  if (!taskSnapshot.exists) {
    throw new HttpsError('not-found', 'Task was not found.')
  }

  const currentTask = taskSnapshot.data()

  if (currentTask.ownerId !== ownerId) {
    throw new HttpsError('permission-denied', 'You can only update your own tasks.')
  }

  const updatedTask = normalizeTaskUpdates(request.data ?? {}, currentTask)

  await taskRef.set(updatedTask, { merge: true })

  return {
    id: taskId,
    ...updatedTask,
  }
})

// Deletes a task only when it belongs to the signed-in user.
exports.deleteTask = onCall(CALLABLE_OPTIONS, async (request) => {
  const ownerId = requireAuth(request)
  const taskId = request.data?.taskId

  if (typeof taskId !== 'string' || !taskId) {
    throw new HttpsError('invalid-argument', 'Task id is required.')
  }

  const taskRef = db.collection('Tasks').doc(taskId)
  const taskSnapshot = await taskRef.get()

  if (!taskSnapshot.exists) {
    return {
      ok: true,
      taskId,
    }
  }

  if (taskSnapshot.data().ownerId !== ownerId) {
    throw new HttpsError('permission-denied', 'You can only delete your own tasks.')
  }

  await taskRef.delete()

  return {
    ok: true,
    taskId,
  }
})
