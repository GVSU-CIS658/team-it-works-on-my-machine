<template>
  <div class="not-found-view">
    <section>
      <p>Campus Access Portal</p>
      <p>404</p>
      <h1>The page you requested is not on the quad.</h1>
      <p>
        The route may have moved, the link may be outdated, or the address may
        never have existed in this application.
      </p>
      <div>
        <RouterLink class="button-primary" to="/login">Return to login</RouterLink>
        <RouterLink class="button-secondary" to="/dashboard">Open dashboard</RouterLink>
      </div>
    </section>

    <section>
      <article>
        <h2>Helpful next steps</h2>
        <ul class="feature-list">
          <li>Check the URL for spelling or missing path segments.</li>
          <li>Re-enter through the login or dashboard route.</li>
          <li>Use navigation links instead of old bookmarks.</li>
        </ul>
      </article>
    </section>
  </div>
</template>

<style scoped lang="sass" src="../styles/pages/not-found.sass"></style>
