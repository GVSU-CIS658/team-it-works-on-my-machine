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
        
      </div>
          <div class="dashboard-pad">
            
            <input class="dashboard-input" placeholder="Add New Task" v-model="message"></input>
            <v-btn class="button-pill dashboard-button" variant="flat" click="addTask(message, tasks.length)">Add Task</v-btn>
           
          </div>
          <nav>
         <ul>
          
          <li class="dashboard-list" v-for ="(n,idx) in tasks" :key="idx" >
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
                @click="deleteTask()">
                <v-icon icon="mdi-trash-can-outline" />
              </v-btn>
            </div>
          </li>
        </ul>
      </nav>
      </div>
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
import { computed } from 'vue'
import {Task, DashboardTask} from '../stores/Tasks'
import { useAuthStore } from '../stores/auth'

enum taskState {
  read,
  edit,
  finish
}

var message:string ="";

const auth = useAuthStore()
auth.hydrate()

const username = computed(() => auth.displayName || auth.user?.firstName)
let {tasks, filteredTasks} = DashboardTask();
const {addTask,addTestTask} = DashboardTask();
// <li v-for = "n in groups">{{ n.title }}</li>

type Group = {
title: string
description: string
numberOfPeople: number
}

let testTask: Task[] = [
  { id:0,
    description: "Eat breakfast!",
    date: new Date ("February 01, 2025"),
    isCompleted: false,
    isHidden: false,
  }
  ,
  {
    id:1,
    description: "Do push Up",
    date: new Date ("March 01, 2025"),
    isCompleted: true,
    isHidden: false,
  },
   {
    id:2,
    description: "working",
    date: new Date ("March 01, 2025"),
    isCompleted: true,
    isHidden: false,
  }
]
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

function deleteTask(){
  console.log("delete task here");
}
addTestTask(testTask[0]);
addTestTask(testTask[1]);
addTestTask(testTask[2]);


</script>

<style scoped lang="sass" src="../styles/pages/dashboard.sass"></style>
  

