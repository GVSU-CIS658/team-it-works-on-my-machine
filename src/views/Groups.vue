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
              type="button"
              color="primary"
              variant="flat"
              :disabled="!canJoinGroup"
              @click.stop.prevent="handleJoinGroup"
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
              type="button"
              color="secondary"
              variant="flat"
              :disabled="!canCreateGroup"
              @click.stop.prevent="handleCreateGroup"
            >
              Create
            </v-btn>
          </div>
        </div>

        <div v-if="groupsStore.isLoading" class="feed-status">Loading groups...</div>

        <div v-else-if="groupsStore.userGroups.length" class="groups-list">
          <h3>Your Groups</h3>
          <v-list bg-color="transparent">
            <v-tooltip
              v-for="group in groupsStore.userGroups"
              :key="group.id"
              location="top"
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  :title="group.name"
                  :subtitle="group.description"
                  :class="{ 'is-active': groupsStore.activeGroupId === group.id }"
                  @click="groupsStore.setActiveGroup(group.id)"
                />
              </template>
              <div class="group-members-tooltip">
                <div class="group-members-tooltip__title">Members</div>
                <ul>
                  <li v-for="memberName in getGroupMemberNames(group)" :key="memberName">
                    {{ memberName }}
                  </li>
                </ul>
              </div>
            </v-tooltip>
          </v-list>
        </div>
      </aside>

      <main class="groups-stage">
        <template v-if="activeGroup">
          <div class="stage-header">
            <div class="groups-stage-heading">
              <template v-if="isEditingGroup">
                <v-text-field
                  v-model="editGroupName"
                  label="Group Name"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
                <v-textarea
                  v-model="editGroupDescription"
                  label="Description"
                  variant="outlined"
                  auto-grow
                  rows="3"
                  hide-details
                />
                <div class="groups-edit-actions">
                  <v-btn
                    type="button"
                    color="primary"
                    variant="flat"
                    :disabled="!canSaveGroupEdit"
                    :loading="isSavingGroupEdit"
                    @click="handleSaveGroupEdit"
                  >
                    Save
                  </v-btn>
                  <v-btn type="button" variant="outlined" @click="handleCancelGroupEdit">
                    Cancel
                  </v-btn>
                </div>
              </template>

              <template v-else>
                <h2>{{ activeGroup.name }}</h2>
                <p>{{ activeGroup.description }}</p>
                <div class="groups-join-code">Join Code: {{ activeGroup.joinCode }}</div>
              </template>
            </div>

            <div class="groups-stage-actions">
              <v-tooltip v-if="isActiveGroupOwner" text="Edit Group" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    type="button"
                    icon="mdi-pencil"
                    variant="text"
                    color="error"
                    aria-label="Edit Group"
                    :disabled="isEditingGroup"
                    @click.stop.prevent="handleStartGroupEdit"
                  />
                </template>
              </v-tooltip>
              <v-tooltip text="Leave Group" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    type="button"
                    icon="mdi-exit-to-app"
                    variant="text"
                    color="error"
                    aria-label="Leave Group"
                    :disabled="isEditingGroup"
                    @click.stop.prevent="handleLeaveGroup"
                  />
                </template>
              </v-tooltip>
              <v-tooltip v-if="isActiveGroupOwner" text="Delete Group" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    type="button"
                    icon="mdi-trash-can"
                    variant="text"
                    color="error"
                    aria-label="Delete Group"
                    :disabled="isEditingGroup"
                    @click.stop.prevent="handleDeleteGroup"
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
              type="button"
              class="mt-2"
              color="primary"
              :disabled="!canCreatePost"
              @click.stop.prevent="handleCreatePost"
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
                <div class="feed-post-header">
                  <v-card-title v-if="editingPostId !== post.id">{{ post.title }}</v-card-title>
                  <v-text-field
                    v-else
                    v-model="editPostTitle"
                    label="Post Title"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                  <div v-if="canManagePost(post)" class="feed-post-actions">
                    <v-tooltip text="Edit Post" location="top">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          type="button"
                          icon="mdi-pencil"
                          variant="text"
                          color="grey"
                          aria-label="Edit Post"
                          :disabled="editingPostId !== '' && editingPostId !== post.id"
                          @click.stop.prevent="handleStartPostEdit(post)"
                        />
                      </template>
                    </v-tooltip>
                    <v-tooltip text="Delete Post" location="top">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          type="button"
                          icon="mdi-trash-can"
                          variant="text"
                          color="grey"
                          aria-label="Delete Post"
                          :disabled="editingPostId !== ''"
                          @click.stop.prevent="handleDeletePost(post.id)"
                        />
                      </template>
                    </v-tooltip>
                  </div>
                </div>
                <v-card-subtitle>{{ formatPostDate(post.updatedAt ?? post.createdAt) }}</v-card-subtitle>
                <v-card-text v-if="editingPostId !== post.id">{{ post.body }}</v-card-text>
                <div v-else class="feed-post-edit">
                  <v-textarea
                    v-model="editPostBody"
                    label="Post Text"
                    variant="outlined"
                    auto-grow
                    rows="3"
                    hide-details
                  />
                  <div class="groups-edit-actions">
                    <v-btn
                      type="button"
                      color="primary"
                      variant="flat"
                      :disabled="!canSavePostEdit"
                      :loading="isSavingPostEdit && editingPostId === post.id"
                      @click="handleSavePostEdit(post.id)"
                    >
                      Save
                    </v-btn>
                    <v-btn type="button" variant="outlined" @click="handleCancelPostEdit">
                      Cancel
                    </v-btn>
                  </div>
                </div>
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
const isEditingGroup = ref(false)
const editGroupName = ref('')
const editGroupDescription = ref('')
const editingPostId = ref('')
const editPostTitle = ref('')
const editPostBody = ref('')
const isSavingGroupEdit = ref(false)
const isSavingPostEdit = ref(false)

