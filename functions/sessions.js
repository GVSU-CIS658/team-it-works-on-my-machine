const { onCall, HttpsError } = require('firebase-functions/v2/https')

const {
  CALLABLE_OPTIONS,
  db,
  normalizeOptionalString,
  normalizeRequiredString,
  requireAuth,
} = require('./shared')

function normalizeStartsAt(value) {
  if (typeof value !== 'string') {
    throw new HttpsError('invalid-argument', 'Session start time is required.')
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    throw new HttpsError('invalid-argument', 'Session start time is invalid.')
  }

  return parsedDate.toISOString()
}

async function getGroupForSessionWrite(groupId, userId) {
  const groupRef = db.collection('groups').doc(groupId)
  const groupSnapshot = await groupRef.get()

  if (!groupSnapshot.exists) {
    throw new HttpsError('not-found', 'Group was not found.')
  }

  const group = groupSnapshot.data()

  if (!Array.isArray(group.memberIds) || !group.memberIds.includes(userId)) {
    throw new HttpsError('permission-denied', 'You must be a member of the group.')
  }

  return group
}

async function getSessionAndGroupForWrite(sessionId) {
  const sessionRef = db.collection('sessions').doc(sessionId)
  const sessionSnapshot = await sessionRef.get()

  if (!sessionSnapshot.exists) {
    throw new HttpsError('not-found', 'Session was not found.')
  }

  const session = sessionSnapshot.data()
  const groupRef = db.collection('groups').doc(session.groupId)
  const groupSnapshot = await groupRef.get()

  if (!groupSnapshot.exists) {
    throw new HttpsError('not-found', 'Group was not found.')
  }

  return {
    sessionRef,
    session,
    group: groupSnapshot.data(),
  }
}

const createSession = onCall(CALLABLE_OPTIONS, async (request) => {
  const userId = requireAuth(request)
  const groupId = normalizeRequiredString(request.data?.groupId, 'Group id')
  const title = normalizeRequiredString(request.data?.title, 'Session title')
  const startsAt = normalizeStartsAt(request.data?.startsAt)
  const locationOrLink = normalizeOptionalString(request.data?.locationOrLink)

  await getGroupForSessionWrite(groupId, userId)

  const now = new Date().toISOString()
  const session = {
    groupId,
    title,
    startsAt,
    locationOrLink,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  }

  const sessionRef = await db.collection('sessions').add(session)

  return {
    id: sessionRef.id,
    ...session,
  }
})

const updateSession = onCall(CALLABLE_OPTIONS, async (request) => {
  const userId = requireAuth(request)
  const sessionId = normalizeRequiredString(request.data?.sessionId, 'Session id')
  const title = normalizeRequiredString(request.data?.title, 'Session title')
  const startsAt = normalizeStartsAt(request.data?.startsAt)
  const locationOrLink = normalizeOptionalString(request.data?.locationOrLink)

  const { sessionRef, session, group } = await getSessionAndGroupForWrite(sessionId)
  const canEditSession = session.createdBy === userId || group.ownerId === userId

  if (!canEditSession) {
    throw new HttpsError('permission-denied', 'You do not have permission to edit this session.')
  }

  const updatedAt = new Date().toISOString()

  await sessionRef.set(
    {
      title,
      startsAt,
      locationOrLink,
      updatedAt,
    },
    { merge: true },
  )

  return {
    id: sessionId,
    ...session,
    title,
    startsAt,
    locationOrLink,
    updatedAt,
  }
})

const deleteSession = onCall(CALLABLE_OPTIONS, async (request) => {
  const userId = requireAuth(request)
  const sessionId = normalizeRequiredString(request.data?.sessionId, 'Session id')
  const { sessionRef, session, group } = await getSessionAndGroupForWrite(sessionId)
  const canDeleteSession = session.createdBy === userId || group.ownerId === userId

  if (!canDeleteSession) {
    throw new HttpsError('permission-denied', 'You do not have permission to delete this session.')
  }

  await sessionRef.delete()

  return {
    ok: true,
    sessionId,
  }
})

module.exports = {
  createSession,
  updateSession,
  deleteSession,
}
