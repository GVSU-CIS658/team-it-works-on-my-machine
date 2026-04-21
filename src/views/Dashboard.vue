<template>
  <div class="dashboard-view">
    <div class="head">
      <h1>Welcome back, {{ username }}.</h1>
      <p>
        Use the dashboard as the landing view for tasks, group activity, and
        upcoming sessions.
      </p>
    </div>

    <div>
      <div class="dashboard-border">
        <div class="dashboard-title">
          <div><h2>Task</h2></div>
          <div class="dashboard-task-actions">
            <v-btn
              class="button-pill dashboard-task-icon-button"
              variant="flat"
              aria-label="Add task"
              @click="addingTask">
              <v-icon icon="mdi-plus" />
            </v-btn>
            <v-btn
              class="button-pill dashboard-task-icon-button"
              variant="flat"
              aria-label="Sort tasks alphabetically"
              @click="setTaskSort(TASK_SORT_OPTIONS.ALPHABET)">
              <v-icon :icon="alphabetSortIcon" />
            </v-btn>
            <v-btn
              class="button-pill dashboard-task-icon-button"
              variant="flat"
              aria-label="Sort tasks by date"
              @click="setTaskSort(TASK_SORT_OPTIONS.DATE)">
              <v-icon :icon="dateSortIcon" />
            </v-btn>
          </div>
          <v-select
            v-model="selectedTaskFilter"
            class="dashboard-filter-select"
            :items="taskFilterOptions"
            density="compact"
            hide-details
            variant="outlined"
            menu-icon="mdi-filter-variant"
            aria-label="Task filter"
          />
        </div>

        <div class="dashboard-pad">
          <input
            v-model="message"
            class="dashboard-input"
            placeholder="Add New Task"
          />
        </div>

        <nav>
          <ul>
            <li
              v-for="task in visibleTasks"
              :key="task.id"
              class="dashboard-list">
              <div class="dashboard-pad">
                <input
                  type="checkbox"
                  :name="task.description"
                  :checked="task.isCompleted"
                  @change="toggleTaskComplete(task, $event)"
                />
                <s v-if="task.isCompleted">{{ task.description }}</s>
                <span v-else>{{ task.description }}</span>
              </div>
              <div></div>
              <div>
                <s v-if="task.isCompleted">{{ task.date.toLocaleDateString() }}</s>
                <span v-else>{{ task.date.toLocaleDateString() }}</span>
                <v-btn
                  icon
                  variant="text"
                  class="dashboard-icon-button"
                  aria-label="Edit task"
                  @click.stop="openEditTask(task)">
                  <v-icon icon="mdi-pencil" />
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  class="dashboard-icon-button"
                  aria-label="Delete Task"
                  @click="taskStore.deleteTask(task.id)">
                  <v-icon icon="mdi-trash-can-outline" />
                </v-btn>
              </div>
            </li>
          </ul>
        </nav>
      </div>

      <v-dialog v-model="editing" max-width="400" max-height="500">
        <div class="dashboard-pop">
          <v-card-title>Edit Task</v-card-title>
          <div class="dashboard-pad">
            <input
              v-model="editTaskMessage"
              class="dashboard-input"
              aria-label="Edit task description"
            />
          </div>

          <v-card-title>Date</v-card-title>
          <v-text-field
            v-model="editTaskDate"
            type="date"
            aria-label="Edit task date"
          />
          <div class="dashboard-option">
            <v-btn
              class="button-pill dashboard-row-action dashboard-option"
              variant="flat"
              @click="saveTaskEdits">
              SAVE
            </v-btn>
            <v-btn
              class="button-pill dashboard-row-action dashboard-option"
              variant="flat"
              @click="cancelTaskEdit">
              CANCEL
            </v-btn>
          </div>
        </div>
      </v-dialog>

      <div class="dashboard-border">
        <RouterLink to="/Groups" class="dashboard-header">
          <h2>Groups</h2>
        </RouterLink>

        <ul>
          <li v-if="groupsStore.isLoading">Loading groups...</li>
          <li v-else-if="!groups.length">You are not in any groups yet.</li>
          <li v-for="group in groups" v-else :key="group.id">
            {{ group.name }}
          </li>
        </ul>
      </div>

      <div class="dashboard-border">
        <RouterLink to="/Sessions" class="dashboard-header">
          <h2>Upcoming Sessions</h2>
        </RouterLink>
        <ul>
          <li>There is no upcoming sessions.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { type Task, DashboardTask, TASK_FILTER_OPTIONS, TASK_SORT_OPTIONS } from '../stores/tasks'
import { useAuthStore } from '../stores/auth'
import { useGroupsStore } from '../stores/groups'

