<template>
  <div class="dashboard-view">
    <section>
      <p>Dashboard</p>
      <h1>Welcome back, username.</h1>
      <p>
        Use the dashboard as the landing view for progress, upcoming work, and
        group activity.
      </p>
    </section>

    <section>
      <article>
        <h2>Recent tasks</h2>
        <ul>
          <li>Display the five most recent tasks in date order.</li>
          <li>Highlight due-soon items and completion status.</li>
          <li>Link each task back to its owning session or course group.</li>
        </ul>
      </article>

      <article>
        <h2>Upcoming sessions</h2>
        <ul>
          <li>Show the next five sessions in chronological order.</li>
          <li>Include meeting location or join link.</li>
          <li>Surface RSVP or attendance actions if needed later.</li>
        </ul>
      </article>

      <article>
        <h2>My groups</h2>
        <p>
          Display the groups the user belongs to, along with a quick summary of
          unread updates, member count, or upcoming deadlines.
        </p>
      </article>
    </section>
  </div>
</template>

<style scoped lang="sass" src="../styles/pages/dashboard.sass"></style>
