<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const props = defineProps({
  statusCode: {
    type: String,
    required: true,
  },
  statusLabel: {
    type: String,
    default: '',
  },
  pageTitle: {
    type: String,
    required: true,
  },
  pageMessage: {
    type: String,
    required: true,
  },
  helpNotes: {
    type: Array,
    default: () => [],
  },
  pageActions: {
    type: Array,
    default: () => [],
  },
  includeBackAction: {
    type: Boolean,
    default: false,
  },
  backActionMode: {
    type: String,
    default: 'append',
  },
  compactSingleAction: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()
const canGoBack = ref(false)

onMounted(() => {
  canGoBack.value = window.history.length > 1
})

const visibleActions = computed(() => {
  const studyActions = [...props.pageActions]

  if (props.includeBackAction && canGoBack.value) {
    const backAction = {
      key: 'go-back',
      label: 'Go back',
      kind: 'back',
      styleType: 'secondary',
    }

    if (props.backActionMode === 'replace') {
      return [backAction]
    }

    studyActions.push(backAction)
  }

  return studyActions
})

const actionRowClass = computed(() => ({
  'study-actions--centered': props.compactSingleAction && visibleActions.value.length === 1,
}))

function handleAction(action) {
  if (action.kind === 'back') {
    router.back()
  }
}
</script>

<template>
  <div class="study-status-page">
    <div class="study-status-content">
      <section class="study-status-hero">
        <p class="status-code">{{ statusCode }}</p>
        <p v-if="statusLabel" class="status-label">{{ statusLabel }}</p>
        <h1>{{ pageTitle }}</h1>
        <p class="hero-copy">
          {{ pageMessage }}
        </p>

        <div class="study-actions" :class="actionRowClass">
          <component
            :is="action.kind === 'back' ? 'button' : RouterLink"
            v-for="action in visibleActions"
            :key="action.key ?? action.label"
            class="button-pill"
            :class="action.styleType === 'secondary' ? 'button-secondary' : 'button-primary'"
            :to="action.kind === 'link' ? action.to : undefined"
            :type="action.kind === 'back' ? 'button' : undefined"
            @click="action.kind === 'back' ? handleAction(action) : undefined"
          >
            {{ action.label }}
          </component>
        </div>
      </section>

      <section class="study-note-board" aria-label="recovery steps">
        <div
          v-for="(note, index) in helpNotes"
          :key="note.key ?? note"
          class="study-note"
          :class="`study-note--${index + 1}`"
        >
          <p>{{ note.text ?? note }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="sass" src="../styles/pages/status-page.sass"></style>