const editing = ref(false)
const selectedTaskId = ref('')
const editTaskMessage = ref('')
const editTaskDate = ref(toDateInputValue(new Date()))
const message = ref('')
const ONE_WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000
const taskFilterOptions = Object.values(TASK_FILTER_OPTIONS)
const selectedTaskFilter = ref(taskFilterOptions[0])
const selectedTaskSort = ref(TASK_SORT_OPTIONS.DATE)
const selectedTaskSortDirection = ref('ascending')

const auth = useAuthStore()
const taskStore = DashboardTask()
const groupsStore = useGroupsStore()

const username = computed(() => auth.username || auth.user?.firstName)
const tasks = computed(() => taskStore.tasks)
const groups = computed(() => groupsStore.userGroups)

const alphabetSortIcon = computed(() => (
  selectedTaskSort.value === TASK_SORT_OPTIONS.ALPHABET && selectedTaskSortDirection.value === 'descending'
    ? 'mdi-sort-alphabetical-descending'
    : 'mdi-sort-alphabetical-ascending'
))

const dateSortIcon = computed(() => (
  selectedTaskSort.value === TASK_SORT_OPTIONS.DATE && selectedTaskSortDirection.value === 'descending'
    ? 'mdi-sort-calendar-descending'
    : 'mdi-sort-calendar-ascending'
))

const visibleTasks = computed(() => {
  const now = Date.now()
  const oneWeekFromNow = now + ONE_WEEK_IN_MILLISECONDS
  const sortDirection = selectedTaskSortDirection.value === 'ascending' ? 1 : -1

  const filteredTasks = tasks.value.filter((task: Task) => {
    const taskTime = task.date.getTime()

    switch (selectedTaskFilter.value) {
      case TASK_FILTER_OPTIONS.FINISHED:
        return task.isCompleted
      case TASK_FILTER_OPTIONS.UNFINISHED:
        return !task.isCompleted
      case TASK_FILTER_OPTIONS.SOONER:
        return taskTime <= oneWeekFromNow
      case TASK_FILTER_OPTIONS.LATER:
        return taskTime > oneWeekFromNow
      default:
        return true
    }
  })

  return [...filteredTasks].sort((a: Task, b: Task) => {
    if (selectedTaskSort.value === TASK_SORT_OPTIONS.ALPHABET) {
      return a.description.localeCompare(b.description) * sortDirection
    }

    if (selectedTaskSort.value === TASK_SORT_OPTIONS.DATE) {
      return (a.date.getTime() - b.date.getTime()) * sortDirection
    }

    return 0
  })
})

function setTaskSort(sortOption: string) {
  if (selectedTaskSort.value === sortOption) {
    selectedTaskSortDirection.value = selectedTaskSortDirection.value === 'ascending'
      ? 'descending'
      : 'ascending'
    return
  }

  selectedTaskSort.value = sortOption
  selectedTaskSortDirection.value = 'ascending'
}

async function addingTask() {
  selectedTaskSort.value = TASK_SORT_OPTIONS.NONE
  await taskStore.addTask(message.value)
  message.value = ''
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

function openEditTask(task: Task) {
  selectedTaskId.value = task.id
  editTaskMessage.value = task.description
  editTaskDate.value = toDateInputValue(task.date)
  editing.value = true
}

function cancelTaskEdit() {
  editing.value = false
  selectedTaskId.value = ''
  editTaskMessage.value = ''
  editTaskDate.value = toDateInputValue(new Date())
}

async function saveTaskEdits() {
  await taskStore.updateTask(selectedTaskId.value, {
    description: editTaskMessage.value,
    dueAt: new Date(`${editTaskDate.value}T00:00:00`).toISOString(),
  })
  cancelTaskEdit()
}

async function toggleTaskComplete(task: Task, event: Event) {
  const target = event.target as HTMLInputElement

  await taskStore.updateTask(task.id, {
    isCompleted: target.checked,
  })
}

watch(
  () => auth.user?.uid,
  (ownerId) => {
    if (ownerId) {
      taskStore.init(ownerId)
      groupsStore.init(ownerId)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (taskStore.unsubscribe) {
    taskStore.unsubscribe()
    taskStore.unsubscribe = null
  }

  if (groupsStore.unsubscribe) {
    groupsStore.unsubscribe()
    groupsStore.unsubscribe = null
  }

  if (groupsStore.feedUnsubscribe) {
    groupsStore.feedUnsubscribe()
    groupsStore.feedUnsubscribe = null
  }
})
</script>

<style scoped lang="sass" src="../styles/pages/dashboard.sass"></style>
