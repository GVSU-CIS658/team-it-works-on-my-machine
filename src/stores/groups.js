import { defineStore } from 'pinia'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'

import { db, functions } from '../services/firebase'

const createGroupFunction = httpsCallable(functions, 'createGroup')
const joinGroupFunction = httpsCallable(functions, 'joinGroup')
const leaveGroupFunction = httpsCallable(functions, 'leaveGroup')
const updateGroupFunction = httpsCallable(functions, 'updateGroup')
const deleteGroupFunction = httpsCallable(functions, 'deleteGroup')
const createGroupPostFunction = httpsCallable(functions, 'createGroupPost')
const updateGroupPostFunction = httpsCallable(functions, 'updateGroupPost')
const deleteGroupPostFunction = httpsCallable(functions, 'deleteGroupPost')

export const useGroupsStore = defineStore('groups', {
  state: () => ({
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
    activeGroup(state) {
      return state.userGroups.find((group) => group.id === state.activeGroupId) ?? null
    },
    isActiveGroupOwner(state) {
      const activeGroup = state.userGroups.find((group) => group.id === state.activeGroupId)
      return Boolean(activeGroup && activeGroup.ownerId === state.ownerId)
    },
  },
  actions: {
    upsertGroup(group) {
      const existingIndex = this.userGroups.findIndex((currentGroup) => currentGroup.id === group.id)

      if (existingIndex >= 0) {
        this.userGroups.splice(existingIndex, 1, group)
      } else {
        this.userGroups.push(group)
      }

      this.userGroups.sort((left, right) => left.name.localeCompare(right.name))
    },
    init(ownerId) {
      if (!ownerId) {
        this.reset()
        return
      }

      if (this.ownerId === ownerId && this.unsubscribe) {
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
          this.userGroups = snapshot.docs
            .map((docSnapshot) => ({
              id: docSnapshot.id,
              ...docSnapshot.data(),
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
    setActiveGroup(groupId) {
      this.activeGroupId = groupId
      this.error = ''
      this.syncActiveGroupFeed()
    },
    clearError() {
      this.error = ''
    },
    async createGroup(groupDetails) {
      this.error = ''

      try {
        const response = await createGroupFunction(groupDetails)
        const group = response.data
        this.upsertGroup(group)
        this.activeGroupId = group.id
        return group
      } catch (error) {
        console.error(error)
        this.error = error.message || 'Unable to create the group.'
        throw error
      }
    },
    async joinGroup(joinCode) {
      this.error = ''

      try {
        const response = await joinGroupFunction({
          joinCode: joinCode.trim().toUpperCase(),
        })

        const group = response.data
        this.upsertGroup(group)
        this.activeGroupId = group.id
        return group
      } catch (error) {
        console.error(error)
        this.error = error.message || 'Unable to join the group.'
        throw error
      }
    },
    async leaveGroup(groupId) {
      this.error = ''

      try {
        await leaveGroupFunction({ groupId })
        this.userGroups = this.userGroups.filter((group) => group.id !== groupId)

        if (this.activeGroupId === groupId) {
          this.activeGroupId = ''
        }
      } catch (error) {
        console.error(error)
        this.error = error.message || 'Unable to leave the group.'
        throw error
      }
    },
    async updateGroup(groupId, groupDetails) {
      this.error = ''

      try {
        const response = await updateGroupFunction({
          groupId,
          ...groupDetails,
        })

        const group = response.data
        this.upsertGroup(group)
        return group
      } catch (error) {
        console.error(error)
        this.error = error.message || 'Unable to update the group.'
        throw error
      }
    },
    async deleteGroup(groupId) {
      this.error = ''

      try {
        await deleteGroupFunction({ groupId })
        this.userGroups = this.userGroups.filter((group) => group.id !== groupId)

        if (this.activeGroupId === groupId) {
          this.activeGroupId = ''
        }
      } catch (error) {
        console.error(error)
        this.error = error.message || 'Unable to delete the group.'
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
          this.groupFeed = snapshot.docs
            .map((docSnapshot) => ({
              id: docSnapshot.id,
              ...docSnapshot.data(),
            }))
            .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        },
        (error) => {
          console.error(error)
          this.error = 'Unable to load the group feed right now.'
        },
      )
    },
    async createPost(postDetails) {
      this.error = ''

      try {
        const response = await createGroupPostFunction({
          groupId: this.activeGroupId,
          ...postDetails,
        })

        return response.data
      } catch (error) {
        console.error(error)
        this.error = error.message || 'Unable to post to the group feed.'
        throw error
      }
    },
    async updatePost(postId, postDetails) {
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
      } catch (error) {
        console.error(error)
        this.error = error.message || 'Unable to update the post.'
        throw error
      }
    },
    async deletePost(postId) {
      this.error = ''

      try {
        await deleteGroupPostFunction({ postId })
        this.groupFeed = this.groupFeed.filter((post) => post.id !== postId)
      } catch (error) {
        console.error(error)
        this.error = error.message || 'Unable to delete the post.'
        throw error
      }
    },
  },
})
