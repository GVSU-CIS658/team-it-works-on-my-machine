const { onCall, HttpsError } = require('firebase-functions/v2/https')

const {
  CALLABLE_OPTIONS,
  db,
  normalizeTaskUpdates,
  requireAuth,
} = require('./shared')

// Creates a task owned by the signed-in user.
const createTask = onCall(CALLABLE_OPTIONS, async (request) => {
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
const updateTask = onCall(CALLABLE_OPTIONS, async (request) => {
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
const deleteTask = onCall(CALLABLE_OPTIONS, async (request) => {
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

module.exports = {
  createTask,
  updateTask,
  deleteTask,
}
