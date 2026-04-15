<template>
  <div class="dashboard-view">
    <div class="head">
      <h1>Welcome back, {{username}}.</h1>
      <p>
        Use the dashboard as the landing view for progress, upcoming work, and
        group activity.
      </p>
    </div>

    <div >
      <div class="dashboard-border">
      <div class="dashboard-title">
        <div><h2>Task</h2></div>
        <div class="dashboard-task-actions">
          <v-btn
            class="button-pill dashboard-task-icon-button"
            variant="flat"
            aria-label="Add task"
            @click="addingTask(message, tasks.length)">
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
            
            <input class="dashboard-input" placeholder="Add New Task" v-model="message"></input>
           
          </div>
          <nav>
         <ul>
          
          <li class="dashboard-list" v-for ="(n,idx) in visibleTasks" :key="idx" >
            <div class="dashboard-pad""><input type="checkbox" name="{{ n.description }}" v-model="n.isCompleted">
              <s v-if="n.isCompleted">{{ n.description }}</s>
              <span  v-if="!n.isCompleted">{{ n.description }}</span>
              </input>
              </div>
              <div></div>
            <div>
               <s v-if="n.isCompleted">{{ n.date.toLocaleDateString()}}</s> 
              <span v-if="!n.isCompleted">{{ n.date.toLocaleDateString()}}</span>
              <v-btn
                icon
                variant="text"
                class="dashboard-icon-button"
                aria-label="Edit task"
                @click="editTask()">
                <v-icon icon="mdi-pencil" />
              </v-btn>
                  <v-btn
                icon
                variant="text"
                class="dashboard-icon-button"
                aria-label="Delete Task"
                @click="deleteTask(n.id, n.user)">
                <v-icon icon="mdi-trash-can-outline" />
              </v-btn>
            </div>
          </li>
        </ul>
      </nav>
      </div>
      <v-dialog
      v-model="editing"

      >COOL</v-dialog>
      <div class="dashboard-border">

        <RouterLink to="/Groups" class="dashboard-header">
          <h2>Groups</h2>
        </RouterLink>
        
        <ul>
          <li v-for ="n in groups">{{n.title}}</li>
        </ul>
      </div>

      <div class="dashboard-border">
          <RouterLink to="/Sessions" class="dashboard-header">
          <h2>Upcoming Sessions</h2>
        </RouterLink>
        <ul>
          <li>Show the next five sessions in chronological order.</li>
          <li>Include meeting location or join link.</li>
          <li>Surface RSVP or attendance actions if needed later.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { type Task, DashboardTask, TASK_FILTER_OPTIONS, TASK_SORT_OPTIONS,} from '../stores/tasks'
import { useAuthStore } from '../stores/auth'

var editing=false;
var message:string ="";
const ONE_WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;
const taskFilterOptions = Object.values(TASK_FILTER_OPTIONS);
const selectedTaskFilter = ref(taskFilterOptions[0]);
const selectedTaskSort = ref(TASK_SORT_OPTIONS.DATE);
const selectedTaskSortDirection = ref('ascending');

const auth = useAuthStore()

const username = computed(() => auth.username || auth.user?.firstName)
const taskStore = DashboardTask();
const tasks = computed(() => taskStore.tasks);
const {addTask, init, deleteTask} = taskStore;

const alphabetSortIcon = computed(() => (
  selectedTaskSort.value === TASK_SORT_OPTIONS.ALPHABET && selectedTaskSortDirection.value === 'descending'
    ? 'mdi-sort-alphabetical-descending'
    : 'mdi-sort-alphabetical-ascending'
));
const dateSortIcon = computed(() => (
  selectedTaskSort.value === TASK_SORT_OPTIONS.DATE && selectedTaskSortDirection.value === 'descending'
    ? 'mdi-sort-calendar-descending'
    : 'mdi-sort-calendar-ascending'
));

const visibleTasks = computed(() => {
  const now = Date.now();
  const oneWeekFromNow = now + ONE_WEEK_IN_MILLISECONDS;
  const sortDirection = selectedTaskSortDirection.value === 'ascending' ? 1 : -1;

  const filteredTasks = tasks.value.filter((task: Task) => {
    const taskTime = task.date.getTime();

    switch (selectedTaskFilter.value) {
      case TASK_FILTER_OPTIONS.FINISHED:
        return task.isCompleted;
      case TASK_FILTER_OPTIONS.UNFINISHED:
        return !task.isCompleted;
      case TASK_FILTER_OPTIONS.SOONER:
        return taskTime <= oneWeekFromNow;
      case TASK_FILTER_OPTIONS.LATER:
        return taskTime > oneWeekFromNow;
      default:
        return true;
    }
  });

  return [...filteredTasks].sort((a: Task, b: Task) => {
    if (selectedTaskSort.value === TASK_SORT_OPTIONS.ALPHABET) {
      return a.description.localeCompare(b.description) * sortDirection;
    }

    if(selectedTaskSort.value === TASK_SORT_OPTIONS.DATE){return (a.date.getTime() - b.date.getTime()) * sortDirection;}

    return;
  });
});

function setTaskSort(sortOption: string) {
  if (selectedTaskSort.value === sortOption) {
    selectedTaskSortDirection.value = selectedTaskSortDirection.value === 'ascending'
      ? 'descending'
      : 'ascending';
    return;
  }

  selectedTaskSort.value = sortOption;
  selectedTaskSortDirection.value = 'ascending';
}

function addingTask(message:string, id:number){
  selectedTaskSort.value = TASK_SORT_OPTIONS.NONE;
addTask(message, id);
}

type Group = {
title: string
description: string
numberOfPeople: number
}

let groups: Group[]  = [
  {
    title: "Math",
    description: "Math is hard",
    numberOfPeople: 3
  },
   {
    title: "Science",
    description: "Speed is in fact relative",
    numberOfPeople: 10
  }
];

function editTask(){
  console.log("edit Task here");
}

init(auth.emailAddress);

onUnmounted(()=>taskStore.unsubscribe)

</script>

<style scoped lang="sass" src="../styles/pages/dashboard.sass"></style>
  

