<template>
  <div class="not-found-view">
    <section class="page-hero">
      <p class="status-code">404</p>
      <h1>Did you lose your place?</h1>
      <p class="hero-copy">
        This route reads like half-finished notes from a lecture you missed. The
        page may be outdated, mistyped, or it may never have existed at all.
      </p>

      <div class="page-actions">
        <RouterLink class="button-primary button-pill" to="/login">Return to login</RouterLink>
        <RouterLink class="button-secondary button-pill" to="/dashboard">Open dashboard</RouterLink>
      </div>
    </section>

    <section class="sticky-notes" aria-label="recovery steps">
      <div class="sticky-note sticky-note--one">
        <p>check the url for a typo or a missing route segment.</p>
      </div>

      <div class="sticky-note sticky-note--two">
        <p>use the main navigation instead of an older saved link.</p>
      </div>

      <div class="sticky-note sticky-note--three">
        <p>return to a known page and navigate from there.</p>
      </div>
    </section>
  </div>
</template>

<style scoped lang="sass" src="../styles/pages/not-found.sass"></style>
