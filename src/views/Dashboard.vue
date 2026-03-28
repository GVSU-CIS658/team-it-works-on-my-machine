<template>
  <div class="dashboard-view">
    <div>
      <p>Dashboard</p>
      <h1>Welcome back, {{username}}.</h1>
      <p>
        Use the dashboard as the landing view for progress, upcoming work, and
        group activity.
      </p>
    </div>

    <div>
      <div>
        <h2>Task</h2>
      </div>
      <div>
        <h2>HELLO</h2>
        <ul>
          <li v-for ="n in groups">{{n.title}}</li>
          
      
        </ul>
      </div>

      <div>
        <h2>Upcoming sessions</h2>
        <ul>
          <li>Show the next five sessions in chronological order.</li>
          <li>Include meeting location or join link.</li>
          <li>Surface RSVP or attendance actions if needed later.</li>
        </ul>
      </div>

      <div>
        <h2>My groups</h2>
        <p>
          Display the groups the user belongs to, along with a quick summary of
          unread updates, member count, or upcoming deadlines.
        </p>
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
]

</script>

<style scoped lang="sass" src="../styles/pages/dashboard.sass"></style>
