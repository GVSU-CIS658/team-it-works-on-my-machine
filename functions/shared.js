const { HttpsError } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')

admin.initializeApp()

const db = admin.firestore()

const DEFAULT_ROLE = '<undefined>'
const DEFAULT_STUDY_MAJOR = 'undeclared'
const GROUP_JOIN_CODE_LENGTH = 6
const CALLABLE_OPTIONS = {
  cors: [
    'http://localhost:4800',
    'https://finalproject-2cac4.firebaseapp.com',
    'https://finalproject-2cac4.web.app',
  ],
  invoker: 'public',
}

function requireAuth(request) {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.')
  }

  return request.auth.uid
}

function normalizeRequiredString(value, fieldName) {
  if (typeof value !== 'string') {
    throw new HttpsError('invalid-argument', `${fieldName} is required.`)
  }

  const normalizedValue = value.trim()

  if (!normalizedValue) {
    throw new HttpsError('invalid-argument', `${fieldName} is required.`)
  }

  return normalizedValue
}

function normalizeOptionalString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function generateJoinCode(length = GROUP_JOIN_CODE_LENGTH) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let joinCode = ''

  for (let index = 0; index < length; index += 1) {
    const characterIndex = Math.floor(Math.random() * alphabet.length)
    joinCode += alphabet[characterIndex]
  }

  return joinCode
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

function createGroupFromRequest(request, joinCode) {
  const ownerId = request.auth.uid
  const now = new Date().toISOString()
  const data = request.data ?? {}

  return {
    name: normalizeRequiredString(data.name, 'Group name'),
    description: normalizeOptionalString(data.description),
    joinCode,
    ownerId,
    memberIds: [ownerId],
    createdAt: now,
    updatedAt: now,
  }
}

function createGroupPostFromRequest(request) {
  const data = request.data ?? {}
  const now = new Date().toISOString()

  return {
    groupId: normalizeRequiredString(data.groupId, 'Group id'),
    title: normalizeRequiredString(data.title, 'Post title'),
    body: normalizeRequiredString(data.body, 'Post body'),
    createdBy: request.auth.uid,
    createdAt: now,
    updatedAt: now,
  }
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

module.exports = {
  CALLABLE_OPTIONS,
  DEFAULT_ROLE,
  db,
  createGroupFromRequest,
  createGroupPostFromRequest,
  createProfileFromRequest,
  generateJoinCode,
  normalizeOptionalString,
  normalizeRequiredString,
  normalizeTaskUpdates,
  requireAuth,
}
