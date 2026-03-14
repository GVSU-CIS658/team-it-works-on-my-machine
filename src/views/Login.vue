<template>
  <div class="login-view" style="color: whitesmoke;">
    <div>
      <p>Authentication</p>
      <h1>Access your academic workspace.</h1>
      <p>
        Sign in or create an account to manage study groups, sessions, and tasks
        from one shared portal.
      </p>
    </div>

    <div>
      <div>
        <h2>What this page handles</h2>
        <ul>
          <li>User registration with display name, email, and password.</li>
          <li>Sign in flow for returning users.</li>
          <li>Logout and redirect behavior after authentication.</li>
          <li>Protected route entry into the rest of the application.</li>
        </ul>
      </div>

      <div>
        <h2>Suggested next step</h2>
        <p>
          Start here, then route authenticated users to the dashboard and route
          unauthorized access attempts to the dedicated error page.
        </p>
        <RouterLink class="inline-link" to="/dashboard">Preview dashboard flow</RouterLink>
      </div>
    </div>

    <footer  style="background-color: greenyellow; color: black;">
      <p>Remove before deploying</p>
      <nav aria-label="Temporary development links" style="display: flex; gap: 1rem; margin-top: 0.5rem;">
        <RouterLink to="/unauthorized">Unauthorized</RouterLink>
        <RouterLink to="/not-a-real-route">Not Found</RouterLink>
      </nav>
    </footer>
  </div>
</template>

<style scoped lang="sass" src="../styles/pages/login.sass"></style>
