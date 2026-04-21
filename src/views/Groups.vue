<template>
  <div class="groups-view">
    <div class="page-hero">
      <h1>Groups & Communities</h1>
    </div>

    <div class="content-card--wide">
      <aside class="groups-sidebar">
        <div v-if="groupsStore.error" class="groups-error-message">
          {{ groupsStore.error }}
        </div>

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
              color="primary"
              variant="flat"
              :disabled="!canJoinGroup"
              @click="handleJoinGroup"
            >
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
            <v-textarea
              v-model="newGroupDescription"
              label="Description"
              variant="outlined"
              auto-grow
              rows="3"
              hide-details
            />
            <v-btn
              color="secondary"
              variant="flat"
              :disabled="!canCreateGroup"
              @click="handleCreateGroup"
            >
              Create
            </v-btn>
          </div>
        </div>

        <div v-if="groupsStore.isLoading" class="feed-status">Loading groups...</div>

        <div v-else-if="groupsStore.userGroups.length" class="groups-list">
          <h3>Your Groups</h3>
          <v-list bg-color="transparent">
            <v-list-item
              v-for="group in groupsStore.userGroups"
              :key="group.id"
              :title="group.name"
              :subtitle="group.description"
              :class="{ 'is-active': groupsStore.activeGroupId === group.id }"
              @click="groupsStore.setActiveGroup(group.id)"
            />
          </v-list>
        </div>
      </aside>

      <main class="groups-stage">
        <template v-if="activeGroup">
          <div class="stage-header">
            <div class="groups-stage-heading">
              <h2>{{ activeGroup.name }}</h2>
              <p>{{ activeGroup.description }}</p>
              <div class="groups-join-code">Join Code: {{ activeGroup.joinCode }}</div>
            </div>

            <div class="groups-stage-actions">
              <v-tooltip text="Leave Group" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-exit-to-app"
                    variant="text"
                    color="error"
                    aria-label="Leave Group"
                    @click="handleLeaveGroup"
                  />
                </template>
              </v-tooltip>
              <v-tooltip v-if="isActiveGroupOwner" text="Delete Group" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-trash-can"
                    variant="text"
                    color="error"
                    aria-label="Delete Group"
                    @click="handleDeleteGroup"
                  />
                </template>
              </v-tooltip>
            </div>
          </div>

          <div class="groups-feed--create">
            <v-text-field
              v-model="newPostTitle"
              label="Post Title"
              variant="outlined"
              density="compact"
              hide-details
            />
            <v-textarea
              v-model="newPostBody"
              label="Share with the group..."
              variant="outlined"
              auto-grow
              rows="3"
              hide-details
            />
            <v-btn
              class="mt-2"
              color="primary"
              :disabled="!canCreatePost"
              @click="handleCreatePost"
            >
              Post
            </v-btn>
          </div>

          <div class="groups-feed--stream">
            <div v-if="!groupsStore.groupFeed.length" class="feed-status">No posts yet. Be the first.</div>
            <template v-else>
              <v-card
                v-for="post in groupsStore.groupFeed"
                :key="post.id"
                class="feed-post"
                variant="outlined"
              >
                <v-card-title>{{ post.title }}</v-card-title>
                <v-card-subtitle>{{ formatPostDate(post.createdAt) }}</v-card-subtitle>
                <v-card-text>{{ post.body }}</v-card-text>
              </v-card>
            </template>
          </div>
        </template>

        <div v-else class="groups-stage--empty">
          <p>Select a group or join one to see the details.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

import { useAuthStore } from '../stores/auth'
import { useGroupsStore } from '../stores/groups'

const auth = useAuthStore()
const groupsStore = useGroupsStore()
const joinCodeInput = ref('')
const newGroupName = ref('')
const newGroupDescription = ref('')
const newPostTitle = ref('')
const newPostBody = ref('')

const activeGroup = computed(() => groupsStore.activeGroup)
const isActiveGroupOwner = computed(() => groupsStore.isActiveGroupOwner)
const canJoinGroup = computed(() => Boolean(joinCodeInput.value.trim()))
const canCreateGroup = computed(() => Boolean(newGroupName.value.trim()))
const canCreatePost = computed(() => Boolean(newPostTitle.value.trim() && newPostBody.value.trim()))

watch(
  () => auth.user?.uid ?? '',
  (userId) => {
    groupsStore.init(userId)
  },
  { immediate: true },
)

async function handleJoinGroup() {
  if (!joinCodeInput.value.trim()) {
    return
  }

  try {
    await groupsStore.joinGroup(joinCodeInput.value)
    joinCodeInput.value = ''
  } catch {
    // Store state already exposes the user-facing error.
  }
}

async function handleCreateGroup() {
  if (!newGroupName.value.trim()) {
    return
  }

  try {
    await groupsStore.createGroup({
      name: newGroupName.value,
      description: newGroupDescription.value,
    })

    newGroupName.value = ''
    newGroupDescription.value = ''
  } catch {
    // Store state already exposes the user-facing error.
  }
}

async function handleLeaveGroup() {
  if (!activeGroup.value) {
    return
  }

  try {
    await groupsStore.leaveGroup(activeGroup.value.id)
  } catch {
    // Store state already exposes the user-facing error.
  }
}

async function handleDeleteGroup() {
  if (!activeGroup.value) {
    return
  }

  try {
    await groupsStore.deleteGroup(activeGroup.value.id)
  } catch {
    // Store state already exposes the user-facing error.
  }
}

async function handleCreatePost() {
  if (!newPostTitle.value.trim() || !newPostBody.value.trim()) {
    return
  }

  try {
    await groupsStore.createPost({
      title: newPostTitle.value,
      body: newPostBody.value,
    })

    newPostTitle.value = ''
    newPostBody.value = ''
  } catch {
    // Store state already exposes the user-facing error.
  }
}

function formatPostDate(value) {
  const postDate = new Date(value)

  if (Number.isNaN(postDate.getTime())) {
    return ''
  }

  return postDate.toLocaleString()
}
</script>

<style scoped lang="sass" src="../styles/pages/groups.sass"></style>