const activeGroup = computed(() => groupsStore.activeGroup)
const isActiveGroupOwner = computed(() => groupsStore.isActiveGroupOwner)
const canJoinGroup = computed(() => Boolean(joinCodeInput.value.trim()))
const canCreateGroup = computed(() => Boolean(newGroupName.value.trim()))
const canCreatePost = computed(() => Boolean(newPostTitle.value.trim() && newPostBody.value.trim()))
const canSaveGroupEdit = computed(() => Boolean(editGroupName.value.trim()))
const canSavePostEdit = computed(() => Boolean(editPostTitle.value.trim() && editPostBody.value.trim()))

watch(
  () => auth.user?.uid ?? '',
  (userId) => {
    groupsStore.init(userId)
  },
  { immediate: true },
)

watch(
  () => activeGroup.value?.id ?? '',
  () => {
    handleCancelGroupEdit()
    handleCancelPostEdit()
  },
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

function handleStartGroupEdit() {
  if (!activeGroup.value) {
    return
  }

  editGroupName.value = activeGroup.value.name ?? ''
  editGroupDescription.value = activeGroup.value.description ?? ''
  isEditingGroup.value = true
}

function handleCancelGroupEdit() {
  isEditingGroup.value = false
  editGroupName.value = ''
  editGroupDescription.value = ''
}

async function handleSaveGroupEdit() {
  if (!activeGroup.value || !editGroupName.value.trim()) {
    return
  }

  isSavingGroupEdit.value = true

  try {
    const updatedGroup = await groupsStore.updateGroup(activeGroup.value.id, {
      name: editGroupName.value.trim(),
      description: editGroupDescription.value.trim(),
    })

    groupsStore.upsertGroup(updatedGroup)
    handleCancelGroupEdit()
  } catch (error) {
    groupsStore.error = error?.message || 'Unable to save the group.'
  } finally {
    isSavingGroupEdit.value = false
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

function handleStartPostEdit(post) {
  editPostTitle.value = post.title ?? ''
  editPostBody.value = post.body ?? ''
  editingPostId.value = post.id
}

function handleCancelPostEdit() {
  editingPostId.value = ''
  editPostTitle.value = ''
  editPostBody.value = ''
}

async function handleSavePostEdit(postId) {
  if (!editPostTitle.value.trim() || !editPostBody.value.trim()) {
    return
  }

  isSavingPostEdit.value = true

  try {
    await groupsStore.updatePost(postId, {
      title: editPostTitle.value.trim(),
      body: editPostBody.value.trim(),
    })

    handleCancelPostEdit()
  } catch (error) {
    groupsStore.error = error?.message || 'Unable to save the post.'
  } finally {
    isSavingPostEdit.value = false
  }
}

async function handleDeletePost(postId) {
  try {
    await groupsStore.deletePost(postId)

    if (editingPostId.value === postId) {
      handleCancelPostEdit()
    }
  } catch {
    // Store state already exposes the user-facing error.
  }
}

function canManagePost(post) {
  const currentUserId = auth.user?.uid ?? ''
  return Boolean(currentUserId && (post.createdBy === currentUserId || isActiveGroupOwner.value))
}

function getGroupMemberNames(group) {
  if (Array.isArray(group.memberSummaries) && group.memberSummaries.length) {
    return group.memberSummaries.map((member) => member.username || member.uid)
  }

  if (Array.isArray(group.memberIds) && group.memberIds.length) {
    return group.memberIds.map((memberId) => (
      memberId === auth.user?.uid ? 'You' : 'Member'
    ))
  }

  return ['No members']
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
