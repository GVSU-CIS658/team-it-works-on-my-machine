<template>
  <div class="groups-view">
    <div class="page-hero">
      <h1>Groups & Communities</h1>
    </div>

    <div class="content-card--wide">
      <aside class="groups-sidebar">
        <div class="groups-actions">
          <div class="action-group">
            <v-text-field
              v-model="joinCodeInput"
              label="Join Code"
              variant="outlined"
              density="compact"
              hide-details
            />
            <v-btn
              class="groups-action-button groups-action-button--pill"
              color="primary"
              variant="flat"
              @click="handleJoinGroup">
              Join
            </v-btn>
          </div>

          <div class="action-group">
            <v-text-field
              v-model="newGroupName"
              label="Group Name"
              variant="outlined"
              density="compact"
              hide-details
            />
            <v-btn
              class="groups-action-button groups-action-button--pill"
              color="secondary"
              variant="flat"
              @click="handleCreateGroup">
              Create
            </v-btn>
          </div>
        </div>

        <div v-if="groupsStore.userGroups.length" class="groups-list">
          <h3>Your Groups</h3>
          <v-list bg-color="transparent">
            <v-list-item
              v-for="group in groupsStore.userGroups"
              :key="group.id"
              :title="group.name"
              :class="{ 'is-active': groupsStore.activeGroup?.id === group.id }"
              @click="groupsStore.activeGroup = group"
            />
          </v-list>
        </div>
      </aside>

      <main class="groups-stage">
        <template v-if="groupsStore.activeGroup">
          <div class="stage-header">
            <h2>{{ groupsStore.activeGroup.name }} Feed</h2>
            <v-btn variant="text" color="error" @click="handleLeaveGroup">
              Leave Group
            </v-btn>
          </div>

          <div class="groups-feed--create">
            <v-textarea
              v-model="newPostContent"
              label="Share with the group..."
              variant="outlined"
              auto-grow
              rows="2"
              hide-details
            />
            <v-btn class="mt-2" color="primary" @click="handleCreatePost">
              Post
            </v-btn>
          </div>

          <div class="groups-feed--stream">
            <div v-if="groupsStore.isLoading" class="feed-status">
              Loading feed...
            </div>
            <div v-else-if="!groupsStore.groupFeed.length" class="feed-status">
              No posts yet. Be the first!
            </div>

            <v-card
              v-for="post in groupsStore.groupFeed"
              v-else
              :key="post.id"
              class="feed-post"
              variant="outlined"
            >
              <v-card-text>{{ post.content }}</v-card-text>
            </v-card>
          </div>
        </template>

        <div v-else class="groups-stage--empty">
          <p>Select a group or join one to see the feed.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import { useGroupsStore } from '../stores/groups'

const groupsStore = useGroupsStore()

const joinCodeInput = ref('')
const newGroupName = ref('')
const newPostContent = ref('')

function handleJoinGroup() {
  if (joinCodeInput.value) {
    groupsStore.joinGroup(joinCodeInput.value)
    joinCodeInput.value = ''
  }
}

function handleCreateGroup() {
  if (newGroupName.value) {
    groupsStore.createGroup(newGroupName.value)
    newGroupName.value = ''
  }
}

function handleLeaveGroup() {
  if (groupsStore.activeGroup) {
    groupsStore.leaveGroup(groupsStore.activeGroup.id)
  }
}

function handleCreatePost() {
  if (newPostContent.value) {
    groupsStore.createPost(newPostContent.value)
    newPostContent.value = ''
  }
}
</script>

<style scoped lang="sass" src="../styles/pages/groups.sass"></style>
