import { defineStore } from 'pinia'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'

import { db, functions } from '../services/firebase'

type MemberSummary = {
  uid: string
  username: string
}

type Group = {
  id: string
  name: string
  description: string
  joinCode: string
  ownerId: string
  memberIds: string[]
  memberSummaries?: MemberSummary[]
  createdAt?: string
  updatedAt?: string
}

type GroupPost = {
  id: string
  groupId: string
  title: string
  body: string
  createdBy: string
  createdAt: string
  updatedAt?: string
}

type GroupDetails = {
  name: string
  description?: string
}

type GroupPostDetails = {
  title: string
  body: string
}

type GroupsState = {
  ownerId: string
  userGroups: Group[]
  activeGroupId: string
  groupFeed: GroupPost[]
  isLoading: boolean
  error: string
  unsubscribe: null | (() => void)
  feedUnsubscribe: null | (() => void)
}

const createGroupFunction = httpsCallable<GroupDetails, Group>(functions, 'createGroup')
const joinGroupFunction = httpsCallable<{ joinCode: string }, Group>(functions, 'joinGroup')
const leaveGroupFunction = httpsCallable<{ groupId: string }, { ok: boolean; groupId: string }>(functions, 'leaveGroup')
const updateGroupFunction = httpsCallable<{ groupId: string } & GroupDetails, Group>(functions, 'updateGroup')
const deleteGroupFunction = httpsCallable<{ groupId: string }, { ok: boolean; groupId: string }>(functions, 'deleteGroup')
const createGroupPostFunction = httpsCallable<{ groupId: string } & GroupPostDetails, GroupPost>(functions, 'createGroupPost')
const updateGroupPostFunction = httpsCallable<{ postId: string } & GroupPostDetails, GroupPost>(functions, 'updateGroupPost')
const deleteGroupPostFunction = httpsCallable<{ postId: string }, { ok: boolean; postId: string }>(functions, 'deleteGroupPost')

