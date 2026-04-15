import { defineStore } from 'pinia'

function createGroup(name) {
  const trimmedName = name.trim()

  return {
    id: `group-${Date.now()}`,
    name: trimmedName,
    joinCode: trimmedName.toLowerCase().replace(/\s+/g, '-'),
  }
}

export const useGroupsStore = defineStore('groups', {
  state: () => ({
    userGroups: [],
    activeGroup: null,
    groupFeed: [],
    isLoading: false,
  }),

  actions: {
    createGroup(name) {
      const group = createGroup(name)

      this.userGroups.push(group)
      this.activeGroup = group
    },

    joinGroup(joinCode) {
      const normalizedJoinCode = joinCode.trim()

      if (!normalizedJoinCode) {
        return
      }

      const existingGroup = this.userGroups.find(
        (group) => group.joinCode === normalizedJoinCode,
      )

      if (existingGroup) {
        this.activeGroup = existingGroup
        return
      }

      const group = {
        id: `joined-${Date.now()}`,
        name: `Joined ${normalizedJoinCode}`,
        joinCode: normalizedJoinCode,
      }

      this.userGroups.push(group)
      this.activeGroup = group
    },

    leaveGroup(groupId) {
      this.userGroups = this.userGroups.filter((group) => group.id !== groupId)
      this.groupFeed = []

      if (this.activeGroup?.id === groupId) {
        this.activeGroup = this.userGroups[0] ?? null
      }
    },

    createPost(content) {
      if (!this.activeGroup) {
        return
      }

      this.groupFeed.unshift({
        id: `post-${Date.now()}`,
        groupId: this.activeGroup.id,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      })
    },
  },
})
