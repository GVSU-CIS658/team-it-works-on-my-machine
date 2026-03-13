<template>
  <div class="unauthorized-view">
    <div>
      <p>Unauthorized</p>
      <h1>You do not have access to this resource.</h1>
      <p>
        The application should send users here when backend permission rules deny
        access to a protected group, page, or action.
      </p>
    </div>

    <div>
      <div>
        <h2>Typical cases</h2>
        <ul class="feature-list">
          <li>A user attempts to open a group they do not belong to.</li>
          <li>A protected action is denied by authorization rules.</li>
          <li>A stale link points to content the current user cannot reach.</li>
        </ul>
      </div>

      <div>
        <h2>Recovery path</h2>
        <p>Give the user a clear route back to a safe page instead of leaving them blocked.</p>
        <RouterLink class="inline-link" to="/login">Return to login</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass" src="../styles/pages/unauthorized.sass"></style>