export const useGroupsStore = defineStore('groups', {
  state: (): GroupsState => ({
    ownerId: '',
    userGroups: [],
    activeGroupId: '',
    groupFeed: [],
    isLoading: false,
    error: '',
    unsubscribe: null,
    feedUnsubscribe: null,
  }),
  getters: {
    activeGroup(state): Group | null {
      return state.userGroups.find((group) => group.id === state.activeGroupId) ?? null
    },
    isActiveGroupOwner(state): boolean {
      const activeGroup = state.userGroups.find((group) => group.id === state.activeGroupId)
      return Boolean(activeGroup && activeGroup.ownerId === state.ownerId)
    },
  },
  actions: {
    upsertGroup(group: Group) {
      const existingIndex = this.userGroups.findIndex((currentGroup) => currentGroup.id === group.id)

      if (existingIndex >= 0) {
        this.userGroups.splice(existingIndex, 1, group)
      } else {
        this.userGroups.push(group)
      }

      this.userGroups.sort((left, right) => left.name.localeCompare(right.name))
    },
    init(ownerId: string) {
      if (!ownerId) {
        this.reset()
        return
      }

      if (this.ownerId === ownerId && this.unsubscribe && (this.userGroups.length || this.isLoading) && !this.error) {
        return
      }

      this.resetListener()
      this.ownerId = ownerId
      this.isLoading = true
      this.error = ''

      const groupsQuery = query(
        collection(db, 'groups'),
        where('memberIds', 'array-contains', ownerId),
      )

      this.unsubscribe = onSnapshot(
        groupsQuery,
        (snapshot) => {
          this.error = ''
          this.userGroups = snapshot.docs
            .map((docSnapshot) => ({
              id: docSnapshot.id,
              ...(docSnapshot.data() as Omit<Group, 'id'>),
            }))
            .sort((left, right) => left.name.localeCompare(right.name))

          if (!this.userGroups.length) {
            this.activeGroupId = ''
          } else if (!this.userGroups.some((group) => group.id === this.activeGroupId)) {
            this.activeGroupId = this.userGroups[0].id
          }

          this.syncActiveGroupFeed()
          this.isLoading = false
        },
        (error) => {
          console.error(error)
          this.error = 'Unable to load groups right now.'
          this.isLoading = false
          this.unsubscribe = null
        },
      )
    },
    resetListener() {
      if (typeof this.unsubscribe === 'function') {
        this.unsubscribe()
      }

      this.unsubscribe = null
    },
    resetFeedListener() {
      if (typeof this.feedUnsubscribe === 'function') {
        this.feedUnsubscribe()
      }

      this.feedUnsubscribe = null
    },
    reset() {
      this.resetListener()
      this.resetFeedListener()
      this.ownerId = ''
      this.userGroups = []
      this.activeGroupId = ''
      this.groupFeed = []
      this.isLoading = false
      this.error = ''
    },
    cleanup() {
      this.reset()
    },
    setActiveGroup(groupId: string) {
      this.activeGroupId = groupId
      this.error = ''
      this.syncActiveGroupFeed()
    },
    clearError() {
      this.error = ''
    },
    async createGroup(groupDetails: GroupDetails) {
      this.error = ''

      try {
        const response = await createGroupFunction(groupDetails)
        const group = response.data
        this.upsertGroup(group)
        this.activeGroupId = group.id
        return group
      } catch (error: any) {
        console.error(error)
        this.error = error?.message || 'Unable to create the group.'
        throw error
      }
    },
    async joinGroup(joinCode: string) {
      this.error = ''

      try {
        const response = await joinGroupFunction({
          joinCode: joinCode.trim().toUpperCase(),
        })

        const group = response.data
        this.upsertGroup(group)
        this.activeGroupId = group.id
        return group
      } catch (error: any) {
        console.error(error)
        this.error = error?.message || 'Unable to join the group.'
        throw error
      }
    },
    async leaveGroup(groupId: string) {
      this.error = ''

      try {
        await leaveGroupFunction({ groupId })
        this.userGroups = this.userGroups.filter((group) => group.id !== groupId)

        if (this.activeGroupId === groupId) {
          this.activeGroupId = ''
        }
      } catch (error: any) {
        console.error(error)
        this.error = error?.message || 'Unable to leave the group.'
        throw error
      }
    },
    async updateGroup(groupId: string, groupDetails: GroupDetails) {
      this.error = ''

      try {
        const response = await updateGroupFunction({
          groupId,
          ...groupDetails,
        })

        const group = response.data
        this.upsertGroup(group)
        return group
      } catch (error: any) {
        console.error(error)
        this.error = error?.message || 'Unable to update the group.'
        throw error
      }
    },
    async deleteGroup(groupId: string) {
      this.error = ''

      try {
        await deleteGroupFunction({ groupId })
        this.userGroups = this.userGroups.filter((group) => group.id !== groupId)

        if (this.activeGroupId === groupId) {
          this.activeGroupId = ''
        }
      } catch (error: any) {
        console.error(error)
        this.error = error?.message || 'Unable to delete the group.'
        throw error
      }
    },
    syncActiveGroupFeed() {
      this.resetFeedListener()

      if (!this.activeGroupId) {
        this.groupFeed = []
        return
      }

      const groupFeedQuery = query(
        collection(db, 'groupFeed'),
        where('groupId', '==', this.activeGroupId),
      )

      this.feedUnsubscribe = onSnapshot(
        groupFeedQuery,
        (snapshot) => {
          this.error = ''
          this.groupFeed = snapshot.docs
            .map((docSnapshot) => ({
              id: docSnapshot.id,
              ...(docSnapshot.data() as Omit<GroupPost, 'id'>),
            }))
            .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        },
        (error) => {
          console.error(error)
          this.error = 'Unable to load the group feed right now.'
          this.feedUnsubscribe = null
        },
      )
    },
    async createPost(postDetails: GroupPostDetails) {
      this.error = ''

      try {
        const response = await createGroupPostFunction({
          groupId: this.activeGroupId,
          ...postDetails,
        })

        return response.data
      } catch (error: any) {
        console.error(error)
        this.error = error?.message || 'Unable to post to the group feed.'
        throw error
      }
    },
    async updatePost(postId: string, postDetails: GroupPostDetails) {
      this.error = ''

      try {
        const response = await updateGroupPostFunction({
          postId,
          ...postDetails,
        })

        const updatedPost = response.data
        this.groupFeed = this.groupFeed.map((post) => (
          post.id === postId ? updatedPost : post
        ))

        return updatedPost
      } catch (error: any) {
        console.error(error)
        this.error = error?.message || 'Unable to update the post.'
        throw error
      }
    },
    async deletePost(postId: string) {
      this.error = ''

      try {
        await deleteGroupPostFunction({ postId })
        this.groupFeed = this.groupFeed.filter((post) => post.id !== postId)
      } catch (error: any) {
        console.error(error)
        this.error = error?.message || 'Unable to delete the post.'
        throw error
      }
    },
  },
})

export type { Group, GroupDetails, GroupPost, GroupPostDetails, MemberSummary }
