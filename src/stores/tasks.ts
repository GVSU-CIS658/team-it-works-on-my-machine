import { defineStore } from 'pinia'
import { collection, onSnapshot, query, where, type QueryDocumentSnapshot } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'

import { db, functions } from '../services/firebase'

type Task = {
  id: string
  ownerId: string
  description: string
  date: Date
  dueAt: string
  isCompleted: boolean
  isHidden: boolean
  createdAt?: string
  updatedAt?: string
}

type TaskPayload = {
  id: string
  ownerId: string
  description: string
  dueAt?: string
  date?: string
  isCompleted?: boolean
  isHidden?: boolean
  createdAt?: string
  updatedAt?: string
}

type TaskUpdates = {
  description?: string
  dueAt?: string
  isCompleted?: boolean
  isHidden?: boolean
}

export const TASK_FILTER_OPTIONS = Object.freeze({
  ALL: 'all',
  FINISHED: 'finished',
  UNFINISHED: 'unfinished',
  SOONER: 'sooner',
  LATER: 'later',
})

export const TASK_SORT_OPTIONS = Object.freeze({
  NONE: 'none',
  DATE: 'date',
  ALPHABET: 'alphabet',
})

type TaskFilterOption = typeof TASK_FILTER_OPTIONS[keyof typeof TASK_FILTER_OPTIONS]
type TaskSortOption = typeof TASK_SORT_OPTIONS[keyof typeof TASK_SORT_OPTIONS]

const createTaskFunction = httpsCallable(functions, 'createTask')
const updateTaskFunction = httpsCallable(functions, 'updateTask')
const deleteTaskFunction = httpsCallable(functions, 'deleteTask')

function toTask(document: QueryDocumentSnapshot): Task {
  const data = document.data() as TaskPayload
  const dueAt = data.dueAt ?? data.date ?? new Date().toISOString()

  return {
    id: document.id,
    ownerId: data.ownerId,
    description: data.description,
    date: new Date(dueAt),
    dueAt,
    isCompleted: Boolean(data.isCompleted),
    isHidden: Boolean(data.isHidden),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}

export const DashboardTask = defineStore('DashboardTask', {
  state: () => ({
    ownerId: '',
    tasks: [] as Task[],
    filteredTasks: [] as Task[],
    myFilter: TASK_FILTER_OPTIONS.ALL as TaskFilterOption,
    unsubscribe: null as null | (() => void),
    error: '',
  }),

  actions: {
    clearError() {
      this.error = ''
    },

    init(ownerId: string) {
      if (!ownerId) {
        return
      }

      if (this.ownerId === ownerId && this.unsubscribe) {
        return
      }

      if (this.unsubscribe) {
        this.unsubscribe()
        this.unsubscribe = null
      }

      this.ownerId = ownerId
      this.error = ''

      const taskQuery = query(
        collection(db, 'Tasks'),
        where('ownerId', '==', this.ownerId),
      )

      this.unsubscribe = onSnapshot(
        taskQuery,
        (snapshot) => {
          this.tasks = snapshot.docs.map(toTask)
        },
        (error) => {
          this.error = error.message
          this.tasks = []
          this.unsubscribe = null
        },
      )
    },

    async addTask(description: string, dueAt?: string) {
      const normalizedDescription = description.trim()

      if (!normalizedDescription) {
        return
      }

      this.error = ''

      try {
        await createTaskFunction({
          description: normalizedDescription,
          dueAt: dueAt ?? new Date().toISOString(),
        })
      } catch (error: any) {
        this.error = error?.message || 'Unable to create the task.'
        throw error
      }
    },

    async updateTask(taskId: string, updates: TaskUpdates) {
      if (!taskId) {
        return
      }

      this.error = ''

      try {
        await updateTaskFunction({
          taskId,
          ...updates,
        })
      } catch (error: any) {
        this.error = error?.message || 'Unable to update the task.'
        throw error
      }
    },

    async deleteTask(taskId: string) {
      if (!taskId) {
        return
      }

      this.error = ''

      try {
        await deleteTaskFunction({ taskId })
      } catch (error: any) {
        this.error = error?.message || 'Unable to delete the task.'
        throw error
      }
    },

    filterTask(option: TaskFilterOption) {
      this.myFilter = option
    },
  },
})

export type { TaskFilterOption }
export type { TaskSortOption }
export type { TaskUpdates }
export type { Task }
