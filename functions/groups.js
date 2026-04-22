const { onCall, HttpsError } = require('firebase-functions/v2/https')
const logger = require('firebase-functions/logger')
const admin = require('firebase-admin')

const {
  CALLABLE_OPTIONS,
  createGroupFromRequest,
  createGroupPostFromRequest,
  db,
  generateJoinCode,
  normalizeOptionalString,
  normalizeRequiredString,
  requireAuth,
} = require('./shared')

const { FieldValue } = admin.firestore
const MAX_JOIN_CODE_ATTEMPTS = 10

async function getUserSummary(userId) {
  const userSnapshot = await db.collection('users').doc(userId).get()
  const user = userSnapshot.exists ? userSnapshot.data() : {}

  return {
    uid: userId,
    username: user.username || user.email || userId,
  }
}

async function createUniqueJoinCode() {
  for (let attempt = 0; attempt < MAX_JOIN_CODE_ATTEMPTS; attempt += 1) {
    const joinCode = generateJoinCode()
    const existingGroups = await db
      .collection('groups')
      .where('joinCode', '==', joinCode)
      .limit(1)
      .get()

    if (existingGroups.empty) {
      return joinCode
    }
  }

  throw new HttpsError('internal', 'Unable to create a unique join code.')
}

async function addGroupToUserProfile(userId, groupId) {
  await db.collection('users').doc(userId).set(
    {
      groups: FieldValue.arrayUnion(groupId),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  )
}

async function removeGroupFromUserProfile(userId, groupId) {
  await db.collection('users').doc(userId).set(
    {
      groups: FieldValue.arrayRemove(groupId),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  )
}

// Creates a group owned by the signed-in user and adds it to their profile membership list.
const createGroup = onCall(CALLABLE_OPTIONS, async (request) => {
  const userId = requireAuth(request)
  const ownerSummary = await getUserSummary(userId)

  const joinCode = await createUniqueJoinCode()
  const group = {
    ...createGroupFromRequest(request, joinCode),
    memberSummaries: [ownerSummary],
  }
  const groupRef = await db.collection('groups').add(group)

  await addGroupToUserProfile(group.ownerId, groupRef.id)

  return {
    id: groupRef.id,
    ...group,
  }
})

// Adds the signed-in user to an existing group by join code.
const joinGroup = onCall(CALLABLE_OPTIONS, async (request) => {
  const userId = requireAuth(request)
  const joinCode = request.data?.joinCode?.trim()?.toUpperCase()

  if (!joinCode) {
    throw new HttpsError('invalid-argument', 'Join code is required.')
  }

  const groupSnapshot = await db
    .collection('groups')
    .where('joinCode', '==', joinCode)
    .limit(1)
    .get()

  if (groupSnapshot.empty) {
    throw new HttpsError('not-found', 'Group was not found.')
  }

  const groupDocument = groupSnapshot.docs[0]
  const group = groupDocument.data()
  const userSummary = await getUserSummary(userId)

  if (!Array.isArray(group.memberIds)) {
    group.memberIds = []
  }

  if (!Array.isArray(group.memberSummaries)) {
    group.memberSummaries = []
  }

  if (!group.memberIds.includes(userId)) {
    await groupDocument.ref.set(
      {
        memberIds: FieldValue.arrayUnion(userId),
        memberSummaries: FieldValue.arrayUnion(userSummary),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    )
  }

  await addGroupToUserProfile(userId, groupDocument.id)

  return {
    id: groupDocument.id,
    ...group,
    memberIds: group.memberIds.includes(userId)
      ? group.memberIds
      : [...group.memberIds, userId],
    memberSummaries: group.memberSummaries.some((member) => member.uid === userId)
      ? group.memberSummaries
      : [...group.memberSummaries, userSummary],
  }
})

// Removes the signed-in user from a group unless they are the owner.
const leaveGroup = onCall(CALLABLE_OPTIONS, async (request) => {
  const userId = requireAuth(request)
  const groupId = request.data?.groupId

  if (typeof groupId !== 'string' || !groupId) {
    throw new HttpsError('invalid-argument', 'Group id is required.')
  }

  const groupRef = db.collection('groups').doc(groupId)
  const groupSnapshot = await groupRef.get()

  if (!groupSnapshot.exists) {
    throw new HttpsError('not-found', 'Group was not found.')
  }

  const group = groupSnapshot.data()

  if (group.ownerId === userId) {
    throw new HttpsError('failed-precondition', 'Group owners must delete the group instead of leaving it.')
  }

  await groupRef.set(
    {
      memberIds: FieldValue.arrayRemove(userId),
      memberSummaries: (Array.isArray(group.memberSummaries) ? group.memberSummaries : [])
        .filter((member) => member.uid !== userId),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  )

  await removeGroupFromUserProfile(userId, groupId)

  return {
    ok: true,
    groupId,
  }
})

// Updates the name and description of a group when the signed-in user owns it.
const updateGroup = onCall(CALLABLE_OPTIONS, async (request) => {
  const userId = requireAuth(request)
  const groupId = normalizeRequiredString(request.data?.groupId, 'Group id')
  const name = normalizeRequiredString(request.data?.name, 'Group name')
  const description = normalizeOptionalString(request.data?.description)
  logger.info('updateGroup request received', { groupId, userId })

  const groupRef = db.collection('groups').doc(groupId)
  const groupSnapshot = await groupRef.get()

  if (!groupSnapshot.exists) {
    throw new HttpsError('not-found', 'Group was not found.')
  }

  const group = groupSnapshot.data()

  if (group.ownerId !== userId) {
    throw new HttpsError('permission-denied', 'Only the group owner can edit the group.')
  }

  const updatedGroup = {
    ...group,
    name,
    description,
    updatedAt: new Date().toISOString(),
  }

  await groupRef.set(
    {
      name,
      description,
      updatedAt: updatedGroup.updatedAt,
    },
    { merge: true },
  )

  return {
    id: groupId,
    ...updatedGroup,
  }
})

// Deletes a group only when the signed-in user owns it and removes it from all member profiles.
const deleteGroup = onCall(CALLABLE_OPTIONS, async (request) => {
  const userId = requireAuth(request)
  const groupId = request.data?.groupId

  if (typeof groupId !== 'string' || !groupId) {
    throw new HttpsError('invalid-argument', 'Group id is required.')
  }

  const groupRef = db.collection('groups').doc(groupId)
  const groupSnapshot = await groupRef.get()

  if (!groupSnapshot.exists) {
    return {
      ok: true,
      groupId,
    }
  }

  const group = groupSnapshot.data()

  if (group.ownerId !== userId) {
    throw new HttpsError('permission-denied', 'Only the group owner can delete the group.')
  }

  const batch = db.batch()

  if (Array.isArray(group.memberIds)) {
    group.memberIds.forEach((memberId) => {
      const userRef = db.collection('users').doc(memberId)
      batch.set(
        userRef,
        {
          groups: FieldValue.arrayRemove(groupId),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      )
    })
  }

  const groupFeedSnapshot = await db
    .collection('groupFeed')
    .where('groupId', '==', groupId)
    .get()

  groupFeedSnapshot.forEach((document) => {
    batch.delete(document.ref)
  })

  batch.delete(groupRef)
  await batch.commit()

  return {
    ok: true,
    groupId,
  }
})

// Creates a new feed post for a group when the signed-in user is a member.
const createGroupPost = onCall(CALLABLE_OPTIONS, async (request) => {
  const userId = requireAuth(request)
  const groupId = normalizeRequiredString(request.data?.groupId, 'Group id')
  const groupRef = db.collection('groups').doc(groupId)
  const groupSnapshot = await groupRef.get()

  if (!groupSnapshot.exists) {
    throw new HttpsError('not-found', 'Group was not found.')
  }

  const group = groupSnapshot.data()

  if (!Array.isArray(group.memberIds) || !group.memberIds.includes(userId)) {
    throw new HttpsError('permission-denied', 'You must be a member of the group.')
  }

  const post = createGroupPostFromRequest(request)
  const postRef = await db.collection('groupFeed').add(post)

  return {
    id: postRef.id,
    ...post,
  }
})

async function getPostAndGroupForWrite(postId) {
  const postRef = db.collection('groupFeed').doc(postId)
  const postSnapshot = await postRef.get()

  if (!postSnapshot.exists) {
    throw new HttpsError('not-found', 'Post was not found.')
  }

  const post = postSnapshot.data()
  const groupRef = db.collection('groups').doc(post.groupId)
  const groupSnapshot = await groupRef.get()

  if (!groupSnapshot.exists) {
    throw new HttpsError('not-found', 'Group was not found.')
  }

  return {
    postRef,
    post,
    group: groupSnapshot.data(),
  }
}

// Updates a feed post when the signed-in user created it or owns the parent group.
const updateGroupPost = onCall(CALLABLE_OPTIONS, async (request) => {
  const userId = requireAuth(request)
  const postId = normalizeRequiredString(request.data?.postId, 'Post id')
  const title = normalizeRequiredString(request.data?.title, 'Post title')
  const body = normalizeRequiredString(request.data?.body, 'Post body')
  logger.info('updateGroupPost request received', { postId, userId })

  const { postRef, post, group } = await getPostAndGroupForWrite(postId)
  const canEditPost = post.createdBy === userId || group.ownerId === userId

  if (!canEditPost) {
    throw new HttpsError('permission-denied', 'You do not have permission to edit this post.')
  }

  const updatedAt = new Date().toISOString()

  await postRef.set(
    {
      title,
      body,
      updatedAt,
    },
    { merge: true },
  )

  return {
    id: postId,
    ...post,
    title,
    body,
    updatedAt,
  }
})

// Deletes a feed post when the signed-in user created it or owns the parent group.
const deleteGroupPost = onCall(CALLABLE_OPTIONS, async (request) => {
  const userId = requireAuth(request)
  const postId = normalizeRequiredString(request.data?.postId, 'Post id')
  const { postRef, post, group } = await getPostAndGroupForWrite(postId)
  const canDeletePost = post.createdBy === userId || group.ownerId === userId

  if (!canDeletePost) {
    throw new HttpsError('permission-denied', 'You do not have permission to delete this post.')
  }

  await postRef.delete()

  return {
    ok: true,
    postId,
  }
})

module.exports = {
  createGroup,
  joinGroup,
  leaveGroup,
  updateGroup,
  deleteGroup,
  createGroupPost,
  updateGroupPost,
  deleteGroupPost,
}
