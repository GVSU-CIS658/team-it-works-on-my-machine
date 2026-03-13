<template>
  <div class="sessions-view">
    <section>
      <p>Sessions and Tasks</p>
      <h1>Plan shared study sessions and track private task work.</h1>
      <p>
        This page combines collaborative scheduling with individual task
        management, which makes it a good place to demonstrate shared versus
        private data.
      </p>
    </section>

    <section>
      <article>
        <h2>Study sessions</h2>
        <ul class="feature-list">
          <li>View upcoming sessions for the selected group.</li>
          <li>Create a session with title, date, time, and location.</li>
          <li>Allow edits or deletion only when permission rules allow it.</li>
        </ul>
      </article>

      <article>
        <h2>Personal tasks</h2>
        <ul class="feature-list">
          <li>Create, edit, complete, and delete private tasks.</li>
          <li>Show tasks by due date, status, or related session.</li>
          <li>Keep ownership scoped to the signed-in user.</li>
        </ul>
      </article>
    </section>
  </div>
</template>

<style scoped lang="sass" src="../styles/pages/sessions.sass"></style>
