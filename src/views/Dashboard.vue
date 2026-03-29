<template>
  <div class="dashboard-view">
    <div>
      <h1>Welcome back, {{username}}.</h1>
      <p>
        Use the dashboard as the landing view for progress, upcoming work, and
        group activity.
      </p>
    </div>

    <div >
      <div class="dashboard-border">
        <h2>Task</h2>
         <ul>
          <li class="dashboard-list" v-for ="n in tasks">
            <div class="dashboard-pad"><input type="checkbox" name="{{ n.description }}" value="{{n.isCompleted}}" checked="">
              <span>{{ n.description }}</span>
              </input>
              </div>
              <div></div>
            <div> <p>{{ n.date.toLocaleDateString()}}</p></div>
           
          </li>
        </ul>
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

import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
auth.hydrate()

const username = computed(() => auth.displayName || auth.user?.firstName)

// <li v-for = "n in groups">{{ n.title }}</li>

type Task = {
  description: string;
  date: Date;
  isCompleted: boolean;
  isHidden:boolean;
}

type Group = {
title: string
description: string
numberOfPeople: number
}

let tasks: Task[] = [
  {
    description: "Eat breakfast!",
    date: new Date ("February 01, 2025"),
    isCompleted: false,
    isHidden: false,
  }
  ,
  {
    description: "Do push Up",
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
]

</script>

<style scoped lang="sass" src="../styles/pages/dashboard.sass"></style>
  

