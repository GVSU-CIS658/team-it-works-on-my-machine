<script setup>
const helpSections = [
  {
    id: 'account',
    title: 'Account',
    points: [
      'Sign up with email and password or use Google sign-in.',
      'Update your username, name, and study major from Profile.',
      'Your role is shown in Profile but cannot be edited there.',
      'Use logout from the user menu when you are done.',
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    points: [
      'Manage your personal task list with create, edit, complete, and delete actions.',
      'Review your current groups in the Groups panel.',
      'Review upcoming sessions pulled from the groups you belong to.',
      'Task data is private to your account.',
    ],
  },
  {
    id: 'groups',
    title: 'Groups',
    points: [
      'Create a group with a name and description. The app generates the join code.',
      'Join an existing group by entering a join code shared by a group owner.',
      'Group owners can edit or delete the group.',
      'Group members can create posts in the shared feed. Post authors and group owners can edit or delete posts.',
    ],
  },
  {
    id: 'sessions',
    title: 'Sessions',
    points: [
      'Select one of your groups before creating or reviewing sessions.',
      'Create sessions with a title, date, time, and optional location or meeting link.',
      'Session creators and group owners can edit or delete sessions.',
      'Upcoming Sessions on the Dashboard reflects the sessions tied to your groups.',
    ],
  },
]
</script>

<template>
  <div class="help-view">
    <section class="help-hero">
      <h1>Help</h1>
      <p>Use this page as the quick reference for how each part of the app is meant to work.</p>
    </section>

    <section class="help-grid" aria-label="Help sections">
      <article
        v-for="section in helpSections"
        :key="section.id"
        class="help-card"
      >
        <h2>{{ section.title }}</h2>
        <ul class="help-list">
          <li
            v-for="point in section.points"
            :key="point"
          >
            {{ point }}
          </li>
        </ul>
      </article>
    </section>
  </div>
</template>

<style scoped lang="sass" src="../styles/pages/help.sass"></style>
