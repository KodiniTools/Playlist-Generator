<template>
  <UiDialog
    :open="open"
    :title="t('handoff_title')"
    :description="description"
    :close-label="t('toast_close')"
    @close="emit('decline')"
  >
    <template #footer>
      <UiButton variant="secondary" data-action="handoff-decline" @click="emit('decline')">
        {{ t('handoff_decline') }}
      </UiButton>
      <UiButton variant="primary" data-action="handoff-accept" @click="emit('accept')">
        {{ t('handoff_accept') }}
      </UiButton>
    </template>
  </UiDialog>
</template>

<script setup lang="ts">
  import { UiButton, UiDialog } from '../ui'
  import { useTranslation } from '../../composables/useTranslation'

  /** Frage „Im Texteditor öffnen?“ nach Kopieren oder Speichern. Schließen = Ablehnen. */
  defineProps<{
    open: boolean
    description: string
  }>()

  const emit = defineEmits<{
    accept: []
    decline: []
  }>()

  const { t } = useTranslation()
</script>
