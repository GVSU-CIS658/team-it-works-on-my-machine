<template>
  <div class="section-shell">
    <header class="section-header">
      <div class="section-header-inner">
        <RouterLink class="section-brand" to="/login">
          <span class="section-brand-mark">SGP</span>
          <span class="section-brand-text">
            <strong>Study Group Portal</strong>
            <small>Student collaboration space</small>
          </span>
        </RouterLink>

        <nav class="section-nav" aria-label="Primary">
          <RouterLink to="/login">Login</RouterLink>
          <RouterLink to="/dashboard">Dashboard</RouterLink>
          <RouterLink to="/groups">Groups</RouterLink>
          <RouterLink to="/sessions">Sessions</RouterLink>
        </nav>
      </div>
    </header>

    <main class="section-main">
      <slot />
    </main>

    <footer class="section-footer">
      <p>Study Group Portal</p>
      <p>Shared academic planning, groups, and sessions.</p>
    </footer>
  </div>
</template>
